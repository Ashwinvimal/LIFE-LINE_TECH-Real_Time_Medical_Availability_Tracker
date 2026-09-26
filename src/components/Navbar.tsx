import { Link } from "@tanstack/react-router";
import { Activity, Menu, Siren } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Search medicine" },
  { to: "/pharmacies", label: "Nearby pharmacies" },
  { to: "/admin", label: "Admin" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 focus-ring rounded-md">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="size-5" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-extrabold tracking-tight">
              LIFE-LINE-TECH
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Real-time medical availability
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="focus-ring rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-primary-soft data-[status=active]:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="destructive" size="sm" className="gap-1.5">
            <Link to="/emergency">
              <Siren className="size-4" aria-hidden />
              <span className="hidden sm:inline">Emergency</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <div className={cn("border-t border-border md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground data-[status=active]:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-sm font-bold">LIFE-LINE-TECH</p>
          <p className="mt-2 text-sm text-muted-foreground">
            A medicine discovery tool that shows pharmacy stock reported through the
            pharmacy admin console.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Product</p>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li>
              <Link to="/search" className="hover:text-foreground">
                Medicine search
              </Link>
            </li>
            <li>
              <Link to="/pharmacies" className="hover:text-foreground">
                Nearby pharmacies
              </Link>
            </li>
            <li>
              <Link to="/admin/inventory" className="hover:text-foreground">
                Inventory management
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Important</p>
          <p className="mt-2">
            This is an information and discovery tool. It is not a medical service. For a
            life-threatening emergency, contact your local emergency number or nearest
            hospital immediately.
          </p>
        </div>
      </div>
    </footer>
  );
}
