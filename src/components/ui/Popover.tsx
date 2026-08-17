import { forwardRef, useLayoutEffect, useRef, useState } from 'react';
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  InputHTMLAttributes,
  MutableRefObject,
  ReactNode,
  Ref,
  RefObject,
} from 'react';
import { Icon } from './Icon';
import type { IconName } from './Icon';

export type PopoverWidth = 'sm' | 'md' | 'lg' | 'trigger' | 'content' | number;
export type PopoverAlign = 'auto' | 'left' | 'right' | 'none';
export type PopoverPlacement = 'auto' | 'top' | 'bottom';
export type PopoverPosition = 'absolute' | 'fixed' | 'static';
export type PopoverShadow = 'default' | 'strong';
export type PopoverPadding = 'default' | 'none';

type PopoverProps = HTMLAttributes<HTMLDivElement> & {
  width?: PopoverWidth;
  align?: PopoverAlign;
  placement?: PopoverPlacement;
  position?: PopoverPosition;
  offset?: number | null;
  anchorRef?: RefObject<HTMLElement | null>;
  boundaryPadding?: number;
  constrainHeight?: boolean;
  repositionOnChildrenChange?: boolean;
  shadow?: PopoverShadow;
  padding?: PopoverPadding;
  children: ReactNode;
};

const widthClassNames: Record<Exclude<PopoverWidth, number>, string> = {
  sm: 'w-40',
  md: 'w-[220px]',
  lg: 'w-80',
  trigger: 'min-w-40 w-full',
  content: 'w-max min-w-40 max-w-80',
};

const positionClassNames: Record<PopoverPosition, string> = {
  absolute: 'absolute',
  fixed: 'fixed',
  static: 'relative',
};

const shadowClassNames: Record<PopoverShadow, string> = {
  default: 'shadow-popover',
  strong: 'shadow-popover-strong',
};

const paddingClassNames: Record<PopoverPadding, string> = {
  default: 'py-2',
  none: '',
};

function popoverWidthClassName(width: PopoverWidth) {
  return typeof width === 'number' ? undefined : widthClassNames[width];
}

function popoverWidthStyle(width: PopoverWidth) {
  return typeof width === 'number' ? { width } : undefined;
}

function assignInputRef(ref: Ref<HTMLInputElement> | undefined, value: HTMLInputElement | null) {
  if (!ref) return;

  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  (ref as MutableRefObject<HTMLInputElement | null>).current = value;
}

