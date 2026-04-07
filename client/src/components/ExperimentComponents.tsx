import { cn } from "@/lib/utils";

// ── Status Badge ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active: { label: "Active", color: "bg-blue-500/10 text-blue-400 dark:text-blue-300" },
  observing: { label: "Observing", color: "bg-primary/10 text-primary" },
  completed: { label: "Completed", color: "bg-muted text-muted-foreground" },
  archived: { label: "Archived", color: "bg-muted text-muted-foreground/60" },
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? {
    label: status,
    color: "bg-muted text-muted-foreground",
  };
  return (
    <span
      data-testid={`badge-status-${status}`}
      className={cn(
        "inline-flex items-center text-xs px-1.5 py-0.5 rounded font-medium",
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}

// ── Phase Dot ─────────────────────────────────────────────────────────────

const PHASE_DOT_COLOR = {
  active: "bg-blue-400",
  observing: "bg-primary",
  completed: "bg-muted-foreground/40",
  archived: "bg-muted-foreground/20",
};

export function PhaseDot({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0",
        PHASE_DOT_COLOR[status as keyof typeof PHASE_DOT_COLOR] ?? "bg-muted-foreground"
      )}
    />
  );
}

// ── Source Tag ────────────────────────────────────────────────────────────

const SOURCE_CONFIG = {
  liminal: { label: "Liminal", color: "text-purple-400 dark:text-purple-300" },
  parallax: { label: "Parallax", color: "text-teal-500 dark:text-teal-400" },
  manual: { label: "Manual", color: "text-muted-foreground" },
};

export function SourceTag({ source }: { source: string }) {
  const config = SOURCE_CONFIG[source as keyof typeof SOURCE_CONFIG] ?? {
    label: source,
    color: "text-muted-foreground",
  };
  return (
    <span className={cn("text-xs font-medium uppercase tracking-wider", config.color)}>
      {config.label}
    </span>
  );
}

// ── Phase Label ───────────────────────────────────────────────────────────

const PHASES = ["hypothesis", "design", "observation", "meaning"] as const;

export function PhaseProgress({ experiment }: { experiment: { status: string; observation: string; meaningExtraction: string } }) {
  const getPhase = () => {
    if (experiment.status === "completed") return 4;
    if (experiment.meaningExtraction) return 4;
    if (experiment.observation) return 3;
    if (experiment.status === "observing") return 2;
    return 1;
  };
  const currentPhase = getPhase();

  return (
    <div className="flex items-center gap-1">
      {["Hypothesis", "Design", "Observation", "Meaning"].map((label, i) => (
        <div key={label} className="flex items-center gap-1">
          <div
            className={cn(
              "h-1 w-8 rounded-full transition-colors",
              i < currentPhase ? "bg-primary" : "bg-border"
            )}
          />
          {i < 3 && <div className="w-0.5" />}
        </div>
      ))}
    </div>
  );
}
