import { motion } from "framer-motion";
import { Calendar, MapPin, MessageCircle } from "lucide-react";
import { getHonorific } from "../../lib/utils";
import type { Guest } from "../../types/guest";

interface LetterProps {
  guest: Guest;
}

export default function Letter({ guest }: LetterProps) {
  const honorific = getHonorific(guest.gender, guest.role);
  const fullName = `${honorific}${guest.name}`;

  // WhatsApp configuration
  const WHATSAPP_NUMBER =
    guest.gender === "female"
      ? import.meta.env.VITE_GLORY
      : import.meta.env.VITE_AKIN;

  // Role details mapping
  const getRoleQuestion = (role: string) => {
    switch (role) {
      case "Bridesmaid":
        return "Will you celebrate beside me as one of my Bridesmaids?";
      case "Groomsman":
        return "Will you celebrate beside me as one of my Groomsmen?";
      case "Asoebi Lady":
        return "Will you celebrate beside me as one of my Asoebi Ladies?";
      case "Asoebi Gentleman":
        return "Will you celebrate beside me as one of my Asoebi Gentlemen?";
      default:
        return "Will you celebrate beside us on our special day?";
    }
  };

  const getRoleDescription = (role: string) => {
    if (role === "Bridesmaid" || role === "Asoebi Lady") {
      return "Every bride needs the women who shaped her. You are one of mine.";
    }
    if (role === "Groomsman" || role === "Asoebi Gentleman") {
      return "Every groom needs the brothers who stood by him. You are one of mine.";
    }
    return "We cannot imagine this celebration without the people who mean the most to us.";
  };

  const getWhatsAppLink = (message: string) => {
    return `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
  };

  const acceptMessage =
    guest.role && guest.role !== "Guest"
      ? `YES! I'd be honoured to stand beside you as one of your ${guest.role}s! - ${fullName}`
      : `YES! I'd be honoured to stand beside you on your special day! - ${fullName}`;

  const celebrateMessage = `I can't wait to celebrate with you on your wedding day! - ${fullName}`;

  return (
    <div className="relative min-h-screen bg-blush px-4 py-16 sm:px-6">
      {/* Gold floating particles inside open view as well */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#E5A93C]/20 blur-[1px]"
            style={{
              width: 2 + Math.random() * 4,
              height: 2 + Math.random() * 4,
              left: `${Math.random() * 100}%`,
              bottom: "-20px",
            }}
            animate={{
              y: ["0vh", "-110vh"],
              x: ["0px", `${(Math.random() - 0.5) * 40}px`],
              opacity: [0, 0.5, 0.5, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-2xl">
        {/* Letter Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-full rounded-3xl bg-cream px-8 py-16 sm:px-12 sm:py-24 border border-burgundy/5 overflow-hidden min-h-[600px] sm:min-h-[700px] flex flex-col justify-between"
        >
          {/* Corner Flowers */}
          <img
            src="/assets/letter-flower.png"
            alt=""
            className="absolute -top-16 -left-16 w-48 h-48 object-contain pointer-events-none opacity-70 rotate-90 z-0"
          />
          <img
            src="/assets/letter-flower.png"
            alt=""
            className="absolute -bottom-16 -right-16 w-48 h-48 object-contain pointer-events-none opacity-[45%] -rotate-90 scale-x-[-1] z-0"
          />

          {/* Group Greeting and Body at the top, signature at the bottom */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Greeting Section with Watercolor Flower */}
              <div className="relative mb-10 z-10">
                {/* Flower behind greeting */}
                <img
                  src="/assets/letter-flower.png"
                  alt=""
                  className="absolute -top-40 -left-16 w-56 h-56 object-contain pointer-events-none opacity-85 z-0"
                />
                <div className="relative z-10 space-y-1">
                  {guest.title && (
                    <p className="font-body text-[1.3rem] text-burgundy/75 italic">
                      {guest.title},
                    </p>
                  )}
                  <h1 className="font-display text-[3.25rem] font-bold text-burgundy leading-tight">
                    Dear {fullName},
                  </h1>
                </div>
              </div>

              {/* Letter Body */}
              <div className="relative z-10 space-y-6 font-body leading-relaxed text-ink/80 text-[1.2rem]">
                {guest.message.split(/\n+/).map((para, idx) => (
                  <p key={idx} className="whitespace-pre-wrap">
                    {para.trim()}
                  </p>
                ))}
              </div>
            </div>

            {/* Signature Block with Watercolor Flower */}
            <div className="relative mt-20 z-10 flex flex-col items-end pr-4">
              <div className="relative">
                {/* Flower behind signature */}
                <img
                  src="/assets/letter-flower.png"
                  alt=""
                  className="absolute -top-20 -right-20 w-60 h-60 object-contain pointer-events-none opacity-85 z-0"
                />
                <div className="relative z-10 text-right">
                  <p className="font-body text-base text-ink/75 italic">
                    With all my love,
                  </p>
                  <span className="font-script text-6xl text-burgundy font-medium block mt-2 leading-none">
                    {guest.gender === "male" ? "Akinola" : "Macnoms"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Invitation Question ("One More Thing...") */}
        {guest.role && guest.role !== "Guest" && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mt-16 text-center px-4"
          >
            <p className="font-body text-xs tracking-[0.25em] text-burgundy/60 uppercase font-semibold">
              One More Thing...
            </p>
            <h2 className="mt-4 font-display text-3xl text-burgundy leading-snug sm:text-4xl px-2">
              {getRoleQuestion(guest.role)}
            </h2>
            <p className="mt-4 font-body text-sm text-ink/60 italic max-w-md mx-auto">
              {getRoleDescription(guest.role)}
            </p>
          </motion.div>
        )}

        {/* The Day Cards Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mt-20"
        >
          <div className="text-center">
            <h2 className="font-display text-4xl text-burgundy">The Day</h2>
            <p className="mt-2 font-body text-xs tracking-[0.2em] text-burgundy/50 uppercase">
              Save it in your heart
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {/* Card 1: The Date */}
            <div className="rounded-2xl border border-burgundy/5 bg-cream/90 p-6 shadow-sm flex items-start gap-4">
              <div className="rounded-full bg-blush p-2.5 text-burgundy">
                <Calendar size={20} className="stroke-[1.5]" />
              </div>
              <div>
                <p className="font-body text-xs tracking-wider text-burgundy/60 uppercase font-semibold">
                  The Date
                </p>
                <p className="mt-1 font-display text-xl text-burgundy">
                  Saturday, December 19th, 2026
                </p>
              </div>
            </div>

            {/* Card 2: Ceremony */}
            <div className="rounded-2xl border border-burgundy/5 bg-cream/90 p-6 shadow-sm flex items-start gap-4 min-h-[144px]">
              <div className="rounded-full bg-blush p-2.5 text-burgundy">
                <MapPin size={20} className="stroke-[1.5]" />
              </div>
              <div>
                <p className="font-body text-xs tracking-wider text-burgundy/60 uppercase font-semibold">
                  Ceremony
                </p>
                <p className="mt-1 font-display text-xl text-burgundy">
                  The Havillah, Sharon House Int'l Church
                </p>
                <p className="mt-2 font-body text-sm text-ink/60">
                  Beside Mark-ez Hotel, off Mama Mudiaga Street, Usieffurun
                  Road, Orhuwhorun
                </p>
              </div>
            </div>

            {/* Card 3: Reception */}
            <div className="rounded-2xl border border-burgundy/5 bg-cream/90 p-6 shadow-sm flex items-start gap-4 min-h-[144px]">
              <div className="rounded-full bg-blush p-2.5 text-burgundy">
                <MapPin size={20} className="stroke-[1.5]" />
              </div>
              <div>
                <p className="font-body text-xs tracking-wider text-burgundy/60 uppercase font-semibold">
                  Reception
                </p>
                <p className="mt-1 font-display text-xl text-burgundy">
                  2CR Event Centre
                </p>
                <p className="mt-2 font-body text-sm text-ink/60">
                  Usieffurun Road
                </p>
              </div>
            </div>

            {/* Card 4: Reach Me */}
            <div className="rounded-2xl border border-burgundy/5 bg-cream/90 p-6 shadow-sm flex items-start gap-4 min-h-[144px]">
              <div className="rounded-full bg-blush p-2.5 text-burgundy">
                <MessageCircle size={20} className="stroke-[1.5]" />
              </div>
              <div>
                <p className="font-body text-xs tracking-wider text-burgundy/60 uppercase font-semibold">
                  Reach Me
                </p>
                <p className="mt-1 font-display text-xl text-burgundy">
                  WhatsApp
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block font-body text-sm text-burgundy hover:underline"
                >
                  +234 811 121 9577
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RSVP Actions ("Will you say yes?") */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mt-20 text-center"
        >
          <h2 className="font-display text-3xl text-burgundy">
            Will you say yes?
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-4">
            {/* Sparkles Card */}
            <a
              href={getWhatsAppLink(acceptMessage)}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-burgundy/5 bg-cream p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-burgundy/20 text-left flex flex-col justify-between"
            >
              <span>✨</span>
              <div>
                <p className="font-display text-[1.1rem] text-burgundy font-medium leading-snug">
                  {guest.role && guest.role !== "Guest"
                    ? `I would be honoured to stand beside you.`
                    : `I would be honoured to celebrate with you.`}
                </p>
                <span className="mt-3 block font-body text-[0.7rem] tracking-widest text-burgundy/50 uppercase group-hover:text-burgundy/80 transition-colors">
                  Reply on WhatsApp →
                </span>
              </div>
            </a>

            {/* Mail Card */}
            <a
              href={getWhatsAppLink(celebrateMessage)}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-burgundy/5 bg-cream p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-burgundy/20 text-left flex flex-col justify-between"
            >
              <span>💌</span>
              <div>
                <p className="font-display text-[1.1rem] text-burgundy font-medium leading-snug">
                  I can't wait to celebrate with you.
                </p>
                <span className="mt-3 block font-body text-[0.7rem] tracking-widest text-burgundy/50 uppercase group-hover:text-burgundy/80 transition-colors">
                  Reply on WhatsApp →
                </span>
              </div>
            </a>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mt-24 text-center pb-12 flex flex-col items-center gap-6"
        >
          <p className="font-display text-xl text-burgundy italic">
            Thank you for being part of my story.
          </p>

          <svg
            viewBox="0 0 100 100"
            className="w-20 h-20 text-[#C5A059] opacity-70"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          >
            <circle cx="50" cy="50" r="38" strokeDasharray="1 3" />
            <circle cx="50" cy="50" r="35" strokeWidth="0.25" />
            <text
              x="50%"
              y="54%"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="'Cormorant Garamond', serif"
              fontSize="22"
              fontWeight="500"
              fill="#AA7C11"
              stroke="none"
            >
              G&A
            </text>
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
