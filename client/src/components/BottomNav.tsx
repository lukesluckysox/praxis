import { Link, useLocation } from "wouter";
import { LayoutDashboard, FlaskConical, BookOpen, GitFork, Plus } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Lab" },
  { href: "/experiments", icon: FlaskConical, label: "Experiments" },
  { href: "/experiments/new", icon: Plus, label: "New" },
  { href: "/doctrines", icon: BookOpen, label: "Doctrines" },
  { href: "/tensions", icon: GitFork, label: "Tensions" },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav
      data-testid="nav-bottom"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/90 backdrop-blur-md md:hidden"
    >
      <div className="max-w-2xl mx-auto flex items-center justify-around px-2 py-2.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          let isActive: boolean;
          if (href === "/") {
            isActive = location === href || location === "";
          } else if (href === "/experiments/new") {
            isActive = location === href;
          } else if (href === "/experiments") {
            isActive = location === href || (location.startsWith("/experiments/") && location !== "/experiments/new");
          } else {
            isActive = location === href || location.startsWith(href + "/");
          }
          return (
            <Link
              key={href}
              href={href}
              data-testid={`nav-${label.toLowerCase()}`}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground/40 hover:text-muted-foreground"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2 : 1.5} />
              <span className={`text-[8px] font-mono ${isActive ? "text-foreground/70" : "text-muted-foreground/30"}`}>
                {label.toLowerCase()}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
