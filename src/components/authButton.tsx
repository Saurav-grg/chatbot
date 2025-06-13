// app/components/auth/AuthButton.tsx
'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
// import SignInForm from './signInForm';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => signIn('github')}
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Sign In with GitHub
        </button>
        <button
          onClick={() => signIn('google')}
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-4 text-white">
      <span>Welcome, {session?.user?.name}!</span>
      {!showSignOutConfirm ? (
        <button
          onClick={() => setShowSignOutConfirm(true)}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Sign Out
        </button>
      ) : (
        <div className="absolute right-0 top-12 z-10">
          <div className="rounded-lg bg-white p-4 shadow-md">
            <p className="mb-4">Are you sure?</p>
            <div className="flex gap-2">
              <button
                onClick={() => signOut()}
                className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="rounded bg-gray-500 px-3 py-1 text-white hover:bg-gray-600"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
