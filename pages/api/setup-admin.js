import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const db = client.db("linktree_clone");

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
