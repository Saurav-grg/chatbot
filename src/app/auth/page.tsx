'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
function AuthPageInner() {
  const { data: session, status } = useSession();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="h-full p-4">
        <div className="border p-4 bg-gradient-to-br from-purple-600/30 to-blue-600/30 border-white/20 rounded-xl flex flex-col items-center justify-center w-1/3 mx-auto h-1/3 mt-48 gap-4">
          <h2 className="text-white text-xl text-center font-mono">
            Sign in using your account to continue chatting...
          </h2>
          <button
            onClick={() => signIn('github', { callbackUrl })}
            className="rounded bg-gray-800 outline outline-1 px-4 py-2 text-white hover:bg-gray-700"
          >
            Sign In with GitHub
          </button>
          <button
            onClick={() => signIn('google', { callbackUrl })}
            className="rounded bg-red-800 px-4 py-2 text-white hover:bg-red-700"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full gap-4 text-white">
      <div className="relative">
        <span>Welcome, {session?.user?.name}! </span>

        {!showSignOutConfirm ? (
          <button
            onClick={() => setShowSignOutConfirm(true)}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Sign Out
          </button>
        ) : (
          <div className="absolute right-0 top-12 z-10">
            <div className="rounded-xl bg-white/30 p-4 shadow-md">
              <p className="mb-4">Are you sure you want to Sign out?</p>
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
    </div>
  );
}

// Main component that wraps everything in Suspense
export default function Authpage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-white">Loading authentication...</div>
        </div>
      }
    >
      <AuthPageInner />
    </Suspense>
  );
}
