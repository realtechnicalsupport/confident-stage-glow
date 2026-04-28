import { useEffect, useRef, useState } from "react";
import { TrackShell } from "@/components/TrackShell";
import { RecorderPanel } from "@/components/RecorderPanel";
import { Button } from "@/components/ui/button";
import { Shuffle, Play, Pause, RotateCcw, Lightbulb, EyeOff } from "lucide-react";

type Difficulty = "Easy" | "Medium" | "Hard";

type ExampleBeat = { label: string; text: string };

type Prompt = {
  text: string;
  framework: string; // must match a FRAMEWORKS name
  points: string[];
  example: ExampleBeat[];
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
  {
    name: "Story Arc",
    expanded: "Setting · Conflict · Turning point · Lesson",
    detail: "Best for personal anecdotes — pulls the listener in fast.",
  },
];

const PROMPTS: Record<Difficulty, Prompt[]> = {
  Easy: [
    {
      text: "Talk about your favorite meal and why it matters to you.",
      framework: "Story Arc",
      points: [
        "Set the scene — where and when you usually eat it",
        "Describe one specific memory tied to it",
        "Name the smell, taste, or texture you love most",
        "End with what it represents (home, family, comfort)",
      ],
    },
    {
      text: "Describe the room you grew up in.",
      framework: "Story Arc",
      points: [
        "Open with one vivid detail (a poster, a smell, the light)",
        "Walk us around the room in 2–3 sentences",
        "Mention an object that meant a lot to you",
        "Close with how it shaped who you are",
      ],
    },
    {
      text: "What is one small thing that made you smile this week?",
      framework: "What · So What · Now What",
      points: [
        "Name the moment in one sentence",
        "Why it landed — what you needed that day",
        "What it reminded you to pay attention to",
      ],
    },
    {
      text: "Pitch your hometown as a vacation spot.",
      framework: "PREP",
      points: [
        "Point: one bold reason to visit",
        "Reason: what makes it different from everywhere else",
        "Example: a specific street, dish, or season",
        "Point: restate why someone would love it",
      ],
    },
    {
      text: "Talk for 60 seconds about the color blue.",
      framework: "Past · Present · Future",
      points: [
        "Past: where blue shows up in your earliest memories",
        "Present: where you notice it now (sky, screens, mood)",
        "Future: what blue could come to mean",
      ],
    },
    {
      text: "Describe a teacher who left a mark on you.",
      framework: "Story Arc",
      points: [
        "Who they were and what they taught",
        "One specific moment with them",
        "What they said or did that stuck",
        "How you carry it today",
      ],
    },
    {
      text: "What is one habit you actually enjoy?",
      framework: "PREP",
      points: [
        "Point: name the habit",
        "Reason: why it works for you",
        "Example: what a typical day looks like with it",
        "Point: what it has changed",
      ],
    },
    {
      text: "Tell us about an ordinary object you couldn't live without.",
      framework: "Story Arc",
      points: [
        "Name the object plainly",
        "Describe the ritual it is part of",
        "A moment it saved you or surprised you",
        "Why losing it would actually hurt",
      ],
    },
  ],
  Medium: [
    {
      text: "Convince me that breakfast is the most important meal.",
      framework: "PREP",
      points: [
        "Point: breakfast sets the tone for the day",
        "Reason: energy, focus, and decision quality",
        "Example: a morning with vs. without it",
        "Point: small meal, big compounding effect",
      ],
    },
    {
      text: "What advice would you give your 16-year-old self?",
      framework: "Past · Present · Future",
      points: [
        "Past: what you were worrying about at 16",
        "Present: what you now know is true",
        "Future: the one habit you'd start earlier",
      ],
    },
    {
      text: "Argue for or against working from home.",
      framework: "PREP",
      points: [
        "Point: pick a clear side",
        "Reason: focus, autonomy, or collaboration",
        "Example: a real situation that proves it",
        "Point: who it works best for",
      ],
    },
    {
      text: "Pitch a brand new holiday — what is it and how do we celebrate?",
      framework: "What · So What · Now What",
      points: [
        "What: the name and the date",
        "So what: the value it celebrates",
        "Now what: one ritual everyone does",
      ],
    },
    {
      text: "Describe a time you changed your mind about something important.",
      framework: "Story Arc",
      points: [
        "What you used to believe and why",
        "The moment that cracked it open",
        "The new view you hold now",
        "What it taught you about being wrong",
      ],
    },
    {
      text: "What is one belief most people hold that you disagree with?",
      framework: "PREP",
      points: [
        "Point: state the belief and your counter-view",
        "Reason: where the common view falls short",
        "Example: a case that proves your point",
        "Point: what people should do instead",
      ],
    },
    {
      text: "Sell me a book you'd recommend to anyone.",
      framework: "PREP",
      points: [
        "Point: the book and the one-line promise",
        "Reason: who it is for and what shifts",
        "Example: an idea or scene that hit hard",
        "Point: when to read it",
      ],
    },
    {
      text: "What does courage look like in everyday life?",
      framework: "What · So What · Now What",
      points: [
        "What: define the kind of courage you mean",
        "So what: why small acts matter more than big ones",
        "Now what: one thing the listener can do today",
      ],
    },
  ],
  Hard: [
    {
      text: "If you ran the world for a day, what is the first law you'd pass?",
      framework: "What · So What · Now What",
      points: [
        "What: the law in one sentence",
        "So what: the problem it solves",
        "Now what: how life changes the next morning",
      ],
    },
    {
      text: "Defend a controversial opinion you actually hold.",
      framework: "PREP",
      points: [
        "Point: state it cleanly, no hedging",
        "Reason: the principle behind it",
        "Example: where the mainstream view fails",
        "Point: what you are NOT saying",
      ],
    },
    {
      text: "Describe the best meal you've ever eaten without naming the food.",
      framework: "Story Arc",
      points: [
        "Where you were and who you were with",
        "The textures, smells, sounds at the table",
        "The first bite — described, not named",
        "Why it became unforgettable",
      ],
    },
    {
      text: "What is the most useful skill schools fail to teach?",
      framework: "PREP",
      points: [
        "Point: name the skill",
        "Reason: where adults clearly lack it",
        "Example: a moment it would have helped you",
        "Point: how it could be taught simply",
      ],
    },
    {
      text: "Explain quantum entanglement to a curious 10-year-old.",
      framework: "What · So What · Now What",
      points: [
        "What: a simple analogy (two coins, two dice)",
        "So what: why it is weirder than it sounds",
        "Now what: where this shows up in real tech",
      ],
    },
    {
      text: "Argue that failure is more valuable than success.",
      framework: "PREP",
      points: [
        "Point: the bold claim",
        "Reason: feedback, humility, durability",
        "Example: a personal or famous failure",
        "Point: how to fail on purpose",
      ],
    },
    {
      text: "Make the case for or against social media in three points.",
      framework: "PREP",
      points: [
        "Pick a side and state it fast",
        "Three reasons — keep them distinct",
        "One example per reason",
        "Land on what the listener should do",
      ],
    },
    {
      text: "What would you say in a 60-second eulogy for your past self?",
      framework: "Past · Present · Future",
      points: [
        "Past: who that version of you was",
        "Present: what they made possible",
        "Future: what you are carrying forward without them",
      ],
    },
  ],
};

