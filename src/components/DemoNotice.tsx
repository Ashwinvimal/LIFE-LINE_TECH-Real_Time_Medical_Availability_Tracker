import { Info } from "lucide-react";
import { DEMO_DATA_NOTICE } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function DemoNotice({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      {DEMO_DATA_NOTICE}
    </p>
  );
}
