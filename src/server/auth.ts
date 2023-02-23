import type { GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { CustomPrismaAdapter } from "./prisma-adapter.js";
import { env } from "../env.mjs";
import { prisma } from "./db";
import type { PrismaClient, User } from "@prisma/client";
import type { Session } from "next-auth";

const getUserProfile = async (user: Pick<User, "id">, prisma: PrismaClient) => {
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      displayName: true,
      username: true,
      role: true,
    },
  });
  return profile;
};
type Profile = Awaited<ReturnType<typeof getUserProfile>>;

/**
 * Module augmentation for `next-auth` types.
 * Allows us to add custom properties to the `session` object and keep type
 * safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
    profile: Profile & Pick<Session["user"], "image">;
    // ... other properties
  }

  // interface User {
  //   role: string; // ?
  //   // ... other properties
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks,
 * etc.
 *
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {
  callbacks: {
    async session({ session, user }) {
      if (!session.user) return session;
      const profile = await getUserProfile(user, prisma);
      if (!profile) return session;

      session.profile = {
        ...profile,
      } satisfies Session["profile"];
      session.user.id = user.id;
      // ... put other properties on the session here

      return session;
    },
  },
  adapter: CustomPrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here
     *
     * @see https://next-auth.js.org/providers/github
     **/
  ],
  pages: {
    signIn: "/auth/signin",
  },
};

/**
 * Wrapper for `getServerSession` so that we don't need to import the
 * `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 **/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
