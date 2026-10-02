import { LoaderCircle } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'outline' | 'ghost' | 'gold' | 'goldDark' | 'link';
type Size = 'sm' | 'md' | 'touch' | 'icon';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-ink',
  outline: 'border border-line bg-white text-ink hover:bg-tint',
  ghost: 'text-ink hover:bg-tint',
  // White on gold exactly as the reference shows it on the upgrade buttons (desktop shell only).
  gold: 'bg-gold text-white font-semibold hover:bg-gold-strong',
  // Dark text on gold everywhere else: passes WCAG AA.
  goldDark: 'bg-gold text-ink font-semibold hover:bg-gold-strong',
  link: 'text-ink underline-offset-4 hover:underline',
};

const SIZE: Record<Size, string> = {
  sm: 'h-[30px] px-2.5 text-[13px]',
  md: 'h-[36px] px-3.5 text-[14px]',
  touch: 'min-h-[52px] px-5 text-[16px]',
  icon: 'h-[36px] w-[36px]',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap transition-colors disabled:opacity-50',
    VARIANT[variant],
    SIZE[size],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, loading, className, children, disabled, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
