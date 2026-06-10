/**
 * Concorde AI - Voice Avatar Client
 *
 * Orchestrates Anam avatar + ElevenLabs agent with proper sequencing
 * to avoid video stutter at conversation start.
 */

import { createClient, AnamEvent } from "@anam-ai/js-sdk";
import type AnamClient from "@anam-ai/js-sdk/dist/module/AnamClient";
import { connectElevenLabs, stopElevenLabs } from "./elevenlabs";

// ============================================================================
// STATE
// ============================================================================

let isConnected = false;
let anamClient: AnamClient | null = null;

interface Config {
  anamSessionToken: string;
  elevenLabsAgentId: string;
}

// ============================================================================
// DOM
// ============================================================================

const $ = (id: string) => document.getElementById(id);
const connectBtn = $("connect-btn") as HTMLButtonElement;
const btnText = $("btn-text") as HTMLSpanElement;
const transcript = $("transcript") as HTMLDivElement;
const statusText = $("status-text") as HTMLParagraphElement;
const anamVideo = $("anam-video") as HTMLVideoElement;
const avatarPlaceholder = $("avatar-placeholder") as HTMLDivElement;
const errorContainer = $("error-container") as HTMLDivElement;
const errorText = $("error-text") as HTMLParagraphElement;

// ============================================================================
// UI HELPERS
// ============================================================================

function setLoadingState(state: "idle" | "connecting" | "loading-avatar" | "listening") {
  switch (state) {
    case "idle":
      btnText.textContent = "Start Conversation";
      statusText.textContent = "Disconnected";
      break;
    case "connecting":
      btnText.textContent = "Connecting...";
      statusText.textContent = "Connecting...";
      break;
    case "loading-avatar":
      btnText.textContent = "Loading avatar...";
      statusText.textContent = "Loading avatar...";
      break;
    case "listening":
      btnText.textContent = "End Conversation";
      statusText.textContent = "Listening";
      break;
  }
}

function setConnected(connected: boolean) {
  isConnected = connected;
  connectBtn.classList.toggle("bg-red-600", connected);
  connectBtn.classList.toggle("hover:bg-red-500", connected);
  connectBtn.classList.toggle("bg-labs-600", !connected);
  connectBtn.classList.toggle("hover:bg-labs-500", !connected);

  if (connected) {
    setLoadingState("listening");
  } else {
    setLoadingState("idle");
  }
}

function showVideo(show: boolean) {
  anamVideo.classList.toggle("hidden", !show);
  avatarPlaceholder.classList.toggle("hidden", show);
}

function addMessage(role: "user" | "agent" | "system", text: string) {
  if (transcript.querySelector(".text-center")) {
    transcript.innerHTML = "";
  }

  const color =
    role === "user"
      ? "text-blue-400"
      : role === "agent"
      ? "text-labs-400"
      : "text-zinc-500";
  const label = role === "user" ? "You" : role === "agent" ? "Agent" : "•";

  transcript.insertAdjacentHTML(
    "beforeend",
    `<div class="fade-in">
      <span class="${color} font-medium">${label}:</span>
      <span class="text-zinc-200">${text}</span>
    </div>`
  );
  transcript.scrollTop = transcript.scrollHeight;
}

function showError(message: string) {
  errorText.textContent = message;
  errorContainer.classList.remove("hidden");
  setTimeout(() => errorContainer.classList.add("hidden"), 5000);
}

// ============================================================================
// MAIN
// ============================================================================

async function start() {
  connectBtn.disabled = true;
  setLoadingState("connecting");

  try {
    // Fetch config from server
    const res = await fetch("/api/config");
    const config: Config = await res.json();

    // Initialize Anam avatar
    console.log("[Anam] Creating client...");
    anamClient = createClient(config.anamSessionToken, {
      disableInputAudio: true,
    });

    // Set up listener BEFORE starting the stream to catch the first frame event
    const videoReadyPromise = new Promise<void>((resolve) => {
      anamClient!.addListener(AnamEvent.VIDEO_PLAY_STARTED, () => {
        console.log("[Anam] First video frame rendered, avatar is ready");
        resolve();
      });
    });

    // Start streaming to video element (this starts the Anam session)
    setLoadingState("loading-avatar");
    showVideo(true);
    await anamClient.streamToVideoElement("anam-video");
    console.log(
      "[Anam] Streaming to video element, session:",
      anamClient.getActiveSessionId()
    );

    // Wait until the first video frame is actually displayed
    // This is the key to avoiding the "avatar appears mid-sentence" stutter
    await videoReadyPromise;

    // Now that the session is started AND the avatar is visible,
    // create the agent audio input stream
    const agentAudioInputStream = anamClient.createAgentAudioInputStream({
      encoding: "pcm_s16le",
      sampleRate: 16000,
      channels: 1,
    });

    // Connect ElevenLabs - avatar is visible and ready to lip-sync
    await connectElevenLabs(config.elevenLabsAgentId, {
      onReady: () => {
        setConnected(true);
        addMessage("system", "Connected. Start speaking...");
      },
      onAudio: (audio) => {
        agentAudioInputStream.sendAudioChunk(audio);
      },
      onUserTranscript: (text) => addMessage("user", text),
      onAgentResponse: (text) => {
        agentAudioInputStream.endSequence();
        addMessage("agent", text);
      },
      onInterrupt: () => {
        addMessage("agent", "Interrupted");
        anamClient?.interruptPersona();
        agentAudioInputStream.endSequence();
      },
      onDisconnect: () => setConnected(false),
      onError: () => showError("Connection error"),
    });
  } catch (error) {
    showError(error instanceof Error ? error.message : "Failed to start");
    setLoadingState("idle");
    showVideo(false);
  } finally {
    connectBtn.disabled = false;
  }
}

