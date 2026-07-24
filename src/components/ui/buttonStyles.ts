type ButtonVariant = 'primary' | 'secondary' | 'text' | 'warning' | 'notice';
type ButtonSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';

const sizeClassNames: Record<ButtonSize, string> = {
  xl: 'min-h-10 px-5 py-2.5 text-sm',
  lg: 'min-h-9 px-[18px] py-2 text-sm',
  md: 'min-h-8 px-4 py-1.5 text-sm',
  sm: 'min-h-7 px-3.5 py-1.5 text-xs',
  xs: 'min-h-6 px-3 py-1 text-xs',
};

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    'bg-button-primary text-text-inverse hover:bg-button-primary-hover active:bg-button-primary-active disabled:bg-transparent disabled:text-text-disabled disabled:shadow-border-strong',
  secondary:
    'bg-transparent text-text-primary shadow-border-strong hover:bg-bg-soft active:bg-bg-medium disabled:bg-transparent disabled:text-text-disabled disabled:shadow-border-strong',
  text:
    'bg-transparent text-text-primary hover:bg-bg-medium active:bg-bg-strong disabled:bg-transparent disabled:text-text-disabled',
  warning:
    'bg-button-warning text-text-inverse hover:bg-button-warning-hover active:bg-button-warning-active disabled:bg-transparent disabled:text-text-disabled disabled:shadow-border-strong',
  notice:
    'bg-button-notice text-text-inverse hover:bg-button-notice-hover active:bg-button-notice-active disabled:bg-transparent disabled:text-text-disabled disabled:shadow-border-strong',
};

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

export function buttonClassName({
  variant = 'primary',
  size = 'lg',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return mergeClassNames(
    'inline-flex box-border items-center justify-center rounded-button font-normal transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-selected disabled:pointer-events-none',
    sizeClassNames[size],
    variantClassNames[variant],
    className,
  );
}
