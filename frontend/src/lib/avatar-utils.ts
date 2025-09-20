/**
 * Generate a random color for avatar fallback based on user name
 */
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-cyan-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-violet-500',
    'bg-rose-500',
    'bg-teal-500',
    'bg-lime-500',
    'bg-sky-500',
  ];

  // Use name to generate consistent color for same user
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Get user initials from name (always 2 characters)
 */
export function getUserInitials(name: string): string {
  if (!name) return 'U';
  
  // Lấy 2 ký tự đầu của tên
  return name.substring(0, 2).toUpperCase();
}
