import clientPromise from "./mongodb";
import bcrypt from "bcryptjs";
import defaultLinks from "../data/LinksData";

export async function getDatabase() {
    const client = await clientPromise;
    return client.db("linktree_clone");
}

export async function ensureMasterAdmin(db) {
    const adminCollection = db.collection("admins");
    const masterEmail = "fadd3079@gmail.com";
    const masterUsername = "mufaddhol";
    const masterPasswordPlain = "FADHOL0123456789@#$";

    const existingAdmin = await adminCollection.findOne({
        $or: [{ email: masterEmail }, { username: masterUsername }, { username: masterEmail }]
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(masterPasswordPlain, 10);
        await adminCollection.insertOne({
            email: masterEmail,
            username: masterUsername,
            password: hashedPassword,
            role: "admin",
            brand: "Fadd Graphics",
            createdAt: new Date(),
            updatedAt: new Date()
        });
    } else {
        // Ensure email & updated password hash are synced
        const isMatch = await bcrypt.compare(masterPasswordPlain, existingAdmin.password);
        if (!isMatch || !existingAdmin.email) {
            const hashedPassword = await bcrypt.hash(masterPasswordPlain, 10);
            await adminCollection.updateOne(
                { _id: existingAdmin._id },
                {
                    $set: {
                        email: masterEmail,
                        username: masterUsername,
                        password: hashedPassword,
                        role: "admin",
                        brand: "Fadd Graphics",
                        updatedAt: new Date()
                    }
                }
            );
        }
    }
}

export async function ensureDefaultLinks(db) {
    const linksCollection = db.collection("links");
    const count = await linksCollection.countDocuments();
    if (count === 0 && Array.isArray(defaultLinks) && defaultLinks.length > 0) {
        const initialLinks = defaultLinks.map((item, index) => ({
            title: item.title,
            subtitle: item.subtitle || "",
            badge: item.badge || "",
            url: item.url,
            type: item.type,
            icon: item.icon,
            featured: Boolean(item.featured),
            on: item.on !== false,
            order: index + 1,
            clicks: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        }));
        await linksCollection.insertMany(initialLinks);
    }
}
