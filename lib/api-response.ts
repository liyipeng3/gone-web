import { NextResponse } from 'next/server'

/**
 * API 响应辅助工具
 *
 * 收敛路由层重复的错误兜底与请求体解析样板。
 * 不改变各接口的成功响应形状，仅统一错误响应与异常处理。
 */

/**
 * 统一的服务端错误兜底：记录原始错误，向客户端返回通用文案（避免泄露内部细节）。
 *
 * 用法：
 *   try { ... } catch (error) { return handleApiError(error, '保存文章失败') }
 */
export const handleApiError = (error: unknown, message: string, status = 500): NextResponse => {
  console.error(`${message}:`, error)
  return NextResponse.json({ error: message }, { status })
}

/**
 * 安全解析请求体 JSON。
 *
 * 成功返回解析后的对象；请求体为空或非法 JSON 时返回 400 响应，
 * 避免未捕获异常直接冒泡成 500。调用方需配合 isAuthResponse 判断提前返回。
 */
export const readJson = async <T = unknown>(
  request: Request
): Promise<T | NextResponse> => {
  try {
    return await request.json() as T
  } catch {
    return NextResponse.json({ error: '请求体格式错误' }, { status: 400 })
  }
}
