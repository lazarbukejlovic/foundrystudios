import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SERVICE_IMAGES, formatPrice, formatDuration, CATEGORY_ICONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Clock, Users, ArrowLeft, ShieldCheck, Zap, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const { data: service } = useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: slots } = useQuery({
    queryKey: ["slots", id, selectedDate?.toISOString()],
    enabled: !!selectedDate,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_slots")
        .select("*")
        .eq("service_id", id!)
        .eq("date", format(selectedDate!, "yyyy-MM-dd"))
        .eq("is_available", true)
        .gt("spots_available", 0)
        .order("start_time");
      if (error) throw error;
      return data;
    },
  });

  const handleBook = async () => {
    if (!user) {
      navigate("/auth?redirect=/services/" + id);
      return;
    }
    if (!service || !selectedSlot) return;

    setBookingLoading(true);
    try {
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          service_id: service.id,
          time_slot_id: selectedSlot,
          total_cents: 0, // Server trigger sets real price from services table
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { bookingId: booking.id },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create booking";
      toast.error(message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (!service) {
    return (
      <div className="container py-20">
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  const img = SERVICE_IMAGES[service.id];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="container py-6 md:py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground md:mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
        {/* Image + info */}
        <div className="lg:col-span-3">
          <div className="aspect-[16/10] overflow-hidden rounded-lg">
            {img ? (
              <img src={img} alt={service.title} className="h-full w-full object-cover" width={800} height={600} />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted text-6xl">
                {CATEGORY_ICONS[service.category] ?? "✨"}
              </div>
            )}
          </div>
          <div className="mt-5 md:mt-6">
            <span className="text-xs font-medium uppercase tracking-wider text-accent">
              {service.category}
            </span>
            <h1 className="mt-1 font-display text-2xl md:text-3xl lg:text-4xl">{service.title}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {formatDuration(service.duration_minutes)}
              </span>
              {service.max_capacity > 1 && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> Up to {service.max_capacity} participants
                </span>
              )}
            </div>
            <p className="mt-5 leading-relaxed text-muted-foreground">{service.description}</p>

            {/* What to expect */}
            <div className="mt-6 rounded-lg border bg-card/50 p-4 md:p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Info className="h-4 w-4 text-accent" />
                What to expect
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Professional-grade equipment and materials provided</li>
                <li>• Guided instruction tailored to your skill level</li>
                <li>• Small group size for personalized attention</li>
                <li>• Refreshments included with every session</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Booking sidebar */}
        <div className="lg:col-span-2">
          <div className="sticky top-20 rounded-lg border bg-card p-5 md:p-6">
            <p className="font-display text-2xl">{formatPrice(service.price_cents)}</p>
            <p className="text-sm text-muted-foreground">per session</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Select a date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => {
                        setSelectedDate(d);
                        setSelectedSlot(null);
                      }}
                      disabled={(date) => date < tomorrow || date.getDay() === 0}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {selectedDate && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Available times</label>
                  {!slots || slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No slots available for this date.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot.id)}
                          className={cn(
                            "rounded-md border px-3 py-2.5 text-sm transition-colors",
                            selectedSlot === slot.id
                              ? "border-accent bg-accent/10 text-accent font-medium"
                              : "hover:border-accent/50"
                          )}
                        >
                          {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                          {slot.spots_available > 1 && (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {slot.spots_available} spots left
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                disabled={!selectedSlot || bookingLoading}
                onClick={handleBook}
              >
                {bookingLoading ? "Processing…" : user ? "Book & Pay" : "Sign in to Book"}
              </Button>

              {/* Trust signals */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" />
                  Secure checkout via Stripe
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-accent" />
                  Instant confirmation after payment
                </div>
                <p className="text-xs text-muted-foreground">
                  Free cancellation up to 24 hours before your session.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
