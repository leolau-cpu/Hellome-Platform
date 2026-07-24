import { Link } from 'react-router-dom';
import { buttonClassName } from '../components/ui/buttonStyles';

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl py-20 text-center">
      <p className="text-sm font-medium text-text-secondary">404</p>
      <h1 className="mt-3 text-3xl font-semibold text-text-primary">
        页面不存在
      </h1>
      <p className="mt-4 text-sm text-text-hint">
        这个路由还没有创建，可以从首页继续。
      </p>
      <Link
        to="/"
        className={buttonClassName({ className: 'mt-8' })}
      >
        返回首页
      </Link>
    </section>
  );
}
