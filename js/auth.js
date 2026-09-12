import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "GANTI_DENGAN_API_KEY_ASLI",
  authDomain: "zaxin-abe14.firebaseapp.com",
  databaseURL: "https://zaxin-abe14-default-rtdb.firebaseio.com",
  projectId: "zaxin-abe14",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ==== Login ====
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("loginError");
    errorEl.textContent = "";
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "dashboard.html";
    } catch (err) {
      errorEl.textContent = "Email atau password salah.";
    }
  });
}

// ==== Register ====
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("registerError");
    errorEl.textContent = "";
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Simpan profil dasar; role default "member" — hanya bisa diubah manual jadi "admin" lewat Firebase Console
      await set(ref(db, "users/" + cred.user.uid), {
        name,
        email,
        role: "member",
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      });
      window.location.href = "dashboard.html";
    } catch (err) {
      errorEl.textContent = "Gagal daftar. Cek email/password, lalu coba lagi.";
    }
  });
}
