export async function adminMutation<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch('/api/admin/mutations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Admin operation failed')
  return result as T
}
