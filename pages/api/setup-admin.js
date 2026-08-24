import { getDatabase, ensureMasterAdmin, ensureDefaultLinks } from "../../lib/dbHelper";

export default async function handler(req, res) {
    try {
        const db = await getDatabase();
        await ensureMasterAdmin(db);
        await ensureDefaultLinks(db);

        const admin = await db.collection("admins").findOne({ email: "fadd3079@gmail.com" });

        return res.status(200).json({
            success: true,
            message: "Master admin dan database berhasil disiapkan!",
            admin: {
                username: admin?.username,
                email: admin?.email,
                role: admin?.role,
                brand: admin?.brand
            }
        });
    } catch (error) {
        console.error("Setup Error:", error);
        return res.status(500).json({ success: false, error: "Gagal menyiapkan database." });
    }
}
