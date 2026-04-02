export function getDashboardRoute(role) {
  if (role === 'admin') return '/admin/students'
  if (role === 'student') return '/student'
  return '/'
}