async function stop() {
  stopElevenLabs();
  await anamClient?.stopStreaming();
  anamClient = null;
  showVideo(false);
  setConnected(false);
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

connectBtn.addEventListener("click", () => {
  isConnected ? stop() : start();
});

window.addEventListener("beforeunload", stop);

console.log("Concorde AI Voice Avatar ready");
// ============================================================================
// EMBED MODE
// Activé par ?embed=1. Masque le chrome, auto-démarre la conversation, et
// communique avec la maquette parent via postMessage :
// - "oscar:ready" envoyé quand le <video> Anam joue effectivement (avatar
//   visible) → la maquette peut alors fader le flou et révéler l'iframe.
// - "oscar:mute" reçu de la maquette quand l'utilisateur clique le bouton
//   son → on mute/unmute la <video> Anam (toute la voix d'Oscar passe par là).
// ============================================================================

if (new URLSearchParams(window.location.search).has("embed")) {
  // CSS d'override. Tout est mis en position:absolute inset:0 pour éviter
  // tout reflow flex pendant les transitions de taille de l'iframe parent
  // (sinon une bande noire apparaît côté pendant le redimensionnement
  // fullscreen → corner du cadre Oscar dans la maquette).
  const embedStyle = document.createElement("style");
  embedStyle.textContent = `
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: #000 !important;
      overflow: hidden !important;
    }
    body > div.fixed.inset-0 { display: none !important; }
    header, footer, #connect-btn, #avatar-placeholder { display: none !important; }
    main {
      position: absolute !important;
      inset: 0 !important;
      padding: 0 !important;
      gap: 0 !important;
      display: block !important;
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
    }
    main > div:first-of-type {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      display: block !important;
    }
    #avatar-container {
      position: fixed !important;
      /* Overscale 10% : le contenu dépasse le viewport de l'iframe pour
         absorber le lag de redimensionnement du viewport interne pendant
         les transitions du cadre parent (maquette). Combiné avec
         l'overscale de l'iframe element côté maquette (10% également),
         on garantit que la zone visible est toujours remplie même en
         pic de lag. */
      top: -5% !important;
      left: -5% !important;
      width: 110% !important;
      height: 110% !important;
      max-width: none !important;
      aspect-ratio: auto !important;
      border-radius: 0 !important;
      border: none !important;
      background: #000 !important;
    }
    #anam-video {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      object-position: center !important;
    }
  `;
  document.head.appendChild(embedStyle);

  // Signale au parent que l'avatar est visible. L'event 'playing' fire au
  // moment où la <video> Anam commence effectivement à rendre des frames
  // (différent de 'loadedmetadata' qui est trop précoce). { once: true }
  // car on n'a besoin de signaler la transition initiale qu'une seule fois.
  anamVideo.addEventListener("playing", () => {
    try {
      window.parent.postMessage({ type: "oscar:ready" }, "*");
    } catch (e) {
      console.warn("[embed] postMessage oscar:ready failed", e);
    }
  }, { once: true });

  // Écoute les ordres de mute venant de la maquette parent. Toute la voix
  // d'Oscar passe par l'élément <video id="anam-video"> (Anam lit l'audio
  // ElevenLabs streamé via createAgentAudioInputStream et le rejoue avec
  // lipsync), donc muter cet élément coupe tout l'audio.
  window.addEventListener("message", (event) => {
    if (event.data?.type === "oscar:mute") {
      anamVideo.muted = !!event.data.muted;
    }
  });

  // Auto-déclenche le bouton "Start Conversation" après un court délai
  // (laisse les listeners se câbler).
  setTimeout(() => {
    if (!isConnected) {
      connectBtn.click();
    }
  }, 100);
}
