import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { idSchema } from "../../../utils/schemas";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const postLikeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ postId: idSchema }))
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { profile } = ctx.session;

      await prisma.postLike.create({
        data: {
          likedPostId: input.postId,
          likerId: profile.id,
        },
        select: {},
      });
    }),

  delete: protectedProcedure
    .input(z.object({ postId: idSchema }))
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { profile } = ctx.session;

      const postLike = await prisma.postLike.findUnique({
        where: {
          likedPostId_likerId: {
            likedPostId: input.postId,
            likerId: profile.id,
          },
        },
        select: {
          id: true,
        },
      });

      if (!postLike) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Could not satisfy request. The reason could be that the message does not exist or that it does but the user is not its creator",
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
