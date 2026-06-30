import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Heart, Music, Pause } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import couple from "@/assets/couple.jpg";
import venue from "@/assets/venue.jpg";
import rings from "@/assets/rings.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Зиёдулла ❤ Шаҳноза — Тўй таклифномаси" },
      {
        name: "description",
        content:
          "Ҳаётимиздаги энг бахтли кунга Сизни таклиф этамиз. 21 август, 18:00, Grand Royal тўйхонаси.",
      },
      { property: "og:title", content: "Зиёдулла ❤ Шаҳноза — Тўй таклифномаси" },
      { property: "og:description", content: "21 август, 18:00 — Grand Royal тўйхонаси" },
    ],
  }),
  component: Index,
});

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] as const } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ------------------------------------------------------------------ *
 *  Shared SVG gradient defs (gold foil + soft petal colours).        *
 *  Drawn once, referenced by id everywhere — renders identically on  *
 *  every device, no emoji/font fallbacks.                            *
 * ------------------------------------------------------------------ */
function GoldDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        <linearGradient id="goldStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4e2a6" />
          <stop offset="45%" stopColor="#c79a3e" />
          <stop offset="70%" stopColor="#f6e6ad" />
          <stop offset="100%" stopColor="#b8862f" />
        </linearGradient>
        <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eccf7e" />
          <stop offset="100%" stopColor="#b8862f" />
        </linearGradient>
        <linearGradient id="petalIvory" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#fffaf0" />
          <stop offset="100%" stopColor="#f0e2c4" />
        </linearGradient>
        <linearGradient id="petalBlush" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#fbe4e0" />
          <stop offset="100%" stopColor="#f3c9bf" />
        </linearGradient>
        <linearGradient id="petalGold" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#f7e7b0" />
          <stop offset="100%" stopColor="#d8b25a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* Ornamental gold filigree swirl — flanks the names and acts as a divider. */
function Swirl({ flip = false, className = "" }: { flip?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 130 40"
      className={className}
      style={{ transform: flip ? "scaleX(-1)" : undefined, overflow: "visible" }}
    >
      <g fill="none" stroke="url(#goldStroke)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M128 20 C 96 20, 84 9, 64 14" />
        <path d="M64 14 C 44 18, 36 6, 28 16 C 23 22, 29 31, 39 28 C 47 25, 44 15, 37 18" />
        <path d="M128 20 C 104 25, 92 31, 74 26" />
      </g>
      <circle cx="128" cy="20" r="2.4" fill="url(#goldFill)" />
      <path d="M59 11 l3 -5 l3 5 l-3 4 z" fill="url(#goldFill)" />
    </svg>
  );
}

/* Small gold heart with an optional label inside — used in the calendar header. */
function HeartTag({ label, size = 34 }: { label?: string; size?: number }) {
  return (
    <span className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 32 30" width={size} height={size} aria-hidden>
        <path
          d="M16 28 C 4 18, 1 10, 6 5 C 10 1, 15 3, 16 7 C 17 3, 22 1, 26 5 C 31 10, 28 18, 16 28 Z"
          fill="url(#goldFill)"
          stroke="#a9772a"
          strokeWidth="0.6"
        />
      </svg>
      {label && (
        <span
          className="absolute text-[10px] font-semibold text-[#5b3d12] md:text-xs"
          style={{ marginTop: -2 }}
        >
          {label}
        </span>
      )}
    </span>
  );
}

const PETAL_VARIANTS = [
  { grad: "petalIvory", size: 24 },
  { grad: "petalBlush", size: 19 },
  { grad: "petalGold", size: 15 },
] as const;

function Petal({ grad }: { grad: string }) {
  return (
    <svg
      viewBox="0 0 100 125"
      width="100%"
      height="100%"
      style={{ display: "block", filter: "drop-shadow(0 2px 4px rgba(120,90,30,0.18))" }}
    >
      <path d="M50 2 C 14 28, 14 80, 50 123 C 86 80, 86 28, 50 2 Z" fill={`url(#${grad})`} />
      <path
        d="M50 16 C 38 42, 38 82, 50 110"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2.5"
        fill="none"
      />
    </svg>
  );
}

