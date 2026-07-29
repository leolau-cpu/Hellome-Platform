import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { Icon } from './Icon';
import { Popover } from './Popover';

export type NotificationPopoverTab<T extends string> = {
  value: T;
  label: string;
};

export type NotificationPopoverMessage = {
  id: string;
  title: string;
  time: string;
};

type NotificationPopoverProps<T extends string> = {
  tabs: readonly NotificationPopoverTab<T>[];
  value: T;
  messagesByMode: Record<T, readonly NotificationPopoverMessage[]>;
  unreadCounts: Record<T, number>;
  unreadMessageIds: Set<string>;
  isLoggedIn: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onValueChange: (value: T) => void;
  onMessageClick: (value: T, messageId: string) => void;
  onMarkAllRead: (value: T) => void;
  onAllMessagesClick: () => void;
  onClose: () => void;
};

export function NotificationPopover<T extends string>({
  tabs,
  value,
  messagesByMode,
  unreadCounts,
  unreadMessageIds,
  isLoggedIn,
  anchorRef,
  onValueChange,
  onMessageClick,
  onMarkAllRead,
  onAllMessagesClick,
  onClose,
}: NotificationPopoverProps<T>) {
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const popoverMessages = isLoggedIn ? messagesByMode[value] : [];
  const currentUnreadCount = isLoggedIn ? unreadCounts[value] : 0;

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        popoverRef.current?.contains(target)
      ) {
        return;
      }

      onClose();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <Popover
      ref={popoverRef}
      width={400}
      anchorRef={anchorRef}
      align="auto"
      placement="bottom"
      offset={4}
      constrainHeight={false}
      className="flex max-h-[calc(100vh-96px)] min-h-[196px] flex-col"
      role="dialog"
      aria-label="消息通知"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex h-9 w-full items-center px-4">
        <div className="flex h-9 w-full items-center gap-4">
          {tabs.map((tab) => {
            const isActive = value === tab.value;
            const badge = unreadCounts[tab.value];

            return (
              <button
                key={tab.value}
                className={[
                  'flex h-9 items-center gap-1 text-sm leading-5',
                  isActive
                    ? 'font-medium text-text-primary'
                    : 'font-normal text-text-hint hover:text-text-secondary active:text-text-primary',
                ].join(' ')}
                type="button"
                onClick={() => onValueChange(tab.value)}
              >
                <span>{tab.label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-pill bg-accent-red px-1 text-xs leading-4 text-text-inverse">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex h-4 items-center px-4">
        <div className="h-px w-full bg-border-subtle" />
      </div>
      <div className="scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto">
        {popoverMessages.length === 0 ? (
          <div className="flex h-[110px] items-center justify-center px-4 text-sm leading-5 text-text-hint">
            <span className="flex items-center gap-2">
              <Icon
                name={isLoggedIn ? 'FolderMinus' : 'MailOpen'}
                className="shrink-0"
              />
              <span>暂无消息</span>
            </span>
          </div>
        ) : popoverMessages.map((message) => {
          const isUnread = unreadMessageIds.has(message.id);

          return (
            <button
              key={message.id}
              className="group flex h-10 w-full items-center px-2 text-left"
              type="button"
              onClick={() => onMessageClick(value, message.id)}
            >
              <span className="flex h-9 min-w-0 flex-1 items-center rounded-button px-2 hover:bg-bg-soft active:bg-bg-medium">
                <span
                  className={[
                    'h-1.5 w-1.5 shrink-0 rounded-pill',
                    isUnread ? 'bg-accent-red' : 'bg-bg-strong',
                  ].join(' ')}
                />
                <span
                  className={[
                    'ml-2 min-w-0 flex-1 truncate text-sm leading-5 text-text-primary',
                    isUnread ? 'font-medium' : 'font-normal',
                  ].join(' ')}
                >
                  {message.title}
                </span>
                <time className="ml-2 shrink-0 text-xs leading-4 text-text-hint group-hover:hidden">
                  {message.time}
                </time>
                <Icon
                  name="ChevronRight"
                  className="ml-2 hidden shrink-0 text-text-secondary group-hover:block"
                />
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex h-3 items-center px-4">
        <div className="h-px w-full bg-border-subtle" />
      </div>
      <div className="flex h-9 items-center px-4">
        <div className="flex h-9 w-full items-center justify-between">
          <button
            className="h-5 rounded-button text-sm leading-5 text-text-secondary hover:text-text-primary active:text-text-primary disabled:pointer-events-none disabled:text-text-disabled"
            type="button"
            disabled={currentUnreadCount === 0}
            onClick={() => onMarkAllRead(value)}
          >
            全部已读
          </button>
          <button
            className="group flex h-5 items-center rounded-button text-sm leading-5 text-text-secondary hover:text-text-primary active:text-text-primary"
            type="button"
            onClick={onAllMessagesClick}
          >
            <span>全部消息</span>
            <Icon
              name="ChevronRight"
              className="text-text-secondary group-hover:text-text-primary group-active:text-text-primary"
            />
          </button>
        </div>
      </div>
    </Popover>
  );
}
