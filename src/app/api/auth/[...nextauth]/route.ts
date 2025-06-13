// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { AuthOptions } from 'next-auth';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  providers: [
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: '/auth', // Custom sign-in page (optional)
    // signOut: '/auth/signout', // Custom sign-out page (optional)
    // error: '/auth/error',     // Error page (optional)
  },
  callbacks: {
    async session({ session, token, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id, // Use token.sub for user ID
        },
      };
    },
    async jwt({ token, user }) {
      return token;
    },
    // debug: process.env.NODE_ENV === 'development',
  },
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
