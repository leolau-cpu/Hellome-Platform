import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { buttonClassName, buttonLinkClassName } from './buttonStyles';
import type { ButtonLinkTone, ButtonSize, ButtonSurface, ButtonVariant } from './buttonStyles';
import { Icon } from './Icon';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  surface?: ButtonSurface;
  selected?: boolean;
  fullWidth?: boolean;
  isLoading?: boolean;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'lg',
  surface = 'white',
  selected = false,
  fullWidth = false,
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      aria-pressed={selected || undefined}
      className={buttonClassName({ variant, size, surface, selected, fullWidth, className })}
      disabled={disabled || isLoading}
      type="button"
      {...props}
    >
      {isLoading ? (
        <>
          <Icon name="LoaderCircle" className="mr-1 animate-spin" />
          处理中
        </>
      ) : (
        children
      )}
    </button>
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  size?: ButtonSize;
  tone?: ButtonLinkTone;
  fullWidth?: boolean;
  children: ReactNode;
};

export function ButtonLink({
  size = 'lg',
  tone = 'black',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a className={buttonLinkClassName({ size, tone, fullWidth, className })} {...props}>
      {children}
    </a>
  );
}
