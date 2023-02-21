import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { idSchema } from "../../../utils/schemas";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const postLikeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ postId: idSchema }))
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { user } = ctx.session;

      await prisma.postLike.create({
        data: {
          postId: input.postId,
          userId: user.id,
        },
        select: {},
      });
    }),

  delete: protectedProcedure
    .input(z.object({ postLikeId: idSchema }))
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { user } = ctx.session;

      const postLike = await prisma.postLike.findUniqueOrThrow({
        where: {
          id: input.postLikeId,
        },
        select: {
          id: true, // for error logging
          userId: true,
        },
      });

      if (user.id !== postLike.userId && user.role === "USER") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `User ${user.id} does not have permissions to delete post like ${postLike.id}`,
        });
      }

      await prisma.postLike.delete({
        where: {
          id: postLike.id,
        },
        select: {},
      });
    }),
});
