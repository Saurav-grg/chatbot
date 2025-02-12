'use client';
import { signOut } from 'next-auth/react';

export default function SignOutForm() {
  return (
    <div className="rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-6 text-2xl font-bold">Sign Out</h1>
      <p className="mb-4">Are you sure you want to sign out?</p>
      <button
        onClick={() => signOut()}
        className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
}
