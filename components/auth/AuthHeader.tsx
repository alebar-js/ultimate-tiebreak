'use client';

import { useSession } from 'next-auth/react';
import SignInButton from './SignInButton';
import UserMenu from './UserMenu';

export default function AuthHeader() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
    );
  }

  if (session) {
    return <UserMenu session={session} />;
  }

  return <SignInButton className="bg-white text-primary hover:bg-gray-100" />;
}
