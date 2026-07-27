export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'warning' | 'notice';
export type ButtonSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';
export type ButtonSurface = 'white' | 'soft';
export type ButtonLinkTone = 'black' | 'red' | 'yellow' | 'green';

const sizeClassNames: Record<ButtonSize, string> = {
  xl: 'min-h-10 px-5 py-2.5 text-sm',
  lg: 'min-h-9 px-[18px] py-2 text-sm',
  md: 'min-h-8 px-4 py-1.5 text-sm',
  sm: 'min-h-7 px-3.5 py-1.5 text-xs',
  xs: 'min-h-6 px-3 py-1 text-xs',
};

const filledVariantClassNames: Record<Extract<ButtonVariant, 'primary' | 'warning' | 'notice'>, string> = {
  primary:
    'bg-button-primary text-text-inverse hover:bg-button-primary-hover active:bg-button-primary-active disabled:bg-transparent disabled:text-text-disabled disabled:shadow-border-strong',
  warning:
    'bg-button-warning text-text-inverse hover:bg-button-warning-hover active:bg-button-warning-active disabled:bg-transparent disabled:text-text-disabled disabled:shadow-border-strong',
  notice:
    'bg-button-notice text-text-inverse hover:bg-button-notice-hover active:bg-button-notice-active disabled:bg-transparent disabled:text-text-disabled disabled:shadow-border-strong',
};

const surfaceVariantClassNames: Record<
  Extract<ButtonVariant, 'secondary' | 'text'>,
  Record<ButtonSurface, { default: string; selected: string }>
> = {
  secondary: {
    white: {
      default:
        'bg-transparent text-text-primary shadow-border-strong hover:bg-bg-soft active:bg-bg-medium disabled:bg-transparent disabled:text-text-disabled disabled:shadow-border-strong',
      selected:
        'bg-bg-medium text-text-primary shadow-border-strong hover:bg-bg-medium active:bg-bg-medium disabled:bg-transparent disabled:text-text-disabled disabled:shadow-border-strong',
    },
    soft: {
      default:
        'bg-transparent text-text-primary shadow-border-strong hover:bg-bg-medium active:bg-bg-strong disabled:bg-transparent disabled:text-text-disabled disabled:shadow-border-strong',
      selected:
        'bg-bg-strong text-text-primary shadow-border-strong hover:bg-bg-strong active:bg-bg-strong disabled:bg-transparent disabled:text-text-disabled disabled:shadow-border-strong',
    },
  },
  text: {
    white: {
      default:
        'bg-transparent text-text-primary shadow-none hover:bg-bg-soft active:bg-bg-medium disabled:bg-transparent disabled:text-text-disabled',
      selected:
        'bg-bg-medium text-text-primary shadow-none hover:bg-bg-medium active:bg-bg-medium disabled:bg-transparent disabled:text-text-disabled',
    },
    soft: {
      default:
        'bg-transparent text-text-primary shadow-none hover:bg-bg-medium active:bg-bg-strong disabled:bg-transparent disabled:text-text-disabled',
      selected:
        'bg-bg-strong text-text-primary shadow-none hover:bg-bg-strong active:bg-bg-strong disabled:bg-transparent disabled:text-text-disabled',
    },
  },
};

const linkToneClassNames: Record<ButtonLinkTone, string> = {
  black: 'text-text-primary hover:text-text-secondary active:text-text-primary',
  red: 'text-accent-error hover:text-accent-error active:text-accent-error',
  yellow: 'text-button-notice hover:text-button-notice-hover active:text-button-notice-active',
  green: 'text-accent-success hover:text-accent-success active:text-accent-success',
};

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function variantClassName(
  variant: ButtonVariant,
  surface: ButtonSurface,
  selected: boolean,
) {
  if (variant === 'secondary' || variant === 'text') {
    return surfaceVariantClassNames[variant][surface][selected ? 'selected' : 'default'];
  }

  return filledVariantClassNames[variant];
}

export function buttonClassName({
  variant = 'primary',
  size = 'lg',
  surface = 'white',
  selected = false,
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  surface?: ButtonSurface;
  selected?: boolean;
  fullWidth?: boolean;
  className?: string;
}) {
  return mergeClassNames(
    'inline-flex box-border items-center justify-center rounded-button font-normal transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-selected disabled:pointer-events-none',
    sizeClassNames[size],
    variantClassName(variant, surface, selected),
    fullWidth ? 'w-full' : undefined,
    className,
  );
}

export function buttonLinkClassName({
  size = 'lg',
  tone = 'black',
  fullWidth = false,
  className,
}: {
  size?: ButtonSize;
  tone?: ButtonLinkTone;
  fullWidth?: boolean;
  className?: string;
}) {
  return mergeClassNames(
    'inline-flex box-border items-center justify-center rounded-button bg-transparent font-normal shadow-none transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-selected disabled:pointer-events-none disabled:text-text-disabled',
    sizeClassNames[size],
    linkToneClassNames[tone],
    fullWidth ? 'w-full' : undefined,
    className,
  );
}
