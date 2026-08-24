import { getDatabase } from "../../lib/dbHelper";
import defaultLinks from "../../data/LinksData";

export default async function handler(req, res) {
    try {
        const db = await getDatabase();
        const linksCollection = db.collection("links");

        // Format and prepare links from data/LinksData.js
        const formattedLinks = defaultLinks.map((item, index) => ({
            title: item.title || "",
            subtitle: item.subtitle || "",
            badge: item.badge || "",
            url: item.url || "",
            type: item.type || "Core Services & Portfolio",
            icon: item.icon || "/web.svg",
            featured: Boolean(item.featured),
            on: item.on !== false,
            order: index + 1,
            clicks: 0,
            totalClicks: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        // Option 1: If force reset requested or collection is empty
        const shouldReplace = req.query.replace === "true" || req.method === "POST";

        if (shouldReplace) {
            await linksCollection.deleteMany({});
            const insertResult = await linksCollection.insertMany(formattedLinks);
            return res.status(200).json({
                success: true,
                message: `Berhasil me-replace dan memasukkan ${insertResult.insertedCount} tautan ke MongoDB.`,
                count: insertResult.insertedCount,
                data: formattedLinks
            });
        }

        // Option 2: Upsert based on title and url to avoid duplicates
        let insertedCount = 0;
        let updatedCount = 0;

        for (const link of formattedLinks) {
            const existing = await linksCollection.findOne({
                $or: [
                    { title: link.title, url: link.url },
                    { title: link.title }
                ]
            });

            if (!existing) {
                await linksCollection.insertOne(link);
                insertedCount++;
            } else {
                await linksCollection.updateOne(
                    { _id: existing._id },
                    {
                        $set: {
                            subtitle: link.subtitle,
                            badge: link.badge,
                            url: link.url,
                            type: link.type,
                            icon: link.icon,
                            featured: link.featured,
                            order: link.order,
                            updatedAt: new Date()
                        },
                        $setOnInsert: {
                            clicks: 0,
                            totalClicks: 0,
                            on: true,
                            createdAt: new Date()
                        }
                    }
                );
                updatedCount++;
            }
        }

        const totalInDb = await linksCollection.countDocuments();

        return res.status(200).json({
            success: true,
            message: `Migrasi selesai! ${insertedCount} tautan baru ditambahkan, ${updatedCount} diperbarui. Total di DB: ${totalInDb}`,
            inserted: insertedCount,
            updated: updatedCount,
            totalInDb
        });
    } catch (error) {
        console.error("Seed links error:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal melakukan seeding tautan ke MongoDB.",
            error: error.message
        });
    }
}
