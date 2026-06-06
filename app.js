/* ============================================================
   SE2026 PORTAL – app.js
   Backend : Google Apps Script API
   Database: Google Spreadsheet (1LlbKHySNFJ1Xj2aBQenRQ6dflp038ATTpWPIp4pcio0)
   ============================================================ */

// ── CONFIG ───────────────────────────────────────────────────
const CONFIG = {
  // Setelah deploy Apps Script, tempel URL-nya di sini dan set USE_DEMO: false
  API_URL  : 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
  USE_DEMO : true,
};

// ── DEMO DATA (sesuai struktur spreadsheet asli) ──────────────
const DEMO_DATA = [
  // PDF
  { id:'pdf_1',  judul:'Penjelasan Umum SE2026',                kategori:'Materi Umum',               tipe:'pdf',   url:'https://drive.google.com/uc?export=download&id=1poDL5hLHxTVRErk0raaSv3EOd', urlRaw:'https://drive.google.com/file/d/1poDL5hLHxTVRErk0raaSv3EOd/view' },
  { id:'pdf_2',  judul:'Metodologi SE2026',                     kategori:'Metodologi dan Konsep',      tipe:'pdf',   url:'https://drive.google.com/uc?export=download&id=1U7Emo9pKc', urlRaw:'' },
  { id:'pdf_3',  judul:'Manajemen Lapangan SE2026',             kategori:'Manajemen Lapangan',         tipe:'pdf',   url:'#', urlRaw:'' },
  { id:'pdf_4',  judul:'FASIH Mobile SE2026',                   kategori:'Aplikasi dan Teknologi',     tipe:'pdf',   url:'#', urlRaw:'' },
  { id:'pdf_5',  judul:'Pemutakhiran Kuesioner P SE2026',       kategori:'Pemutakhiran dan Pencacahan', tipe:'pdf',  url:'#', urlRaw:'' },
  { id:'pdf_6',  judul:'Tata Cara Pengisian Kuesioner L',       kategori:'Pengisian Kuesioner',        tipe:'pdf',   url:'#', urlRaw:'' },
  { id:'pdf_7',  judul:'Tabel Rangkuman Kasus Pencatatan Keluarga', kategori:'Kasus dan Referensi Pencatatan', tipe:'pdf', url:'#', urlRaw:'' },
  { id:'pdf_8',  judul:'Tata Cara Pengisian Kuesioner L Sosek SE2026', kategori:'Pengisian Kuesioner', tipe:'pdf',  url:'#', urlRaw:'' },
  { id:'pdf_9',  judul:'KBLI Dalam SE2026',                     kategori:'Klasifikasi Usaha',          tipe:'pdf',   url:'#', urlRaw:'' },
  { id:'pdf_10', judul:'Kasus Batas SE2026',                    kategori:'Kasus dan Referensi Pencatatan', tipe:'pdf', url:'#', urlRaw:'' },
  // VIDEO
  { id:'vid_1',  judul:'Penjelasan Umum',                       kategori:'Materi Dasar SE2026',        tipe:'video', url:'https://www.youtube.com/embed/Wy4NO7wi-Woo', urlRaw:'https://youtu.be/Wy4NO7wi-Woo' },
  { id:'vid_2',  judul:'Pendahuluan Metodologi SE2026',         kategori:'Materi Dasar SE2026',        tipe:'video', url:'https://www.youtube.com/embed/WUxWGl7si', urlRaw:'' },
  { id:'vid_3',  judul:'Konsep Definisi Usaha',                 kategori:'Materi Dasar SE2026',        tipe:'video', url:'https://www.youtube.com/embed/eXcCTU', urlRaw:'' },
  { id:'vid_4',  judul:'Tata Cara Pemutakhiran SE2026',         kategori:'Pemutakhiran dan Pendataan',  tipe:'video', url:'https://www.youtube.com/embed/U3HSo7si', urlRaw:'' },
  { id:'vid_5',  judul:'Struktur Organisasi Lapangan Lengkap SE2026', kategori:'Organisasi dan Manajemen Lapangan', tipe:'video', url:'https://www.youtube.com/embed/v6OFGEA2', urlRaw:'' },
  { id:'vid_6',  judul:'Mekanisme Pendataan Usaha Besar',       kategori:'Pemutakhiran dan Pendataan',  tipe:'video', url:'https://www.youtube.com/embed/jcMZPFBjmBg', urlRaw:'' },
  { id:'vid_7',  judul:'Mekanisme Pendataan Door To Door',      kategori:'Pemutakhiran dan Pendataan',  tipe:'video', url:'https://www.youtube.com/embed/tIEqDRtvNto', urlRaw:'' },
  { id:'vid_8',  judul:'Pengenalan Fasih',                      kategori:'Aplikasi Pendukung',         tipe:'video', url:'https://www.youtube.com/embed/pQktFwBDRml', urlRaw:'' },
  { id:'vid_9',  judul:'Penggunaan Fasih SE2026',               kategori:'Aplikasi Pendukung',         tipe:'video', url:'https://www.youtube.com/embed/WEldvC_VTIA', urlRaw:'' },
  { id:'vid_10', judul:'KBLI SE2026',                           kategori:'Konsep dan Karakteristik Usaha', tipe:'video', url:'https://www.youtube.com/embed/OZdsVL-RI2c', urlRaw:'' },
];

