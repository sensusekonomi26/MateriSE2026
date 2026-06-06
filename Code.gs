// ============================================================
//  SE2026 PORTAL – Google Apps Script (Code.gs)
//  Spreadsheet: https://docs.google.com/spreadsheets/d/1LlbKHySNFJ1Xj2aBQenRQ6dflp038ATTpWPIp4pcio0
//
//  STRUKTUR SHEET1 (1 baris = 1 pasang materi):
//  A: ID | B: Nama Materi PDF | C: Kategori PDF | D: Link PDF
//  E: Nama Materi Video | F: Kategori Video | G: Link Video
// ============================================================

const SPREADSHEET_ID = '1LlbKHySNFJ1Xj2aBQenRQ6dflp038ATTpWPIp4pcio0';
const SHEET_NAME     = 'Sheet1';

// ── RESPONSE HELPER ──────────────────────────────────────────
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── MAIN HANDLER ─────────────────────────────────────────────
function doGet(e) {
  const action = (e.parameter && e.parameter.action) || 'getMateri';
  try {
    if (action === 'getMateri') return jsonResponse(getMateri());
    return jsonResponse({ status: 'error', message: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

// ── GET MATERI ────────────────────────────────────────────────
function getMateri() {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return { status: 'error', message: 'Sheet tidak ditemukan' };

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { status: 'ok', data: [] };

  // Ambil kolom A–G mulai baris 2
  const values = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  const data   = [];
  let uid      = 1;

  values.forEach(function(row) {
    const id        = row[0]; // Kolom A
    const namaPDF   = String(row[1] || '').trim();
    const katPDF    = String(row[2] || '').trim();
    const linkPDF   = String(row[3] || '').trim();
    const namaVideo = String(row[4] || '').trim();
    const katVideo  = String(row[5] || '').trim();
    const linkVideo = String(row[6] || '').trim();

    // Tambah entri PDF jika ada
    if (namaPDF) {
      data.push({
        id       : 'pdf_' + (id || uid),
        judul    : namaPDF,
        kategori : katPDF || 'Umum',
        tipe     : 'pdf',
        url      : convertDriveLink(linkPDF),
        urlRaw   : linkPDF,
      });
    }

    // Tambah entri Video jika ada
    if (namaVideo) {
      data.push({
        id       : 'vid_' + (id || uid),
        judul    : namaVideo,
        kategori : katVideo || 'Umum',
        tipe     : 'video',
        url      : convertYoutubeEmbed(linkVideo),
        urlRaw   : linkVideo,
      });
    }

    uid++;
  });

  return { status: 'ok', data: data };
}

// ── CONVERT GOOGLE DRIVE LINK → DIRECT DOWNLOAD ──────────────
function convertDriveLink(url) {
  if (!url) return '';
  // Format: /file/d/FILE_ID/view → /uc?export=download&id=FILE_ID
  var match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return 'https://drive.google.com/uc?export=download&id=' + match[1];
  // Sudah format download
  if (url.includes('uc?export=download')) return url;
  return url;
}

// ── CONVERT YOUTUBE LINK → EMBED ─────────────────────────────
function convertYoutubeEmbed(url) {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;
  // youtu.be/VIDEO_ID
  var m1 = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (m1) return 'https://www.youtube.com/embed/' + m1[1];
  // youtube.com/watch?v=VIDEO_ID
  var m2 = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (m2) return 'https://www.youtube.com/embed/' + m2[1];
  // si= format (youtu.be/ID?si=...)
  var m3 = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)\?/);
  if (m3) return 'https://www.youtube.com/embed/' + m3[1];
  return url;
}
