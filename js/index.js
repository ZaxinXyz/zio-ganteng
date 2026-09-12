// ==== Firebase config ====
// Pakai project Firebase yang sama dengan KacungComunity (zaxin-abe14).
// Ganti apiKey, authDomain, dan appId di bawah sesuai config asli project kamu.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "GANTI_DENGAN_API_KEY_ASLI",
  authDomain: "zaxin-abe14.firebaseapp.com",
  databaseURL: "https://zaxin-abe14-default-rtdb.firebaseio.com",
  projectId: "zaxin-abe14",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ==== Auth area: ganti tombol "Masuk" jadi "Dashboard" kalau sudah login ====
onAuthStateChanged(auth, (user) => {
  const authArea = document.getElementById("authArea");
  if (user) {
    authArea.innerHTML = `<a href="dashboard.html" class="btn-ghost">Dashboard</a>`;
  } else {
    authArea.innerHTML = `<a href="login.html" class="btn-ghost">Masuk</a>`;
  }
});

// ==== Render artikel publik dari node kacungers/articles ====
const articleGrid = document.getElementById("articleGrid");
const articleEmpty = document.getElementById("articleEmpty");

onValue(ref(db, "kacungers/articles"), (snapshot) => {
  const data = snapshot.val();
  if (!data) {
    articleEmpty.style.display = "grid";
    return;
  }
  articleEmpty.style.display = "none";
  articleGrid.innerHTML = "";

  const items = Object.entries(data).sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0));

  items.forEach(([id, article]) => {
    const card = document.createElement("div");
    card.className = "panel-card article-card";
    const date = article.createdAt ? new Date(article.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "";
    card.innerHTML = `
      <h3>${escapeHtml(article.title || "Tanpa judul")}</h3>
      <p>${escapeHtml(article.summary || article.content || "")}</p>
      ${date ? `<span class="article-date">${date}</span>` : ""}
    `;
    articleGrid.appendChild(card);
  });
});

// ==== Render galeri publik dari node kacungers/gallery ====
const galleryGrid = document.getElementById("galleryGrid");
const galleryEmpty = document.getElementById("galleryEmpty");

onValue(ref(db, "kacungers/gallery"), (snapshot) => {
  const data = snapshot.val();
  if (!data) {
    galleryEmpty.style.display = "grid";
    return;
  }
  galleryEmpty.style.display = "none";
  galleryGrid.innerHTML = "";

  const items = Object.entries(data).sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0));

  items.forEach(([id, item]) => {
    const cell = document.createElement("div");
    cell.className = "gallery-item";
    cell.innerHTML = `<img src="${escapeAttr(item.url)}" alt="${escapeAttr(item.caption || "Galeri Kacungers")}" loading="lazy">`;
    galleryGrid.appendChild(cell);
  });
});

// ==== Util kecil biar aman dari HTML injection ====
function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(str = "") {
  return escapeHtml(str);
}
