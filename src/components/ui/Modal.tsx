import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { FormHTMLAttributes, ReactNode } from 'react';
import { Button, ModalCloseButton } from './Button';
import type { ButtonVariant } from './buttonStyles';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

type ModalOverlayTone = 'standard' | 'light' | 'medium';
type ModalBodyScroll = 'body' | 'none';

type ModalProps = {
  open?: boolean;
  size?: ModalSize;
  title?: ReactNode;
  children: ReactNode | ((controls: { close: () => void }) => ReactNode);
  footer?: ReactNode | ((controls: { close: () => void }) => ReactNode);
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  closeLabel?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  overlayTone?: ModalOverlayTone;
  bodyScroll?: ModalBodyScroll;
  panelClassName?: string;
  bodyClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  footerClassName?: string;
  bodyPadding?: boolean;
  header?: ReactNode | ((controls: { close: () => void; titleId?: string }) => ReactNode);
  onClose: () => void;
};

type InfoModalProps = {
  title: ReactNode;
  media: ReactNode;
  description?: ReactNode;
  closeLabel?: string;
  onClose: () => void;
};

type ConfirmModalProps = {
  title: ReactNode;
  description: ReactNode;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: ButtonVariant;
  closeLabel?: string;
  ariaLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
};

type FormModalProps = {
  title: ReactNode;
  children: ReactNode;
  cancelText?: string;
  confirmText?: string;
  confirmDisabled?: boolean;
  closeLabel?: string;
  formProps?: Omit<FormHTMLAttributes<HTMLFormElement>, 'children'>;
  onClose: () => void;
  onConfirm?: () => boolean | void;
};

type PresetModalProps = Omit<ModalProps, 'size'>;

const modalSizeClassNames: Record<ModalSize, string> = {
  sm: 'w-[360px]',
  md: 'w-[480px]',
  lg: 'w-[640px]',
  xl: 'w-[720px]',
  '2xl': 'w-[960px]',
};

