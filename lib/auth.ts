import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "trader@scantrade.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Professional fallback for demo/admin access
                if (credentials?.email === "admin@scantrade.com" && credentials?.password === "admin123") {
                    return { id: "1", name: "System Administrator", email: "admin@scantrade.com", role: "admin" }
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
                session.user.id = token.sub;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Ensure internal redirects stay internal
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/signin", // Error code passed in query string as ?error=
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};
