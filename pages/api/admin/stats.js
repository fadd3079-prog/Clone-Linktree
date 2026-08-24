import { getDatabase, ensureMasterAdmin, ensureDefaultLinks } from "../../../lib/dbHelper";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
    const session = await getSession({ req });
    if (!session) {
        return res.status(401).json({ success: false, message: "Unauthorized. Silakan login terlebih dahulu." });
    }

    try {
        const db = await getDatabase();
        await ensureMasterAdmin(db);
        await ensureDefaultLinks(db);

        const linksCollection = db.collection("links");
        const clicksCollection = db.collection("clicks");

        // 1. Fetch links
        const allLinks = await linksCollection.find({}).sort({ clicks: -1 }).toArray();

        const totalLinks = allLinks.length;
        const activeLinks = allLinks.filter(l => l.on !== false).length;
        const totalClicks = allLinks.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
        const categories = Array.from(new Set(allLinks.map(l => l.type).filter(Boolean)));
        const topLink = allLinks[0] || null;

        // 2. Generate 7-day timeline trends
        const days = 7;
        const clickTrends = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateString = d.toISOString().split('T')[0];
            const displayLabel = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

            const countForDay = await clicksCollection.countDocuments({ dateString });
            clickTrends.push({
                date: dateString,
                label: displayLabel,
                clicks: countForDay
            });
        }

        // 3. Device breakdown
        const deviceAgg = await clicksCollection.aggregate([
            { $group: { _id: "$device", count: { $sum: 1 } } }
        ]).toArray();

        let deviceBreakdown = deviceAgg.map(d => ({
            name: d._id || "Other",
            value: d.count
        }));

        // Default mock distribution if no clicks recorded yet
        if (deviceBreakdown.length === 0) {
            deviceBreakdown = [
                { name: "Mobile", value: totalClicks > 0 ? Math.round(totalClicks * 0.65) : 0 },
                { name: "Desktop", value: totalClicks > 0 ? Math.round(totalClicks * 0.30) : 0 },
                { name: "Tablet", value: totalClicks > 0 ? Math.round(totalClicks * 0.05) : 0 }
            ];
        }

        // 4. Browser breakdown
        const browserAgg = await clicksCollection.aggregate([
            { $group: { _id: "$browser", count: { $sum: 1 } } }
        ]).toArray();

        let browserBreakdown = browserAgg.map(b => ({
            name: b._id || "Other",
            value: b.count
        }));

        if (browserBreakdown.length === 0) {
            browserBreakdown = [
                { name: "Chrome", value: totalClicks > 0 ? Math.round(totalClicks * 0.55) : 0 },
                { name: "Safari", value: totalClicks > 0 ? Math.round(totalClicks * 0.30) : 0 },
                { name: "Firefox", value: totalClicks > 0 ? Math.round(totalClicks * 0.10) : 0 },
                { name: "Other", value: totalClicks > 0 ? Math.round(totalClicks * 0.05) : 0 }
            ];
        }

        return res.status(200).json({
            success: true,
            data: {
                metrics: {
                    totalClicks,
                    totalLinks,
                    activeLinks,
                    inactiveLinks: totalLinks - activeLinks,
                    totalCategories: categories.length,
                    topLink: topLink ? {
                        title: topLink.title,
                        clicks: topLink.clicks || 0,
                        url: topLink.url,
                        percentage: totalClicks > 0 ? Math.round(((topLink.clicks || 0) / totalClicks) * 100) : 0
                    } : null
                },
                clickTrends,
                deviceBreakdown,
                browserBreakdown,
                categories,
                topLinks: allLinks.slice(0, 5)
            }
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return res.status(500).json({ success: false, message: "Gagal memproses statistik analitik." });
    }
}
