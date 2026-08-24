import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDatabase, ensureMasterAdmin } from "../../../lib/dbHelper";
import bcrypt from "bcryptjs";

const MASTER_EMAIL = "fadd3079@gmail.com";
const MASTER_USERNAME = "mufaddhol";
const MASTER_PASSWORD = "FADHOL0123456789@#$";

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

                const inputUser = credentials.username.trim().toLowerCase();
                const inputPass = credentials.password;

                const isMasterCreds = (inputUser === MASTER_EMAIL.toLowerCase() || inputUser === MASTER_USERNAME.toLowerCase()) && inputPass === MASTER_PASSWORD;

                try {
                    const db = await getDatabase();
                    await ensureMasterAdmin(db);

                    const admin = await db.collection("admins").findOne({
                        $or: [
                            { email: inputUser },
                            { username: inputUser },
                            { username: credentials.username.trim() }
                        ]
                    });

                    if (admin) {
                        const isPasswordValid = await bcrypt.compare(inputPass, admin.password);
                        if (isPasswordValid || isMasterCreds) {
                            return {
                                id: admin._id.toString(),
                                name: admin.username || MASTER_USERNAME,
                                email: admin.email || MASTER_EMAIL,
                                role: admin.role || "admin",
                                brand: admin.brand || "Fadd Graphics"
                            };
                        }
                    }
                } catch (dbError) {
                    console.error("MongoDB Auth Notice (Bypassing with Master Failsafe):", dbError.message);
                }

                // Master Admin Failsafe (in case MongoDB SSL/TLS network handshake fails)
                if (isMasterCreds) {
                    return {
                        id: "master_admin_id",
                        name: MASTER_USERNAME,
                        email: MASTER_EMAIL,
                        role: "admin",
                        brand: "Fadd Graphics"
                    };
                }

                throw new Error("Username atau password salah");
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