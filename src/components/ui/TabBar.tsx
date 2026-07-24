import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { TabButton } from './TabButton';

type TabBarProps = {
  items: Array<string | { value: string; label: string }>;
  value: string;
  onValueChange: (value: string) => void;
  scrollStep?: number;
};

function normalizeItem(item: string | { value: string; label: string }) {
  return typeof item === 'string' ? { value: item, label: item } : item;
}

export function TabBar({
  items,
  value,
  onValueChange,
  scrollStep = 160,
}: TabBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const maxScrollLeft = element.scrollWidth - element.clientWidth;

    setCanScrollLeft(element.scrollLeft > 0);
    setCanScrollRight(element.scrollLeft < maxScrollLeft - 1);
  }

  function scrollTabs(direction: 'left' | 'right') {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    element.scrollBy({
      left: direction === 'left' ? -scrollStep : scrollStep,
      behavior: 'smooth',
    });
  }

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return undefined;
    }

    updateScrollState();

    const resizeObserver = new ResizeObserver(updateScrollState);

    resizeObserver.observe(element);
    window.addEventListener('resize', updateScrollState);
    element.addEventListener('scroll', updateScrollState, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScrollState);
      element.removeEventListener('scroll', updateScrollState);
    };
  }, []);

  return (
    <div className="relative flex min-w-0 flex-1 items-center gap-2">
      <div
        ref={scrollRef}
        className="scrollbar-none flex min-w-0 items-center gap-1 overflow-x-auto overflow-y-hidden"
      >
        {items.map((item) => {
          const normalizedItem = normalizeItem(item);
          const isActive = normalizedItem.value === value;

          return (
            <TabButton
              key={normalizedItem.value}
              className="shrink-0"
              selected={isActive}
              onClick={() => onValueChange(normalizedItem.value)}
            >
              {normalizedItem.label}
            </TabButton>
          );
        })}
      </div>

      {canScrollLeft && (
        <div className="tab-fade-left pointer-events-none absolute left-0 top-1/2 flex h-8 w-12 -translate-y-1/2 items-center">
          <button
            className="pointer-events-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-bg-soft text-text-primary shadow-border-strong hover:bg-bg-medium active:bg-bg-strong"
            type="button"
            aria-label="向左滚动分类"
            onClick={() => scrollTabs('left')}
          >
            <Icon name="ChevronLeft" />
          </button>
        </div>
      )}

      {canScrollRight && (
        <div className="tab-fade-right pointer-events-none absolute right-0 top-1/2 flex h-8 w-12 -translate-y-1/2 items-center justify-end">
          <button
            className="pointer-events-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-bg-soft text-text-primary shadow-border-strong hover:bg-bg-medium active:bg-bg-strong"
            type="button"
            aria-label="向右滚动分类"
            onClick={() => scrollTabs('right')}
          >
            <Icon name="ChevronRight" />
          </button>
        </div>
      )}
    </div>
  );
}
