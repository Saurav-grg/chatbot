'use client';
import { signIn } from 'next-auth/react';

export default function SignInForm() {
  return (
    <div className="rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-6 text-2xl font-bold">Sign In</h1>
      <button
        onClick={() => signIn('github')}
        className="flex items-center justify-center rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
      >
        <span>Sign in with GitHub</span>
      </button>
    </div>
  );
}
