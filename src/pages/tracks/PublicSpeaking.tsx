import { useState } from "react";
import { TrackShell } from "@/components/TrackShell";
import { RecorderPanel } from "@/components/RecorderPanel";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const LESSONS = [
  {
    title: "The 10-second hook",
    duration: "5 min",
    summary:
      "Audiences decide if they're listening in the first ten seconds. Open with a sharp question, a single image, or a number that surprises.",
    drill:
      "Pick a topic you know well. Write three different opening lines: a question, an image, a stat. Record yourself reading each one. Which lands?",
    example:
      '"Three out of four people in this room will quit a meeting in their head before it even starts. Today, we change that."',
  },
  {
    title: "Structure: Point — Story — Point",
    duration: "6 min",
    summary:
      "The cleanest structure on earth. State your point. Tell one specific story that proves it. Restate the point with new force.",
    drill:
      "Take any belief you hold. Speak for 90 seconds using PSP. Don't add a second point — discipline is the lesson.",
    example:
      'Point: "Small habits beat big plans." Story: a 30-second moment from your life. Point again, sharpened.',
  },
  {
    title: "The pause that earns attention",
    duration: "4 min",
    summary:
      "New speakers fill silence. Strong speakers use it. A pause after your headline tells the room: this matters.",
    drill:
      "Record a 60-second story. Insert one full second of silence after your most important line. Listen back — feel the weight.",
    example:
      'Try: "And then she said the one thing I never expected." (one… two…) "She said: \'You\'re ready.\'"',
  },
  {
    title: "Pace, pitch, and the energy curve",
    duration: "5 min",
    summary:
      "Monotone kills meaning. Vary speed: slow on the heavy lines, faster on the build. End lower than you start to land authority.",
    drill:
      "Read a paragraph aloud twice — once flat, once with deliberate variation. Record both. Compare.",
    example: "Slow: the headline. Fast: the build. Slow + low: the close.",
  },
  {
    title: "Closing: the line they'll repeat",
    duration: "4 min",
    summary:
      "A talk lives or dies on its last line. Write it before you write anything else. Make it short, vivid, and quotable.",
    drill:
      "Write three possible closes for a short talk. Say each out loud. Keep the one your body wants to say with conviction.",
    example: '"Don\'t practice until you get it right. Practice until you can\'t get it wrong."',
  },
];

const PublicSpeaking = () => {
  const [open, setOpen] = useState(0);

  return (
    <TrackShell
      eyebrow="Public Speaking · 5 lessons"
      title={
        <>
          Build a talk that <em className="text-primary not-italic">lands.</em>
        </>
      }
      intro="Five short lessons on hooks, structure, pause, pace, and the close. Each one ends with a drill you do out loud — record yourself, listen back, repeat tomorrow."
    >
      <div className="grid lg:grid-cols-[1fr_420px] gap-10">
        <div className="space-y-3">
          {LESSONS.map((l, i) => {
            const isOpen = open === i;
            return (
              <article
                key={l.title}
                className={cn(
                  "border border-border rounded-2xl overflow-hidden transition-colors",
                  isOpen ? "bg-card-gradient" : "bg-card",
                )}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="grid place-items-center h-10 w-10 rounded-full bg-muted font-display text-lg font-semibold">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-xl md:text-2xl font-semibold">{l.title}</h3>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{l.duration}</p>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform shrink-0",
                      isOpen && "rotate-90 text-primary",
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-7 space-y-5 animate-fade-in">
                    <p className="text-foreground/90 leading-relaxed">{l.summary}</p>
                    <div className="border-l-2 border-primary pl-4">
                      <p className="text-xs uppercase tracking-widest text-primary mb-1">Drill</p>
                      <p className="text-muted-foreground leading-relaxed">{l.drill}</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Example</p>
                      <p className="font-display text-lg italic leading-relaxed">{l.example}</p>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <aside className="lg:sticky lg:top-24 self-start space-y-6">
          <RecorderPanel
            label="Practice this lesson"
            hint="Run the drill from the open lesson. Record. Listen. Adjust."
            targetSeconds={90}
          />
          <div className="border border-border rounded-2xl p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Self-review checklist</p>
            <ul className="space-y-2 text-sm">
              {[
                "Did the first 10 seconds earn attention?",
                "One clear point — not three?",
                "At least one full pause?",
                "Pace varied between lines?",
                "Closing line lands cleanly?",
              ].map((q) => (
                <li key={q} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground/85">{q}</span>
                </li>
              ))}
            </ul>
          </div>
          <Button variant="outline" className="w-full" asChild>
            <a href="/tracks/impromptu">Next: try the impromptu drills →</a>
          </Button>
        </aside>
      </div>
    </TrackShell>
  );
};

export default PublicSpeaking;