function assignElementRef(ref: Ref<HTMLDivElement> | undefined, value: HTMLDivElement | null) {
  if (!ref) return;

  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  (ref as MutableRefObject<HTMLDivElement | null>).current = value;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type AnchoredPositionState = {
  alignToLeft: boolean;
  maxHeight?: number;
  measuredWidth: number;
  openBelow: boolean;
  renderedHeight: number;
};

function applyAnchoredStyle(
  element: HTMLDivElement,
  nextStyle: CSSProperties,
) {
  if (typeof nextStyle.left === 'number') {
    element.style.left = `${nextStyle.left}px`;
  }

  if (typeof nextStyle.top === 'number') {
    element.style.top = `${nextStyle.top}px`;
  }

  if (typeof nextStyle.width === 'number') {
    element.style.width = `${nextStyle.width}px`;
  }

  if (typeof nextStyle.maxHeight === 'number') {
    element.style.maxHeight = `${nextStyle.maxHeight}px`;
    element.style.overflowY = 'auto';
  } else {
    element.style.maxHeight = '';
    element.style.overflowY = '';
  }

  element.style.visibility = 'visible';
}

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  {
    width = 'sm',
    align = 'left',
    placement = 'auto',
    position = 'absolute',
    offset = 4,
    anchorRef,
    boundaryPadding = 48,
    constrainHeight = true,
    repositionOnChildrenChange = true,
    shadow = 'default',
    padding = 'default',
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const anchoredPositionRef = useRef<AnchoredPositionState | null>(null);
  const [anchoredStyle, setAnchoredStyle] = useState<CSSProperties | undefined>();
  const usesAnchor = Boolean(anchorRef);
  const resolvedPosition = usesAnchor ? 'fixed' : position;
  const childrenPositionDependency = repositionOnChildrenChange ? children : undefined;
  const widthStyle = popoverWidthStyle(width);
  const offsetStyle =
    position === 'absolute' && !usesAnchor && offset !== null
      ? { top: `calc(100% + ${offset}px)` }
      : undefined;

  useLayoutEffect(() => {
    if (!anchorRef?.current || !popoverRef.current || position === 'static') {
      setAnchoredStyle(undefined);
      return undefined;
    }

    let scrollAnimationFrame: number | null = null;

    function updatePosition(recalculate = false) {
      if (!anchorRef?.current || !popoverRef.current) return;

      const triggerRect = anchorRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const offsetValue = offset ?? 0;
      let positionState = anchoredPositionRef.current;
      const shouldRefreshPositionState =
        recalculate ||
        positionState === null ||
        placement === 'auto' ||
        align === 'auto' ||
        constrainHeight;

      if (shouldRefreshPositionState) {
        const popoverRect = popoverRef.current.getBoundingClientRect();
        const measuredWidth = width === 'trigger'
          ? Math.max(160, triggerRect.width)
          : popoverRect.width;
        const spaceAbove = triggerRect.top - boundaryPadding;
        const spaceBelow = viewportHeight - triggerRect.bottom - boundaryPadding;
        const openBelow =
          placement === 'bottom' ||
          (placement === 'auto' && spaceBelow >= spaceAbove);
        const availableHeight = Math.max(
          0,
          (openBelow ? spaceBelow : spaceAbove) - offsetValue,
        );
        const alignToLeft =
          align === 'left' ||
          (align === 'auto' &&
            viewportWidth - triggerRect.right >= triggerRect.left);
        const contentHeight = Math.max(popoverRef.current.scrollHeight, popoverRect.height);
        const renderedHeight = constrainHeight
          ? Math.min(contentHeight, availableHeight)
          : contentHeight;

        positionState = {
          alignToLeft,
          measuredWidth,
          openBelow,
          renderedHeight,
          ...(constrainHeight ? { maxHeight: availableHeight } : undefined),
        };
        anchoredPositionRef.current = positionState;
      }

      if (positionState === null) return;

      const nextLeft = positionState.alignToLeft
        ? triggerRect.left
        : triggerRect.right - positionState.measuredWidth;
      const preferredTop = positionState.openBelow
        ? triggerRect.bottom + offsetValue
        : triggerRect.top - offsetValue - positionState.renderedHeight;
      const maxTop = Math.max(
        boundaryPadding,
        viewportHeight - boundaryPadding - positionState.renderedHeight,
      );
      const nextTop = recalculate
        ? clamp(preferredTop, boundaryPadding, maxTop)
        : preferredTop;

      const nextStyle: CSSProperties = {
        left: nextLeft,
        top: nextTop,
        ...(width === 'trigger' ? { width: positionState.measuredWidth } : undefined),
        ...(positionState.maxHeight !== undefined
          ? {
              maxHeight: positionState.maxHeight,
              overflowY: 'auto',
            }
          : undefined),
        visibility: 'visible',
      };

      if (recalculate) {
        setAnchoredStyle(nextStyle);
        return;
      }

      applyAnchoredStyle(popoverRef.current, nextStyle);
    }

    updatePosition(true);
    const updatePositionOnResize = () => updatePosition(true);
    const updatePositionOnScroll = () => {
      if (scrollAnimationFrame !== null) return;

      scrollAnimationFrame = window.requestAnimationFrame(() => {
        scrollAnimationFrame = null;
        updatePosition(false);
      });
    };

    window.addEventListener('resize', updatePositionOnResize);
    window.addEventListener('scroll', updatePositionOnScroll, true);

    return () => {
      if (scrollAnimationFrame !== null) {
        window.cancelAnimationFrame(scrollAnimationFrame);
      }

      window.removeEventListener('resize', updatePositionOnResize);
      window.removeEventListener('scroll', updatePositionOnScroll, true);
    };
  }, [
    align,
    anchorRef,
    boundaryPadding,
    childrenPositionDependency,
    constrainHeight,
    offset,
    placement,
    position,
    width,
  ]);

  return (
    <div
      ref={(node) => {
        popoverRef.current = node;
        assignElementRef(ref, node);
      }}
      className={[
        positionClassNames[resolvedPosition],
        resolvedPosition !== 'static' ? 'z-40' : undefined,
        !usesAnchor && align === 'right' ? 'right-0' : undefined,
        !usesAnchor && align === 'left' ? 'left-0' : undefined,
        'rounded-card bg-bg-white',
        shadowClassNames[shadow],
        paddingClassNames[padding],
        popoverWidthClassName(width),
        className,
      ].filter(Boolean).join(' ')}
      style={{
        ...offsetStyle,
        ...widthStyle,
        ...(usesAnchor && !anchoredStyle ? { visibility: 'hidden' } : undefined),
        ...anchoredStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

type PopoverPresetProps = Omit<PopoverProps, 'width'> & {
  width?: PopoverWidth;
};

export type PopoverMenuWidth = 'sm' | 'md';
export type PopoverOptionsWidth = 'sm' | 'md' | 'lg' | 'trigger' | 'content';
export type PopoverPanelWidth = 'sm' | 'md' | 'lg' | 'trigger' | 'content';

type PopoverMenuProps = Omit<PopoverPresetProps, 'width'> & {
  width?: PopoverMenuWidth;
};

type PopoverOptionsProps = Omit<PopoverPresetProps, 'width'> & {
  width?: PopoverOptionsWidth;
};

type PopoverPanelProps = Omit<PopoverPresetProps, 'width'> & {
  width?: PopoverPanelWidth;
};

export const PopoverMenu = forwardRef<HTMLDivElement, PopoverMenuProps>(
  function PopoverMenu({ width = 'sm', children, ...props }, ref) {
  return (
    <Popover ref={ref} width={width} {...props}>
      {children}
    </Popover>
  );
});

export const PopoverOptions = forwardRef<HTMLDivElement, PopoverOptionsProps>(
  function PopoverOptions({ width = 'sm', children, ...props }, ref) {
  return (
    <Popover ref={ref} width={width} {...props}>
      {children}
    </Popover>
  );
});

export const PopoverPanel = forwardRef<HTMLDivElement, PopoverPanelProps>(
  function PopoverPanel({ width = 'md', children, ...props }, ref) {
  return (
    <Popover ref={ref} width={width} {...props}>
      {children}
    </Popover>
  );
});

export function PopoverHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        'flex h-8 items-center px-4 text-xs font-normal leading-4 text-text-hint',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function PopoverSection({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['w-full px-2', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}

type PopoverSearchProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value' | 'defaultValue' | 'size'
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder: string;
  clearLabel?: string;
};

export const PopoverSearch = forwardRef<HTMLInputElement, PopoverSearchProps>(
  function PopoverSearch(
    {
      value,
      defaultValue = '',
      onValueChange,
      placeholder,
      clearLabel = '清空搜索',
      className,
      disabled,
      ...props
    },
    forwardedRef,
  ) {
  const inputRef = useRef<HTMLInputElement | null>(null);
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
      className={[
        'flex h-9 w-full items-center rounded-button p-2 text-left text-sm leading-5',
        className,
      ].filter(Boolean).join(' ')}
    >
      <Icon name="Search" className="mr-2 shrink-0 text-text-hint" />
      <input
        {...props}
        ref={(node) => {
          inputRef.current = node;
          assignInputRef(forwardedRef, node);
        }}
        className="min-w-0 flex-1 bg-transparent text-sm leading-5 text-text-primary outline-none placeholder:text-text-placeholder disabled:text-text-disabled disabled:placeholder:text-text-disabled"
        type="text"
        value={currentValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => updateValue(event.target.value)}
      />
      {hasValue && !disabled && (
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

export function PopoverEmpty({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        'flex h-9 w-full items-center rounded-button p-2 text-left text-sm leading-5 text-text-hint',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </div>
  );
}

type PopoverItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: IconName;
  startAdornment?: ReactNode;
  selected?: boolean;
  danger?: boolean;
  endAdornment?: ReactNode;
  children: ReactNode;
};

export function PopoverItem({
  icon,
  startAdornment,
  selected = false,
  danger = false,
  endAdornment,
  className,
  children,
  ...props
}: PopoverItemProps) {
  return (
    <button
      className={[
        'flex h-9 w-full items-center rounded-button p-2 text-left text-sm leading-5 hover:bg-bg-soft active:bg-bg-medium',
        danger ? 'text-text-danger' : 'text-text-primary',
        className,
      ].filter(Boolean).join(' ')}
      type="button"
      {...props}
    >
      {startAdornment}
      {icon && <Icon name={icon} className="mr-2 shrink-0" />}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {endAdornment}
      {selected && <Icon name="Check" className="ml-2 shrink-0" />}
    </button>
  );
}

export function PopoverDivider({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['flex h-3 w-full shrink-0 items-center px-4', className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
      {...props}
    >
      <div className="h-px w-full bg-border-subtle" />
    </div>
  );
}
