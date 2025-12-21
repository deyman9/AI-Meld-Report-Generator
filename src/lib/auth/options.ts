import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/db/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if user's email is in the allowed list
      const allowedEmails = process.env.ALLOWED_EMAIL?.split(",").map((e) =>
        e.trim().toLowerCase()
      );

      if (!user.email) {
        return false;
      }

      const userEmail = user.email.toLowerCase();

      if (!allowedEmails?.includes(userEmail)) {
        console.log(`Access denied for email: ${userEmail}`);
        return false;
      }

      return true;
    },
    async session({ session, user }) {
      // Add user id to session
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "database",
  },
  debug: process.env.NODE_ENV === "development",
};

