import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t bg-card py-12">
      <div className="container">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <div className="flex items-center justify-center gap-2.5 md:justify-start">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground">
                <span className="text-xs font-bold text-background">F</span>
              </div>
              <span className="font-display text-lg tracking-tight">Foundry Studios</span>
            </div>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Creative studios and workshops for photographers, makers, musicians, and designers.
            </p>
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/services" className="transition-colors hover:text-foreground">Studios</Link>
            <Link to="/auth" className="transition-colors hover:text-foreground">Sign In</Link>
          </nav>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Foundry Studios. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
