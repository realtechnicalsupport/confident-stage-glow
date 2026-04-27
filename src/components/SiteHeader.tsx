import { Link, NavLink, useLocation } from "react-router-dom";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/tracks/public-speaking", label: "Public Speaking" },
  { to: "/tracks/impromptu", label: "Impromptu" },
  { to: "/tracks/interviews", label: "Interviews" },
  { to: "/tracks/body-language", label: "Body Language" },
];

export const SiteHeader = ({ transparent = false }: { transparent?: boolean }) => {
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  return (
    <header
      className={cn(
        "z-30",
        transparent ? "absolute top-0 inset-x-0" : "sticky top-0 bg-background/85 backdrop-blur-md border-b border-border",
      )}
    >
      <div className="container flex items-center justify-between py-5">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <span className="grid place-items-center h-9 w-9 rounded-full bg-warm text-primary-foreground">
            <Mic className="h-4 w-4" />
          </span>
          Speak<em className="not-italic text-primary">Bold</em>
        </Link>
        <nav className="hidden lg:flex items-center gap-7 text-sm text-muted-foreground">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn("hover:text-foreground transition-colors", isActive && "text-foreground")
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <Button variant={onHome ? "spotlight" : "outline"} size="sm" asChild>
          <Link to="/tracks/impromptu">Practice now</Link>
        </Button>
      </div>
    </header>
  );
};
