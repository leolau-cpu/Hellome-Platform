import type { PropsWithChildren } from 'react';
import { Link, NavLink } from 'react-router-dom';

const navItems = [
  { label: '首页', to: '/' },
  { label: '功能', to: '/features' },
  { label: '关于', to: '/about' },
];

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-bg-soft text-text-primary">
      <header className="border-b border-border-subtle bg-bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-semibold">
            HelloMe
          </Link>
          <nav className="flex items-center gap-1" aria-label="主导航">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'rounded-button px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-bg-black text-text-inverse'
                      : 'text-text-secondary hover:bg-bg-medium hover:text-text-primary',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
