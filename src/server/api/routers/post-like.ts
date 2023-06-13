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

      const likedPost = await prisma.postLike.create({
        data: {
          likedPostId: input.postId,
          likerId: profile.id,
        },
        select: { likedPostId: true },
      });

      return likedPost;
    }),

  delete: protectedProcedure
    .input(z.object({ postId: idSchema }))
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { profile } = ctx.session;

      let postLike: { likedPostId: string };
      try {
        postLike = await prisma.postLike.delete({
          where: {
            likedPostId_likerId: {
              likedPostId: input.postId,
              likerId: profile.id,
            },
          },
          select: { likedPostId: true },
        });
      } catch (e) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this operation",
        });
      }

      return postLike;
    }),
});
