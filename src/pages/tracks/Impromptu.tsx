import { useEffect, useRef, useState } from "react";
import { TrackShell } from "@/components/TrackShell";
import { RecorderPanel } from "@/components/RecorderPanel";
import { Button } from "@/components/ui/button";
import { Shuffle, Play, Pause, RotateCcw } from "lucide-react";

const PROMPTS: Record<string, string[]> = {
  Easy: [
    "Talk about your favorite meal and why it matters to you.",
    "Describe the room you grew up in.",
    "What is one small thing that made you smile this week?",
    "Pitch your hometown as a vacation spot.",
    "Talk for 60 seconds about the color blue.",
    "Describe a teacher who left a mark on you.",
    "What is one habit you actually enjoy?",
    "Tell us about an ordinary object you couldn't live without.",
  ],
  Medium: [
    "Convince me that breakfast is the most important meal.",
    "What advice would you give your 16-year-old self?",
    "Argue for or against working from home.",
    "Pitch a brand new holiday — what is it and how do we celebrate?",
    "Describe a time you changed your mind about something important.",
    "What is one belief most people hold that you disagree with?",
    "Sell me a book you'd recommend to anyone.",
    "What does courage look like in everyday life?",
  ],
  Hard: [
    "If you ran the world for a day, what is the first law you'd pass?",
    "Defend a controversial opinion you actually hold.",
    "Describe the best meal you've ever eaten without naming the food.",
    "What is the most useful skill schools fail to teach?",
    "Explain quantum entanglement to a curious 10-year-old.",
    "Argue that failure is more valuable than success.",
    "Make the case for or against social media in three points.",
    "What would you say in a 60-second eulogy for your past self?",
  ],
};

const FRAMEWORKS = [
  {
    name: "PREP",
    expanded: "Point · Reason · Example · Point",
    detail: "State your view. Why you hold it. A short story or stat. Restate the view.",
  },
  {
    name: "Past · Present · Future",
    expanded: "Where it was · Where it is · Where it's going",
    detail: "Perfect for opinions, trends, or any 'what do you think about X?' question.",
  },
  {
    name: "What · So What · Now What",
    expanded: "The fact · Why it matters · What to do",
    detail: "Great for reactions, news, and putting a recommendation on the table.",
  },
];

type Difficulty = "Easy" | "Medium" | "Hard";

const Impromptu = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [prompt, setPrompt] = useState(PROMPTS.Medium[0]);
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  const idRef = useRef<number | null>(null);

  const shuffle = (d: Difficulty = difficulty) => {
    const list = PROMPTS[d];
    let next = prompt;
    while (next === prompt) next = list[Math.floor(Math.random() * list.length)];
    setPrompt(next);
    setSeconds(60);
    setRunning(false);
  };

  useEffect(() => {
    if (!running) {
      if (idRef.current) window.clearInterval(idRef.current);
      return;
    }
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

  const pct = (seconds / 60) * 100;

  return (
    <TrackShell
      eyebrow="Impromptu · 60-second drills"
      title={
        <>
          One prompt. Sixty seconds. <em className="text-primary not-italic">No notes.</em>
        </>
      }
      intro="The fastest way to build speaking confidence is to speak when you don't feel ready. Pick a difficulty, hit start, and talk until the timer ends."
    >
      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PROMPTS) as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDifficulty(d);
                  shuffle(d);
                }}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  difficulty === d
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="relative bg-card-gradient border border-border rounded-3xl p-8 md:p-12 shadow-soft overflow-hidden">
            <div
              className="absolute top-0 left-0 h-1 bg-warm transition-all duration-1000 ease-linear"
              style={{ width: `${pct}%` }}
            />
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{difficulty} prompt</span>
              <span className="font-mono tabular-nums text-2xl">
                0:{String(seconds).padStart(2, "0")}
              </span>
            </div>
            <p className="font-display text-3xl md:text-5xl leading-tight text-pretty mb-10 min-h-[8rem]">
              "{prompt}"
            </p>
            <div className="flex flex-wrap gap-3">
              {!running ? (
                <Button variant="hero" size="lg" onClick={() => setRunning(true)} disabled={seconds === 0}>
                  <Play className="h-4 w-4" />
                  Start 60s
                </Button>
              ) : (
                <Button variant="hero" size="lg" onClick={() => setRunning(false)}>
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              )}
              <Button variant="outline" size="lg" onClick={() => { setSeconds(60); setRunning(false); }}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button variant="outline" size="lg" onClick={() => shuffle()}>
                <Shuffle className="h-4 w-4" />
                New prompt
              </Button>
            </div>
            {seconds === 0 && (
              <p className="mt-6 text-primary font-semibold animate-fade-in">Time. Take a breath. Try a fresh prompt.</p>
            )}
          </div>

          <RecorderPanel
            label="Optional: record your attempt"
            hint="Listen back to one in five attempts. You'll spot fillers, pace dips, and habits you can fix fast."
            targetSeconds={60}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Frameworks for when you blank</p>
          {FRAMEWORKS.map((f) => (
            <div key={f.name} className="border border-border rounded-2xl p-5">
              <h3 className="font-display text-xl font-semibold">{f.name}</h3>
              <p className="text-sm text-primary mb-2">{f.expanded}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.detail}</p>
            </div>
          ))}
          <div className="border border-border rounded-2xl p-5 bg-muted/30">
            <p className="text-sm text-foreground/85 leading-relaxed">
              <strong className="text-foreground">Rule:</strong> never apologise mid-prompt. If you stumble,
              keep going. The goal is reps, not perfection.
            </p>
          </div>
        </aside>
      </div>
    </TrackShell>
  );
};

export default Impromptu;
