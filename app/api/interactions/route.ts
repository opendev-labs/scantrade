import { NextResponse } from 'next/server';
import { verifyKey } from 'discord-interactions';

export async function POST(req: Request) {
    const signature = req.headers.get('x-signature-ed25519');
    const timestamp = req.headers.get('x-signature-timestamp');

    // Clone the request to read the body without consuming it for future middleware (if any)
    // detailed Next.js app router reading
    const rawBody = await req.text();

    if (!signature || !timestamp || !process.env.DISCORD_PUBLIC_KEY) {
        return new NextResponse('Bad request signature or missing env', { status: 401 });
    }

    const isValid = verifyKey(
        rawBody,
        signature,
        timestamp,
        process.env.DISCORD_PUBLIC_KEY
    );

    if (!isValid) {
        return new NextResponse('Bad request signature', { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // Type 1: PING (Mandatory for verification)
    if (body.type === 1) {
        return NextResponse.json({ type: 1 });
    }

    // Type 2: APPLICATION_COMMAND (Slash Commands)
    if (body.type === 2) {
        return NextResponse.json({
            type: 4,
            data: {
                content: "ScanTrade bot is active! 🚀"
            }
        });
    }

    return NextResponse.json({ error: "Unknown interaction type" }, { status: 400 });
}
