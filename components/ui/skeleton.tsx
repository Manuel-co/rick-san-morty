import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-zinc-800", className)} />
  );
}

export function CharacterCardSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-800 overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-2 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-zinc-800">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-2 px-3">
          <Skeleton className="h-3.5 w-full" />
        </td>
      ))}
    </tr>
  );
}
