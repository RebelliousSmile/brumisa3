/**
 * Logging Helper - MVP v1.0
 * Helper pour logging structuré avec performance tracking
 */

import type { H3Event } from 'h3'

export interface LogContext {
  requestId: string
  userId?: string
  method?: string
  path?: string
  duration?: number
  [key: string]: any
}

/**
 * Log info avec contexte structuré
 */
export function logInfo(message: string, context: LogContext) {
  console.log(`[INFO] ${message}`, {
    timestamp: new Date().toISOString(),
    ...context
  })
}

/**
 * Log warning avec contexte structuré
 */
export function logWarn(message: string, context: LogContext) {
  console.warn(`[WARN] ${message}`, {
    timestamp: new Date().toISOString(),
    ...context
  })
}

/**
 * Log error avec contexte structuré
 */
export function logError(message: string, error: Error | any, context: LogContext) {
  console.error(`[ERROR] ${message}`, {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack,
    ...context
  })
}

/**
 * Log performance (slow request > threshold)
 */
export function logPerformance(message: string, duration: number, threshold: number, context: LogContext) {
  if (duration > threshold) {
    logWarn(`[SLOW] ${message}`, {
      ...context,
      duration,
      threshold,
      slowBy: duration - threshold
    })
  }
}

/**
 * Crée un contexte de log depuis un event H3
 */
export function createLogContext(event: H3Event, requestId: string): LogContext {
  return {
    requestId,
    userId: event.context.user?.id,
    method: event.method,
    path: event.path
  }
}

/**
 * Helper pour mesurer performance d'une fonction
 */
export async function withPerformanceTracking<T>(
  fn: () => Promise<T>,
  label: string,
  context: LogContext,
  threshold: number = 500
): Promise<T> {
  const startTime = Date.now()

  try {
    const result = await fn()
    const duration = Date.now() - startTime

    logPerformance(label, duration, threshold, { ...context, duration })

    return result
  } catch (error) {
    const duration = Date.now() - startTime
    logError(`${label} failed`, error, { ...context, duration })
    throw error
  }
}
