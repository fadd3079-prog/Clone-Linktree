import { getDatabase } from "../../../lib/dbHelper";
import { getSession } from "next-auth/react";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    const session = await getSession({ req });
    if (!session) {
        return res.status(401).json({ success: false, message: "Unauthorized. Silakan login terlebih dahulu." });
    }

    const db = await getDatabase();
    const collection = db.collection("links");

    // 1. GET: Ambil semua links
    if (req.method === 'GET') {
        try {
            const links = await collection.find({}).sort({ order: 1, _id: 1 }).toArray();
            return res.status(200).json({ success: true, data: links });
        } catch (error) {
            console.error("Admin fetch links error:", error);
            return res.status(500).json({ success: false, message: "Gagal mengambil data tautan." });
        }
    }

    // 2. POST: Tambah link baru
    if (req.method === 'POST') {
        try {
            const { title, subtitle, badge, url, type, icon, featured, on, order } = req.body || {};

            if (!title || !url || !type) {
                return res.status(400).json({ success: false, message: "Title, URL, dan Kategori/Type wajib diisi." });
            }

            const highestOrderLink = await collection.find({}).sort({ order: -1 }).limit(1).toArray();
            const nextOrder = order !== undefined ? Number(order) : (highestOrderLink[0]?.order || 0) + 1;

            const newLink = {
                title: title.trim(),
                subtitle: (subtitle || "").trim(),
                badge: (badge || "").trim(),
                url: url.trim(),
                type: type.trim(),
                icon: icon ? icon.trim() : "/web.svg",
                featured: Boolean(featured),
                on: on !== false,
                order: nextOrder,
                clicks: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await collection.insertOne(newLink);
            return res.status(201).json({
                success: true,
                message: "Tautan berhasil ditambahkan!",
                data: { ...newLink, _id: result.insertedId }
            });
        } catch (error) {
            console.error("Admin add link error:", error);
            return res.status(500).json({ success: false, message: "Gagal menambahkan tautan." });
        }
    }

    // 3. PUT: Update link
    if (req.method === 'PUT') {
        try {
            const { _id, title, subtitle, badge, url, type, icon, featured, on, order, clicks } = req.body || {};

            if (!_id || !ObjectId.isValid(_id)) {
                return res.status(400).json({ success: false, message: "ID tautan tidak valid." });
            }

            const updateFields = {
                updatedAt: new Date()
            };

            if (title !== undefined) updateFields.title = title.trim();
            if (subtitle !== undefined) updateFields.subtitle = subtitle.trim();
            if (badge !== undefined) updateFields.badge = badge.trim();
            if (url !== undefined) updateFields.url = url.trim();
            if (type !== undefined) updateFields.type = type.trim();
            if (icon !== undefined) updateFields.icon = icon.trim();
            if (featured !== undefined) updateFields.featured = Boolean(featured);
            if (on !== undefined) updateFields.on = Boolean(on);
            if (order !== undefined) updateFields.order = Number(order);
            if (clicks !== undefined) updateFields.clicks = Number(clicks);

            await collection.updateOne(
                { _id: new ObjectId(_id) },
                { $set: updateFields }
            );

            return res.status(200).json({ success: true, message: "Tautan berhasil diperbarui!" });
        } catch (error) {
            console.error("Admin update link error:", error);
            return res.status(500).json({ success: false, message: "Gagal memperbarui tautan." });
        }
    }

    // 4. DELETE: Hapus link
    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;

            if (!id || !ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, message: "ID tautan tidak valid." });
            }

            await collection.deleteOne({ _id: new ObjectId(id) });
            return res.status(200).json({ success: true, message: "Tautan berhasil dihapus!" });
        } catch (error) {
            console.error("Admin delete link error:", error);
            return res.status(500).json({ success: false, message: "Gagal menghapus tautan." });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
}
