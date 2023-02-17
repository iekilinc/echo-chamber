import { z } from "zod";
import { idSchema, postBodySchema } from "../../../utils/schemas";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        body: postBodySchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { user } = ctx.session;

      const post = await prisma.post.create({
        data: {
          id: user.id,
          body: input.body,
        },
      });

      return post;
    }),

  delete: protectedProcedure
    .input(z.object({ postId: idSchema }))
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { user } = ctx.session;

      const post = await prisma.post.findUniqueOrThrow({
        where: {
          id: input.postId,
        },
        select: {
          userId: true,
        },
      });
    }),
});
