import type { ButtonHTMLAttributes, ReactNode } from 'react';

type TabButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  children: ReactNode;
};

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export function TabButton({
  selected = false,
  className,
  children,
  ...props
}: TabButtonProps) {
  return (
    <button
      className={mergeClassNames(
        'inline-flex h-8 items-center justify-center rounded-button px-3.5 py-1.5 text-sm font-normal transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-selected disabled:pointer-events-none disabled:bg-transparent disabled:text-text-disabled',
        selected
          ? 'bg-bg-strong text-text-primary hover:bg-bg-strong active:bg-bg-strong'
          : 'bg-transparent text-text-secondary hover:bg-bg-medium active:bg-bg-strong',
        className,
      )}
      type="button"
      aria-pressed={selected}
      {...props}
    >
      {children}
    </button>
  );
}
