export type ClientStatus = 'active' | 'inactive' | 'blocked'
export type ClientType = 'individual' | 'corporate'
export type ClientMembership = 'member' | 'non_member'
export type ClientGender = 'male' | 'female'

export function formatClientAge(dateOfBirth?: string): string | null {
  if (!dateOfBirth?.trim()) return null
  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const monthDiff = now.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age -= 1
  return age >= 0 ? String(age) : null
}
