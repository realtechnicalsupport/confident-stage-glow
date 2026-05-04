import { useEffect, useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Feedback = {
  id: string;
  recording_id: string;
  transcript: string | null;
  summary: string;
  strengths: string[];
  improvements: string[];
  next_drill: string | null;
  scores: Record<string, number>;
  created_at: string;
};

const SCORE_LABELS: Record<string, string> = {
  clarity: "Clarity",
  pace: "Pace",
  structure: "Structure",
  confidence: "Confidence",
  filler_words: "Filler control",
};

export const RecordingFeedback = ({ recordingId }: { recordingId: string }) => {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [open, setOpen] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("recording_feedback")
        .select("*")
        .eq("recording_id", recordingId)
        .maybeSingle();
      if (!cancelled) {
        if (data) {
          setFeedback({
            ...data,
            strengths: (data.strengths as any) ?? [],
            improvements: (data.improvements as any) ?? [],
            scores: (data.scores as any) ?? {},
          });
          setOpen(true);
        }
        setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [recordingId]);

  const generate = async (force = false) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-recording", {
        body: { recordingId, force },
      });
      if (error) {
        const msg = (error as any)?.context?.error || error.message || "Failed to generate feedback";
        toast.error(msg);
        return;
      }
      if (data?.feedback) {
        setFeedback({
          ...data.feedback,
          strengths: data.feedback.strengths ?? [],
          improvements: data.feedback.improvements ?? [],
          scores: data.feedback.scores ?? {},
        });
        setOpen(true);
        toast.success(data.cached ? "Feedback loaded" : "AI coach has notes for you");
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return null;

  if (!feedback) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => generate(false)}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Listening to your take…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Get AI feedback
          </>
        )}
      </Button>
    );
  }

  return (
    <div className="border border-primary/30 rounded-xl bg-card-gradient overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">
            AI coach
          </span>
          <span className="text-sm text-muted-foreground truncate hidden sm:inline">
            · {feedback.summary.slice(0, 60)}{feedback.summary.length > 60 ? "…" : ""}
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/60 pt-4">
          <p className="text-sm text-foreground/90 leading-relaxed">{feedback.summary}</p>

          {/* Scores */}
          {Object.keys(feedback.scores).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Object.entries(SCORE_LABELS).map(([key, label]) => {
                const v = Number(feedback.scores[key] ?? 0);
                return (
                  <div key={key} className="border border-border rounded-lg p-2">
                    <div className="font-display text-xl font-semibold tabular-nums">{v}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                      {label}
                    </div>
                    <div className="h-1 w-full bg-muted rounded-full mt-2 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          v >= 75 ? "bg-warm" : v >= 50 ? "bg-primary/70" : "bg-muted-foreground/60",
                        )}
                        style={{ width: `${Math.max(0, Math.min(100, v))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">
                Strengths
              </p>
              <ul className="space-y-1.5 text-sm text-foreground/90">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary mt-1">·</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-2">
                Tighten next
              </p>
              <ul className="space-y-1.5 text-sm text-foreground/90">
                {feedback.improvements.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-accent mt-1">·</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {feedback.next_drill && (
            <div className="border border-dashed border-border rounded-lg p-3 bg-muted/20">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Try next
              </p>
              <p className="text-sm text-foreground/90">{feedback.next_drill}</p>
            </div>
          )}

          {feedback.transcript && (
            <div>
              <button
                type="button"
                onClick={() => setShowTranscript((v) => !v)}
                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                {showTranscript ? "Hide" : "Show"} transcript
              </button>
              {showTranscript && (
                <p className="text-sm text-muted-foreground mt-2 italic leading-relaxed whitespace-pre-wrap">
                  "{feedback.transcript}"
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => generate(true)} disabled={loading}>
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
