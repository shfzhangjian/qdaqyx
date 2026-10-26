// 零依赖静态服务器：用于在本地打开 index.html（原型）
// 用法：node serve.mjs   然后浏览器打开 http://127.0.0.1:5173/
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)))
const port = Number(process.env.PORT || 5173)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
}

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    if (urlPath === '/' || urlPath === '') urlPath = '/index.html'

    const filePath = join(root, urlPath)
    // 防目录穿越
    if (!filePath.startsWith(root)) {
      res.writeHead(403).end('403 Forbidden')
      return
    }

    let target = filePath
    const info = await stat(target).catch(() => null)
    if (info && info.isDirectory()) {
      target = join(target, 'index.html')
    }

    const data = await readFile(target)
    const type = MIME[extname(target).toLowerCase()] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' })
    res.end(data)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('404 Not Found')
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`静态服务器已启动：http://127.0.0.1:${port}/`)
  console.log(`根目录：${root}`)
})
