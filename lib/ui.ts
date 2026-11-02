// ระบบดีไซน์: คลาสที่ใช้ร่วมกันทุกหน้า (ดูตัวอย่างทั้งหมดที่ /design)

type BtnVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type BtnSize = "md" | "lg" | "sm";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand " +
  "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50";

const btnVariant: Record<BtnVariant, string> = {
  primary: "bg-accent text-white shadow-sm hover:bg-accent-strong", // ปุ่มหลัก 1 ปุ่มต่อหน้าจอ
  secondary: "bg-brand text-white hover:bg-brand-strong",
  outline: "border-2 border-brand bg-white text-brand hover:bg-brand-soft",
  ghost: "text-brand hover:bg-brand-soft",
  danger: "border border-bad/40 bg-white text-bad hover:bg-bad-soft",
};

const btnSize: Record<BtnSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-[15px]", // 44px = ขนาดแตะขั้นต่ำบนมือถือ
  lg: "h-12 px-6 text-base",
};

export function btn(variant: BtnVariant = "primary", size: BtnSize = "md", extra = "") {
  return `${btnBase} ${btnVariant[variant]} ${btnSize[size]} ${extra}`.trim();
}

export const inputCls =
  "h-11 w-full rounded-md border border-line bg-white px-3 text-[15px] text-ink placeholder:text-muted " +
  "focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 " +
  "disabled:bg-surface disabled:text-muted " +
  "aria-[invalid=true]:border-bad aria-[invalid=true]:ring-bad/20";

export const labelCls = "text-sm font-medium text-ink-soft";
export const hintCls = "text-xs text-muted";
export const errorCls = "text-sm font-medium text-bad";
export const cardCls = "rounded-lg border border-line bg-white";