/* Soft ivory/blush/gold petals drifting down — gentle, low opacity. */
function Petals() {
  const N = 20;
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {Array.from({ length: N }).map((_, i) => {
        const depth = i % 3;
        const v = PETAL_VARIANTS[depth];
        const jitter = ((i * 0.37) % 1) - 0.5;
        const left = ((i + 0.5) / N) * 100 + (jitter * 100) / N;
        const blur = depth >= 1 ? depth : 0;
        const op = 0.65 - depth * 0.12;
        const sway = (i % 2 ? 1 : -1) * (3 + (i % 4) * 1.4);
        const fall = 13 + (i % 5) * 1.6 + depth;
        const delay = (((i * 7) % N) / N) * fall;
        const baseRot = (i * 47) % 360;
        const spin = i % 3 ? 360 : -360;
        return (
          <motion.div
            key={i}
            className="absolute -top-[12vh] will-change-transform"
            style={{
              left: `${left}%`,
              width: v.size,
              height: v.size * 1.25,
              filter: blur ? `blur(${blur}px)` : undefined,
            }}
            initial={{ y: 0, opacity: 0, rotate: baseRot }}
            animate={{
              y: ["0vh", "124vh"],
              x: ["0vw", `${sway}vw`, `${-sway * 0.7}vw`, `${sway}vw`, "0vw"],
              rotate: [baseRot, baseRot + spin],
              opacity: [0, op, op, op, 0],
            }}
            transition={{
              duration: fall,
              repeat: Infinity,
              delay,
              ease: "linear",
              x: {
                duration: fall / 2,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay,
              },
            }}
          >
            <Petal grad={v.grad} />
          </motion.div>
        );
      })}
    </div>
  );
}

function Sparkles() {
  const dots = Array.from({ length: 22 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full"
          style={{
            left: `${(i * 137) % 100}%`,
            top: `${(i * 53) % 100}%`,
            background: "var(--gold)",
            boxShadow: "0 0 8px var(--gold-soft)",
          }}
          animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.3, 0.4] }}
          transition={{ duration: 2.4 + (i % 4), repeat: Infinity, delay: (i % 7) * 0.3 }}
        />
      ))}
    </div>
  );
}

/* Decorative gold corner brackets, like a printed card frame. */
function CornerFrames() {
  const corner = (
    <svg viewBox="0 0 80 80" className="h-16 w-16 md:h-24 md:w-24" aria-hidden>
      <g fill="none" stroke="url(#goldStroke)" strokeWidth="1.4" strokeLinecap="round">
        <path d="M6 38 C 6 16, 16 6, 38 6" />
        <path d="M14 40 C 14 22, 22 14, 40 14" />
        <path d="M40 14 C 30 14, 24 8, 26 2" />
        <path d="M14 40 C 14 30, 8 24, 2 26" />
      </g>
      <circle cx="40" cy="14" r="2" fill="url(#goldFill)" />
      <circle cx="14" cy="40" r="2" fill="url(#goldFill)" />
    </svg>
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-20 hidden sm:block">
      <div className="absolute left-3 top-3 md:left-6 md:top-6">{corner}</div>
      <div className="absolute right-3 top-3 rotate-90 md:right-6 md:top-6">{corner}</div>
      <div className="absolute bottom-3 left-3 -rotate-90 md:bottom-6 md:left-6">{corner}</div>
      <div className="absolute bottom-3 right-3 rotate-180 md:bottom-6 md:right-6">{corner}</div>
    </div>
  );
}

const WEDDING_DATE = new Date("2026-08-21T18:00:00+05:00").getTime();

