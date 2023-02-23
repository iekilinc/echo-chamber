import Image from "next/image";
import { useState } from "react";
import { api, type RouterOutputs } from "../utils/api";
import HeartIconOutline from "@heroicons/react/24/outline/HeartIcon";
import HeartIconSolid from "@heroicons/react/24/solid/HeartIcon";

export const Post: React.FC<
  RouterOutputs["post"]["getScrolling"]["posts"][number]
> = ({ id, author, body, likeCount: initialLikeCount, alreadyLiked }) => {
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

  return (
    <article>
      <div>
        <Image
          src={author.image ?? ""}
          alt={`${author.displayName ?? author.username}'s avatar`}
        />
        <span>
          {author.displayName ?? <p>{author.displayName}</p>}
          <p>@{author.username}</p>
        </span>
      </div>

      <main>{body}</main>

      <div>
        <button
          onClick={() => {
            if (likeState === "CHANGING") return;
            const mutation =
              likeState === "LIKED" ? unlikeMutation : likeMutation;
            return mutation.mutateAsync({ postId: id });
          }}
        >
          {(() => {
            switch (likeState) {
              case "NOT_LIKED":
                return <HeartIconOutline />;
              case "LIKED":
                return <HeartIconSolid />;
              case "CHANGING":
                return <HeartIconSolid className="opacity-50" />;
            }
          })()}
        </button>
        <span>{likeCount}</span>
      </div>
    </article>
  );
};
