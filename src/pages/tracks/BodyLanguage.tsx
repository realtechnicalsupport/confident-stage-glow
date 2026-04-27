import { useEffect, useRef, useState } from "react";
import { TrackShell } from "@/components/TrackShell";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const POSTURE = [
  "Feet shoulder-width apart, weight even on both legs.",
  "Knees soft — never locked.",
  "Shoulders down and back, chest open.",
  "Chin level with the floor — not raised, not tucked.",
  "Hands visible, ready to gesture, not crossed or in pockets.",
  "Eyes scanning the room in 3-second holds — not darting.",
];

const GESTURES = [
  {
    name: "The container",
    use: "Defining a topic or boundary.",
    how: "Hands shoulder-width apart, palms facing each other, as if holding a box.",
  },
  {
    name: "The reveal",
    use: "Introducing an idea or surprise.",
    how: "One hand opens outward from your chest, palm up, ending shoulder-height.",
  },
  {
    name: "The list",
    use: "Counting points (\"first… second… third…\").",
    how: "Touch your thumb to each finger as you say each item. Don't wave the whole hand.",
  },
  {
    name: "The pause-down",
    use: "Landing a heavy line.",
    how: "Lower both hands slowly to your sides as you say the line. Then hold still.",
  },
];

const EYE_CONTACT = [
  "Pick three points in the room: left, centre, right.",
  "Hold each for 3–5 seconds — about one full sentence.",
  "Move only on a punctuation mark, never mid-word.",
  "If a real person makes you nervous, look at their forehead. They can't tell.",
];

type Phase = "Inhale" | "Hold" | "Exhale" | "Hold ";
const CYCLE: { phase: Phase; seconds: number }[] = [
  { phase: "Inhale", seconds: 4 },
  { phase: "Hold", seconds: 4 },
  { phase: "Exhale", seconds: 4 },
  { phase: "Hold ", seconds: 4 },
];

