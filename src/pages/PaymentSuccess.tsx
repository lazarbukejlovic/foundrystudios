import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, ArrowRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/constants";

interface BookingInfo {
  id: string;
  confirmation_code: string;
  total_cents: number;
  services: { title: string } | null;
  time_slots: { date: string; start_time: string; end_time: string } | null;
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }

    const verify = async () => {
      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: { sessionId },
      });
      if (!error && data?.bookingId) {
        const { data: b } = await supabase
          .from("bookings")
          .select("id, confirmation_code, total_cents, services(title), time_slots(date, start_time, end_time)")
          .eq("id", data.bookingId)
          .single();
        if (b) setBooking(b as unknown as BookingInfo);
      }
      setLoading(false);
    };
    verify();
  }, [sessionId]);

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h1 className="font-display text-2xl md:text-3xl">Booking Confirmed</h1>
        <p className="mt-3 text-muted-foreground">
          Your payment was successful and your session is reserved.
        </p>

        {loading ? (
          <div className="mt-6 h-32 animate-pulse rounded-lg bg-muted" />
        ) : booking ? (
          <div className="mt-6 rounded-lg border bg-card p-5 text-left">
            <h3 className="font-display text-lg">{booking.services?.title ?? "Session"}</h3>
            {booking.time_slots && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {new Date(booking.time_slots.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                {" · "}
                {booking.time_slots.start_time.slice(0, 5)} – {booking.time_slots.end_time.slice(0, 5)}
              </p>
            )}
            <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
              <span className="text-muted-foreground">Amount paid</span>
              <span className="font-semibold">{formatPrice(booking.total_cents)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3 text-sm">
              <span className="text-muted-foreground">Confirmation</span>
              <span className="font-mono font-medium">{booking.confirmation_code}</span>
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {booking && (
            <Button asChild>
              <Link to={`/bookings/${booking.id}`}>
                View Booking
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to="/services">Book Another Session</Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          A confirmation email will be sent to your registered address.
        </p>
      </div>
    </div>
  );
}
