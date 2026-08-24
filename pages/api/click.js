import { getDatabase } from "../../lib/dbHelper";
import { ObjectId } from "mongodb";
import { UAParser } from "ua-parser-js";

function parseUserAgentDetails(uaString) {
    if (!uaString) {
        return { device: "Desktop", browser: "Other", os: "Unknown" };
    }
    const parser = new UAParser(uaString);
    const result = parser.getResult();

    let device = "Desktop";
    const devType = result.device?.type;
    if (devType === "mobile" || devType === "wearable" || devType === "embedded") {
        device = "Mobile";
    } else if (devType === "tablet") {
        device = "Tablet";
    } else if (/mobile|iphone|ipod|android/i.test(uaString)) {
        device = "Mobile";
    } else if (/ipad|tablet/i.test(uaString)) {
        device = "Tablet";
    }

    const browser = result.browser?.name || "Other";
    const os = result.os?.name || "Unknown";

    return { device, browser, os };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const origin = req.headers.origin || '';
        const referer = req.headers.referer || '';
        const host = req.headers.host || '';

        // Filter: Bypass tracking for localhost / 127.0.0.1 / development environment
        const isLocalTraffic =
            process.env.NODE_ENV === 'development' ||
            origin.includes('localhost') ||
            origin.includes('127.0.0.1') ||
            referer.includes('localhost') ||
            referer.includes('127.0.0.1') ||
            host.includes('localhost') ||
            host.includes('127.0.0.1');

        if (isLocalTraffic) {
            return res.status(200).json({
                success: true,
                bypassed: true,
                message: "Tracking bypassed for localhost"
            });
        }

        const { linkId, url, title } = req.body || {};
        const ua = req.headers['user-agent'] || '';
        const { device, browser, os } = parseUserAgentDetails(ua);
        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

        const db = await getDatabase();
        const now = new Date();

        // 1. Increment link counter in 'links' collection
        if (linkId && ObjectId.isValid(linkId)) {
            await db.collection("links").updateOne(
                { _id: new ObjectId(linkId) },
                { $inc: { clicks: 1 } }
            );
        } else if (title) {
            await db.collection("links").updateOne(
                { title: title },
                { $inc: { clicks: 1 } }
            );
        }

        // 2. Record click event in both 'clicks' and 'click_logs' collections
        const logData = {
            linkId: linkId || null,
            title: title || "Unknown Link",
            url: url || "",
            device,
            browser,
            os,
            origin,
            referer,
            ip: typeof ip === 'string' ? ip.split(',')[0].trim() : 'unknown',
            timestamp: now,
            dateString: now.toISOString().split('T')[0]
        };

        await Promise.all([
            db.collection("clicks").insertOne(logData),
            db.collection("click_logs").insertOne(logData)
        ]);

        return res.status(200).json({ success: true, message: "Click recorded successfully" });
    } catch (error) {
        console.error("Click tracking error:", error);
        return res.status(200).json({ success: false }); // Non-blocking
    }
}
