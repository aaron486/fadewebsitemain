Google Sheet → World Cup signatures
====================================

This connects the `fade.bet/worldcup` enroll form to a Google Sheet, in
addition to Supabase. The page sends each signup to a Google Apps Script
"web app" that appends a row to your sheet.

ONE-TIME SETUP
--------------
1. Create a Google Sheet (e.g. "Fade — World Cup Signatures").
   Add a tab named `Signatures` with these headers in row 1:
       Timestamp | Name | Email | Campaign

2. In that sheet: Extensions → Apps Script. Delete any boilerplate and
   paste the code below. Save.

3. Deploy → New deployment → gear icon → "Web app".
       - Description: worldcup signatures
       - Execute as: Me
       - Who has access: Anyone
   Click Deploy, authorize when prompted, and COPY the Web app URL
   (looks like https://script.google.com/macros/s/AKfyc.../exec).

4. Paste that URL into public/worldcup.html, into the line:
       var SHEET_WEBHOOK_URL = '';
   …so it reads:
       var SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfyc.../exec';
   Commit + deploy. New signups now append to the sheet in real time.

   (Or just send me the URL and I'll drop it in and ship it.)

NOTE ON UPDATES: each time you change the Apps Script code you must
Deploy → Manage deployments → edit → Version: New version, or the live
URL keeps running the old code.

APPS SCRIPT CODE
----------------
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Signatures') || ss.getSheets()[0];
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
    sheet.appendRow([
      data.ts || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.campaign || ''
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: lets you open the /exec URL in a browser to confirm it's live.
function doGet() {
  return ContentService.createTextOutput('Fade signatures endpoint OK');
}
