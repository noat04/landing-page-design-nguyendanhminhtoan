# Landing page frontend

## Run local

```bash
npm install
npm run dev
```

## Send signup data to Google Sheet

The `#signup` form sends data to `VITE_GOOGLE_SHEETS_WEB_APP_URL` when this variable is configured.

1. Create a Google Sheet with columns:

```text
Submitted At | Name | Email | Source | Page URL | User Agent
```

2. Open `Extensions > Apps Script` and add:

```js
const SHEET_NAME = 'Sheet1'

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  const data = JSON.parse(e.postData.contents || '{}')

  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.name || '',
    data.email || '',
    data.source || '',
    data.pageUrl || '',
    data.userAgent || '',
  ])

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON)
}
```

3. Deploy as `Web app`:

- Execute as: `Me`
- Who has access: `Anyone`

4. Copy the Web App URL into `.env`:

```bash
VITE_GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Then restart Vite.

## Troubleshooting

- If a direct test returns `401 Unauthorized`, redeploy the Apps Script Web App and set `Who has access` to `Anyone`.
- After changing Apps Script code or permissions, use `Deploy > Manage deployments > Edit > New version`, then copy the latest Web App URL.
- `SHEET_NAME` must match the sheet tab name at the bottom of Google Sheets. The file name at the top is not the tab name.
- The frontend uses `no-cors` for Google Apps Script, so the browser cannot confirm whether the row was written. Check Apps Script executions and the Sheet itself for the real result.
