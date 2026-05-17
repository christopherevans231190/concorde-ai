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

        {/* Main content - takes remaining space, content centered */}
        <main class="flex-1 min-h-0 flex flex-col items-center justify-center px-4 gap-4 sm:gap-6">
          {/* Avatar video area - sized by height to ensure it always fits */}
          <div
            id="avatar-container"
            class="relative aspect-video h-[60vh] max-h-[600px] max-w-full rounded-2xl bg-zinc-900/50 border border-zinc-800 overflow-hidden"
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
                      d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6
