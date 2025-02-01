import { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User";
import dbConnect from "@/lib/db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please enter your email and password');
          }

          const { email, password } = credentials;
          
          await dbConnect();

          const user = await User.findOne({ 
            email: email.toLowerCase().trim()
          }).select('+password');
          
          if (!user) {
            throw new Error('No account found with this email');
          }

          const isValid = await user.comparePassword(password);
          
          if (!isValid) {
            await User.findByIdAndUpdate(user._id, {
              $inc: { failedLoginAttempts: 1 },
              lastFailedLogin: new Date()
            });
            throw new Error('Incorrect password');
          }

          await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date(),
            failedLoginAttempts: 0,
            lastFailedLogin: null
          });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            preferredLanguage: user.preferredLanguage,
            role: user.role,
          };
        } catch (error: any) {
          console.error('Auth error:', error);
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.preferredLanguage = user.preferredLanguage;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.preferredLanguage = token.preferredLanguage as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
