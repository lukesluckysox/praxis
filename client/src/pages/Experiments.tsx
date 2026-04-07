import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Filter, Archive, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, PhaseDot, PhaseProgress, SourceTag } from "@/components/ExperimentComponents";
import type { Experiment } from "@shared/schema";
import { formatDateShort } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Filter = "all" | "active" | "observing" | "completed" | "archived";

export default function Experiments() {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const { toast } = useToast();

  const { data: experiments, isLoading } = useQuery<Experiment[]>({
    queryKey: ["/api/experiments"],
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/experiments/${id}`, { status: "archived" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experiments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
    },
  });

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "observing", label: "Observing" },
    { key: "completed", label: "Completed" },
    { key: "archived", label: "Archived" },
  ];

  const filtered = experiments?.filter(e => {
    if (activeFilter === "all") return e.status !== "archived";
    return e.status === activeFilter;
  }) ?? [];

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-1">
            Experiments
          </h2>
          <p className="text-sm text-muted-foreground">
            Controlled trials designed to test what you think you believe.
          </p>
        </div>
        <Link href="/experiments/new">
          <Button
            data-testid="button-new-experiment-page"
            size="sm"
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={14} />
            New Experiment
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 mb-6 flex-wrap">
        {filters.map(f => (
          <button
            key={f.key}
            data-testid={`filter-${f.key}`}
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              "px-3 py-1 text-xs rounded font-medium transition-colors",
              activeFilter === f.key
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
            )}
          >
            {f.label}
            {f.key !== "all" && experiments && (
              <span className="ml-1.5 text-muted-foreground/60">
                {experiments.filter(e => e.status === f.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full rounded-md" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-border rounded-md py-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {activeFilter === "all"
              ? "No experiments yet. The laboratory awaits."
              : `No ${activeFilter} experiments.`}
          </p>
          {activeFilter === "all" && (
            <Link href="/experiments/new">
              <Button size="sm" variant="outline" className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                <Plus size={13} />
                Begin first experiment
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(exp => (
            <Link key={exp.id} href={`/experiments/${exp.id}`}>
              <div
                data-testid={`row-experiment-${exp.id}`}
                className="bg-card border border-border rounded-md p-5 hover:border-primary/20 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <PhaseDot status={exp.status} />
                  <span className="trial-badge">Trial #{exp.trialNumber}</span>
                  <SourceTag source={exp.source} />
                  <StatusBadge status={exp.status} className="ml-auto" />
                  <span className="text-xs text-muted-foreground/60">{formatDateShort(exp.createdAt)}</span>
                </div>

                <h3 className="font-medium text-foreground text-sm leading-snug mb-2">
                  {exp.title}
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                  <span className="text-muted-foreground/60">Hyp. </span>
                  {exp.hypothesis}
                </p>

                <PhaseProgress experiment={exp} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