const BoxBreath = () => {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [tick, setTick] = useState(0);
  const idRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      if (idRef.current) window.clearInterval(idRef.current);
      return;
    }
    idRef.current = window.setInterval(() => {
      setTick((t) => {
        const current = CYCLE[step];
        if (t + 1 >= current.seconds) {
          setStep((s) => (s + 1) % CYCLE.length);
          return 0;
        }
        return t + 1;
      });
    }, 1000);
    return () => {
      if (idRef.current) window.clearInterval(idRef.current);
    };
  }, [running, step]);

  const reset = () => {
    setRunning(false);
    setStep(0);
    setTick(0);
  };

  const current = CYCLE[step];
  const remaining = current.seconds - tick;
  const scale = current.phase === "Inhale" ? 1 : current.phase === "Exhale" ? 0.55 : current.phase === "Hold" ? 1 : 0.55;

  return (
    <div className="bg-card-gradient border border-border rounded-3xl p-8 md:p-10 text-center">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Box breathing · 4-4-4-4</p>
      <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
        Steadies your heart rate before you walk on stage or into a room. Two minutes is enough.
      </p>

      <div className="relative mx-auto mb-8" style={{ width: 240, height: 240 }}>
        <div
          className="absolute inset-0 rounded-full bg-warm shadow-glow transition-transform duration-[1000ms] ease-in-out"
          style={{ transform: `scale(${scale})` }}
        />
        <div className="absolute inset-0 grid place-items-center">
          <div>
            <p className="font-display text-3xl font-semibold text-primary-foreground">{current.phase.trim()}</p>
            <p className="font-mono text-xl text-primary-foreground/80 tabular-nums">{remaining}s</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        {!running ? (
          <Button variant="hero" size="lg" onClick={() => setRunning(true)}>
            <Play className="h-4 w-4" /> Start
          </Button>
        ) : (
          <Button variant="hero" size="lg" onClick={() => setRunning(false)}>
            <Pause className="h-4 w-4" /> Pause
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={reset}>
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
      </div>
    </div>
  );
};

const PostureChecklist = () => {
  const [checked, setChecked] = useState<boolean[]>(POSTURE.map(() => false));
  const allDone = checked.every(Boolean);
  return (
    <div className="border border-border rounded-3xl p-8">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Power-stance check</p>
      <p className="text-sm text-muted-foreground mb-6">Stand up. Run through each line. Tick when it's true.</p>
      <ul className="space-y-3">
        {POSTURE.map((p, i) => (
          <li key={p}>
            <button
              onClick={() =>
                setChecked((c) => {
                  const next = [...c];
                  next[i] = !next[i];
                  return next;
                })
              }
              className="w-full flex items-start gap-3 text-left group"
            >
              <span
                className={cn(
                  "mt-0.5 grid place-items-center h-5 w-5 rounded border transition-colors shrink-0",
                  checked[i] ? "bg-primary border-primary" : "border-muted-foreground group-hover:border-foreground",
                )}
              >
                {checked[i] && <Check className="h-3 w-3 text-primary-foreground" />}
              </span>
              <span className={cn("text-foreground/90", checked[i] && "line-through text-muted-foreground")}>
                {p}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {allDone && (
        <p className="mt-5 text-primary text-sm font-semibold animate-fade-in">
          Locked in. Now hold it for 60 seconds and notice how it feels.
        </p>
      )}
    </div>
  );
};

const POWER_POSE_SECONDS = 120;
const PowerPose = () => {
  const [seconds, setSeconds] = useState(POWER_POSE_SECONDS);
  const [running, setRunning] = useState(false);
  const idRef = useRef<number | null>(null);
  useEffect(() => {
    if (!running) return;
    idRef.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (idRef.current) window.clearInterval(idRef.current);
    };
  }, [running]);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <div className="border border-border rounded-3xl p-8">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">2-minute power pose</p>
      <p className="text-sm text-muted-foreground mb-6">
        Hands on hips, feet wide, chin level. Hold for two minutes before any high-stakes moment.
      </p>
      <div className="font-mono tabular-nums text-5xl font-semibold mb-6">
        {m}:{String(s).padStart(2, "0")}
      </div>
      <div className="flex gap-3">
        {!running ? (
          <Button variant="hero" onClick={() => setRunning(true)} disabled={seconds === 0}>
            <Play className="h-4 w-4" /> Start
          </Button>
        ) : (
          <Button variant="hero" onClick={() => setRunning(false)}>
            <Pause className="h-4 w-4" /> Pause
          </Button>
        )}
        <Button variant="outline" onClick={() => { setSeconds(POWER_POSE_SECONDS); setRunning(false); }}>
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
      </div>
    </div>
  );
};

const BodyLanguage = () => {
  return (
    <TrackShell
      eyebrow="Body Language · live drills"
      title={
        <>
          Stand like the room is <em className="text-primary not-italic">already yours.</em>
        </>
      }
      intro="Four interactive drills you do right now, on this page. Breathe. Posture-check. Pose. Then learn the four gestures that carry meaning."
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <BoxBreath />
        <PowerPose />
        <PostureChecklist />

        <div className="border border-border rounded-3xl p-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Eye contact rule</p>
          <p className="text-sm text-muted-foreground mb-6">3–5 seconds per person. Move on punctuation.</p>
          <ol className="space-y-3 list-decimal list-inside marker:text-primary marker:font-semibold">
            {EYE_CONTACT.map((e) => (
              <li key={e} className="text-foreground/90 leading-relaxed">{e}</li>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-2 border border-border rounded-3xl p-8 md:p-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">Four gestures that carry meaning</p>
          <div className="grid md:grid-cols-2 gap-6">
            {GESTURES.map((g) => (
              <div key={g.name} className="bg-card-gradient rounded-2xl p-6">
                <h3 className="font-display text-2xl font-semibold mb-1">{g.name}</h3>
                <p className="text-sm text-primary mb-3">{g.use}</p>
                <p className="text-muted-foreground leading-relaxed">{g.how}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-8">
            Practice each gesture in front of a mirror or your phone camera. Three reps each. Then say a sentence
            out loud while doing it — the gesture should land just before the word it emphasises.
          </p>
        </div>
      </div>
    </TrackShell>
  );
};

export default BodyLanguage;
