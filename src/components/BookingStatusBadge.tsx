import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-warning/15 text-warning border-warning/30" },
  confirmed: { label: "Confirmed", className: "bg-success/15 text-success border-success/30" },
  cancelled: { label: "Cancelled", className: "bg-destructive/15 text-destructive border-destructive/30" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground border-border" },
};

const PAYMENT_CONFIG: Record<string, { label: string; className: string }> = {
  unpaid: { label: "Unpaid", className: "bg-warning/15 text-warning border-warning/30" },
  paid: { label: "Paid", className: "bg-success/15 text-success border-success/30" },
  refunded: { label: "Refunded", className: "bg-muted text-muted-foreground border-border" },
};

export function BookingStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "" };
  return (
    <Badge variant="outline" className={cn("text-xs", config.className)}>
      {config.label}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const config = PAYMENT_CONFIG[status] ?? { label: status, className: "" };
  return (
    <Badge variant="outline" className={cn("text-xs", config.className)}>
      {config.label}
    </Badge>
  );
}
