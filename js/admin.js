import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, get, push, set, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAUtnSKkkgOLJryEqE9Vh6elkXaxMYi42A",
  authDomain: "zaxin-abe14.firebaseapp.com",
  databaseURL: "https://zaxin-abe14-default-rtdb.firebaseio.com",
  projectId: "zaxin-abe14",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ==== Proteksi: hanya role "admin" yang boleh masuk halaman ini ====
// Ini proteksi tampilan (UX) saja. Proteksi asli tetap di Firebase Realtime Database Rules:
// node kacungers/* hanya boleh ditulis kalau users/{uid}/role == "admin".
onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "login.html"; return; }

  const snap = await get(ref(db, "users/" + user.uid));
  const profile = snap.val() || {};

  if (profile.role !== "admin") {
    window.location.href = "dashboard.html";
    return;
  }
});

document.getElementById("btnLogout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ==== Tambah Artikel ====
document.getElementById("articleForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("articleTitle").value.trim();
  const content = document.getElementById("articleContent").value.trim();
  if (!title || !content) return;

  const newRef = push(ref(db, "kacungers/articles"));
  await set(newRef, { title, content, createdAt: Date.now() });
  e.target.reset();
});

// ==== Render + hapus Artikel ====
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
        <button class="btn-delete" data-id="${id}">HAPUS</button>
        <h3>${escapeHtml(article.title || "")}</h3>
        <p>${escapeHtml(article.content || "")}</p>
        ${date ? `<span class="article-date">${date}</span>` : ""}
      `;
      card.querySelector(".btn-delete").addEventListener("click", () => {
        remove(ref(db, "kacungers/articles/" + id));
      });
      articleGrid.appendChild(card);
    });
});

// ==== Tambah Foto Galeri ====
document.getElementById("galleryForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = document.getElementById("galleryUrl").value.trim();
  const caption = document.getElementById("galleryCaption").value.trim();
  if (!url) return;

  const newRef = push(ref(db, "kacungers/gallery"));
  await set(newRef, { url, caption, createdAt: Date.now() });
  e.target.reset();
});

// ==== Render + hapus Galeri ====
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
      cell.innerHTML = `
        <button class="btn-delete" data-id="${id}">HAPUS</button>
        <img src="${escapeAttr(item.url)}" alt="${escapeAttr(item.caption || "Galeri Kacungers")}" loading="lazy">
      `;
      cell.querySelector(".btn-delete").addEventListener("click", () => {
        remove(ref(db, "kacungers/gallery/" + id));
      });
      galleryGrid.appendChild(cell);
    });
});

// ==== Render tabel member (read-only) ====
const memberTableBody = document.getElementById("memberTableBody");

onValue(ref(db, "users"), (snapshot) => {
  const data = snapshot.val();
  if (!data) { memberTableBody.innerHTML = "<tr><td colspan='4'>Belum ada member.</td></tr>"; return; }

  memberTableBody.innerHTML = "";
  Object.values(data).forEach((u) => {
    const tr = document.createElement("tr");
    const date = u.createdAt ? new Date(u.createdAt).toLocaleDateString("id-ID") : "-";
    const roleClass = u.role === "admin" ? "role-tag role-tag--admin" : "role-tag";
    tr.innerHTML = `
      <td>${escapeHtml(u.name || "-")}</td>
      <td>${escapeHtml(u.email || "-")}</td>
      <td><span class="${roleClass}">${escapeHtml(u.role || "member")}</span></td>
      <td>${date}</td>
    `;
    memberTableBody.appendChild(tr);
  });
});

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(str = "") { return escapeHtml(str); }
