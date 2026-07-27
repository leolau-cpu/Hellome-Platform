import type { FormEvent, ReactNode, Ref } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';

const phonePattern = /^1[3-9]\d{9}$/;
type LoginErrorField = 'phone' | 'code' | null;

type LoginPageProps = {
  onLogin: (phone: string) => void;
  onPrivacyClick?: () => void;
  onTermsClick?: () => void;
};

type LoginModalProps = LoginPageProps & {
  onClose: () => void;
};

function LoginInput({
  id,
  iconSrc,
  value,
  placeholder,
  inputMode,
  maxLength,
  disabled = false,
  readOnly = false,
  clearable = false,
  action,
  error = false,
  inputRef,
  onClear,
  onChange,
}: {
  id: string;
  iconSrc: string;
  value: string;
  placeholder: string;
  inputMode: 'tel' | 'numeric';
  maxLength: number;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  action?: ReactNode;
  error?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  onClear?: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className={[
        'flex h-10 w-full items-center gap-2 rounded-button px-4 py-2.5 transition-shadow',
        error
          ? 'shadow-[inset_0_0_0_1px_#FF5C4D]'
          : disabled
            ? 'shadow-border-subtle'
            : readOnly
              ? 'shadow-border-strong'
              : 'shadow-border-strong focus-within:shadow-border-selected',
      ].join(' ')}
      htmlFor={id}
      onMouseDown={(event) => {
        if (!readOnly) return;

        const target = event.target as HTMLElement | null;
        if (target?.closest('button:not(:disabled)')) return;

        event.preventDefault();
      }}
    >
      <img className="h-4 w-4 shrink-0" src={iconSrc} alt="" />
      <input
        id={id}
        className="min-w-0 flex-1 bg-transparent text-sm leading-5 text-text-primary outline-none placeholder:text-text-placeholder disabled:text-text-disabled disabled:placeholder:text-text-disabled"
        type="text"
        inputMode={inputMode}
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        onFocus={(event) => {
          if (readOnly) {
            event.currentTarget.blur();
          }
        }}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
      />
      {clearable && value.length > 0 && !disabled && (
        <button
          className="ml-2 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-pill bg-text-hint text-text-inverse hover:bg-text-secondary active:bg-text-primary"
          type="button"
          aria-label="清空手机号"
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onClear?.();
            onChange('');
          }}
        >
          <Icon name="X" size="xs" />
        </button>
      )}
      {action}
    </label>
  );
}

