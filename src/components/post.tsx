import Image from "next/image";
import { useState } from "react";
import { api, type RouterOutputs } from "../utils/api";
import HeartIconOutline from "@heroicons/react/24/outline/HeartIcon";
import HeartIconSolid from "@heroicons/react/24/solid/HeartIcon";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

export const Post: React.FC<{
  post: RouterOutputs["post"]["getScrolling"]["posts"][number];
}> = ({
  post: {
    id,
    author,
    body,
    createdAt,
    likeCount: initialLikeCount,
    alreadyLiked,
  },
}) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [liked, setLiked] = useState(alreadyLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  // TODO: Add a sign in modal if not signed in
  const likeMutation = api.postLike.create.useMutation({
    onSuccess: () => {
      setLiked(true);
      setLikeCount(likeCount + 1);
    },
  });
  const unlikeMutation = api.postLike.delete.useMutation({
    onSuccess: () => {
      setLiked(false);
      setLikeCount(likeCount - 1);
    },
  });

  const likeState =
    likeMutation.isLoading || unlikeMutation.isLoading
      ? "CHANGING"
      : liked
      ? "LIKED"
      : "NOT_LIKED";

  const LikeIcon =
    likeState === "NOT_LIKED" ? HeartIconOutline : HeartIconSolid;

  return (
    <article className="flex gap-3 border-gray-600 bg-gray-800 px-2 pt-3 overflow-hidden">
      <Image
        // apple-touch-icon.png is 180x180 px
        src={author.image ?? "http://localhost:3000/apple-touch-icon.png"}
        alt={`${author.displayName ?? author.username}'s avatar`}
        width={96}
        height={96}
        className="h-11 w-11 rounded-full"
      />
      <div className="flex w-full flex-col">
        <div className="flex justify-between">
          <Link
            href={`/profile/${author.username}`}
            className="flex gap-1.5 overflow-hidden"
          >
            <h3 className="whitespace-nowrap font-bold text-gray-50">
              {author.displayName ? author.displayName : `@${author.username}`}
            </h3>
            {author.displayName && (
              <span className=" text-[0.95rem] text-gray-400">
                @{author.username}
              </span>
            )}
          </Link>
          <div className="place-self-center text-sm text-gray-400">
            {createdAt.toLocaleDateString()}
          </div>
        </div>
        <main className="mb-1 leading-snug text-gray-200">{body}</main>
        <div className="mb-1 flex gap-0.5">
          <button
            onClick={() => {
              if (!session) {
                return void router.push("/auth/signin");
              }
              if (likeState === "CHANGING") return;
              const mutation =
                likeState === "LIKED" ? unlikeMutation : likeMutation;
              return void mutation.mutateAsync({ postId: id });
            }}
          >
            <LikeIcon
              className={`${likeState === "CHANGING" ? "opacity-40 " : ""}w-4`}
            />
          </button>
          <span className="text-[0.95rem]">{likeCount}</span>
        </div>
      </div>
    </article>
  );
};
