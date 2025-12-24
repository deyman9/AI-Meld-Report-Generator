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
    async signIn({ user }) {
      // Check if user's email is in the allowed list
      const allowedEmails = process.env.ALLOWED_EMAIL?.split(",").map((e) =>
        e.trim().toLowerCase()
      );

      console.log(`[AUTH] Sign-in attempt for email: ${user.email}`);
      console.log(`[AUTH] Allowed emails: ${JSON.stringify(allowedEmails)}`);

      if (!user.email) {
        console.log(`[AUTH] Denied: No email provided`);
        return false;
      }

      const userEmail = user.email.toLowerCase();

      if (!allowedEmails?.includes(userEmail)) {
        console.log(`[AUTH] Access denied for email: ${userEmail}`);
        return "/login?error=AccessDenied";
      }

      console.log(`[AUTH] Access granted for email: ${userEmail}`);
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

