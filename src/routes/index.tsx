import { Context } from "hono";

export const Index = (c: Context) => {
  return c.render(
    <>
      {/* Background gradient */}
      <div class="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      <div class="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-labs-900/20 via-transparent to-transparent" />

      {/* Main container - full height, no scroll */}
      <div class="relative h-screen w-screen overflow-hidden flex flex-col">
        {/* Header */}
        <header class="flex-shrink-0 p-4 sm:p-6">
          <div class="flex items-center gap-2 text-zinc-500 text-sm">
            <svg
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>Concorde AI</span>
          </div>
        </header>

        {/* Main content */}
        <main class="flex-1 min-h-0 flex flex-col items-center justify-center px-4 gap-4 sm:gap-6">
          {/* Avatar wrapper - controls height explicitly */}
          <div class="flex items-center justify-center w-full" style="height: min(55vh, 500px)">
            <div
              id="avatar-container"
              class="relative h-full aspect-video max-w-full rounded-2xl bg-zinc-900/50 border border-zinc-800 overflow-hidden"
            >
              {/* Video element for Anam avatar */}
              <video
                id="anam-video"
                class="absolute inset-0 w-full h-full object-cover hidden"
                autoplay
                playsinline
              />

              {/* Placeholder when not streaming */}
              <div
                id="avatar-placeholder"
                class="absolute inset-0 flex flex-col items-center justify-center text-zinc-600"
              >
                <div id="status-ring" class="relative w-24 h-24 mb-4">
                  <div
                    id="outer-ring"
                    class="absolute inset-0 rounded-full border-2 border-zinc-700 transition-colors duration-300"
                  />
                  <div class="absolute inset-2 rounded-full bg-zinc-800 flex items-center justify-center">
                    <svg
                      id="status-icon"
                      class="w-8 h-8 text-zinc-500 transition-colors duration-300"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                      />
                    </svg>
                  </div>
                  <div
                    id="pulse-ring"
                    class="absolute inset-0 rounded-full border-2 border-labs-500 opacity-0 transition-opacity duration-300"
                  />
                </div>
                <p id="status-text" class="text-sm">
                  Disconnected
                </p>
              </div>

              {/* Speaking indicator bars */}
              <div
                id="speaking-bars"
                class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-1 h-8 opacity-0 transition-opacity duration-300"
              >
                <div
                  class="w-1 bg-labs-500 rounded-full speaking-indicator"
                  style="height: 40%; animation-delay: 0ms"
                />
                <div
                  class="w-1 bg-labs-500 rounded-full speaking-indicator"
                  style="height: 70%; animation-delay: 100ms"
                />
                <div
                  class="w-1 bg-labs-500 rounded-full speaking-indicator"
                  style="height: 50%; animation-delay: 200ms"
                />
                <div
                  class="w-1 bg-labs-500 rounded-full speaking-indicator"
                  style="height: 80%; animation-delay: 300ms"
                />
                <div
                  class="w-1 bg-labs-500 rounded-full speaking-indicator"
                  style="height: 60%; animation-delay: 400ms"
                />
              </div>
            </div>
          </div>

          {/* Connect button */}
          <button
            id="connect-btn"
            class="w-full max-w-xs sm:w-auto sm:min-w-64 px-8 py-3 bg-labs-600 hover:bg-labs-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg
              id="btn-icon-mic"
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
              />
            </svg>
            <svg
              id="btn-icon-stop"
              class="w-4 h-4 hidden"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            <span id="btn-text">Start Conversation</span>
          </button>

          {/* Hidden transcript */}
          <div id="transcript" class="hidden" />

          {/* Error display */}
          <div
            id="error-container"
            class="hidden p-4 bg-red-900/20 border border-red-800 rounded-lg max-w-lg"
          >
            <p id="error-text" class="text-red-400 text-sm" />
          </div>
        </main>

        {/* Footer */}
        <footer class="flex-shrink-0 p-4 sm:p-6 text-center">
          <p class="text-zinc-600 text-xs">Concorde AI</p>
        </footer>
      </div>
    </>
  );
};
