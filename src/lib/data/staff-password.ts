/**
 * İşçi şifrəsini dəyişmək (admin-only)
 */

export async function resetStaffPassword(
  staffEmail: string,
  newPassword: string,
  adminUid: string
): Promise<void> {
  const response = await fetch('/api/admin/reset-staff-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      staffEmail,
      newPassword,
      adminUid,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Şifrə dəyişdirilmədi');
  }

  return response.json();
}
