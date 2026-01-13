import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/auth/signin",
    },
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (NextAuth routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public assets
         * - landing page (/)
         */
        "/((?!api/auth|_next/static|_next/image|favicon.ico|api/leo|api/interactions|logo_transparent.png|$).*)",
    ],
};
