import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/BookingStatusBadge";
import { formatPrice, formatDuration, SERVICE_IMAGES, CATEGORY_ICONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, CalendarDays, Hash } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(false);

  const { data: booking, refetch } = useQuery({
    queryKey: ["booking", id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, services(*), time_slots(*)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const handleCancel = async () => {
    if (!booking) return;
    const confirmed = window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.");
    if (!confirmed) return;

    setCancelling(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", booking.id);
      if (error) throw error;
      toast.success("Booking cancelled successfully.");
      refetch();
    } catch {
      toast.error("Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  if (!booking) {
    return (
      <div className="container py-20">
        <div className="mx-auto h-64 max-w-2xl animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  const service = booking.services as { id: string; title: string; category: string; duration_minutes: number; description: string | null } | null;
  const slot = booking.time_slots as { date: string; start_time: string; end_time: string } | null;
  const img = service ? SERVICE_IMAGES[service.id] : undefined;
  const canCancel = booking.status === "pending" || booking.status === "confirmed";

  return (
    <div className="container max-w-3xl py-6 md:py-8">
      <button
        onClick={() => navigate("/bookings")}
        className="mb-5 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground md:mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> My Bookings
      </button>

      <div className="overflow-hidden rounded-lg border bg-card">
        {img && (
          <div className="aspect-[3/1] overflow-hidden">
            <img src={img} alt={service?.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="p-5 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-accent">
                {service?.category}
              </span>
              <h1 className="mt-1 font-display text-xl md:text-2xl lg:text-3xl">
                {service?.title ?? "Booking"}
              </h1>
            </div>
            <div className="flex gap-2">
              <BookingStatusBadge status={booking.status} />
              <PaymentStatusBadge status={booking.payment_status} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 md:mt-6">
            <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3.5">
              <CalendarDays className="h-5 w-5 text-accent flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Date & Time</p>
                <p className="text-sm font-medium truncate">
                  {slot
                    ? `${format(new Date(slot.date), "EEE, MMM d, yyyy")} · ${slot.start_time.slice(0, 5)} – ${slot.end_time.slice(0, 5)}`
                    : format(new Date(booking.created_at), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3.5">
              <Clock className="h-5 w-5 text-accent flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-medium">
                  {service ? formatDuration(service.duration_minutes) : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3.5">
              <Hash className="h-5 w-5 text-accent flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Confirmation</p>
                <p className="font-mono text-sm font-medium">{booking.confirmation_code}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3.5">
              <span className="text-lg flex-shrink-0">
                {service ? CATEGORY_ICONS[service.category] ?? "💰" : "💰"}
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className="text-sm font-semibold">{formatPrice(booking.total_cents)}</p>
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="mt-5">
              <p className="text-xs font-medium text-muted-foreground">Notes</p>
              <p className="mt-1 text-sm">{booking.notes}</p>
            </div>
          )}

          {booking.status === "cancelled" && (
            <div className="mt-5 rounded-md border border-destructive/20 bg-destructive/5 p-3.5 text-sm text-muted-foreground">
              This booking has been cancelled.
              {booking.payment_status === "paid" && " A refund may take 5–10 business days to process."}
            </div>
          )}

          {canCancel && (
            <div className="mt-6 border-t pt-5 md:mt-8 md:pt-6">
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling…" : "Cancel Booking"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