// ── STATE ────────────────────────────────────────────────────
let allMateri  = [];
let favorit    = JSON.parse(localStorage.getItem('se2026_fav') || '[]');
let activeView = 'beranda';
let searchQ    = '';
let filterKat  = 'semua';
let filterType = 'semua';
let filterSort = 'terbaru';

// ── DOM REFS ─────────────────────────────────────────────────
const sidebar        = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const hamburger      = document.getElementById('hamburger');
const sidebarClose   = document.getElementById('sidebarClose');
const searchInput    = document.getElementById('searchInput');
const searchClear    = document.getElementById('searchClear');
const materiGrid     = document.getElementById('materiGrid');
const favGrid        = document.getElementById('favGrid');
const filterKatEl    = document.getElementById('filterKategori');
const filterTypeEl   = document.getElementById('filterType');
const filterSortEl   = document.getElementById('filterSort');
const resultCount    = document.getElementById('resultCount');
const favCount       = document.getElementById('favCount');
const modalOverlay   = document.getElementById('modalOverlay');
const modalClose     = document.getElementById('modalClose');
const modalContent   = document.getElementById('modalContent');
const toast          = document.getElementById('toast');

// ── SIDEBAR ───────────────────────────────────────────────────
function openSidebar()  { sidebar.classList.add('open'); sidebarOverlay.classList.add('show'); document.body.style.overflow='hidden'; }
function closeSidebar() { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('show'); document.body.style.overflow=''; }
hamburger.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

// ── VIEW SWITCH ───────────────────────────────────────────────
function showView(view) {
  activeView = view;
  document.getElementById('viewBeranda').style.display = view==='beranda' ? 'block' : 'none';
  document.getElementById('viewMateri').style.display  = view==='materi'  ? 'block' : 'none';
  document.getElementById('viewFavorit').style.display = view==='favorit' ? 'block' : 'none';
  document.querySelectorAll('.nav-item[data-view]').forEach(el =>
    el.classList.toggle('active', el.dataset.view === view));
  if (view==='materi')  renderMateri();
  if (view==='favorit') renderFavorit();
  if (window.innerWidth<=768) closeSidebar();
  window.scrollTo(0,0);
}
document.querySelectorAll('[data-view]').forEach(el =>
  el.addEventListener('click', e => { e.preventDefault(); showView(el.dataset.view); }));
document.getElementById('btnMulai').addEventListener('click', () => showView('materi'));

