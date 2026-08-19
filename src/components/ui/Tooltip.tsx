import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';

const tooltipBoundaryPadding = 48;
const tooltipViewportPadding = 8;
const tooltipOffset = 2;
const tooltipArrowWidth = 12;
const tooltipDefaultArrowPadding = 12;
const tooltipDefaultArrowCenter =
  tooltipDefaultArrowPadding + tooltipArrowWidth / 2;

type TooltipPlacement = 'top' | 'bottom';

type TooltipStyle = CSSProperties & {
  '--tt-arrow-offset'?: string;
  '--tt-origin-x'?: string;
};

type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  triggerClassName?: string;
  id?: string;
};

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isPointInsideRect(x: number, y: number, rect: DOMRect) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function isPointInsideTooltipArea(
  x: number,
  y: number,
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
) {
  if (isPointInsideRect(x, y, triggerRect) || isPointInsideRect(x, y, tooltipRect)) {
    return true;
  }

  const bridgeLeft = Math.min(triggerRect.left, tooltipRect.left);
  const bridgeRight = Math.max(triggerRect.right, tooltipRect.right);
  const bridgeTop = Math.min(triggerRect.bottom, tooltipRect.bottom);
  const bridgeBottom = Math.max(triggerRect.top, tooltipRect.top);

  return x >= bridgeLeft && x <= bridgeRight && y >= bridgeTop && y <= bridgeBottom;
}

export function Tooltip({
  content,
  children,
  className,
  triggerClassName,
  id,
}: TooltipProps) {
  const generatedId = useId();
  const tooltipId = id ?? generatedId;
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [isMultiline, setIsMultiline] = useState(false);
  const [placement, setPlacement] = useState<TooltipPlacement>('top');
  const [tooltipStyle, setTooltipStyle] = useState<TooltipStyle>({
    left: 0,
    top: 0,
    visibility: 'hidden',
  });

  const updateTooltipPosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) {
      return;
    }

    if (textRef.current) {
      const textStyles = window.getComputedStyle(textRef.current);
      const lineHeight = Number.parseFloat(textStyles.lineHeight);
      const multilineThreshold = Number.isFinite(lineHeight) ? lineHeight * 1.5 : 24;

      setIsMultiline(textRef.current.scrollHeight > multilineThreshold);
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const preferredLeft = triggerCenterX - tooltipDefaultArrowCenter;
    const maxLeft = viewportWidth - tooltipViewportPadding - tooltipRect.width;
    const nextLeft = clampNumber(
      preferredLeft,
      tooltipViewportPadding,
      Math.max(tooltipViewportPadding, maxLeft),
    );
    const arrowPaddingLeft = clampNumber(
      triggerCenterX - nextLeft - tooltipArrowWidth / 2,
      tooltipDefaultArrowPadding,
      Math.max(
        tooltipDefaultArrowPadding,
        tooltipRect.width - tooltipDefaultArrowPadding - tooltipArrowWidth,
      ),
    );
    const topSpace = triggerRect.top - tooltipBoundaryPadding;
    const bottomSpace = viewportHeight - triggerRect.bottom - tooltipBoundaryPadding;
    const canOpenAbove = topSpace >= tooltipRect.height + tooltipOffset;
    const nextPlacement: TooltipPlacement =
      canOpenAbove || topSpace >= bottomSpace ? 'top' : 'bottom';
    const preferredTop = nextPlacement === 'top'
      ? triggerRect.top - tooltipOffset - tooltipRect.height
      : triggerRect.bottom + tooltipOffset;
    const maxTop = viewportHeight - tooltipBoundaryPadding - tooltipRect.height;
    const nextTop = clampNumber(
      preferredTop,
      tooltipBoundaryPadding,
      Math.max(tooltipBoundaryPadding, maxTop),
    );

    setPlacement(nextPlacement);
    setTooltipStyle({
      left: nextLeft,
      top: nextTop,
      visibility: 'visible',
      '--tt-arrow-offset': `${arrowPaddingLeft}px`,
      '--tt-origin-x': `${triggerCenterX - nextLeft}px`,
    });
  }, []);

  useLayoutEffect(() => {
    if (!mounted) {
      return undefined;
    }

    let animationFrame: number | null = null;
    const scheduleUpdate = () => {
      if (animationFrame !== null) {
        return;
      }

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = null;
        updateTooltipPosition();
      });
    };

    updateTooltipPosition();
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('scroll', scheduleUpdate, true);

    return () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }

      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('scroll', scheduleUpdate, true);
    };
  }, [mounted, content, updateTooltipPosition]);

  const showTooltip = () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    setMounted(true);
    window.requestAnimationFrame(() => setActive(true));
  };

  const hideTooltip = () => {
    setActive(false);
    hideTimerRef.current = window.setTimeout(() => {
      setMounted(false);
      hideTimerRef.current = null;
    }, 50);
  };

  useEffect(() => {
    if (!mounted) {
      return undefined;
    }

    function handlePointerMove(event: PointerEvent) {
      if (!triggerRef.current || !tooltipRef.current) {
        return;
      }

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      if (
        isPointInsideTooltipArea(
          event.clientX,
          event.clientY,
          triggerRect,
          tooltipRect,
        )
      ) {
        return;
      }

      hideTooltip();
    }

    window.addEventListener('pointermove', handlePointerMove);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [mounted]);

  useEffect(() => () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
    }
  }, []);

  return (
    <span
      ref={triggerRef}
      className={['t-tt-wrap group/tooltip', className].filter(Boolean).join(' ')}
      onMouseEnter={showTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      <span
        className={[
          't-tt-trigger flex h-4 w-4 items-center justify-center rounded-pill text-text-hint transition-colors group-hover/tooltip:text-text-primary group-focus-within/tooltip:text-text-primary',
          triggerClassName,
        ].filter(Boolean).join(' ')}
        aria-describedby={tooltipId}
      >
        {children}
      </span>
      {mounted && createPortal(
        <span
          ref={tooltipRef}
          className={['t-tt', active ? 't-tt-open' : ''].join(' ')}
          data-placement={placement}
          id={tooltipId}
          role="tooltip"
          style={tooltipStyle}
        >
          {placement === 'bottom' && (
            <span className="t-tt-arrow-wrap" aria-hidden="true">
              <TooltipArrow />
            </span>
          )}
          <span className="t-tt-bubble text-xs leading-4">
            <span
              ref={textRef}
              className={[
                't-tt-text',
                isMultiline ? 't-tt-text-justify' : '',
              ].join(' ')}
            >
              {content}
            </span>
          </span>
          {placement === 'top' && (
            <span className="t-tt-arrow-wrap" aria-hidden="true">
              <TooltipArrow />
            </span>
          )}
        </span>,
        document.body,
      )}
    </span>
  );
}

function TooltipArrow() {
  return (
    <svg
      className="t-tt-arrow"
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 8L12 0H0L6 8Z" className="fill-bg-white" />
      <path
        d="M1.125 0L6 6.5L10.875 0H12L6 8L0 0H1.125Z"
        className="fill-border-strong"
      />
    </svg>
  );
}
