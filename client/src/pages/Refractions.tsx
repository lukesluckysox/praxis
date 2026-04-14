import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  ChevronDown,
  FlaskConical,
  Cloudy,
  Activity,
} from "lucide-react";
import { SkeletonCard, SkeletonLine } from "@/components/Skeleton";

// ── Types ───────────────────────────────────────────────────

interface Experiment {
  title: string;
  duration: string;
  watching: string;
  target: string;
}

interface Condition {
  condition: string;
  amplifies: string;
  observation: string;
}

interface RecoveryData {
  stability: number;
  trend: "stabilizing" | "drifting" | "stable" | "volatile";
  recent_volatility: number;
  historical_volatility: number;
  data_points: number;
}

// ── Archetype colors (matching Parallax) ────────────────────

const ARCHETYPE_COLORS: Record<string, { color: string; emoji: string }> = {
  observer: { color: "#7c8ba0", emoji: "\u25C9" },
  builder: { color: "#5a7d9a", emoji: "\u25E7" },
  explorer: { color: "#6b9080", emoji: "\u25C7" },
  dissenter: { color: "#c17b6e", emoji: "\u25C8" },
  seeker: { color: "#b8976a", emoji: "\u2727" },
};

// ── Trend copy ──────────────────────────────────────────────

const TREND_COPY: Record<string, { label: string; description: string }> = {
  stabilizing: {
    label: "Stabilizing",
    description:
      "Your pattern appears to be settling. Recent signals show less drift than your historical average \u2014 a return toward baseline.",
  },
  drifting: {
    label: "Drifting",
    description:
      "Your recent signals show more movement than usual. This isn\u2019t inherently negative \u2014 drift often precedes a meaningful shift.",
  },
  stable: {
    label: "Stable",
    description:
      "Your pattern is holding steady. Dimension scores are consistent with your historical range \u2014 no significant drift detected.",
  },
  volatile: {
    label: "Volatile",
    description:
      "Your signals are fluctuating more than usual across multiple dimensions. This often coincides with periods of change, stress, or growth.",
  },
};

// ── SubSection wrapper ──────────────────────────────────────

function SubSection({
  icon: Icon,
  title,
  descriptor,
  color,
  children,
}: {
  icon: React.ElementType;
  title: string;
  descriptor: string;
  color: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border border-border/50 bg-card/30 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 w-full p-4 group"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}12` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-foreground/80">{title}</p>
          <p className="text-xs text-muted-foreground/50">{descriptor}</p>
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground/30" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Experiments section ─────────────────────────────────────

function ExperimentsContent() {
  const { data, isLoading } = useQuery<{ experiments: Experiment[] }>({
    queryKey: ["/api/refractions/experiments"],
    staleTime: 10 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="animate-pulse space-y-2">
          <div className="h-16 bg-muted/20 rounded-md" />
          <div className="h-16 bg-muted/20 rounded-md" />
        </div>
      </div>
    );
  }

  const experiments = data?.experiments || [];

  if (experiments.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground/40">
          Check in a few times in Parallax to surface experiment suggestions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {experiments.map((exp, i) => {
        const arch = ARCHETYPE_COLORS[exp.target];
        return (
          <div
            key={i}
            className="p-3 rounded-md border border-border/30 bg-background/30 space-y-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground/80 leading-snug">
                {exp.title}
              </p>
              <span className="text-xs font-mono text-muted-foreground/40 whitespace-nowrap">
                {exp.duration}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {arch && (
                <span
                  className="text-xs font-display"
                  style={{ color: arch.color }}
                >
                  {arch.emoji}
                </span>
              )}
              <p className="text-xs text-muted-foreground/50 italic">
                watching: {exp.watching}
              </p>
            </div>
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground/30 text-center pt-1">
        experiments target your least-expressed archetypes
      </p>
    </div>
  );
}

// ── Conditions section ──────────────────────────────────────

function ConditionsContent() {
  const { data, isLoading } = useQuery<{ conditions: Condition[] }>({
    queryKey: ["/api/refractions/conditions"],
    staleTime: 10 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="animate-pulse space-y-2">
          <div className="h-14 bg-muted/20 rounded-md" />
          <div className="h-14 bg-muted/20 rounded-md" />
          <div className="h-14 bg-muted/20 rounded-md" />
        </div>
      </div>
    );
  }

  const conditions = data?.conditions || [];

  if (conditions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground/40">
          Environmental patterns will surface here as more context is gathered
          in Parallax.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conditions.map((c, i) => {
        const arch = ARCHETYPE_COLORS[c.amplifies];
        return (
          <div
            key={i}
            className="p-3 rounded-md border border-border/30 bg-background/30 space-y-1"
          >
            <div className="flex items-center gap-1.5">
              {arch && (
                <span
                  className="text-xs font-display"
                  style={{ color: arch.color }}
                >
                  {arch.emoji}
                </span>
              )}
              <p className="text-sm font-medium text-foreground/70">
                {c.condition}
              </p>
            </div>
            <p className="text-xs text-muted-foreground/50 leading-relaxed italic">
              {c.observation}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── Recovery section ────────────────────────────────────────

function RecoveryContent() {
  const { data, isLoading } = useQuery<{ recovery: RecoveryData | null }>({
    queryKey: ["/api/refractions/recovery"],
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-20 bg-muted/20 rounded-md" />
      </div>
    );
  }

  const recovery = data?.recovery;
  if (!recovery) {
    return (
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground/40">
          Stability analysis is still forming — check back as your patterns
          develop in Parallax.
        </p>
      </div>
    );
  }

  const trend = TREND_COPY[recovery.trend] || TREND_COPY.stable;
  const stabilityPct = Math.round(recovery.stability * 100);

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-md border border-border/30 bg-background/30 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground/70">
            {trend.label}
          </p>
          <span className="text-xs font-mono text-muted-foreground/40">
            {stabilityPct}% stability
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${stabilityPct}%`,
              backgroundColor:
                stabilityPct > 70
                  ? "#6b9080"
                  : stabilityPct > 40
                    ? "#b8976a"
                    : "#c17b6e",
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground/50 leading-relaxed italic">
          {trend.description}
        </p>
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-mono text-muted-foreground/30">
          recent volatility: {recovery.recent_volatility}
        </span>
        <span className="text-xs font-mono text-muted-foreground/30">
          historical: {recovery.historical_volatility}
        </span>
      </div>
    </div>
  );
}

// ── Main Refractions page ───────────────────────────────────

export default function Refractions() {
  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-8">
        <h2 className="font-display text-xl font-semibold text-foreground mb-1">
          Refractions
        </h2>
        <p className="text-sm text-muted-foreground">
          How patterns respond when you test the conditions around them.
        </p>
      </div>

      <div className="space-y-3">
        <SubSection
          icon={FlaskConical}
          title="Experiments"
          descriptor="short tests to see what changes a pattern"
          color="#7c8ba0"
        >
          <ExperimentsContent />
        </SubSection>

        <SubSection
          icon={Cloudy}
          title="Conditions"
          descriptor="contexts that amplify, weaken, distort, or soften tendencies"
          color="#6b9080"
        >
          <ConditionsContent />
        </SubSection>

        <SubSection
          icon={Activity}
          title="Recovery"
          descriptor="drift, reset, stabilization, return to workable baseline"
          color="#b8976a"
        >
          <RecoveryContent />
        </SubSection>
      </div>

      <p className="text-xs text-muted-foreground/30 text-center mt-6">
        Refractions data is sourced from your Parallax check-in history.
      </p>
    </div>
  );
}
