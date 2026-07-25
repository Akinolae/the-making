import { useState, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useInvite } from "../hooks/useInvite";
import Envelope from "../components/invite/Envelope";
import Letter from "../components/invite/Letter";
import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/invite")({
  component: InvitePage,
  validateSearch: (search: Record<string, string>) => ({
    invite: search.invite || "",
  }),
});

function InvitePage() {
  const { invite } = Route.useSearch();
  const {
    guest: fetchedGuest,
    isLoading: fetchedIsLoading,
    error: fetchedError,
  } = useInvite(invite || null);

  const guest = fetchedGuest;
  const isLoading = fetchedIsLoading;
  const error = fetchedError;

  const [isOpened, setIsOpened] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Update page title
  if (guest) {
    document.title = `A letter for ${guest.name} — December 19th, 2026`;
  }

  // Handle audio state transitions
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      if (!isMuted) {
        audioRef.current.play().catch((err) => {
          console.warn("Audio play failed:", err);
        });
      }
    }
  }, [isMuted]);

  // Pause music when the user leaves the screen / tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!audioRef.current || isMuted) return;

      if (document.hidden) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          console.warn("Audio resume failed:", err);
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isMuted]);

  const handleOpenEnvelope = () => {
    setIsOpened(true);
    setIsMuted(false); // Unmute and play on user interaction
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <div className="relative min-h-screen bg-blush">
      {/* Audio element */}
      <audio ref={audioRef} src="/audio/piano.mp3" loop preload="auto" />

      {/* Floating Audio Controls */}
      {guest && (
        <button
          onClick={toggleMute}
          className="fixed top-6 right-6 z-50 rounded-full border border-burgundy/10 bg-cream/90 p-3 text-burgundy shadow-sm transition-all duration-300 hover:scale-105 hover:bg-cream active:scale-95"
          aria-label={isMuted ? "Unmute music" : "Mute music"}
        >
          {isMuted ? (
            <VolumeX size={20} className="stroke-[1.5]" />
          ) : (
            <Volume2 size={20} className="stroke-[1.5]" />
          )}
        </button>
      )}

      {!invite ? (
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="max-w-lg text-center">
            <h1 className="font-display text-5xl text-burgundy sm:text-6xl">
              A Letter I Couldn't Wait To Write
            </h1>
            <p className="mt-4 font-body text-lg text-ink/60 italic">
              A personal wedding invitation from Macnoms — December 19th, 2026.
            </p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-burgundy/10" />
            <p className="mt-4 font-display text-xl text-ink/50 italic">
              Preparing your letter…
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="max-w-md text-center">
            <h2 className="font-display text-3xl text-burgundy">
              Invitation Not Found
            </h2>
            <p className="mt-2 font-body text-ink/60">
              This invitation link doesn't seem to exist. Please check the URL
              or contact Macnoms directly.
            </p>
          </div>
        </div>
      ) : guest ? (
        <AnimatePresence mode="wait">
          {!isOpened ? (
            <Envelope
              key="envelope"
              guestName={guest.name}
              onOpen={handleOpenEnvelope}
            />
          ) : (
            <Letter key="letter" guest={guest} />
          )}
        </AnimatePresence>
      ) : null}
    </div>
  );
}
