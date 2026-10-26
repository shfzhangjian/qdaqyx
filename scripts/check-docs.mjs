// 零依赖静态检查；不代替业务、视觉或人工验收。
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const read = p => readFileSync(resolve(root, p), 'utf8');
const requireFile = p => { if (!existsSync(resolve(root, p))) errors.push(`缺少文件：${p}`); };
['AGENTS.md', 'agent.md', 'README.md', 'docs/handoff-template.md'].forEach(requireFile);
function walk(dir) {
  return readdirSync(resolve(root, dir)).flatMap(name => {
    const p = `${dir}/${name}`;
    return statSync(resolve(root, p)).isDirectory() ? walk(p) : [p];
  });
}
const files = ['AGENTS.md', 'agent.md', 'README.md', 'changelog/README.md', ...walk('docs')].filter(p => p.endsWith('.md') && !p.includes('/baselines/'));
for (const p of files) {
  const content = read(p);
  for (const m of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = m[1].split('#')[0];
    if (!target || /^[a-z]+:/i.test(target)) continue;
    if (!existsSync(resolve(root, dirname(p), target))) errors.push(`${p} 引用不存在：${target}`);
  }
  if (p.startsWith('docs/handoffs/')) {
    for (const section of ['## 0.', '## 6.', '## 7.', '## 8.', '## 9.'])
      if (!content.includes(section)) errors.push(`${p} 缺少 ${section}`);
    if (!/状态：`(?:示例·未验收|草稿|待人工确认|已确认·可开发|开发中|待验收|已完成)`/.test(content)) errors.push(`${p} 缺少有效状态`);
    if (/<(?:module|YYYY|field|模块|问题|留空|必填)[^>]*>/.test(content)) errors.push(`${p} 有未填占位符`);
    if (content.includes('状态：`示例·未验收`') && /- \[[xX]\]/.test(content)) errors.push(`${p} 示例不应勾选验收`);
    if (!content.includes('SHA-256') && !content.includes('git 版本')) errors.push(`${p} 缺少基线标识`);
  }
}
try {
  execFileSync(process.execPath, [resolve(root, 'scripts/changelog.mjs'), 'check'], { stdio: 'pipe' });
  console.log(`已检查 ${files.length} 个现行文档；归档与生成索引一致性检查通过`);
} catch (e) { errors.push(`日志检查失败：${e.stderr?.toString() || e.message}`); }

if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('静态检查通过；章节锚点、业务事实与浏览器行为仍需另行核对。');
