import { getDatabase, ensureDefaultLinks } from "../../lib/dbHelper";
import defaultLinks from "../../data/LinksData";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const db = await getDatabase();
        await ensureDefaultLinks(db);

        const links = await db.collection("links")
            .find({})
            .sort({ order: 1, _id: 1 })
            .toArray();

        return res.status(200).json({
            success: true,
            data: links
        });
    } catch (error) {
        console.error("Fetch links error:", error);
        // Fallback to static LinksData if database is temporarily unreachable
        return res.status(200).json({
            success: true,
            data: defaultLinks,
            fallback: true
        });
    }
}