import { CircleAlert, Clock3, FileText, LoaderCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DocumentStatus } from "@/types";

function getStatusConfig(status: DocumentStatus) {
  switch (status) {
    case "PENDING":
      return {
        label: "Pending",
        className: "bg-secondary text-secondary-foreground",
        icon: Clock3,
      };
    case "PROCESSING":
      return {
        label: "Processing",
        className: "bg-primary/10 text-primary",
        icon: LoaderCircle,
      };
    case "READY":
      return {
        label: "Ready",
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        icon: FileText,
      };
    case "FAILED":
      return {
        label: "Failed",
        className: "bg-destructive/10 text-destructive",
        icon: CircleAlert,
      };
  }
}

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

export function DocumentStatusBadge({
  status,
  className,
}: DocumentStatusBadgeProps) {
  const { label, className: colorClassName, icon: Icon } =
    getStatusConfig(status);

  return (
    <Badge className={cn("rounded-full", colorClassName, className)}>
      {status === "PROCESSING" ? (
        <Icon className="mr-1 size-3 animate-spin" />
      ) : (
        <span
          className={cn(
            "mr-1 size-1.5 rounded-full",
            status === "READY" && "bg-emerald-500",
            status === "PENDING" && "bg-muted-foreground",
            status === "FAILED" && "bg-destructive",
          )}
        />
      )}
      {label}
    </Badge>
  );
}
