import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  idSchema,
  postBodySchema,
  postSortSchema,
} from "../../../utils/schemas";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination
  getScrolling: publicProcedure
    .input(
      z.object({
        sortingMethod: postSortSchema.default("NEWEST"),
        cursorPostId: idSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { sortingMethod, cursorPostId } = input;

      const limit = 10;
      const isFirstPage: boolean = cursorPostId === undefined;

      const posts = await prisma.post.findMany({
        take: limit + 1,
        skip: isFirstPage ? undefined : 1, // skip fetching the post acting as the cursor
        cursor: { id: cursorPostId },
        orderBy: {
          createdAt: sortingMethod === "NEWEST" ? "desc" : "asc",
        },
      });

      let nextCursor: typeof cursorPostId;
      if (posts.length > limit) {
        const nextPost = posts.pop();
        nextCursor = nextPost?.id;
      }

      return {
        posts,
        nextCursor,
      };
    }),

  create: protectedProcedure
    .input(z.object({ body: postBodySchema }))
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { user } = ctx.session;

      const post = await prisma.post.create({
        data: {
          userId: user.id,
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
          id: true, // for error logging
          userId: true,
        },
      });

      if (user.id !== post.userId && user.role === "USER") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `User ${user.id} does not have permissions to delete post ${post.id}`,
        });
      }

      await prisma.post.delete({
        where: {
          id: post.id,
        },
        select: {},
      });
    }),
});
