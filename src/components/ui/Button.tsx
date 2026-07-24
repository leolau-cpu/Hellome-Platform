import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { buttonClassName } from './buttonStyles';

type ButtonVariant = 'primary' | 'secondary' | 'text' | 'warning' | 'notice';
type ButtonSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'lg',
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClassName({ variant, size, className })}
      disabled={disabled || isLoading}
      type="button"
      {...props}
    >
      {isLoading ? '处理中' : children}
    </button>
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

export function ButtonLink({
  variant = 'primary',
  size = 'lg',
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a className={buttonClassName({ variant, size, className })} {...props}>
      {children}
    </a>
  );
}
