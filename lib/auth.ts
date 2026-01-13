import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "trader@scantrade.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Placeholder: In a real app, verify against a database
                if (credentials?.email === "admin@scantrade.com" && credentials?.password === "admin123") {
                    return { id: "1", name: "Admin User", email: "admin@scantrade.com", role: "admin" }
                }
                if (credentials?.email === "pro@scantrade.com" && credentials?.password === "pro123") {
                    return { id: "2", name: "Pro Trader", email: "pro@scantrade.com", role: "pro" }
                }
                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: { token: any, user: any }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: { session: any, token: any }) {
            if (session.user) {
                session.user.role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "supersecret",
};
