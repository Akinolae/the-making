import { motion } from "framer-motion";

interface EnvelopeProps {
  onOpen: () => void;
  guestName: string;
}

export default function Envelope({ onOpen, guestName }: EnvelopeProps) {
  // Generate floating gold dust particles
  const particles = Array.from({ length: 15 });

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-blush px-4">
      {/* Floating Gold Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((_, i) => {
          const duration = 5 + Math.random() * 8;
          const delay = Math.random() * 5;
          const size = 3 + Math.random() * 5;
          const left = `${Math.random() * 100}%`;

          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-[#E5A93C]/40 blur-[1px]"
              style={{
                width: size,
                height: size,
                left: left,
                bottom: "-20px",
              }}
              animate={{
                y: ["0vh", "-110vh"],
                x: ["0px", `${(Math.random() - 0.5) * 60}px`],
                opacity: [0, 0.7, 0.7, 0],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>

      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center gap-16 sm:gap-24 w-full max-w-lg text-center"
      >
        {/* Envelope Top Title */}
        <h1 className="font-display text-3xl font-bold text-burgundy tracking-wide px-4 leading-[1.375] italic max-w-[20rem] mx-auto">
          A Letter I Couldn't Wait To Write
        </h1>

        {/* Envelope Container */}
        <motion.div
          onClick={onOpen}
          className="group relative w-full aspect-[4/3] max-w-[420px] rounded-2xl shadow-paper overflow-hidden cursor-pointer"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Envelope Background Image */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/assets/themaking-env.png')",
              filter: "brightness(0.98)",
              scale: 1.05, // pre-scaled to prevent bottom edge exposure during vertical float
            }}
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Envelope Overlay Texture */}
          <div className="absolute inset-0 bg-cream/15 mix-blend-overlay" />

          {/* Gold Flourish Emblem G&A */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg
              viewBox="0 0 100 100"
              className="w-40 h-40 text-[#C5A059] opacity-80"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            >
              {/* Gold Flourish Rings */}
              <circle cx="50" cy="50" r="38" strokeDasharray="1 3" />
              <circle cx="50" cy="50" r="35" strokeWidth="0.25" />

              {/* Ornate Flourish Paths */}
              <path
                d="M 50 15 C 45 25, 40 25, 50 35 C 60 25, 55 25, 50 15 Z"
                fill="currentColor"
                fillOpacity="0.05"
              />
              <path
                d="M 50 85 C 45 75, 40 75, 50 65 C 60 75, 55 75, 50 85 Z"
                fill="currentColor"
                fillOpacity="0.05"
              />
              <path
                d="M 15 50 C 25 45, 25 40, 35 50 C 25 60, 25 55, 15 50 Z"
                fill="currentColor"
                fillOpacity="0.05"
              />
              <path
                d="M 85 50 C 75 45, 75 40, 65 50 C 75 60, 75 55, 85 50 Z"
                fill="currentColor"
                fillOpacity="0.05"
              />

              {/* Monogram Monotype */}
              <text
                x="50%"
                y="54%"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="'Cormorant Garamond', serif"
                fontSize="20"
                fontWeight="500"
                fill="url(#goldGradient)"
                stroke="none"
              >
                G&A
              </text>
              <defs>
                <linearGradient
                  id="goldGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="50%" stopColor="#AA7C11" />
                  <stop offset="100%" stopColor="#D4AF37" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </motion.div>

        {/* Envelope Bottom Instruction */}
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="font-body text-xs tracking-[0.25em] text-burgundy/60 uppercase"
        >
          Tap to Open
        </motion.p>
      </motion.div>
    </div>
  );
}
