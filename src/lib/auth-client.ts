export async function checkAdminClient(redirectPath = '/admin') {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch('/api/admin/check-auth', { credentials: 'include' });
    if (!res.ok) {
      window.location.href = redirectPath;
      return;
    }
    const data = await res.json();
    if (!data.isAdmin) {
      window.location.href = redirectPath;
    }
  } catch {
    window.location.href = redirectPath;
  }
}