// ── SIDEBAR KATEGORI ──────────────────────────────────────────
function buildSidebarKategori(kats) {
  const container = document.getElementById('sidebarKategori');
  const all = [{ label:'Semua Kategori', val:'semua', icon:'🗂️' },
               ...kats.map(k => ({ label:k, val:k, icon:'📁' }))];
  container.innerHTML = all.map(k => `
    <a href="#" class="nav-item kategori-item${filterKat===k.val?' active':''}" data-kat="${k.val}">
      <span class="nav-icon">${k.icon}</span> ${k.label}
    </a>`).join('');
  container.querySelectorAll('.kategori-item').forEach(el =>
    el.addEventListener('click', e => {
      e.preventDefault();
      filterKat = el.dataset.kat;
      filterKatEl.value = filterKat;
      buildSidebarKategori(kats);
      showView('materi');
    }));
}

// ── SIDEBAR TYPE FILTER ───────────────────────────────────────
document.querySelectorAll('.filter-type').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    filterType = el.dataset.type;
    filterTypeEl.value = filterType;
    document.querySelectorAll('.filter-type').forEach(x => x.classList.remove('active'));
    el.classList.add('active');
    showView('materi');
  }));

// ── FETCH DATA ────────────────────────────────────────────────
async function fetchMateri() {
  if (CONFIG.USE_DEMO) {
    await new Promise(r => setTimeout(r, 700));
    return DEMO_DATA;
  }
  const res  = await fetch(`${CONFIG.API_URL}?action=getMateri`);
  const json = await res.json();
  if (json.status !== 'ok') throw new Error(json.message);
  return json.data || [];
}

async function initData() {
  try {
    allMateri = await fetchMateri();
  } catch(err) {
    console.warn('API error, using demo data:', err);
    showToast('⚠️ Menggunakan data demo – hubungkan Apps Script untuk data real.');
    allMateri = DEMO_DATA;
  }
  updateStats();
  populateKategoriOptions();
}

// ── STATS ─────────────────────────────────────────────────────
function updateStats() {
  const pdfs  = allMateri.filter(m => m.tipe==='pdf').length;
  const vids  = allMateri.filter(m => m.tipe==='video').length;
  const kats  = [...new Set(allMateri.map(m => m.kategori))].length;
  animNum('statTotal', allMateri.length);
  animNum('statPdf',   pdfs);
  animNum('statVideo', vids);
  animNum('statKat',   kats);
}
function animNum(id, target) {
  const el = document.getElementById(id);
  let cur = 0; const step = Math.ceil(target/30);
  const iv = setInterval(() => { cur=Math.min(cur+step,target); el.textContent=cur; if(cur>=target) clearInterval(iv); }, 28);
}

// ── KATEGORI OPTIONS ──────────────────────────────────────────
function populateKategoriOptions() {
  const kats = [...new Set(allMateri.map(m => m.kategori))].sort();
  filterKatEl.innerHTML = `<option value="semua">🗂️ Semua Kategori</option>` +
    kats.map(k => `<option value="${k}">${k}</option>`).join('');
  buildSidebarKategori(kats);
}

// ── FILTER ────────────────────────────────────────────────────
function getFiltered() {
  let data = [...allMateri];
  if (searchQ) {
    const q = searchQ.toLowerCase();
    data = data.filter(m =>
      m.judul.toLowerCase().includes(q) ||
      m.kategori.toLowerCase().includes(q));
  }
  if (filterKat  !== 'semua') data = data.filter(m => m.kategori === filterKat);
  if (filterType !== 'semua') data = data.filter(m => m.tipe     === filterType);
  if (filterSort === 'az')      data.sort((a,b) => a.judul.localeCompare(b.judul));
  if (filterSort === 'favorit') data.sort((a,b) => (favorit.includes(b.id)?1:0)-(favorit.includes(a.id)?1:0));
  return data;
}

