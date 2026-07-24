import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const sourceRoot = join(process.cwd(), 'src');
const allowedLucideImportFile = join(
  process.cwd(),
  'src',
  'components',
  'ui',
  'Icon.tsx',
);
const forbiddenPatterns = [
  {
    pattern: /#[0-9A-Fa-f]{3,8}\b/g,
    message: '不要在页面代码中直接写颜色值，请使用 tailwind.config.ts 中的 token。',
  },
  {
    pattern: /\bslate-\d{2,3}\b/g,
    message: '不要使用临时 slate 色阶，请使用 text/bg/border token。',
  },
  {
    pattern: /\b(?:text|bg|border|rounded)-\[[^\]]+\]/g,
    message: '不要随意新增字号、背景、边框或圆角，请先收敛到设计规范。',
  },
];

function listFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return listFiles(fullPath);
    }

    return /\.(ts|tsx|css)$/.test(entry) ? [fullPath] : [];
  });
}

const violations = [];

for (const filePath of listFiles(sourceRoot)) {
  const content = readFileSync(filePath, 'utf8');

  if (
    filePath !== allowedLucideImportFile &&
    /from ['"]lucide-react['"]/.test(content)
  ) {
    violations.push({
      filePath,
      line: content.slice(0, content.indexOf('lucide-react')).split('\n')
        .length,
      match: 'lucide-react',
      message: '页面内不要直接引入 lucide-react，请先在 Icon.tsx 注册后通过 Icon 组件使用。',
    });
  }

  for (const { pattern, message } of forbiddenPatterns) {
    for (const match of content.matchAll(pattern)) {
      const line = content.slice(0, match.index).split('\n').length;
      violations.push({
        filePath,
        line,
        match: match[0],
        message,
      });
    }
  }
}

if (violations.length > 0) {
  console.error('Design token check failed:\n');
  for (const violation of violations) {
    console.error(
      `${violation.filePath}:${violation.line} ${violation.match}\n  ${violation.message}`,
    );
  }
  process.exit(1);
}

console.log('Design token check passed.');
