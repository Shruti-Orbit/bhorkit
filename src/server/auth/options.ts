import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { findUserByEmail, upsertGoogleUser } from "@/src/server/auth/userRepository";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          access_type: "offline",
          prompt: "select_account",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google") {
        return false;
      }

      if (!user.email) {
        return false;
      }

      if (typeof profile?.email_verified === "boolean" && !profile.email_verified) {
        return false;
      }

      return true;
    },
    async jwt({ token, account, profile, user }) {
      const email = user?.email ?? token.email;

      if (!email) {
        return token;
      }

      if (account?.provider === "google" && account.providerAccountId) {
        const dbUser = await upsertGoogleUser({
          email,
          emailVerified: typeof profile?.email_verified === "boolean" ? profile.email_verified : true,
          googleId: account.providerAccountId,
          image: user?.image,
          name: user?.name,
        });

        token.appUserId = dbUser.id;
        token.email = dbUser.email;
        token.name = dbUser.name;
        token.picture = dbUser.image ?? undefined;
      } else if (!token.appUserId) {
        const dbUser = await findUserByEmail(email);

        if (dbUser) {
          token.appUserId = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.picture = dbUser.image ?? undefined;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.appUserId === "string" ? token.appUserId : "";
        session.user.email = typeof token.email === "string" ? token.email : session.user.email ?? "";
        session.user.name = typeof token.name === "string" ? token.name : session.user.name ?? "BHORKIT Devotee";
        session.user.image = typeof token.picture === "string" ? token.picture : session.user.image ?? null;
      }

      return session;
    },
  },
  pages: {},
  debug: process.env.NODE_ENV === "development",
};
