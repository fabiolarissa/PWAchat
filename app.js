const gun = Gun({ peers: ["https://gun-manhattan.herokuapp.com/gun"] });
const room = gun.get("pwachat-luxe-room");
const presence = gun.get("pwachat-luxe-presence");

const GEMINI_API_KEY = "AIzaSyBw2CFeExp56hsEqvC7RX7egn8FqeriFAs";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
 
let username = "";
let mediaRecorder;
let chunks = [];
let localQuotes = ["Welcome to PWAchat Luxe ✨"];
let appConfig = { appName: "PWAchat Luxe", roomName: "Global Lounge", botName: "@faacore", themeColor: "#0f1226", welcomeHint: "Pick a username to enter the public live room.", botPersona: "You are luxurious, warm, concise, and witty. Keep replies under 60 words unless asked otherwise.", botMemoryLimit: 12 };
let botMemory = [];

const usernameModal = document.getElementById("usernameModal");
const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const messagesEl = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const fileInput = document.getElementById("fileInput");
const recordBtn = document.getElementById("recordBtn");
const onlineCount = document.getElementById("onlineCount");

loadConfig();
loadQuotes();
loadMemory();

joinBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (!name) return;
  username = name;
  localStorage.setItem("pwachat_name", username);
  usernameModal.classList.remove("show");

  presence.get(`${username}-${Date.now()}`).put({ username, ts: Date.now() });
  sendBotPresenceMessage("join", username);
};

usernameInput.value = localStorage.getItem("pwachat_name") || "";

function addMessage(msg) {
  if (!msg || !msg.ts) return;
  const div = document.createElement("div");
  div.className = "msg";
  const date = new Date(msg.ts).toLocaleTimeString();
  div.innerHTML = `<div class='meta'>${msg.user} • ${date}</div><div>${(msg.text || "").replace(/</g, "&lt;")}</div>`;
  if (msg.mediaType === "image") div.innerHTML += `<img src='${msg.media}' alt='upload'/>`;
  if (msg.mediaType === "video") div.innerHTML += `<video controls src='${msg.media}'></video>`;
  if (msg.mediaType === "audio") div.innerHTML += `<audio controls src='${msg.media}'></audio>`;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

room.map().on((msg) => addMessage(msg));

function pushMessage(payload) {
  if (!username) return alert("Choose username first.");
  const msg = { ...payload, user: username, ts: Date.now() };
  room.set(msg);
  if ((msg.text || "").toLowerCase().includes(appConfig.botName.toLowerCase())) {
    remember({ user: username, text: msg.text, ts: msg.ts });
    callBot(msg.text);
  }
}

sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (!text) return;
  pushMessage({ text });
  messageInput.value = "";
};

fileInput.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const data = await fileToDataURL(file);
  const mediaType = file.type.startsWith("video") ? "video" : "image";
  pushMessage({ text: `Shared a ${mediaType}`, media: data, mediaType });
};

recordBtn.onclick = async () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const data = await fileToDataURL(blob);
      pushMessage({ text: "Voice note", media: data, mediaType: "audio" });
    };
    mediaRecorder.start();
    recordBtn.textContent = "⏹️ Stop";
  } else {
    mediaRecorder.stop();
    recordBtn.textContent = "🎙️ Voice Note";
  }
};

async function callBot(prompt) {
  try {
    const lower = prompt.toLowerCase();
    const botName = appConfig.botName || "@faacore";
    if (lower.includes("generate") && lower.includes("image")) {
      const imagePrompt = prompt.replace(new RegExp(botName, "gi"), "").replace(/generate/gi, "").replace(/image/gi, "").trim() || "luxury futuristic lounge";
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&nologo=true`;
      room.set({ user: botName, text: `Generated image for: ${imagePrompt}`, media: imageUrl, mediaType: "image", ts: Date.now() });
      return;
    }

    const answer = await getGeminiResponse(prompt);
    remember({ user: botName, text: answer, ts: Date.now() });
    room.set({ user: botName, text: answer, ts: Date.now() });
  } catch {
    room.set({ user: botName, text: randomQuote(), ts: Date.now() });
  }
}

async function getGeminiResponse(prompt) {
  const memoryContext = botMemory.map((m) => `${m.user}: ${m.text}`).join("\n");
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: `${appConfig.botPersona}\nRoom: ${appConfig.roomName}\nRecent memory:\n${memoryContext || "(none)"}\n\nUser said: ${prompt}` }] }
      ]
    })
  });

  if (!res.ok) throw new Error("Gemini request failed");
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || `${appConfig.botName}: ${randomQuote()}`;
}

setInterval(() => {
  room.set({ user: appConfig.botName, text: `Luxe check-in ✨ ${randomQuote()}`, ts: Date.now() });
}, 5 * 60 * 1000);

presence.map().on((p) => {
  if (!p?.ts || Date.now() - p.ts > 1000 * 60 * 20) return;
  const seen = new Set();
  presence.map().once((x) => x?.username && seen.add(x.username));
  setTimeout(() => (onlineCount.textContent = `Online: ${Math.max(1, seen.size)}`), 200);
});

window.addEventListener("beforeunload", () => {
  if (!username) return;
  sendBotPresenceMessage("leave", username);
});

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function randomQuote() {
  return localQuotes[Math.floor(Math.random() * localQuotes.length)] || "Keep the conversation flowing.";
}

async function loadQuotes() {
  try {
    const q = await fetch("quotes.json");
    const list = await q.json();
    if (Array.isArray(list) && list.length) localQuotes = list;
  } catch {}
}


async function sendBotPresenceMessage(type, name) {
  const botName = appConfig.botName || "@faacore";
  const fallback = type === "join"
    ? `✨ ${name} just arrived. Welcome to ${appConfig.roomName}!`
    : `👋 ${name} left the lounge. See you soon.`;

  try {
    const prompt = type === "join"
      ? `Create a short warm welcome message for user ${name} entering ${appConfig.roomName}.`
      : `Create a short polite goodbye message for user ${name} leaving ${appConfig.roomName}.`;
    const ai = await getGeminiResponse(prompt);
    room.set({ user: botName, text: ai || fallback, ts: Date.now() });
  } catch {
    room.set({ user: botName, text: fallback, ts: Date.now() });
  }
}


function remember(entry) {
  botMemory.push(entry);
  const limit = Number(appConfig.botMemoryLimit) || 12;
  if (botMemory.length > limit) botMemory = botMemory.slice(-limit);
  localStorage.setItem("pwachat_bot_memory", JSON.stringify(botMemory));
}

function loadMemory() {
  try {
    const raw = localStorage.getItem("pwachat_bot_memory");
    const parsed = JSON.parse(raw || "[]");
    if (Array.isArray(parsed)) botMemory = parsed;
  } catch {}
}

async function loadConfig() {
  try {
    const res = await fetch("app-config.json");
    const cfg = await res.json();
    appConfig = { ...appConfig, ...cfg };
    document.title = appConfig.appName;
    document.getElementById("appTitle").textContent = appConfig.appName;
    document.getElementById("roomTitle").textContent = appConfig.roomName;
    document.getElementById("welcomeHint").textContent = appConfig.welcomeHint;
    document.getElementById("messageInput").placeholder = `Say something... call ${appConfig.botName} for bot replies`;
    document.querySelector("meta[name=theme-color]").setAttribute("content", appConfig.themeColor);
  } catch {}
}
