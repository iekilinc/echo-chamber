import type { PrismaClient, Prisma } from "@prisma/client";
import type { Adapter, AdapterAccount } from "next-auth/adapters";
import { generateRandomUsername } from "../utils/random-name";
import { usernameSchema } from "../utils/schemas";

/**
 * Custom adapter that supports the "Profile" model we created in the prisma
 * schema to store our custom fields seperately from Next auth's fields
 *
 * @see https://github.com/nextauthjs/next-auth/blob/main/packages/adapter-prisma/src/index.ts
 */
export function CustomPrismaAdapter(p: PrismaClient): Adapter {
  return {
    createUser: async (user) => {
      const isUnique = async (username: string) => {
        const dbRes = await p.profile.findUnique({
          where: { username },
          select: { id: true },
        });
        return dbRes === null;
      };

      let uniqueUsername: string | undefined;

      // If the OAuth provider provided a name, use the name if it's unique
      // else, create a 4-decimal-digit discriminator and add it to the name
      const safeChars = user.name?.match(/[a-zA-Z0-9_]/g)?.join("");
      if (safeChars) {
        let discriminator: string;
        let username: string;
        do {
          discriminator = Math.random().toPrecision(4).substring(2);
          username = safeChars + discriminator;
        } while (!(await isUnique(username)));
        const parsed = usernameSchema.safeParse(username);
        uniqueUsername = parsed.success ? parsed.data : undefined;
      }
      
      if (uniqueUsername === undefined) {
        let username: string;
        do {
          username = generateRandomUsername();
        } while (!(await isUnique(username)));
        uniqueUsername = username;
      }

      const dbUser = await p.user.create({
        data: {
          ...user,
          profile: {
            create: {
              username: uniqueUsername,
            },
          },
        },
        include: { profile: true },
      });

      return dbUser;
    },

    // Not sure if we need to include `profile`.
    // TODO: Test things without including `profile`
    getUser: (id) =>
      p.user.findUnique({ where: { id }, include: { profile: true } }),

    getUserByEmail: (email) =>
      p.user.findUnique({ where: { email }, include: { profile: true } }),

    async getUserByAccount(provider_providerAccountId) {
      const account = await p.account.findUnique({
        where: { provider_providerAccountId },
        select: {
          user: {
            include: { profile: true },
          },
        },
      });
      return account?.user ?? null;
    },

    updateUser: ({ id, ...data }) => p.user.update({ where: { id }, data }),

    deleteUser: (id) => p.user.delete({ where: { id } }),

    linkAccount: (data) =>
      p.account.create({ data }) as unknown as AdapterAccount,

    unlinkAccount: (provider_providerAccountId) =>
      p.account.delete({
        where: { provider_providerAccountId },
      }) as unknown as AdapterAccount,

    async getSessionAndUser(sessionToken) {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      });
      if (!userAndSession || !userAndSession.user.profile) return null;
      const { user, ...session } = userAndSession;
      const { profile } = user;
      const userSansProfile = { ...user, profile: undefined };

      return { user: userSansProfile, profile, session };
    },

    createSession: (data) => p.session.create({ data }),

    updateSession: (data) =>
      p.session.update({ where: { sessionToken: data.sessionToken }, data }),

    deleteSession: (sessionToken) =>
      p.session.delete({ where: { sessionToken } }),

    async createVerificationToken(data) {
      const verificationToken = await p.verificationToken.create({ data });
      // @ts-expect-errors // MongoDB needs an ID, but we don't
      if (verificationToken.id) delete verificationToken.id;
      return verificationToken;
    },

    async useVerificationToken(identifier_token) {
      try {
        const verificationToken = await p.verificationToken.delete({
          where: { identifier_token },
        });
        // @ts-expect-errors // MongoDB needs an ID, but we don't
        if (verificationToken.id) delete verificationToken.id;
        return verificationToken;
      } catch (error) {
        // If token already used/deleted, just return null
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025")
          return null;
        throw error;
      }
    },
  };
}
