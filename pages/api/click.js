import { getDatabase } from "../../lib/dbHelper";
import { ObjectId } from "mongodb";

function parseUserAgent(ua) {
    if (!ua) return { device: "Desktop", browser: "Other" };

    let device = "Desktop";
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
        device = "Tablet";
    } else if (/mobile|iphone|ipod|android|blackberry|iemobile|kindle/i.test(ua)) {
        device = "Mobile";
    }

    let browser = "Other";
    if (/edg\//i.test(ua)) {
        browser = "Edge";
    } else if (/opr\/|opera/i.test(ua)) {
        browser = "Opera";
    } else if (/chrome|crios/i.test(ua)) {
        browser = "Chrome";
    } else if (/firefox|fxios/i.test(ua)) {
        browser = "Firefox";
    } else if (/safari/i.test(ua)) {
        browser = "Safari";
    }

    return { device, browser };
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
        const { device, browser } = parseUserAgent(ua);
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

        // 2. Record click event in both 'clicks' and 'click_logs' collections for tracking & analytics
        const logData = {
            linkId: linkId || null,
            title: title || "Unknown Link",
            url: url || "",
            device,
            browser,
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
