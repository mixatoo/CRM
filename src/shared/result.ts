export type AppError =
  | { code: 'VALIDATION'; message: string; fields?: Record<string, string> }
  | { code: 'NOT_FOUND'; message: string; entity?: string }
  | { code: 'PERMISSION_DENIED'; message: string }
  | { code: 'CONFLICT'; message: string; details?: unknown }
  | { code: 'UNKNOWN'; message: string }

export type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E }

export function ok<T>(value: T): Result<T> {
  return { ok: true, value }
}

export function err(error: AppError): Result<never> {
  return { ok: false, error }
}
