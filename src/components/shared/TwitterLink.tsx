import { cn } from "@/lib/utils";

export const TWITTER_URL = "https://x.com/MundialAnalisis";
export const TWITTER_HANDLE = "@MundialAnalisis";

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface TwitterLinkProps {
  variant?: "header" | "footer";
  className?: string;
}

export function TwitterLink({ variant = "header", className }: TwitterLinkProps) {
  const label = `Síguenos en X (${TWITTER_HANDLE})`;

  if (variant === "footer") {
    return (
      <a
        href={TWITTER_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex items-center gap-1 text-muted-foreground hover:text-mundial-gold transition-colors",
          className
        )}
      >
        <XLogo className="h-3.5 w-3.5" />
        {TWITTER_HANDLE}
      </a>
    );
  }

  return (
    <a
      href={TWITTER_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mundial-gold",
        className
      )}
    >
      <XLogo className="h-4 w-4" />
    </a>
  );
}
