import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, get, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAUtnSKkkgOLJryEqE9Vh6elkXaxMYi42A",
  authDomain: "zaxin-abe14.firebaseapp.com",
  databaseURL: "https://zaxin-abe14-default-rtdb.firebaseio.com",
  projectId: "zaxin-abe14",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ==== Proteksi halaman: harus login ====
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Ambil profil user buat sapaan + cek kalau ternyata admin, arahkan ke admin.html
  const snap = await get(ref(db, "users/" + user.uid));
  const profile = snap.val() || {};

  if (profile.role === "admin") {
    window.location.href = "admin.html";
    return;
  }

  document.getElementById("userName").textContent = profile.name || user.email;
  document.getElementById("userChip").textContent = profile.name || user.email;
});

document.getElementById("btnLogout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ==== Render artikel (read-only) ====
const articleGrid = document.getElementById("articleGrid");
const articleEmpty = document.getElementById("articleEmpty");

onValue(ref(db, "kacungers/articles"), (snapshot) => {
  const data = snapshot.val();
  if (!data) { articleEmpty.style.display = "grid"; return; }
  articleEmpty.style.display = "none";
  articleGrid.innerHTML = "";

  Object.entries(data)
    .sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0))
    .forEach(([id, article]) => {
      const card = document.createElement("div");
      card.className = "panel-card article-card";
      const date = article.createdAt ? new Date(article.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "";
      card.innerHTML = `
        <h3>${escapeHtml(article.title || "Tanpa judul")}</h3>
        <p>${escapeHtml(article.content || article.summary || "")}</p>
        ${date ? `<span class="article-date">${date}</span>` : ""}
      `;
      articleGrid.appendChild(card);
    });
});

// ==== Render galeri (read-only) ====
const galleryGrid = document.getElementById("galleryGrid");
const galleryEmpty = document.getElementById("galleryEmpty");

onValue(ref(db, "kacungers/gallery"), (snapshot) => {
  const data = snapshot.val();
  if (!data) { galleryEmpty.style.display = "grid"; return; }
  galleryEmpty.style.display = "none";
  galleryGrid.innerHTML = "";

  Object.entries(data)
    .sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0))
    .forEach(([id, item]) => {
      const cell = document.createElement("div");
      cell.className = "gallery-item";
      cell.innerHTML = `<img src="${escapeAttr(item.url)}" alt="${escapeAttr(item.caption || "Galeri Kacungers")}" loading="lazy">`;
      galleryGrid.appendChild(cell);
    });
});

function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(str = "") { return escapeHtml(str); }
