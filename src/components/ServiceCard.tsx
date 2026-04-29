import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import { SERVICE_IMAGES, formatPrice, formatDuration, CATEGORY_ICONS } from "@/lib/constants";
import { Clock, Users } from "lucide-react";

interface Props {
  service: Tables<"services">;
}

export default function ServiceCard({ service }: Props) {
  const img = SERVICE_IMAGES[service.id];

  return (
    <Link
      to={`/services/${service.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="aspect-[4/3] overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={service.title}
            loading="lazy"
            width={800}
            height={600}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-4xl">
            {CATEGORY_ICONS[service.category] ?? "✨"}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-xs font-medium uppercase tracking-wider text-accent">
          {service.category}
        </span>
        <h3 className="font-display text-lg leading-snug">{service.title}</h3>
        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
          {service.description}
        </p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-semibold">{formatPrice(service.price_cents)}</span>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(service.duration_minutes)}
            </span>
            {service.max_capacity > 1 && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {service.max_capacity}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