const Impromptu = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [prompt, setPrompt] = useState<Prompt>(PROMPTS.Medium[0]);
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const idRef = useRef<number | null>(null);

  const shuffle = (d: Difficulty = difficulty) => {
    const list = PROMPTS[d];
    let next = prompt;
    while (next.text === prompt.text) next = list[Math.floor(Math.random() * list.length)];
    setPrompt(next);
    setSeconds(60);
    setRunning(false);
    setRevealed(false);
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
  const suggestedFramework = FRAMEWORKS.find((f) => f.name === prompt.framework);

  return (
    <TrackShell
      eyebrow="Impromptu · 60-second drills"
      title={
        <>
          One prompt. Sixty seconds. <em className="text-primary not-italic">No notes.</em>
        </>
      }
      intro="The fastest way to build speaking confidence is to speak when you don't feel ready. Pick a difficulty, hit start, and talk until the timer ends. Stuck? Reveal hints — but try without them first."
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
              "{prompt.text}"
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
              <Button
                variant={revealed ? "outline" : "spotlight"}
                size="lg"
                onClick={() => setRevealed((r) => !r)}
              >
                {revealed ? <EyeOff className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
                {revealed ? "Hide hints" : "Reveal hints"}
              </Button>
            </div>
            {seconds === 0 && (
              <p className="mt-6 text-primary font-semibold animate-fade-in">Time. Take a breath. Try a fresh prompt.</p>
            )}
          </div>

          {revealed && (
            <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
              <div className="border border-primary/30 rounded-2xl p-6 bg-primary/5">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold">
                    Talking points
                  </span>
                </div>
                <ol className="space-y-3">
                  {prompt.points.map((p, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed">
                      <span className="font-mono text-primary shrink-0">{i + 1}.</span>
                      <span className="text-foreground/90">{p}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {suggestedFramework && (
                <div className="border border-border rounded-2xl p-6 bg-muted/30">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                      Suggested framework
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold mb-1">{suggestedFramework.name}</h3>
                  <p className="text-sm text-primary mb-3">{suggestedFramework.expanded}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{suggestedFramework.detail}</p>
                </div>
              )}
            </div>
          )}

          <RecorderPanel
            label="Optional: record your attempt"
            hint="Listen back to one in five attempts. You'll spot fillers, pace dips, and habits you can fix fast."
            targetSeconds={60}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">All frameworks</p>
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