const overlayToneClassNames: Record<ModalOverlayTone, string> = {
  standard: 'bg-bg-black/60',
  medium: 'bg-bg-black/40',
  light: 'bg-bg-black/20',
};

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export function Modal({
  open = true,
  size = 'md',
  title,
  children,
  footer,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  closeLabel = '关闭弹窗',
  ariaLabel,
  ariaLabelledBy,
  overlayTone = 'standard',
  bodyScroll = 'body',
  panelClassName,
  bodyClassName,
  headerClassName,
  titleClassName,
  footerClassName,
  bodyPadding = true,
  header,
  onClose,
}: ModalProps) {
  const generatedTitleId = useId();
  const titleId = ariaLabelledBy ?? (title ? generatedTitleId : undefined);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  const overlayPointerStartedRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const requestClose = useCallback(() => {
    setIsVisible(false);

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      onCloseRef.current();
    }, 180);
  }, []);

  useEffect(() => {
    if (!open) {
      setIsVisible(false);
      return undefined;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !closeOnEsc) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        requestClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeOnEsc, open, requestClose]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className={mergeClassNames(
        'fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ease-out',
        overlayToneClassNames[overlayTone],
        isVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      )}
      role="presentation"
      onPointerDown={(event) => {
        overlayPointerStartedRef.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (
          closeOnOverlayClick &&
          overlayPointerStartedRef.current &&
          event.target === event.currentTarget
        ) {
          requestClose();
        }

        overlayPointerStartedRef.current = false;
      }}
    >
      <div
        className={mergeClassNames(
          'flex max-h-[calc(100vh-80px)] shrink-0 flex-col overflow-hidden rounded-modal bg-bg-white shadow-card-hover transition-all duration-200 ease-out',
          modalSizeClassNames[size],
          isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0',
          panelClassName,
        )}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : titleId}
        onClick={(event) => event.stopPropagation()}
      >
        {header ? (
          typeof header === 'function' ? header({ close: requestClose, titleId }) : header
        ) : (
          (title || showCloseButton) && (
            <div
              className={mergeClassNames(
                'flex w-full items-center justify-end gap-2 pb-2 pl-6 pr-4 pt-4',
                headerClassName,
              )}
            >
              {title && (
                <h2
                  id={titleId}
                  className={mergeClassNames(
                    'min-w-0 flex-1 truncate text-base font-medium leading-6 text-text-primary',
                    titleClassName,
                  )}
                >
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <ModalCloseButton aria-label={closeLabel} onClick={requestClose} />
              )}
            </div>
          )
        )}

        <div
          className={mergeClassNames(
            'min-h-0 flex-1',
            bodyScroll === 'body' ? 'overflow-y-auto' : 'overflow-hidden',
            bodyPadding && 'px-6 py-4',
            bodyClassName,
          )}
        >
          {typeof children === 'function' ? children({ close: requestClose }) : children}
        </div>

        {footer && (
          <div
            className={mergeClassNames(
              'flex w-full flex-col items-end px-6 pb-6 pt-4',
              footerClassName,
            )}
          >
            {typeof footer === 'function' ? footer({ close: requestClose }) : footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function InfoModal({
  title,
  media,
  description,
  closeLabel,
  onClose,
}: InfoModalProps) {
  return (
    <Modal
      size="sm"
      title={title}
      panelClassName="relative items-center gap-4 p-8"
      bodyPadding={false}
      bodyClassName="flex w-full flex-col items-center gap-4"
      header={({ close, titleId }) => (
        <>
          <div className="absolute right-0 top-0 flex h-14 w-14 items-start justify-end pb-2 pl-2 pr-4 pt-4">
            <ModalCloseButton aria-label={closeLabel ?? '关闭弹窗'} onClick={close} />
          </div>
          <h2
            id={titleId}
            className="min-w-full text-center text-base font-medium leading-6 text-text-primary"
          >
            {title}
          </h2>
        </>
      )}
      onClose={onClose}
    >
      {media}
      {description && (
        <p className="min-w-full text-center text-sm leading-5 text-text-hint">
          {description}
        </p>
      )}
    </Modal>
  );
}

export function ConfirmModal({
  title,
  description,
  cancelText = '取消',
  confirmText = '确定',
  confirmVariant = 'primary',
  closeLabel,
  ariaLabel,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal
      size="md"
      title={title}
      closeLabel={closeLabel}
      ariaLabel={ariaLabel}
      bodyClassName="flex items-center"
      footer={({ close }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="lg" onClick={close}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            size="lg"
            onClick={() => {
              onConfirm();
              close();
            }}
          >
            {confirmText}
          </Button>
        </div>
      )}
      onClose={onClose}
    >
      <p className="text-sm leading-5 text-text-primary">{description}</p>
    </Modal>
  );
}

export function FormModal({
  title,
  children,
  cancelText = '取消',
  confirmText = '确定',
  confirmDisabled = false,
  closeLabel,
  formProps,
  onClose,
  onConfirm,
}: FormModalProps) {
  const formId = useId();

  return (
    <Modal
      size="md"
      title={title}
      closeLabel={closeLabel}
      footer={({ close }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="lg" onClick={close}>
            {cancelText}
          </Button>
          <Button
            size="lg"
            type="submit"
            form={formId}
            disabled={confirmDisabled}
          >
            {confirmText}
          </Button>
        </div>
      )}
      onClose={onClose}
    >
      {({ close }) => (
        <form
          {...formProps}
          id={formId}
          onSubmit={(event) => {
            formProps?.onSubmit?.(event);

            if (event.defaultPrevented) {
              return;
            }

            event.preventDefault();
            const shouldClose = onConfirm?.();
            if (shouldClose !== false) {
              close();
            }
          }}
        >
          {children}
        </form>
      )}
    </Modal>
  );
}

export function FeatureModal(props: PresetModalProps) {
  return <Modal size="lg" {...props} />;
}

export function ContentModal(props: PresetModalProps) {
  return <Modal size="xl" {...props} />;
}

export function WorkflowModal(props: PresetModalProps) {
  return <Modal size="2xl" {...props} />;
}