function LoginCard({ onLogin, onPrivacyClick, onTermsClick }: LoginPageProps) {
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [errorField, setErrorField] = useState<LoginErrorField>(null);
  const [isCodeInputUnlocked, setIsCodeInputUnlocked] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const codeInputRef = useRef<HTMLInputElement | null>(null);

  const isPhoneValid = phonePattern.test(phone);
  const isCodeValid = /^\d{4,6}$/.test(verificationCode);
  const canSendCode = isPhoneValid && countdown === 0;
  const phoneHasError = errorField === 'phone';
  const codeHasError = errorField === 'code';
  const phoneErrorText =
    phoneHasError && phone.length === 0
      ? '请输入手机号'
      : phoneHasError
        ? '请输入正确的手机号'
        : '';
  const codeErrorText =
    codeHasError && verificationCode.length === 0
      ? '请输入验证码'
      : codeHasError
        ? '请输入 4-6 位验证码'
        : '';

  useEffect(() => {
    if (countdown === 0) return undefined;

    const timer = window.setTimeout(() => {
      setCountdown((currentCountdown) => Math.max(0, currentCountdown - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  function handleSendCode() {
    if (!canSendCode) {
      setErrorField('phone');
      return;
    }

    setErrorField(null);
    setCountdown(60);
    setIsCodeInputUnlocked(true);
    window.requestAnimationFrame(() => {
      codeInputRef.current?.focus({ preventScroll: true });
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isPhoneValid) {
      setErrorField('phone');
      return;
    }

    if (!isCodeValid) {
      setErrorField('code');
      return;
    }

    setErrorField(null);

    onLogin(phone);
  }

  function renderErrorTip(errorText: string) {
    if (errorText.length === 0) return null;

    return (
      <div className="flex h-4 w-full items-center gap-1" aria-live="polite">
        <img
          className="h-3 w-3 shrink-0"
          src="/assets/login/circle-alert.svg"
          alt=""
        />
        <p className="min-w-0 flex-1 truncate text-xs leading-4 text-accent-error">
          {errorText}
        </p>
      </div>
    );
  }

  return (
    <section className="flex h-[480px] w-[640px] flex-col overflow-hidden rounded-card bg-bg-white shadow-card-hover">
        <header className="relative flex h-[88px] shrink-0 items-center gap-6 overflow-hidden px-8 py-8">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="/assets/login/cover-image.png"
            alt=""
          />
          <div className="relative flex shrink-0 items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-pill bg-bg-black shadow-[0_2px_3px_rgb(0_0_0_/_0.05),0_0_3px_rgb(0_0_0_/_0.05)]">
              <img className="h-[18px] w-[18px]" src="/assets/login/logo.svg" alt="" />
            </span>
            <span className="font-logo text-xl leading-none tracking-normal">
              Hello<span className="text-accent-successBorder">me</span>
            </span>
          </div>
          <p className="relative min-w-0 flex-1 truncate text-right text-xs leading-4 text-accent-successBorder">
            国内交互应用智能体平台创新引领者
          </p>
        </header>

        <div className="flex min-h-0 flex-1 bg-bg-white">
          <form
            className="flex h-full min-w-0 flex-1 flex-col items-center gap-6 px-10 py-8"
            onSubmit={handleSubmit}
          >
            <h1 className="h-5 w-full truncate text-center text-sm font-medium leading-5">
              手机号登录
            </h1>
            <div className="flex min-h-0 w-full flex-1 flex-col justify-between">
              <div className="flex w-full flex-col items-start gap-3">
                <LoginInput
                  id="login-phone"
                  iconSrc="/assets/login/smartphone.svg"
                  value={phone}
                  placeholder="输入手机号"
                  inputMode="tel"
                  maxLength={11}
                  error={phoneHasError}
                  clearable
                  inputRef={phoneInputRef}
                  onClear={() => {
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur();
                    }
                    phoneInputRef.current?.blur();
                    codeInputRef.current?.blur();
                    setIsCodeInputUnlocked(false);
                  }}
                  onChange={(nextPhone) => {
                    setPhone(nextPhone);
                    setIsCodeInputUnlocked(false);
                    if (errorField === 'phone') setErrorField(null);
                  }}
                />
                {renderErrorTip(phoneErrorText)}
                <LoginInput
                  id="login-code"
                  iconSrc="/assets/login/shield-check.svg"
                  value={verificationCode}
                  placeholder="输入验证码"
                  inputMode="numeric"
                  maxLength={6}
                  error={codeHasError}
                  inputRef={codeInputRef}
                  readOnly={!isCodeInputUnlocked}
                  onChange={(nextCode) => {
                    setVerificationCode(nextCode);
                    if (errorField === 'code') setErrorField(null);
                  }}
                  action={
                    <button
                      className="shrink-0 text-sm leading-5 text-text-disabled transition-colors enabled:text-text-secondary enabled:hover:text-text-primary enabled:active:text-text-primary disabled:pointer-events-none"
                      type="button"
                      disabled={!canSendCode}
                      onClick={handleSendCode}
                    >
                      {countdown > 0 ? `${countdown}s` : '发送验证码'}
                    </button>
                  }
                />
                {renderErrorTip(codeErrorText)}
              </div>
              <Button className="h-9 w-full px-[18px] py-2" size="lg" type="submit">
                登 录
              </Button>
            </div>
          </form>

          <div className="flex h-full w-px shrink-0 items-center justify-center py-8">
            <div className="h-full w-px bg-border-subtle" />
          </div>

          <section className="flex h-full shrink-0 flex-col items-center gap-6 px-10 py-8">
            <h2 className="h-5 w-full truncate text-center text-sm font-medium leading-5">
              微信扫码登录
            </h2>
            <div className="flex min-h-0 flex-1 flex-col items-center gap-4">
              <div className="h-[180px] w-[180px] overflow-hidden">
                <img
                  className="h-[180px] w-[180px]"
                  src="/assets/login/login-qr.png"
                  alt="微信扫码登录二维码"
                />
              </div>
              <p className="min-w-full truncate text-center text-xs leading-4 text-text-secondary">
                打开微信 扫码登录
              </p>
            </div>
          </section>
        </div>

        <footer className="flex h-[72px] shrink-0 items-start justify-center border-t border-border-subtle bg-[#FCFCFC] px-4 pb-6 pt-4">
          <p className="w-[320px] text-center text-xs leading-4 text-text-secondary">
            阅读并同意
            <button
              className="transition-colors hover:text-text-primary active:text-text-primary"
              type="button"
              onClick={onPrivacyClick}
            >
              《隐私政策》
            </button>
            和
            <button
              className="transition-colors hover:text-text-primary active:text-text-primary"
              type="button"
              onClick={onTermsClick}
            >
              《服务条款》
            </button>
            ，未注册绑定的手机号验证成功后将自动注册
          </p>
        </footer>
    </section>
  );
}

export function LoginModal({
  onClose,
  onLogin,
  onPrivacyClick,
  onTermsClick,
}: LoginModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const closeWithAnimation = useCallback(() => {
    setIsVisible(false);

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      onCloseRef.current();
    }, 180);
  }, []);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeWithAnimation();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);

      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, [closeWithAnimation]);

  return (
    <div
      className={[
        'fixed inset-0 z-50 flex items-center justify-center bg-bg-black/60 p-6 text-text-primary transition-opacity duration-200 ease-out',
        isVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
      role="presentation"
      onClick={closeWithAnimation}
    >
      <div
        className={[
          'transition-all duration-200 ease-out',
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="登录"
        onClick={(event) => event.stopPropagation()}
      >
        <LoginCard
          onPrivacyClick={onPrivacyClick}
          onTermsClick={onTermsClick}
          onLogin={(phone) => {
            onLogin(phone);
            closeWithAnimation();
          }}
        />
      </div>
    </div>
  );
}

export function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <main className="flex min-h-screen min-w-[640px] items-center justify-center bg-bg-soft p-6 text-text-primary">
      <LoginCard onLogin={onLogin} />
    </main>
  );
}
