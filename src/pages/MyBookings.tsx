import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link, Navigate } from "react-router-dom";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/BookingStatusBadge";
import { formatPrice } from "@/lib/constants";
import EmptyState from "@/components/EmptyState";
import { format } from "date-fns";
import { useMemo } from "react";

export default function MyBookings() {
  const { user, loading: authLoading } = useAuth();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, services(*), time_slots(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const grouped = useMemo(() => {
    if (!bookings) return { upcoming: [], past: [], cancelled: [] };
    const now = new Date();
    const upcoming: typeof bookings = [];
    const past: typeof bookings = [];
    const cancelled: typeof bookings = [];

    for (const b of bookings) {
      if (b.status === "cancelled") {
        cancelled.push(b);
      } else if (b.time_slots) {
        const slotDate = new Date(b.time_slots.date + "T" + b.time_slots.end_time);
        if (slotDate > now) upcoming.push(b);
        else past.push(b);
      } else {
        // No slot — treat confirmed/pending as upcoming, completed as past
        if (b.status === "completed") past.push(b);
        else upcoming.push(b);
      }
    }
    return { upcoming, past, cancelled };
  }, [bookings]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth?redirect=/bookings" replace />;

  const renderBooking = (b: NonNullable<typeof bookings>[number]) => (
    <Link
      key={b.id}
      to={`/bookings/${b.id}`}
      className="flex flex-col gap-3 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-base truncate sm:text-lg">
          {(b.services as { title: string } | null)?.title ?? "Session"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {b.time_slots
            ? `${format(new Date(b.time_slots.date), "EEE, MMM d")} · ${b.time_slots.start_time.slice(0, 5)} – ${b.time_slots.end_time.slice(0, 5)}`
            : format(new Date(b.created_at), "MMM d, yyyy")}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground font-mono">
          {b.confirmation_code}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <BookingStatusBadge status={b.status} />
        <PaymentStatusBadge status={b.payment_status} />
        <span className="text-sm font-semibold whitespace-nowrap">{formatPrice(b.total_cents)}</span>
      </div>
    </Link>
  );

  const renderSection = (title: string, items: typeof bookings, emptyMsg: string) => {
    if (!items || items.length === 0) {
      return (
        <div className="py-4 text-center text-sm text-muted-foreground">{emptyMsg}</div>
      );
    }
    return (
      <div className="space-y-3">
        {items.map(renderBooking)}
      </div>
    );
  };

  return (
    <div className="container py-10 md:py-12">
      <h1 className="mb-8 font-display text-2xl md:text-3xl">My Bookings</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No bookings yet"
          description="Browse our studios and sessions to book your first creative experience."
          actionLabel="Browse Studios"
          actionTo="/services"
        />
      ) : (
        <div className="space-y-8">
          {grouped.upcoming.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Upcoming
              </h2>
              {renderSection("Upcoming", grouped.upcoming, "")}
            </section>
          )}
          {grouped.past.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Past
              </h2>
              {renderSection("Past", grouped.past, "")}
            </section>
          )}
          {grouped.cancelled.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Cancelled
              </h2>
              {renderSection("Cancelled", grouped.cancelled, "")}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
