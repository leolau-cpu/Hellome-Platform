export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'warning' | 'notice';
export type ButtonSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';
export type ButtonSurface = 'white' | 'soft';
export type ButtonShape = 'default' | 'pill';
export type TextLinkTone = 'black' | 'red' | 'yellow' | 'green' | 'blue';
export type ButtonLinkTone = TextLinkTone;

const sizeClassNames: Record<ButtonSize, string> = {
  xl: 'min-h-10 px-5 py-2.5 text-sm',
  lg: 'min-h-9 px-[18px] py-2 text-sm',
  md: 'min-h-8 px-4 py-1.5 text-sm',
  sm: 'min-h-7 px-3.5 py-1.5 text-xs',
  xs: 'min-h-6 px-3 py-1 text-xs',
};

const iconOnlySizeClassNames: Record<ButtonSize, string> = {
  xl: 'h-10 w-10 text-sm',
  lg: 'h-9 w-9 text-sm',
  md: 'h-8 w-8 text-sm',
  sm: 'h-7 w-7 text-xs',
  xs: 'h-6 w-6 text-xs',
};

const shapeClassNames: Record<ButtonShape, string> = {
  default: 'rounded-button',
  pill: 'rounded-pill',
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

const textLinkToneClassNames: Record<TextLinkTone, string> = {
  black: 'text-text-primary hover:text-text-secondary active:text-text-primary',
  red: 'text-accent-error hover:text-accent-redHover active:text-accent-linkRedActive',
  yellow: 'text-accent-linkYellow hover:text-accent-linkYellowHover active:text-accent-linkYellowActive',
  green: 'text-accent-success hover:text-accent-greenHover active:text-accent-linkGreenActive',
  blue: 'text-accent-link hover:text-accent-blueHover active:text-accent-linkBlueActive',
};

const textLinkSizeClassNames: Record<ButtonSize, string> = {
  xl: 'text-sm leading-5',
  lg: 'text-sm leading-5',
  md: 'text-sm leading-5',
  sm: 'text-xs leading-4',
  xs: 'text-xs leading-4',
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
  shape = 'default',
  selected = false,
  fullWidth = false,
  iconOnly = false,
  hasInlineIcon = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  surface?: ButtonSurface;
  shape?: ButtonShape;
  selected?: boolean;
  fullWidth?: boolean;
  iconOnly?: boolean;
  hasInlineIcon?: boolean;
  className?: string;
}) {
  return mergeClassNames(
    'inline-flex box-border shrink-0 items-center justify-center font-normal transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-selected disabled:pointer-events-none',
    shapeClassNames[shape],
    iconOnly ? iconOnlySizeClassNames[size] : sizeClassNames[size],
    hasInlineIcon ? 'gap-1.5' : undefined,
    variantClassName(variant, surface, selected),
    fullWidth ? 'w-full' : undefined,
    className,
  );
}

export function textLinkClassName({
  size = 'lg',
  tone = 'black',
  fullWidth = false,
  className,
}: {
  size?: ButtonSize;
  tone?: TextLinkTone;
  fullWidth?: boolean;
  className?: string;
}) {
  return mergeClassNames(
    'inline-flex box-border items-center bg-transparent p-0 font-normal shadow-none transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-selected disabled:pointer-events-none disabled:text-text-disabled',
    textLinkSizeClassNames[size],
    textLinkToneClassNames[tone],
    fullWidth ? 'w-full' : undefined,
    className,
  );
}

export const buttonLinkClassName = textLinkClassName;