// ── RENDER MATERI ─────────────────────────────────────────────
function renderMateri() {
  const data = getFiltered();
  resultCount.textContent = `${data.length} materi`;
  if (!data.length) {
    materiGrid.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><h3>Materi Tidak Ditemukan</h3><p>Coba ubah kata kunci atau filter.</p></div>`;
    return;
  }
  materiGrid.innerHTML = data.map((m,i) => cardHTML(m,i)).join('');
  bindCardEvents(materiGrid);
}

// ── RENDER FAVORIT ────────────────────────────────────────────
function renderFavorit() {
  const data = allMateri.filter(m => favorit.includes(m.id));
  favCount.textContent = `${data.length} materi`;
  if (!data.length) {
    favGrid.innerHTML = `<div class="fav-empty-full"><div class="empty-icon">⭐</div><h3>Belum Ada Favorit</h3><p>Tandai materi dengan ⭐ untuk disimpan di sini.</p></div>`;
    return;
  }
  favGrid.innerHTML = data.map((m,i) => cardHTML(m,i)).join('');
  bindCardEvents(favGrid);
}

// ── CARD HTML ─────────────────────────────────────────────────
function cardHTML(m, i) {
  const isPdf = m.tipe === 'pdf';
  const isFav = favorit.includes(m.id);
  return `
    <div class="materi-card" data-id="${m.id}" style="animation-delay:${i*0.04}s">
      <div class="card-top ${isPdf?'pdf-bg':'vid-bg'}">
        <div class="card-type-icon">${isPdf?'📄':'🎬'}</div>
        <div class="card-top-deco"></div>
        <span class="badge-type ${isPdf?'badge-pdf':'badge-video'}">${isPdf?'PDF':'VIDEO'}</span>
        <button class="btn-fav${isFav?' aktif':''}" data-id="${m.id}">${isFav?'⭐':'☆'}</button>
      </div>
      <div class="card-body">
        <div class="card-kat">${m.kategori}</div>
        <div class="card-title">${m.judul}</div>
        <div class="card-footer">
          <div class="card-actions">
            <button class="btn-action btn-view" data-id="${m.id}">👁 Detail</button>
            ${isPdf ? `<button class="btn-action btn-dl" data-id="${m.id}">⬇ Unduh</button>` : `<button class="btn-action btn-watch" data-id="${m.id}">▶ Tonton</button>`}
          </div>
        </div>
      </div>
    </div>`;
}

// ── BIND CARD EVENTS ──────────────────────────────────────────
function bindCardEvents(container) {
  container.querySelectorAll('.btn-fav').forEach(btn =>
    btn.addEventListener('click', e => { e.stopPropagation(); toggleFavorit(btn.dataset.id); }));
  container.querySelectorAll('.btn-view').forEach(btn =>
    btn.addEventListener('click', e => { e.stopPropagation(); openModal(btn.dataset.id); }));
  container.querySelectorAll('.btn-dl').forEach(btn =>
    btn.addEventListener('click', e => { e.stopPropagation(); downloadItem(btn.dataset.id); }));
  container.querySelectorAll('.btn-watch').forEach(btn =>
    btn.addEventListener('click', e => { e.stopPropagation(); openModal(btn.dataset.id); }));
  container.querySelectorAll('.materi-card').forEach(card =>
    card.addEventListener('click', () => openModal(card.dataset.id)));
}

// ── FAVORIT ───────────────────────────────────────────────────
function toggleFavorit(id) {
  const idx = favorit.indexOf(id);
  if (idx===-1) { favorit.push(id); showToast('⭐ Ditambahkan ke Favorit!'); }
  else          { favorit.splice(idx,1); showToast('✕ Dihapus dari Favorit.'); }
  localStorage.setItem('se2026_fav', JSON.stringify(favorit));
  document.querySelectorAll(`.btn-fav[data-id="${id}"]`).forEach(btn => {
    const isFav = favorit.includes(id);
    btn.classList.toggle('aktif', isFav);
    btn.textContent = isFav ? '⭐' : '☆';
  });
  if (activeView==='favorit') renderFavorit();
}

// ── DOWNLOAD ──────────────────────────────────────────────────
function downloadItem(id) {
  const m = allMateri.find(x => x.id===id);
  if (!m) return;
  if (!m.url || m.url==='#') { showToast('⚠️ File belum tersedia untuk diunduh.'); return; }
  showToast('⬇ Mengunduh: '+m.judul);
  const a = document.createElement('a');
  a.href = m.url; a.download = m.judul+'.pdf'; a.target='_blank';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

// ── MODAL ─────────────────────────────────────────────────────
function openModal(id) {
  const m = allMateri.find(x => x.id===id);
  if (!m) return;
  const isPdf = m.tipe==='pdf';
  const isFav = favorit.includes(id);

  let mediaHTML = '';
  if (!isPdf && m.url && m.url!=='#') {
    mediaHTML = `<div class="video-embed-wrap">
      <iframe src="${m.url}?rel=0" frameborder="0" allowfullscreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
    </div>`;
  }

  // PDF preview thumbnail
  let pdfPreview = '';
  if (isPdf) {
    pdfPreview = `<div class="pdf-preview-box">
      <div class="pdf-icon-big">📄</div>
      <div class="pdf-preview-label">Dokumen PDF</div>
    </div>`;
  }

  modalContent.innerHTML = `
    <div class="modal-header">
      <span class="modal-badge-type ${isPdf?'badge-pdf':'badge-video'}">${isPdf?'📄 Dokumen PDF':'🎬 Video'}</span>
      <div class="modal-title">${m.judul}</div>
      <div class="modal-kat">📁 ${m.kategori}</div>
    </div>
    ${mediaHTML || pdfPreview}
    <hr class="modal-divider"/>
    <div class="modal-meta">
      <div class="modal-meta-item"><strong>Tipe Materi</strong><span>${isPdf?'Dokumen PDF':'Video'}</span></div>
      <div class="modal-meta-item"><strong>Kategori</strong><span>${m.kategori}</span></div>
    </div>
    <div class="modal-actions">
      ${isPdf
        ? `<button class="modal-btn modal-btn-primary" onclick="downloadItem('${id}')">⬇ Unduh PDF</button>`
        : (m.url&&m.url!=='#'
            ? `<a class="modal-btn modal-btn-primary" href="${m.urlRaw||m.url}" target="_blank">▶ Buka di YouTube</a>`
            : '')}
      <button class="modal-btn modal-btn-fav${isFav?' aktif':''}" id="modalFavBtn" onclick="toggleFavorit('${id}'); updateModalFav('${id}')">
        ${isFav?'⭐ Hapus Favorit':'☆ Tambah Favorit'}
      </button>
    </div>`;

  modalOverlay.classList.add('show');
  document.body.style.overflow='hidden';
}

function updateModalFav(id) {
  const btn  = document.getElementById('modalFavBtn');
  const isFav = favorit.includes(id);
  if (btn) {
    btn.textContent = isFav ? '⭐ Hapus Favorit' : '☆ Tambah Favorit';
    btn.classList.toggle('aktif', isFav);
  }
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if(e.target===modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });
function closeModal() { modalOverlay.classList.remove('show'); document.body.style.overflow=''; }

// ── SEARCH ────────────────────────────────────────────────────
let st;
searchInput.addEventListener('input', () => {
  searchQ = searchInput.value.trim();
  searchClear.classList.toggle('show', !!searchQ);
  clearTimeout(st);
  st = setTimeout(() => { if(activeView!=='materi') showView('materi'); else renderMateri(); }, 280);
});
searchClear.addEventListener('click', () => {
  searchInput.value=''; searchQ=''; searchClear.classList.remove('show'); renderMateri();
});

// ── DROPDOWN FILTERS ──────────────────────────────────────────
filterKatEl.addEventListener('change',  () => { filterKat  = filterKatEl.value;  renderMateri(); });
filterTypeEl.addEventListener('change', () => { filterType = filterTypeEl.value; renderMateri(); });
filterSortEl.addEventListener('change', () => { filterSort = filterSortEl.value; renderMateri(); });

// ── TOAST ─────────────────────────────────────────────────────
let tt;
function showToast(msg) {
  toast.textContent=msg; toast.classList.add('show');
  clearTimeout(tt); tt=setTimeout(()=>toast.classList.remove('show'),3000);
}

// ── INIT ──────────────────────────────────────────────────────
initData();
