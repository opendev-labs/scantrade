
import { NextRequest, NextResponse } from 'next/server';
import { verifyKey, InteractionType, InteractionResponseType } from 'discord-interactions';

export async function POST(req: NextRequest) {
    const signature = req.headers.get('X-Signature-Ed25519');
    const timestamp = req.headers.get('X-Signature-Timestamp');
    const body = await req.text();

    const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

    if (!signature || !timestamp || !PUBLIC_KEY) {
        console.error('Missing signature, timestamp, or DISCORD_PUBLIC_KEY');
        return new NextResponse('Bad request signature', { status: 401 });
    }

    const isValidRequest = verifyKey(
        body,
        signature,
        timestamp,
        PUBLIC_KEY
    );

    if (!isValidRequest) {
        console.error('Invalid request signature');
        return new NextResponse('Bad request signature', { status: 401 });
    }

    const interaction = JSON.parse(body);

    if (interaction.type === InteractionType.PING) {
        return NextResponse.json({
            type: InteractionResponseType.PONG,
        });
    }

    // Future: Handle other interaction types (APPLICATION_COMMAND, etc.)

    return new NextResponse('Unknown interaction type', { status: 400 });
}
