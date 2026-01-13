# 🧪 How to Test ScanTrade Scanner

Since ScanTrade runs in the cloud (Vercel), it cannot read files from your local computer. You must host your **Signals Template** on Google Sheets.

## Step 1: Upload Template
1.  Go to **[Google Sheets](https://sheets.google.com)**.
2.  Click **File > Import > Upload**.
3.  Select your `ScanTrade_Signals_Template.xlsx`.
4.  **Important**: Ensure your columns match this structure:
    *   **Column A**: Symbol (e.g., `BTCUSDT`, `NIFTY`, `TSLA`)
    *   **Column B**: Action (e.g., `BUY`, `SELL`, `ALERT`)
    *   **Column C**: Price (e.g., `98000`, `245.50`)
    *   *(Row 1 should be headers, data starts Row 2)*

## Step 2: Publish to Web (Critical)
To let the Scanner read the data instantly without complex API keys:
1.  In your Google Sheet, go to **File > Share > Publish to web**.
2.  In the dialog:
    *   Select **"Sheet1"** (or your tab name).
    *   Select **"Comma-separated values (.csv)"**.
3.  Click **Publish**.
4.  **Copy the Link**? No, we just need the **ID**.

## Step 3: Get the Sheet ID
Your URL looks like this:
`https://docs.google.com/spreadsheets/d/1CStqiA404-7jfAV_wwcZMVy_pXLEDe2r8xj1XRdA-dg/edit...`

The ID is the long string between `/d/` and `/edit`.
ID: `1CStqiA404-7jfAV_wwcZMVy_pXLEDe2r8xj1XRdA-dg`

## Step 4: Connect & Scan
1.  Go to **[ScanTrade Master Hub](https://scantrade.vercel.app/master)**.
2.  Click **Mission Control** (Sidebar).
3.  Paste your **Sheet ID** in the "Google Sheet ID" field.
4.  Click **Update Dashboard**.
5.  Click **SCAN NETWORK** (Green Play Button).

## 🟢 Expected Result
*   The **Signal Feed** (bottom of screen) will update with your rows.
*   **Discord** will receive an alert (if connected).
