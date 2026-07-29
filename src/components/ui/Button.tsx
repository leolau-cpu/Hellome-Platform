import { forwardRef } from 'react';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { buttonClassName, textLinkClassName } from './buttonStyles';
import type {
  ButtonShape,
  ButtonSize,
  ButtonSurface,
  ButtonVariant,
  TextLinkTone,
} from './buttonStyles';
import { Icon } from './Icon';
import type { IconName, IconSize } from './Icon';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  surface?: ButtonSurface;
  shape?: ButtonShape;
  icon?: IconName;
  iconPosition?: 'start' | 'end';
  iconSize?: IconSize;
  selected?: boolean;
  fullWidth?: boolean;
  isLoading?: boolean;
  children: ReactNode;
};

const inlineIconSizeByButtonSize: Record<ButtonSize, IconSize> = {
  xl: 'md',
  lg: 'md',
  md: 'md',
  sm: 'sm',
  xs: 'sm',
};

export function Button({
  variant = 'primary',
  size = 'lg',
  surface = 'white',
  shape = 'default',
  icon,
  iconPosition = 'start',
  iconSize,
  selected = false,
  fullWidth = false,
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const resolvedIconSize = iconSize ?? inlineIconSizeByButtonSize[size];
  const hasInlineIcon = isLoading || Boolean(icon);

  return (
    <button
      aria-pressed={selected || undefined}
      className={buttonClassName({
        variant,
        size,
        surface,
        shape,
        selected,
        fullWidth,
        hasInlineIcon,
        className,
      })}
      disabled={disabled || isLoading}
      type="button"
      {...props}
    >
      {isLoading ? (
        <>
          <Icon name="LoaderCircle" size={resolvedIconSize} className="animate-spin" />
          处理中
        </>
      ) : (
        <>
          {icon && iconPosition === 'start' && (
            <Icon name={icon} size={resolvedIconSize} className="shrink-0" />
          )}
          {children}
          {icon && iconPosition === 'end' && (
            <Icon name={icon} size={resolvedIconSize} className="shrink-0" />
          )}
        </>
      )}
    </button>
  );
}

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  name: IconName;
  iconSize?: IconSize;
  iconStrokeWidth?: number;
  variant?: ButtonVariant;
  size?: ButtonSize;
  surface?: ButtonSurface;
  shape?: ButtonShape;
  selected?: boolean;
  'aria-label': string;
};

const iconSizeByButtonSize: Record<ButtonSize, IconSize> = {
  xl: 'md',
  lg: 'md',
  md: 'md',
  sm: 'md',
  xs: 'md',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      name,
      iconSize,
      iconStrokeWidth,
      variant = 'text',
      size = 'md',
      surface = 'white',
      shape = 'default',
      selected = false,
      className,
      disabled,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) {
  return (
    <button
      ref={ref}
      aria-label={ariaLabel}
      aria-pressed={selected || undefined}
      className={buttonClassName({
        variant,
        size,
        surface,
        shape,
        selected,
        iconOnly: true,
        className,
      })}
      disabled={disabled}
      type="button"
      {...props}
    >
      <Icon
        name={name}
        size={iconSize ?? iconSizeByButtonSize[size]}
        strokeWidth={iconStrokeWidth}
      />
    </button>
  );
});

type ModalCloseButtonProps = Omit<
  IconButtonProps,
  'name' | 'iconSize' | 'iconStrokeWidth' | 'variant' | 'size'
>;

export function ModalCloseButton({
  'aria-label': ariaLabel = '关闭弹窗',
  ...props
}: ModalCloseButtonProps) {
  return (
    <IconButton
      {...props}
      name="X"
      size="md"
      variant="text"
      iconSize="md"
      iconStrokeWidth={1.875}
      aria-label={ariaLabel}
    />
  );
}

type ToolbarIconButtonProps = Omit<
  IconButtonProps,
  'iconSize' | 'iconStrokeWidth' | 'variant' | 'shape'
> & {
  tone?: 'secondary' | 'hint';
};

const toolbarIconButtonToneClassNames: Record<NonNullable<ToolbarIconButtonProps['tone']>, string> = {
  secondary: '!text-text-secondary hover:!text-text-primary active:!text-text-primary',
  hint: '!text-text-hint hover:!text-text-primary active:!text-text-primary',
};

export const ToolbarIconButton = forwardRef<HTMLButtonElement, ToolbarIconButtonProps>(
  function ToolbarIconButton(
    {
      selected = false,
      tone = 'secondary',
      size = 'md',
      className,
      ...props
    },
    ref,
  ) {
  return (
    <IconButton
      ref={ref}
      {...props}
      selected={selected}
      size={size}
      variant="text"
      iconSize="md"
      className={[
        selected ? undefined : toolbarIconButtonToneClassNames[tone],
        className,
      ].filter(Boolean).join(' ')}
    />
  );
});

type TextLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  size?: ButtonSize;
  tone?: TextLinkTone;
  fullWidth?: boolean;
  children: ReactNode;
};

export function TextLink({
  size = 'lg',
  tone = 'black',
  fullWidth = false,
  className,
  children,
  ...props
}: TextLinkProps) {
  return (
    <a className={textLinkClassName({ size, tone, fullWidth, className })} {...props}>
      {children}
    </a>
  );
}

export const ButtonLink = TextLink;
