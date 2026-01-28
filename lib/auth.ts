import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    session({ session }) {
      return session;
    },
  },
});

// Helper to check if a user email is an admin
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) || [];
  return adminEmails.includes(email.toLowerCase());
}

// Helper to get current session in server components/actions
export { auth as getSession };

// Helper to check if a user can modify a tournament
// Returns true if: (1) tournament has no owner (legacy), or (2) user is the owner
export function canModifyTournament(
  userEmail: string | null | undefined,
  tournamentOwnerId: string | null | undefined
): boolean {
  // Legacy tournaments (no owner) can be modified by anyone
  if (!tournamentOwnerId) return true;
  // New tournaments require the user to be the owner
  if (!userEmail) return false;
  return userEmail.toLowerCase() === tournamentOwnerId.toLowerCase();
}
