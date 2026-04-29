import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCanceled() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="font-display text-3xl">Payment Cancelled</h1>
        <p className="mt-3 text-muted-foreground">
          Your payment was not completed. No charges were made. You can try again or browse other sessions.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/services">Browse Studios</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/bookings">My Bookings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
