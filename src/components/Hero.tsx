import heroImage from "@/assets/hero-speaker.jpg";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-[92vh] flex items-end overflow-hidden">
      {/* Background image */}
      <img
        src={heroImage}
        alt="Confident speaker on stage under warm spotlight"
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-spotlight opacity-60" />

      {/* Top nav */}
      <header className="absolute top-0 inset-x-0 z-20">
        <div className="container flex items-center justify-between py-6">
          <a href="#" className="flex items-center gap-2 font-display text-xl font-semibold">
            <span className="grid place-items-center h-9 w-9 rounded-full bg-warm text-primary-foreground">
              <Mic className="h-4 w-4" />
            </span>
            Speak<em className="not-italic text-primary">Bold</em>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#practice" className="hover:text-foreground transition-colors">Practice</a>
            <a href="#tracks" className="hover:text-foreground transition-colors">Tracks</a>
            <a href="#techniques" className="hover:text-foreground transition-colors">Techniques</a>
            <a href="#progress" className="hover:text-foreground transition-colors">Progress</a>
          </nav>
          <Button variant="spotlight" size="sm">Start free</Button>
        </div>
      </header>

      {/* Hero copy */}
      <div className="container relative z-10 pb-20 md:pb-32 pt-32">
        <div className="max-w-3xl animate-fade-up">
          <div className="flex items-center gap-3 text-primary text-xs font-semibold tracking-[0.25em] uppercase mb-8">
            <span className="h-px w-10 bg-primary" />
            Speak with presence
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-semibold leading-[0.95] tracking-tight text-balance mb-8">
            The room <em className="text-primary not-italic">leans in</em> when you speak.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty mb-10 leading-relaxed">
            A daily practice for public speaking, impromptu thinking, job interviews,
            and the body language that makes people listen.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="hero" size="xl" asChild>
              <a href="#practice">
                Start today's session
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <a href="#tracks">Browse tracks</a>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-10 gap-y-4 mt-16 text-sm text-muted-foreground">
            <div><span className="font-display text-2xl text-foreground font-semibold">5 min</span><br/>daily practice</div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div><span className="font-display text-2xl text-foreground font-semibold">120+</span><br/>impromptu prompts</div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div><span className="font-display text-2xl text-foreground font-semibold">4 tracks</span><br/>built by coaches</div>
          </div>
        </div>
      </div>
    </section>
  );
};
