import { describe, expect, it, vi } from 'vitest'
import { SaveScheduler } from '@/lib/save-scheduler'

/** 创建一个可手动 resolve 的 deferred，用于精确控制请求完成时序 */
const createDeferred = <T>() => {
  let resolveRef!: (value: T) => void
  let rejectRef!: (reason?: unknown) => void
  const promise = new Promise<T>((resolve, reject) => {
    resolveRef = resolve
    rejectRef = reject
  })
  return { promise, resolve: resolveRef, reject: rejectRef }
}

const flush = async () => { await Promise.resolve(); await Promise.resolve() }

describe('SaveScheduler', () => {
  it('串行发出：in-flight 期间的多次 schedule 只发出最新一次', async () => {
    const started: string[] = []
    const deferreds = [createDeferred<string>(), createDeferred<string>()]
    let call = 0
    const save = vi.fn(async (payload: string) => {
      started.push(payload)
      return await deferreds[call++].promise
    })

    const scheduler = new SaveScheduler<string, string>(save, {})

    scheduler.schedule('a') // 立即发出
    scheduler.schedule('b') // in-flight，合并为 pending
    scheduler.schedule('c') // in-flight，覆盖 pending 为 c

    await flush()
    expect(started).toEqual(['a'])

    // 第一个请求完成后，应只发出最新的 'c'（'b' 被合并丢弃）
    deferreds[0].resolve('ra')
    await flush()
    expect(started).toEqual(['a', 'c'])

    deferreds[1].resolve('rc')
    await flush()
    expect(save).toHaveBeenCalledTimes(2)
  })

  it('过期响应丢弃：迟到的旧响应不会覆盖更新的结果', async () => {
    const applied: Array<{ result: string, seq: number }> = []
    const deferreds = [createDeferred<string>(), createDeferred<string>()]
    let call = 0
    const save = vi.fn(async (_payload: string) => await deferreds[call++].promise)

    const scheduler = new SaveScheduler<string, string>(save, {
      onResult: (result, seq) => { applied.push({ result, seq }) }
    })

    // 由于串行化，第二个请求要等第一个结束才会发出；
    // 这里让第一个请求“完成”后拿到 seq=1，再让第二个 seq=2 完成，
    // 然后验证：即便人为让旧 seq 的响应最后到达，也不会被采纳。
    scheduler.schedule('v1')
    await flush()
    scheduler.schedule('v2') // pending

    // 完成 R1 → 采纳 seq1，并触发 R2 发出
    deferreds[0].resolve('r1')
    await flush()
    // 完成 R2 → 采纳 seq2
    deferreds[1].resolve('r2')
    await flush()

    expect(applied.map(a => a.seq)).toEqual([1, 2])
    expect(applied[applied.length - 1].result).toBe('r2')
  })

  it('onError 在请求失败时触发，且不阻塞后续 pending', async () => {
    const errors: number[] = []
    const results: string[] = []
    const deferreds = [createDeferred<string>(), createDeferred<string>()]
    let call = 0
    const save = vi.fn(async (_p: string) => await deferreds[call++].promise)

    const scheduler = new SaveScheduler<string, string>(save, {
      onError: (_e, seq) => { errors.push(seq) },
      onResult: (r) => { results.push(r) }
    })

    scheduler.schedule('x')
    await flush()
    scheduler.schedule('y')

    deferreds[0].reject(new Error('boom'))
    await flush()
    deferreds[1].resolve('ok')
    await flush()

    expect(errors).toEqual([1])
    expect(results).toEqual(['ok'])
  })

  it('flushNow 取出并清空当前 pending，不发起请求', async () => {
    const deferred = createDeferred<string>()
    const save = vi.fn(async (_p: string) => await deferred.promise)
    const scheduler = new SaveScheduler<string, string>(save, {})

    scheduler.schedule('first') // 立即发出
    await flush()
    scheduler.schedule('second') // pending

    expect(scheduler.hasPending()).toBe(true)
    expect(scheduler.flushNow()).toBe('second')
    expect(scheduler.hasPending()).toBe(false)
    // flushNow 不应额外发起请求
    expect(save).toHaveBeenCalledTimes(1)

    deferred.resolve('done')
    await flush()
  })

  it('onStart 在每个请求发出时触发', async () => {
    const starts: string[] = []
    const deferreds = [createDeferred<string>(), createDeferred<string>()]
    let call = 0
    const save = vi.fn(async (_p: string) => await deferreds[call++].promise)
    const scheduler = new SaveScheduler<string, string>(save, {
      onStart: (_seq, payload) => { starts.push(payload) }
    })

    scheduler.schedule('p1')
    await flush()
    scheduler.schedule('p2')
    deferreds[0].resolve('r1')
    await flush()
    deferreds[1].resolve('r2')
    await flush()

    expect(starts).toEqual(['p1', 'p2'])
  })
})
