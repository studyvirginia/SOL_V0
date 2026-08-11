// SOL Prep brand lockup: a Cool Pop mark (navy rounded square + checkmark = "pass
// the SOL") next to the Bricolage wordmark. Used in the header and footer.
export default function Logo({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        role="img"
        aria-label="SOL Prep"
        className="shrink-0"
      >
        <rect
          x="1.5"
          y="1.5"
          width="29"
          height="29"
          rx="8"
          fill="hsl(var(--primary))"
          stroke="hsl(var(--foreground))"
          strokeWidth="2"
        />
        <path
          d="M9 16.5 L13.8 21.3 L23 10.5"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-display text-xl font-bold tracking-tight leading-none">
        SOLPrep<span className="font-semibold text-muted-foreground">.com</span>
      </span>
    </span>
  );
}
