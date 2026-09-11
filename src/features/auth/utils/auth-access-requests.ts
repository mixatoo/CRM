export type AuthAccessRequestType = 'account_request' | 'password_reset'

export interface AuthAccessRequest {
  id: string
  type: AuthAccessRequestType
  email: string
  fullName?: string
  department?: string
  requestedRole?: string
  notes?: string
  createdAt: string
  status: 'pending' | 'completed'
}

const STORAGE_KEY = 'egyliere-auth-access-requests'

function readRequests(): AuthAccessRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AuthAccessRequest[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRequests(requests: AuthAccessRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
}

export function submitAuthAccessRequest(
  input: Omit<AuthAccessRequest, 'id' | 'createdAt' | 'status'>,
): AuthAccessRequest {
  const request: AuthAccessRequest = {
    ...input,
    id: `REQ-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  }
  writeRequests([request, ...readRequests()])
  return request
}

export function listAuthAccessRequests(): AuthAccessRequest[] {
  return readRequests()
}
