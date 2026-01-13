import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // This is a stub. In a real app, you would fetch from a database.
    // We'll return dummy data for now.
    return NextResponse.json({
        theme: "dark",
        notifications: true,
        preferredAssets: ["BTC/USDT", "ETH/USDT"],
        userRole: (session.user as any).role || "Free"
    });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Stub for database persistence
        console.log("Saving settings for user:", session.user?.email, body);

        return NextResponse.json({ message: "Settings saved successfully", data: body });
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
