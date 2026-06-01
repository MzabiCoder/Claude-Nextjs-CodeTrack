import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getIP, rateLimiters } from "@/lib/rate-limit";
import authConfig from "./auth.config";

class UnverifiedEmail extends CredentialsSignin {
  code = "unverified";
}

class RateLimited extends CredentialsSignin {
  code = "rate_limited";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  callbacks: {
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  ...authConfig,
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip = getIP(request as Request);
        const key = `${ip}:${credentials.email as string}`;
        const rl = await checkRateLimit(rateLimiters.login, key);
        if (rl.limited) throw new RateLimited();

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: { id: true, name: true, email: true, image: true, password: true, emailVerified: true },
        });

        if (!user?.password) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) return null;

        if (!user.emailVerified) throw new UnverifiedEmail();

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
});
