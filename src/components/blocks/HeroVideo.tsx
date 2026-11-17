"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";

const playbackQuery = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

function subscribe(listener: () => void) {
  const query = window.matchMedia(playbackQuery);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

export function HeroVideo({ src, poster, position, locale }: {
  src: string;
  poster?: string;
  position: string;
  locale: "tr" | "en";
}) {
  const allowed = useSyncExternalStore(subscribe, () => window.matchMedia(playbackQuery).matches, () => false);
  const player = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!allowed || failed) return null;

  return (
    <>
      <video
        ref={player}
        className={`absolute inset-0 h-full w-full object-cover ${position}`}
        aria-hidden="true"
        autoPlay muted loop playsInline
        src={src}
        poster={poster}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setFailed(true)}
      />
      <button
        type="button"
        className="absolute bottom-5 right-5 z-20 flex size-11 items-center justify-center rounded-full border border-white/40 bg-black/60 text-white hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2"
        aria-label={playing
          ? (locale === "en" ? "Pause background video" : "Arka plan videosunu duraklat")
          : (locale === "en" ? "Play background video" : "Arka plan videosunu oynat")}
        onClick={() => {
          const video = player.current;
          if (!video) return;
          if (video.paused) void video.play().catch(() => setPlaying(false));
          else video.pause();
        }}
      >
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>
    </>
  );
}