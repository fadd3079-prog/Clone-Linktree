import clientPromise from "../../lib/mongodb";
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

    return {
        device,
        browser: result.browser?.name || "Other",
        os: result.os?.name || "Unknown"
    };
}

function stripQueryParams(rawUrl) {
    if (!rawUrl) return "";
    try {
        const parsed = new URL(rawUrl);
        return parsed.origin + parsed.pathname;
    } catch {
        return rawUrl.split("?")[0];
    }
}

export default async function handler(req, res) {
    // Permissive CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { linkId, url, title } = req.body || {};
        const ua = req.headers["user-agent"] || "";
        const { device, browser, os } = parseUserAgentDetails(ua);
        const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
        const origin = req.headers.origin || "";
        const referer = req.headers.referer || "";

        const client = await clientPromise;
        const db = client.db("linktree_clone");
        const now = new Date();

        if (linkId && ObjectId.isValid(linkId)) {
            await db.collection("links").updateOne(
                { _id: new ObjectId(linkId) },
                { $inc: { clicks: 1 } }
            );
        } else if (title) {
            await db.collection("links").updateOne(
                { title },
                { $inc: { clicks: 1 } }
            );
        }

        const logData = {
            linkId: linkId || null,
            title: title || "Unknown Link",
            url: stripQueryParams(url),
            device,
            browser,
            os,
            origin: stripQueryParams(origin),
            referer: stripQueryParams(referer),
            ip: typeof ip === "string" ? ip.split(",")[0].trim() : "unknown",
            timestamp: now,
            dateString: now.toISOString().split("T")[0]
        };

        await Promise.all([
            db.collection("clicks").insertOne({ ...logData }),
            db.collection("click_logs").insertOne({ ...logData })
        ]);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Click tracking error:", error);
        return res.status(200).json({ success: false });
    }
}
