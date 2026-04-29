import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

export default function EmptyState({ icon, title, description, actionLabel, actionTo }: Props) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="text-4xl">{icon}</div>
      <h3 className="font-display text-xl">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && actionTo && (
        <Button onClick={() => navigate(actionTo)} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
