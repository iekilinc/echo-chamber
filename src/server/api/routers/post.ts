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
      const { prisma, session } = ctx;
      const { sortingMethod, cursorPostId } = input;

      const limit = 10;
      const isFirstPage: boolean = cursorPostId === undefined;

      const dbPosts = await prisma.post.findMany({
        take: limit + 1,
        skip: isFirstPage ? undefined : 1, // skip fetching the post acting as the cursor
        cursor: { id: cursorPostId },
        orderBy: { createdAt: sortingMethod === "NEWEST" ? "desc" : "asc" },
        select: {
          id: true,
          author: {
            select: {
              displayName: true,
              username: true,
              user: { select: { image: true } },
            },
          },
          body: true,
          // To check if the logged-in user has already liked the post
          postLikes: !session
            ? undefined
            : { where: { likerId: session.profile.id } },
          _count: { select: { postLikes: true } },
        },
      });

      const posts = dbPosts.map((p) => ({
        id: p.id,
        body: p.body,
        author: {
          displayName: p.author.displayName,
          username: p.author.username,
          image: p.author.user.image,
        },
        likeCount: p._count.postLikes,
        alreadyLiked: p.postLikes && p.postLikes.length > 0,
      }));

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
      const { profile } = ctx.session;

      const post = await prisma.post.create({
        data: {
          authorId: profile.id,
          body: input.body,
        },
      });

      return post;
    }),

  delete: protectedProcedure
    .input(z.object({ postId: idSchema }))
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { profile } = ctx.session;

      // As only one can ever have input.postId, we know that this will delete
      // only one post if it succeeds
      const deletedPosts = await prisma.post.deleteMany({
        where: {
          id: input.postId,
          // To uncomment when roles are implemented again
          // OR: [{
          authorId: profile.id,
          // }, { role: "MODERATOR"}]
        },
      });

      if (deletedPosts.count < 1) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `User does not have permissions to delete post`,
        });
      }
    }),
});
