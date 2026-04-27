import { Hero } from "@/components/Hero";
import { Tracks } from "@/components/Tracks";
import { ImpromptuPrompt } from "@/components/ImpromptuPrompt";
import { Techniques } from "@/components/Techniques";
import { Progress } from "@/components/Progress";
import { CTA } from "@/components/CTA";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <h1 className="sr-only">SpeakBold — Build speaking confidence for public speaking, interviews, and impromptu moments</h1>
      <Hero />
      <Tracks />
      <ImpromptuPrompt />
      <Techniques />
      <Progress />
      <CTA />
    </main>
  );
};

export default Index;
