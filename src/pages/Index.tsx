import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ServiceCard from "@/components/ServiceCard";
import heroImg from "@/assets/hero-studio.jpg";
import { ArrowRight } from "lucide-react";

export default function Index() {
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("category");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[60vh] items-center overflow-hidden md:min-h-[70vh]">
        <img
          src={heroImg}
          alt="Foundry Studios creative workspace"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-foreground/10" />
        <div className="container relative z-10 py-16 md:py-20">
          <div className="max-w-lg">
            <h1 className="font-display text-3xl leading-tight text-primary-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              Book your next creative session
            </h1>
            <p className="mt-4 text-base text-primary-foreground/80 sm:text-lg">
              Studios, workshops, and hands-on sessions for photographers, makers, musicians, and designers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 md:mt-8">
              <Button size="lg" asChild>
                <Link to="/services">
                  Browse Studios
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/auth">
                  Try Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured services */}
      <section className="container py-16 md:py-20">
        <div className="mb-8 flex items-end justify-between md:mb-10">
          <div>
            <h2 className="font-display text-2xl md:text-3xl">Studios & Sessions</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Curated creative spaces for every discipline
            </p>
          </div>
          <Link
            to="/services"
            className="hidden text-sm font-medium text-accent hover:underline md:block"
          >
            View all →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services?.slice(0, 6).map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-card py-16 md:py-20">
        <div className="container text-center">
          <h2 className="font-display text-2xl md:text-3xl">Ready to create?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Reserve a studio, join a workshop, or book a private session — all in a few clicks.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/auth?tab=signup">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">Try as Guest</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
