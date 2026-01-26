// Admin emails - users with these emails will automatically get admin role
// Hardcoded for client-side access (ADMIN_EMAILS env var used on server-side API)
export const ADMIN_EMAILS = [
  'charleno@gmail.com',
  'charlenopires@ifpi.edu.br',
];

// Check if an email is an admin email
export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();

  // Check hardcoded list
  if (ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === normalizedEmail)) {
    return true;
  }

  // Check env var (server-side only)
  if (typeof process !== 'undefined' && process.env?.ADMIN_EMAILS) {
    const envAdmins = process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase());
    return envAdmins.includes(normalizedEmail);
  }

  return false;
}
