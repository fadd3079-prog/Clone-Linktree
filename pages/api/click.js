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
        const { linkId, url, title } = req.body || {};
        const ua = req.headers['user-agent'] || '';
        const { device, browser } = parseUserAgent(ua);
        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

        const db = await getDatabase();
        const now = new Date();

        // Increment link counter if linkId is provided
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

        // Record click analytics event
        await db.collection("clicks").insertOne({
            linkId: linkId || null,
            title: title || "Unknown Link",
            url: url || "",
            device,
            browser,
            ip: typeof ip === 'string' ? ip.split(',')[0].trim() : 'unknown',
            timestamp: now,
            dateString: now.toISOString().split('T')[0] // YYYY-MM-DD
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Click tracking error:", error);
        return res.status(200).json({ success: false }); // Do not block client navigation
    }
}
