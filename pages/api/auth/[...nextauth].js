import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDatabase, ensureMasterAdmin } from "../../../lib/dbHelper";
import bcrypt from "bcryptjs";

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username / Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Username dan password wajib diisi");
                }

                const db = await getDatabase();
                await ensureMasterAdmin(db);

                const normalizedInput = credentials.username.trim().toLowerCase();

                // Find admin by email or username
                const admin = await db.collection("admins").findOne({
                    $or: [
                        { email: normalizedInput },
                        { username: normalizedInput },
                        { username: credentials.username.trim() }
                    ]
                });

                if (!admin) {
                    throw new Error("Akun admin tidak ditemukan");
                }

                // Verify bcrypt password
                const isPasswordValid = await bcrypt.compare(credentials.password, admin.password);
                if (!isPasswordValid) {
                    throw new Error("Password yang Anda masukkan salah");
                }

                return {
                    id: admin._id.toString(),
                    name: admin.username || "Mufaddhol",
                    email: admin.email || "fadd3079@gmail.com",
                    role: admin.role || "admin",
                    brand: admin.brand || "Fadd Graphics"
                };
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET || "faddgraphics_super_secret_jwt_key_2026",
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.brand = user.brand;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.brand = token.brand;
            }
            return session;
        }
    },
    pages: {
        signIn: "/admin/login",
        error: "/admin/login"
    }
});