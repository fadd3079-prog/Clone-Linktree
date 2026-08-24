import clientPromise from "../../../lib/mongodb";
import { getSession } from "next-auth/react";

export async function getDashboardAggregations() {
    const client = await clientPromise;
    const db = client.db("linktree_clone");

    const linksCollection = db.collection("links");
    const logsCollection = db.collection("click_logs");

    // 1. Links & Total Clicks
    const allLinks = await linksCollection.find({}).sort({ clicks: -1, order: 1 }).toArray();
    const totalLinks = allLinks.length;
    const activeLinks = allLinks.filter(l => l.on !== false).length;
    const totalClicks = allLinks.reduce((acc, curr) => acc + (curr.clicks || 0), 0);

    // 2. Unique Visitors & Today Clicks
    let uniqueVisitors = 0;
    try {
        const uniqueIps = await logsCollection.distinct("ip");
        uniqueVisitors = uniqueIps.length;
    } catch (e) {
        uniqueVisitors = 0;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todayClicks = await logsCollection.countDocuments({ dateString: todayStr });
    const dailyTargetPercentage = totalClicks > 0 ? Math.min(100, Math.round((todayClicks / 50) * 100)) : 0;

    // 3. 14-Day Timeline (Vertical Bar Chart)
    const dailyTrends = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateString = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

        const count = await logsCollection.countDocuments({ dateString });
        dailyTrends.push({
            date: dateString,
            day: dayLabel,
            clicks: count || 0
        });
    }

    // 4. OS Breakdown (Donut Chart)
    const osAgg = await logsCollection.aggregate([
        { $group: { _id: "$os", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]).toArray();

    const osBreakdown = osAgg
        .filter(item => item._id && item._id !== "Unknown")
        .map(item => ({ name: item._id, value: item.count }));

    // 5. Browser Breakdown (Donut Chart)
    const browserAgg = await logsCollection.aggregate([
        { $group: { _id: "$browser", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]).toArray();

    const browserBreakdown = browserAgg
        .filter(item => item._id && item._id !== "Other")
        .map(item => ({ name: item._id, value: item.count }));

    // 6. Day of Week Stacked by Device (Stacked Bar Chart)
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const dayOfWeekData = [];

    for (let dIdx = 0; dIdx < 7; dIdx++) {
        const dayLabel = dayNames[dIdx];
        // Query database logs matching day of week if logs exist
        const mobileCount = await logsCollection.countDocuments({
            device: "Mobile",
            $expr: { $eq: [{ $dayOfWeek: "$timestamp" }, dIdx + 1] }
        });
        const desktopCount = await logsCollection.countDocuments({
            device: "Desktop",
            $expr: { $eq: [{ $dayOfWeek: "$timestamp" }, dIdx + 1] }
        });
        const tabletCount = await logsCollection.countDocuments({
            device: "Tablet",
            $expr: { $eq: [{ $dayOfWeek: "$timestamp" }, dIdx + 1] }
        });

        dayOfWeekData.push({
            day: dayLabel,
            Mobile: mobileCount || 0,
            Desktop: desktopCount || 0,
            Tablet: tabletCount || 0
        });
    }

    // 7. Top 10 Links (Horizontal Bar Chart)
    const top10Links = allLinks.slice(0, 10).map((l) => ({
        title: l.title.length > 22 ? l.title.substring(0, 20) + '...' : l.title,
        fullTitle: l.title,
        clicks: l.clicks || 0,
        url: l.url,
        type: l.type
    }));

    // 8. Recent Click Logs (Table)
    const recentLogsRaw = await logsCollection
        .find({})
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();

    const recentLogs = recentLogsRaw.map(log => ({
        id: log._id.toString(),
        time: new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        date: new Date(log.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        title: log.title || "Tautan",
        os: log.os || "Mobile",
        browser: log.browser || "Chrome",
        device: log.device || "Mobile",
        ip: log.ip ? log.ip.replace(/\d+$/, 'xxx') : '182.1.xxx'
    }));

    return {
        kpi: {
            totalClicks: totalClicks || 0,
            totalLinks: totalLinks || 0,
            activeLinks: activeLinks || 0,
            uniqueVisitors: uniqueVisitors || 0,
            todayClicks: todayClicks || 0,
            dailyTargetPercentage: dailyTargetPercentage || 0
        },
        dailyTrends,
        osBreakdown,
        browserBreakdown,
        dayOfWeekData,
        top10Links,
        recentLogs,
        links: allLinks
    };
}

export default async function handler(req, res) {
    const session = await getSession({ req });
    if (!session) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const data = await getDashboardAggregations();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Enterprise stats aggregation error:", error);
        return res.status(500).json({ success: false, message: "Gagal memuat statistik." });
    }
}
