import { Link } from "react-router-dom";

export default function SectionHeading({ eyebrow, title, description, to, toLabel }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        {eyebrow && <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-2">{eyebrow}</p>}
        <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>}
      </div>
      {to && toLabel && (
        <Link to={to} className="shrink-0 text-sm font-medium text-accent hover:underline underline-offset-4">{toLabel} →</Link>
      )}
    </div>
  );
}