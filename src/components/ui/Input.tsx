import {
  forwardRef,
  useRef,
  useState,
} from 'react';
import type {
  InputHTMLAttributes,
  MouseEventHandler,
  MutableRefObject,
  ReactNode,
  Ref,
} from 'react';
import { Icon } from './Icon';
import type { IconName } from './Icon';

export type InputSize = 'xl' | 'lg' | 'md';

export type InputFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'onMouseDown' | 'size' | 'value' | 'defaultValue'
> & {
  size?: InputSize;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  prefixIcon?: IconName;
  prefixAsset?: string;
  clearable?: boolean;
  clearLabel?: string;
  onClear?: () => void;
  suffixText?: string;
  suffix?: ReactNode;
  error?: boolean;
  transformValue?: (value: string) => string;
  onContainerMouseDown?: MouseEventHandler<HTMLLabelElement>;
};

export type InputProps = InputFieldProps;

const sizeClassNames: Record<InputSize, string> = {
  xl: 'h-10 px-4 py-2.5',
  lg: 'h-9 px-3.5 py-2',
  md: 'h-8 px-3.5 py-1.5',
};

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function assignRef(ref: Ref<HTMLInputElement> | undefined, value: HTMLInputElement | null) {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  (ref as MutableRefObject<HTMLInputElement | null>).current = value;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  {
    size = 'xl',
    value,
    defaultValue = '',
    onValueChange,
    prefixIcon,
    prefixAsset,
    clearable = false,
    clearLabel = '清空输入',
    onClear,
    suffixText,
    suffix,
    className,
    placeholder,
    disabled,
    readOnly,
    error = false,
    transformValue,
    onContainerMouseDown,
    onFocus,
    ...props
  },
  forwardedRef,
) {
  const inputRef = useRef<HTMLInputElement | null>(null) as MutableRefObject<HTMLInputElement | null>;
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
        'group flex min-w-0 items-center gap-2 rounded-button bg-transparent text-text-hint transition-shadow',
        error
          ? 'shadow-border-error'
          : disabled
            ? 'shadow-border-subtle'
            : readOnly
              ? 'shadow-border-strong'
              : 'shadow-border-strong hover:shadow-border-hover focus-within:!shadow-border-selected',
        !disabled && !readOnly && 'focus-within:text-text-primary',
        sizeClassNames[size],
        className,
      )}
      onMouseDown={(event) => {
        onContainerMouseDown?.(event);

        if (
          event.defaultPrevented ||
          disabled ||
          !readOnly ||
          (event.target as HTMLElement | null)?.closest('button:not(:disabled)')
        ) {
          return;
        }

        event.preventDefault();
      }}
    >
      {prefixIcon && <Icon name={prefixIcon} className="shrink-0" />}
      {prefixAsset && (
        <img className="h-4 w-4 shrink-0" src={prefixAsset} alt="" />
      )}
      <input
        {...props}
        ref={(node) => {
          inputRef.current = node;
          assignRef(forwardedRef, node);
        }}
        className="min-w-0 flex-1 bg-transparent text-sm leading-5 text-text-primary outline-none placeholder:text-text-placeholder disabled:text-text-disabled disabled:placeholder:text-text-disabled"
        type={props.type ?? 'text'}
        value={currentValue}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : props.tabIndex}
        onFocus={(event) => {
          if (readOnly) {
            event.currentTarget.blur();
          }

          onFocus?.(event);
        }}
        onChange={(event) => updateValue(transformValue?.(event.target.value) ?? event.target.value)}
      />
      {suffixText && (
        <span className="shrink-0 text-sm leading-5 text-text-placeholder">
          {suffixText}
        </span>
      )}
      {suffix}
      {clearable && hasValue && !disabled && !readOnly && (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          <button
            className="flex h-3.5 w-3.5 items-center justify-center rounded-pill bg-text-hint text-text-inverse hover:bg-text-secondary active:bg-text-primary"
            type="button"
            aria-label={clearLabel}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onClear?.();
              updateValue('');
              inputRef.current?.focus({ preventScroll: true });
            }}
          >
            <Icon name="X" size="xs" />
          </button>
        </span>
      )}
    </label>
  );
});

type CounterInputProps = Omit<InputFieldProps, 'suffixText'> & {
  maxLength: number;
};

export const CounterInput = forwardRef<HTMLInputElement, CounterInputProps>(
  function CounterInput({
    value,
    defaultValue = '',
    maxLength,
    onValueChange,
    ...props
  }, ref) {
    const [counterValue, setCounterValue] = useState(defaultValue);
    const currentValue = value ?? counterValue;

    return (
      <InputField
        {...props}
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        suffixText={`${currentValue.length}/${maxLength}`}
        onValueChange={(nextValue) => {
          if (value === undefined) {
            setCounterValue(nextValue);
          }

          onValueChange?.(nextValue);
        }}
      />
    );
  },
);
