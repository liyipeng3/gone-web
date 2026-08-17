import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

/**
 * 粗粒度鉴权中间件（第一道防线）。
 *
 * - 页面：/dashboard/*、/editor/* 需登录，否则跳转登录页。
 * - API：/api/post/*、/api/comment/* 的写方法（非 GET）需登录；
 *   GET 读接口一律放行，避免影响公开浏览、sitemap 等。
 *
 * 细粒度的归属/角色校验仍由各 API 路由内部完成（requireUser/requireAdmin）。
 */
export default withAuth(
  function middleware () {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl
        const isApi = pathname.startsWith('/api/')

        if (isApi) {
          const method = req.method.toUpperCase()
          // API 读接口（GET/HEAD/OPTIONS）放行
          if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
            return true
          }
          // 公开的匿名写操作放行：
          // - 评论发布 POST /api/comment/*（评论 DELETE/PATCH 仍需登录 + requireAdmin）
          // - 文章点赞 POST /api/post/like/*（仅前端 localStorage 去重，无需登录）
          if (method === 'POST' && (
            pathname.startsWith('/api/comment/') ||
            pathname.startsWith('/api/post/like/')
          )) {
            return true
          }
        }

        return token != null
      }
    }
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/editor/:path*',
    '/api/post/:path*',
    '/api/comment/:path*'
  ]
}