function Countdown() {
  const [now, setNow] = useState(WEDDING_DATE);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, WEDDING_DATE - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  const items = [
    { label: "Кун", value: days },
    { label: "Соат", value: hours },
    { label: "Дақиқа", value: minutes },
    { label: "Сония", value: seconds },
  ];
  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-6 text-center text-sm uppercase tracking-[0.3em] text-gold-deep md:text-base">
        Тўйимизга қолди
      </p>
      <div className="grid grid-cols-4 gap-3 md:gap-6">
        {items.map((it) => (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl border border-gold/40 bg-white/70 p-3 text-center backdrop-blur-sm md:p-6"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <motion.div
              key={mounted ? it.value : it.label}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-gold-gradient text-3xl font-semibold tabular-nums md:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {mounted ? String(it.value).padStart(2, "0") : "00"}
            </motion.div>
            <div className="mt-1 text-xs uppercase tracking-widest text-ink-soft md:text-base">
              {it.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Wedding day, derived to match WEDDING_DATE (21 August 2026).
const WEDDING_YEAR = 2026;
const WEDDING_MONTH = 7; // 0-indexed → August
const WEDDING_DAY = 21;
const MONTH_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];
const WEEKDAYS = ["Ду", "Се", "Чо", "Па", "Жу", "Ша", "Як"]; // Monday-first

/* Signature OFMARK-style calendar card: month + year, heart weekday header,
   day grid with the wedding day glowing inside a gold heart. */
function WeddingCalendar() {
  const firstDow = (new Date(Date.UTC(WEDDING_YEAR, WEDDING_MONTH, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(WEDDING_YEAR, WEDDING_MONTH + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="mx-auto mt-12 max-w-md"
    >
      <div
        className="rounded-[28px] border border-gold/40 bg-white/75 p-6 backdrop-blur-sm md:p-8"
        style={{ boxShadow: "var(--shadow-gold)" }}
      >
        <p
          className="text-gold-gradient text-center text-3xl leading-none md:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {MONTH_NAMES[WEDDING_MONTH]}
        </p>
        <p className="text-center text-xl tracking-[0.2em] text-gold-deep md:text-2xl">
          {WEDDING_YEAR}
        </p>

        {/* heart weekday header */}
        <div className="mt-4 flex justify-center gap-1 md:gap-1.5">
          {WEEKDAYS.map((w) => (
            <HeartTag key={w} label={w} />
          ))}
        </div>

        <div className="my-3 flex items-center justify-center gap-2">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold" />
          <Heart className="h-3 w-3 fill-gold text-gold" />
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold" />
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {cells.map((d, i) => {
            if (d === null) return <div key={`empty-${i}`} />;
            const isWedding = d === WEDDING_DAY;
            return (
              <div key={d} className="grid aspect-square place-items-center">
                {isWedding ? (
                  <motion.div
                    animate={{
                      filter: [
                        "drop-shadow(0 0 4px var(--gold))",
                        "drop-shadow(0 0 14px var(--gold))",
                        "drop-shadow(0 0 4px var(--gold))",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative grid h-9 w-9 place-items-center md:h-11 md:w-11"
                  >
                    <svg viewBox="0 0 32 30" className="absolute inset-0 h-full w-full" aria-hidden>
                      <path
                        d="M16 28 C 4 18, 1 10, 6 5 C 10 1, 15 3, 16 7 C 17 3, 22 1, 26 5 C 31 10, 28 18, 16 28 Z"
                        fill="url(#goldFill)"
                        stroke="#a9772a"
                        strokeWidth="0.8"
                      />
                    </svg>
                    <span className="relative text-base font-bold text-[#5b3d12] md:text-lg">
                      {d}
                    </span>
                  </motion.div>
                ) : (
                  <span className="text-base text-ink md:text-lg">{d}</span>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-5 text-center text-sm uppercase tracking-[0.22em] text-gold-deep md:text-base">
          Бошланиши соат 18:00 да
        </p>
      </div>
    </motion.div>
  );
}

function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tryPlay = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      setPlaying(true);
    } catch {
      // autoplay blocked — wait for user gesture
    }
  }, []);

  useEffect(() => {
    const audio = new Audio("/wedding-music.mp3");
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = "auto";
    audioRef.current = audio;

    const handleEnded = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        tryPlay();
      }
    };
    audio.addEventListener("ended", handleEnded);

    const events = [
      "pointerdown",
      "touchstart",
      "click",
      "keydown",
      "scroll",
      "wheel",
      "mousemove",
    ] as const;
    const removeListeners = () =>
      events.forEach((ev) => window.removeEventListener(ev, resume, true));
    const resume = () => {
      const a = audioRef.current;
      if (!a) return;
      if (!a.paused) {
        removeListeners();
        return;
      }
      a.play()
        .then(() => {
          setPlaying(true);
          removeListeners();
        })
        .catch(() => {
          // still blocked — keep listeners for the next gesture
        });
    };

    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => {
        events.forEach((ev) =>
          window.addEventListener(ev, resume, { passive: true, capture: true }),
        );
      });

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
      removeListeners();
    };
  }, [tryPlay]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      tryPlay();
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2, duration: 0.6 }}
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full border-2 border-gold bg-white/85 backdrop-blur-md"
      style={{ boxShadow: "0 0 22px var(--gold-soft)" }}
      aria-label={playing ? "Мусиқини тўхтатиш" : "Мусиқини қўйиш"}
    >
      {playing ? (
        <Pause className="h-6 w-6 text-gold-deep" />
      ) : (
        <Music className="h-6 w-6 text-gold-deep" />
      )}
      {playing && (
        <span className="absolute inset-0 animate-ping rounded-full border-2 border-gold opacity-30" />
      )}
    </motion.button>
  );
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      className={`relative z-10 w-full px-6 py-16 md:py-24 ${className}`}
    >
      {children}
    </motion.section>
  );
}

/* Gold divider with a centred swirl pair + heart. */
function Ornament() {
  return (
    <div className="my-6 flex items-center justify-center gap-1">
      <Swirl flip className="h-7 w-24 md:h-9 md:w-32" />
      <Heart className="h-4 w-4 shrink-0 fill-gold text-gold" />
      <Swirl className="h-7 w-24 md:h-9 md:w-32" />
    </div>
  );
}

function PhotoFrame({
  src,
  alt,
  children,
}: {
  src: string;
  alt: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="relative rounded-[28px] p-[3px] gold-foil"
      style={{ boxShadow: "var(--shadow-gold)" }}
    >
      <div className="relative overflow-hidden rounded-[25px]">
        <img src={src} alt={alt} loading="lazy" className="h-auto w-full" />
        <div className="absolute inset-0 rounded-[25px] ring-1 ring-inset ring-white/40" />
        {children}
      </div>
    </div>
  );
}

function Index() {
  const mapUrl =
    "https://yandex.uz/maps/?ll=67.592081%2C40.002304&z=18&pt=67.592081,40.002304,pm2rdm";
  const mapEmbedUrl =
    "https://yandex.uz/map-widget/v1/?ll=67.592081%2C40.002304&z=17&pt=67.592081,40.002304,pm2rdm";

  return (
    <main className="bg-paper relative min-h-screen w-full overflow-x-hidden text-ink">
      <GoldDefs />
      <Petals />
      <CornerFrames />

      {/* HERO */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Sparkles />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center"
        >
          {/* Monogram ring */}
          <motion.div
            animate={{
              filter: [
                "drop-shadow(0 0 6px var(--gold-soft))",
                "drop-shadow(0 0 16px var(--gold))",
                "drop-shadow(0 0 6px var(--gold-soft))",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="mb-8 grid h-24 w-24 place-items-center rounded-full border-2 border-gold/60 bg-white/60 backdrop-blur-sm md:h-28 md:w-28"
          >
            <span
              className="text-gold-gradient text-3xl md:text-4xl"
              style={{ fontFamily: "var(--font-script)" }}
            >
              З<span className="mx-0.5 text-blush">&amp;</span>Ш
            </span>
          </motion.div>

          <motion.div
            animate={{
              filter: [
                "drop-shadow(0 0 6px var(--gold-soft))",
                "drop-shadow(0 0 18px var(--gold))",
                "drop-shadow(0 0 6px var(--gold-soft))",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-3xl font-semibold leading-relaxed text-gold-deep md:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </motion.div>
          <Ornament />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1.2 }}
            className="mt-2 text-sm uppercase tracking-[0.4em] text-gold-deep md:text-base"
          >
            Тўй таклифномаси
          </motion.p>
        </motion.div>
      </section>

      {/* NAMES */}
      <Section className="text-center">
        <motion.div variants={scaleIn} className="relative mx-auto max-w-2xl">
          <Sparkles />
          <div className="relative">
            <p
              className="mb-6 text-2xl text-gold-deep md:text-3xl"
              style={{ fontFamily: "var(--font-script)" }}
            >
              Бирга абадиятга...
            </p>

            <div className="flex items-center justify-center gap-2">
              <Swirl flip className="hidden h-9 w-28 sm:block md:w-36" />
              <h1
                className="text-gold-gradient text-5xl leading-tight md:text-7xl lg:text-8xl"
                style={{ fontFamily: "var(--font-script)" }}
              >
                Зиёдулла
              </h1>
              <Swirl className="hidden h-9 w-28 sm:block md:w-36" />
            </div>

            <motion.div
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="my-3 flex justify-center"
            >
              <Heart className="h-9 w-9 fill-blush text-blush drop-shadow-[0_0_16px_rgba(220,120,120,0.45)] md:h-12 md:w-12" />
            </motion.div>

            <div className="flex items-center justify-center gap-2">
              <Swirl flip className="hidden h-9 w-28 sm:block md:w-36" />
              <h1
                className="text-gold-gradient text-5xl leading-tight md:text-7xl lg:text-8xl"
                style={{ fontFamily: "var(--font-script)" }}
              >
                Шаҳноза
              </h1>
              <Swirl className="hidden h-9 w-28 sm:block md:w-36" />
            </div>
          </div>
        </motion.div>
      </Section>

      {/* GREETING + INVITATION */}
      <Section className="text-center">
        <motion.div
          variants={fadeUp}
          className="mx-auto max-w-2xl rounded-[28px] border border-gold/30 bg-white/70 p-8 backdrop-blur-sm md:p-12"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <p
            className="text-gold-gradient text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-script)" }}
          >
            Ассалому алайкум!
          </p>
          <div className="my-5 text-2xl text-gold/70">❦</div>
          <p
            className="text-2xl leading-loose text-ink md:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Сизни азиз меҳмонимизни{" "}
            <span className="italic text-gold-deep">фарзандларимизнинг никоҳ тўйлари</span>{" "}
            муносабати билан бўлиб ўтадиган тантанага лутфан таклиф этамиз!
          </p>
          <Ornament />
        </motion.div>
      </Section>

      {/* COUPLE PHOTO */}
      <Section>
        <motion.div variants={scaleIn} className="mx-auto max-w-3xl">
          <PhotoFrame src={couple} alt="Келин ва куёв">
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          </PhotoFrame>
        </motion.div>
      </Section>

      {/* CALENDAR + DATE/TIME + COUNTDOWN */}
      <Section>
        <WeddingCalendar />

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {[
            { icon: Calendar, label: "Сана", value: "21 август" },
            { icon: Clock, label: "Вақт", value: "18:00" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative flex flex-col items-center gap-4 rounded-[28px] border border-gold/30 bg-white/70 p-8 backdrop-blur-sm md:flex-row md:gap-6"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-2 border-gold bg-white"
                style={{ boxShadow: "0 0 22px var(--gold-soft)" }}
              >
                <item.icon className="h-9 w-9 text-gold-deep" />
              </motion.div>
              <div className="min-w-0 text-center md:text-left">
                <p className="text-base uppercase tracking-widest text-ink-soft md:text-lg">
                  {item.label}
                </p>
                <p
                  className="text-gold-gradient text-4xl font-semibold md:text-5xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12">
          <Countdown />
        </div>
      </Section>

      {/* VENUE */}
      <Section>
        <motion.div variants={fadeUp} className="mx-auto max-w-4xl">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <div
              className="grid h-16 w-16 place-items-center rounded-full border-2 border-gold bg-white"
              style={{ boxShadow: "0 0 22px var(--gold-soft)" }}
            >
              <MapPin className="h-8 w-8 text-gold-deep" />
            </div>
            <p className="text-base uppercase tracking-widest text-ink-soft md:text-lg">Манзил</p>
            <h2
              className="text-gold-gradient text-4xl md:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              GRAND ROYAL ТЎЙХОНАСИ
            </h2>
          </div>

          <motion.div variants={scaleIn}>
            <PhotoFrame src={venue} alt="Grand Royal тўйхонаси">
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            </PhotoFrame>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-6 overflow-hidden rounded-[28px] border-2 border-gold/40"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <iframe
              src={mapEmbedUrl}
              title="Grand Royal тўйхонаси — Yandex харита"
              loading="lazy"
              className="h-[320px] w-full md:h-[400px]"
              style={{ border: 0 }}
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>

          <div className="mt-6 flex justify-center">
            <motion.a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold uppercase tracking-wider text-white gold-foil"
              style={{ boxShadow: "var(--shadow-gold)" }}
            >
              <MapPin className="h-4 w-4" />
              Йўлни кўрсатиш
            </motion.a>
          </div>
        </motion.div>
      </Section>

      {/* GUEST MESSAGE */}
      <Section className="text-center">
        <motion.div variants={fadeUp} className="mx-auto max-w-2xl">
          <Ornament />
          <p
            className="text-2xl italic leading-loose text-ink md:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Азиз меҳмонимиз, қувончимизга шерик бўлишингизни{" "}
            <span className="text-gold-deep">интизорлик билан</span> кутамиз!
          </p>
          <Ornament />
        </motion.div>
      </Section>

      {/* RINGS & SIGNATURE */}
      <Section>
        <motion.div variants={scaleIn} className="mx-auto max-w-3xl">
          <PhotoFrame src={rings} alt="Никоҳ узуклари">
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/65 via-black/25 to-transparent p-6 text-center">
              <p className="mb-2 text-sm uppercase tracking-widest text-gold-soft md:text-base">
                Ҳурмат билан
              </p>
              <p
                className="text-3xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] md:text-5xl"
                style={{ fontFamily: "var(--font-script)" }}
              >
                Зиёдулла ва Шаҳноза
              </p>
            </div>
          </PhotoFrame>
        </motion.div>
      </Section>

      {/* FOOTER */}
      <section className="relative z-10 px-6 pb-20 pt-6 text-center">
        <Sparkles />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        >
          <Ornament />
          <motion.p
            animate={{
              filter: [
                "drop-shadow(0 0 4px var(--gold-soft))",
                "drop-shadow(0 0 16px var(--gold))",
                "drop-shadow(0 0 4px var(--gold-soft))",
              ],
            }}
            transition={{ duration: 3.5, repeat: Infinity }}
            className="text-gold-gradient text-3xl leading-snug md:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-script)" }}
          >
            Сизни интизорлик
            <br />
            билан кутамиз!
          </motion.p>
          <Ornament />
        </motion.div>
      </section>

      <MusicPlayer />
    </main>
  );
}
