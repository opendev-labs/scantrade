import { NextRequest, NextResponse } from 'next/server';

interface Signal {
    symbol: string;
    action: string;
    price: string;
    timestamp: string;
    source: string;
}

export async function POST(req: NextRequest) {
    try {
        const { sheetId, webhookUrl } = await req.json();

        if (!sheetId) {
            return NextResponse.json({ success: false, error: 'Missing Sheet ID' }, { status: 400 });
        }

        // 1. Fetch CSV from Google Sheets (Public Web Link trick)
        // Format: https://docs.google.com/spreadsheets/d/{sheetId}/export?format=csv
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        console.log(`Fetching Sheet CSV: ${csvUrl}`);

        const sheetRes = await fetch(csvUrl);
        if (!sheetRes.ok) {
            throw new Error(`Failed to fetch sheet. Status: ${sheetRes.status}. Make sure the sheet is "Published to Web" or Public.`);
        }

        const csvText = await sheetRes.text();
        const rows = csvText.split('\n').map(row => row.split(','));

        // 2. Parse Signals
        // Logic: specific column mapping or just detecting active rows
        // For simplicity v1: We assume Row 1 is headers, and we look for any row with values in Col A & B

        const signals: Signal[] = [];
        const validRows = rows.slice(1).filter(r => r[0] && r[1]); // Skip header, check Col A+B

        // Limit to last 5 for demo purposes to avoid spamming
        const recentRows = validRows.slice(-5);

        for (const row of recentRows) {
            // Unsafe simplistic parsing - in prod we'd map headers dynamically
            // Assuming: Col A = Symbol, Col B = Action/Signal, Col C = Price
            const symbol = row[0]?.replace(/"/g, '').trim();
            const action = row[1]?.replace(/"/g, '').trim(); // BUY/SELL/ALERT
            const price = row[2]?.replace(/"/g, '').trim();

            if (symbol && action) {
                signals.push({
                    symbol,
                    action,
                    price: price || 'Market',
                    timestamp: new Date().toISOString(),
                    source: 'Google Sheet'
                });
            }
        }

        // 3. Dispatch to Discord (if Webhook provided)
        let alertSent = false;
        if (webhookUrl && signals.length > 0) {
            // Provide a summary alert
            const latestSignal = signals[signals.length - 1];
            const payload = {
                username: "ScanTrade Connector",
                avatar_url: "https://scantrade.vercel.app/icon.svg",
                embeds: [{
                    title: `🚨 Signal Detected: ${latestSignal.symbol}`,
                    description: `**Action**: ${latestSignal.action}\n**Price**: ${latestSignal.price}`,
                    color: latestSignal.action.toUpperCase().includes('BUY') ? 5763719 : 15548997, // Green or Red
                    footer: { text: `Source: Google Sheet • ${new Date().toLocaleTimeString()}` }
                }]
            };

            try {
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                alertSent = true;
            } catch (err) {
                console.error("Discord Dispatch Failed", err);
            }
        }

        return NextResponse.json({
            success: true,
            signals: signals.reverse(), // Newest first
            alertSent
        });

    } catch (error: any) {
        console.error("Scanner Failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
