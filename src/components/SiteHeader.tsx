import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Mic, LogOut, User, Trophy, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { to: "/tracks/public-speaking", label: "Public Speaking" },
  { to: "/tracks/impromptu", label: "Impromptu" },
  { to: "/tracks/interviews", label: "Interviews" },
  { to: "/tracks/body-language", label: "Body Language" },
];

export const SiteHeader = ({ transparent = false }: { transparent?: boolean }) => {
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => setOpen(false), [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "z-30",
        transparent
          ? "absolute top-0 inset-x-0"
          : "sticky top-0 bg-background/85 backdrop-blur-md border-b border-border",
      )}
    >
      <div className="container flex items-center justify-between py-5">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <span className="grid place-items-center h-9 w-9 rounded-full bg-warm text-primary-foreground">
            <Mic className="h-4 w-4" />
          </span>
          Speak<em className="not-italic text-primary">Bold</em>
        </Link>

        {/* Desktop nav */}
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

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/leaderboard">
                  <Trophy className="h-4 w-4" />
                  <span>Leaderboard</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/profile">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </Button>
            </>
          ) : (
            <Button variant={onHome ? "spotlight" : "outline"} size="sm" asChild>
              <Link to="/login">Log in / Sign up</Link>
            </Button>
          )}
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "lg:hidden relative h-10 w-10 grid place-items-center rounded-full border border-border",
            "bg-background/60 backdrop-blur-md transition-colors hover:border-primary/40",
          )}
        >
          <span className="sr-only">Toggle navigation</span>
          <Menu
            className={cn(
              "h-5 w-5 absolute transition-all duration-300",
              open ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100",
            )}
          />
          <X
            className={cn(
              "h-5 w-5 absolute transition-all duration-300",
              open ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75",
            )}
          />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        className={cn(
          "lg:hidden fixed inset-0 top-0 z-40 transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Panel */}
        <div
          className={cn(
            "relative ml-auto h-full w-full max-w-sm bg-background border-l border-border",
            "flex flex-col transition-transform duration-300 ease-out shadow-2xl",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          {/* Decorative glows */}
          <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-primary/15 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

          {/* Header row */}
          <div className="relative flex items-center justify-between px-6 py-5 border-b border-border">
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
              <span className="grid place-items-center h-8 w-8 rounded-full bg-warm text-primary-foreground">
                <Mic className="h-3.5 w-3.5" />
              </span>
              Speak<em className="not-italic text-primary">Bold</em>
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="h-9 w-9 grid place-items-center rounded-full border border-border hover:border-primary/40 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className="relative flex-1 overflow-y-auto px-6 py-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-5">
              Tracks
            </p>
            <ul className="space-y-1">
              {NAV.map((n, i) => (
                <li
                  key={n.to}
                  className={cn(
                    "transition-all duration-300",
                    open ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4",
                  )}
                  style={{ transitionDelay: open ? `${100 + i * 60}ms` : "0ms" }}
                >
                  <NavLink
                    to={n.to}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center justify-between py-3 border-b border-border/60",
                        "font-display text-2xl transition-colors",
                        isActive ? "text-primary" : "text-foreground hover:text-primary",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span>{n.label}</span>
                        <ArrowRight
                          className={cn(
                            "h-4 w-4 transition-all",
                            isActive
                              ? "opacity-100 translate-x-0 text-primary"
                              : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                          )}
                        />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            {user && (
              <>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-10 mb-4">
                  You
                </p>
                <ul className="space-y-1">
                  {[
                    { to: "/profile", label: "Profile", icon: User },
                    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
                  ].map((item, i) => (
                    <li
                      key={item.to}
                      className={cn(
                        "transition-all duration-300",
                        open ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4",
                      )}
                      style={{
                        transitionDelay: open ? `${100 + (NAV.length + i) * 60}ms` : "0ms",
                      }}
                    >
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 py-3 text-base text-muted-foreground hover:text-foreground transition-colors",
                            isActive && "text-foreground",
                          )
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="relative border-t border-border px-6 py-5">
            {user ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground truncate">
                  Signed in as <span className="text-foreground">{user.email}</span>
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            ) : (
              <Button variant="hero" size="lg" className="w-full" asChild>
                <Link to="/login">
                  Log in / Sign up <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
