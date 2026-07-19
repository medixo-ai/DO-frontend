export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function getFileIcon(type) {
  const icons = { pdf: '📄', docx: '📝', doc: '📝', pptx: '📊', xlsx: '📈' }
  return icons[type] || '📁'
}

export function getRoleColor(role) {
  const colors = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    employee: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  }
  return colors[role] || 'bg-gray-100 text-gray-700'
}

export function getStatusColor(status) {
  return status === 'active'
    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
}

export function getAccessColor(level) {
  const colors = {
    All: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return colors[level] || 'bg-gray-100 text-gray-700'
}
