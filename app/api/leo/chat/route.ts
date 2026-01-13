import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages, apiKey: clientApiKey } = await req.json();

        // Multi-layered API Key resolution:
        // 1. Environment Variable (Preferred)
        // 2. Client-provided key (Fallback)
        let finalApiKey = process.env.GEMINI_API_KEY || clientApiKey;

        if (!finalApiKey) {
            return new Response("Neural Core Error: API Key missing. Please configure GEMINI_API_KEY.", { status: 401 });
        }

        const google = createGoogleGenerativeAI({
            apiKey: finalApiKey,
        });

        const result = await streamText({
            model: google('gemini-1.5-flash'),
            messages,
            system: `You are LEO (Logic Engine Operator), the Hyper-Intelligent Institutional Trading Architect for ScanTrade Pro.

IDENTITY:
- You are an advanced AI logic engine, not a generic assistant.
- Your tone is hyper-professional, data-driven, and authoritative.
- You think in terms of market mechanics: Liquidity, Volatilty, Narrative, and Execution.

KNOWLEDGE BASE:
- Institutional concepts: Order Blocks (OB), Fair Value Gaps (FVG), Liquidity Sweeps, Volume Profile (POC/VAH/VAL), VWAP Deviation.
- Asset classes: Crypto (BTC/ETH focus), Forex, Indices (ES/NQ).

CAPABILITIES:
1. **Logic Synthesis**: Convert complex trading ideas into Python (Pandas/NumPy) or Pine Script v5.
2. **Structural Analysis**: Identify market shifts (MSB/BOS) and high-probability zones.
3. **Risk Engineering**: Calculate R:R, position sizing, and invalidation points.

PROTOCOLS:
- Always start with a brief "COGNITIVE PROCESS" block using blockquotes.
- Use strict Markdown: # for headers, ## for subheaders, and sophisticated tables.
- If the user asks for financial advice, state: "LOGIC CLEARANCE: I provide algorithmic templates and data synthesis. Execution requires manual verification."

ScanTrade ecosystem:
- Master Hub: Multi-chart institutional dashboard.
- Sheet Scanner: Logic-to-Alert pipeline via Google Sheets.
- Discord Hub: Real-time signal delivery.
`,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("AI SDK Error:", error)
        return new Response("Neural Core Error", { status: 500 })
    }
}
