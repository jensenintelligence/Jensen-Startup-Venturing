import { Link } from "react-router-dom";

const LOGO_URL = "https://media.base44.com/images/public/6a86e9679c431bf24ffdb1e9/040a137dc_LogoVettoriale.png";

export default function Logo({ size = "md", withText = true, to = "/" }) {
  const imgH = size === "sm" ? "h-7" : size === "lg" ? "h-11" : "h-8";
  return (
    <Link to={to} className="flex items-center gap-3 group">
      <img src={LOGO_URL} alt="Jensen Intelligence" className={`${imgH} w-auto`} />
      {withText && (
        <span className="leading-tight border-l border-border pl-3">
          <span className="block font-heading font-semibold text-foreground text-[1.05rem] tracking-tight">Intelligence</span>
          <span className="block text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">Research · Markets</span>
        </span>
      )}
    </Link>
  );
}