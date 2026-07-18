import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      try {
        const res = await fetch(
          `${process.env.BACKEND_URL}/auth/check-beta`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-secret": process.env.INTERNAL_SECRET!,
            },
            body: JSON.stringify({ email: user.email }),
          }
        );
        return res.ok;
      } catch {
        return false;
      }
    },

    async session({ session, token }) {
      const backendToken = await new SignJWT({
        email: token.email,
        sub: token.sub,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(secret);

      return { ...session, backendToken };
    },
  },
};
