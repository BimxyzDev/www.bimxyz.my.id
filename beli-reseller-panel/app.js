// app.js
// NOTE: storing bot token & chat id in client-side JS is insecure.
// Use server-side endpoint for production.

const BOT_TOKEN = "8227663814:AAFtt534u1yvwc2IJtpve1Q-dn6sqE_2sAQ"; // <-- ganti kalo perlu
const CHAT_ID   = "6629230649";                                 // <-- ganti kalo perlu
const GROUP_LINK = "https://t.me/+IPAh_u5yY7Y2MTk1";             // <-- ganti kalo perlu

// helper: show/hide steps
function showStep(n) {
  document.querySelectorAll(".container > div").forEach(d => d.classList.add("hidden"));
  const el = document.getElementById("step" + n);
  if (el) el.classList.remove("hidden");
  // hide debug unless step4
  if (n !== 4) document.getElementById("debug").classList.add("hidden");
}

// init buttons
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("buyBtn").addEventListener("click", () => showStep(2));
  document.getElementById("backTo1").addEventListener("click", () => showStep(1));
  document.getElementById("toPayment").addEventListener("click", () => {
    // basic validation before going to payment
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value.trim();
    const t = document.getElementById("telegram").value.trim();
    if (!u || !p || !t) {
      alert("Isi username, password, dan username Telegram terlebih dahulu.");
      return;
    }
    showStep(3);
  });
  document.getElementById("backTo2").addEventListener("click", () => showStep(2));
  document.getElementById("groupBtn").addEventListener("click", () => window.open(GROUP_LINK, "_blank"));
  document.getElementById("sendBtn").addEventListener("click", sendToTelegram);
  document.getElementById("copyBtn").addEventListener("click", copySnippet);
});

// convert file to dataURL (if needed to preview/resend)
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = (e) => reject(e);
    r.readAsDataURL(file);
  });
}

// main send function (frontend-only)
async function sendToTelegram() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const telegram = document.getElementById("telegram").value.trim();
  const fileInput = document.getElementById("bukti");
  const sendBtn = document.getElementById("sendBtn");

  if (!username || !password || !telegram || !fileInput.files[0]) {
    alert("Harap isi semua data dan unggah bukti pembayaran!");
    return;
  }

  const tgUser = telegram.startsWith("@") ? telegram : "@" + telegram;
  const caption = `🪪 Data Pembelian Reseller Panel\n👤 Username: ${username}\n🔑 Password: ${password}\n💬 Telegram: ${tgUser}\n🧾 Status: Menunggu verifikasi admin`;

  sendBtn.disabled = true;
  sendBtn.textContent = "Mengirim...";

  try {
    // 1) send photo
    const fd = new FormData();
    fd.append("chat_id", CHAT_ID);
    fd.append("caption", caption);
    fd.append("photo", fileInput.files[0]);
    fd.append("parse_mode", "Markdown");

    const photoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      body: fd
    });
    const photoJson = await photoRes.json();
    if (!photoJson.ok) throw new Error("Gagal kirim photo: " + (photoJson.description || JSON.stringify(photoJson)));

    // 2) send snippet
    const snippet = `{ username: "${username}", password: "${password}" }`;
    const params = new URLSearchParams();
    params.append("chat_id", CHAT_ID);
    params.append("text", snippet);

    const msgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });
    const msgJson = await msgRes.json();
    if (!msgJson.ok) {
      console.warn("Snippet gagal dikirim:", msgJson);
    }

    // show final screen + snippet on client
    showStep(4);
    document.getElementById("snippetBox").textContent = snippet;
    document.getElementById("debug").classList.remove("hidden");

    alert("Bukti terkirim. Tunggu verifikasi admin.");
  } catch (err) {
    console.error(err);
    alert("Error saat mengirim bukti: " + (err.message || err));
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "Kirim Bukti Pembayaran";
  }
}

function copySnippet() {
  const text = document.getElementById("snippetBox").textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert("Snippet disalin ke clipboard.");
  }).catch(err => {
    alert("Gagal salin: " + err);
  });
    }
