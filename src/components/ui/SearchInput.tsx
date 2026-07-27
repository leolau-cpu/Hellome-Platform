import { useRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Icon } from './Icon';

type SearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'size' | 'type' | 'value' | 'defaultValue'
> & {
  size?: 'md' | 'lg';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

const sizeClassNames = {
  md: 'h-8 px-3.5 py-2',
  lg: 'h-9 px-4 py-2',
};

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export function SearchInput({
  size = 'md',
  value,
  defaultValue = '',
  onValueChange,
  className,
  placeholder = '搜索',
  onMouseDown,
  ...props
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;
  const hasValue = currentValue.length > 0;

  function updateValue(nextValue: string) {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  }

  return (
    <label
      className={mergeClassNames(
        'group flex items-center rounded-button border border-border-strong text-text-hint hover:border-border-hover active:border-border-selected active:text-text-primary focus-within:!border-border-selected focus-within:text-text-primary',
        sizeClassNames[size],
        className,
      )}
    >
      <Icon name="Search" className="shrink-0" />
      <input
        {...props}
        ref={inputRef}
        className="ml-2 min-w-0 flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-hint outline-none"
        type="text"
        value={currentValue}
        placeholder={placeholder}
        onMouseDown={(event) => {
          onMouseDown?.(event);

          if (
            event.defaultPrevented ||
            document.activeElement === event.currentTarget
          ) {
            return;
          }

          event.preventDefault();
          event.currentTarget.focus({ preventScroll: true });
        }}
        onChange={(event) => updateValue(event.target.value)}
      />
      {hasValue && (
        <button
          className="ml-2 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-pill bg-text-hint text-text-inverse hover:bg-text-secondary active:bg-text-primary"
          type="button"
          aria-label="清空搜索"
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={() => {
            updateValue('');
            inputRef.current?.focus({ preventScroll: true });
          }}
        >
          <Icon name="X" size="xs" />
        </button>
      )}
    </label>
  );
}
