import { useEffect, useRef } from "react";
import { Mic, Square, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecorder } from "@/hooks/useRecorder";
import { cn } from "@/lib/utils";

const formatTime = (ms: number) => {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

interface RecorderPanelProps {
  label?: string;
  hint?: string;
  targetSeconds?: number;
  /** When provided, recording auto-starts on true and auto-stops on false. Hides manual buttons. */
  externalRunning?: boolean;
}

export const RecorderPanel = ({
  label = "Practice recording",
  hint = "Hit record, speak out loud, then play it back. Audio stays on your device.",
  targetSeconds,
  externalRunning,
}: RecorderPanelProps) => {
  const { state, recording, elapsedMs, error, start, stop, reset } = useRecorder();
  const externallyControlled = externalRunning !== undefined;
  const prevExternalRef = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (!externallyControlled) return;
    const prev = prevExternalRef.current;
    if (externalRunning && !prev) {
      start();
    } else if (!externalRunning && prev) {
      stop();
    }
    prevExternalRef.current = externalRunning;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalRunning, externallyControlled]);

  const isRecording = state === "recording";
  const reachedTarget = targetSeconds ? elapsedMs >= targetSeconds * 1000 : false;

  return (
    <div className="bg-card-gradient border border-border rounded-3xl p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
          <p className="text-sm text-muted-foreground max-w-md">{hint}</p>
        </div>
        <div className="text-right">
          <div className="font-mono tabular-nums text-3xl md:text-4xl text-foreground">
            {formatTime(elapsedMs)}
          </div>
          {targetSeconds ? (
            <div className={cn("text-xs mt-1", reachedTarget ? "text-primary" : "text-muted-foreground")}>
              target {formatTime(targetSeconds * 1000)}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {!isRecording ? (
          <Button variant="hero" size="lg" onClick={start}>
            <Mic className="h-4 w-4" />
            {recording ? "Record again" : "Start recording"}
          </Button>
        ) : (
          <Button variant="hero" size="lg" onClick={stop} className="animate-pulse-glow">
            <Square className="h-4 w-4" />
            Stop
          </Button>
        )}
        {recording && !isRecording && (
          <Button variant="outline" size="lg" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {recording && !isRecording && (
        <div className="mt-6 space-y-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Playback</p>
          <audio controls src={recording.url} className="w-full" />
          <p className="text-xs text-muted-foreground">
            Listen back. Note one thing you nailed and one thing to tighten next time.
          </p>
        </div>
      )}
    </div>
  );
};
