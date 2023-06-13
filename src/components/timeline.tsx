import { useSession } from "next-auth/react";
import { api } from "../utils/api";
import { Post } from "./post";

export const Timeline: React.FC<{ authorId?: string }> = ({ authorId }) => {
  const { data: session } = useSession();
  console.log({ session });

  const postQuery = api.post.getScrolling.useInfiniteQuery(
    { authorId },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const posts = postQuery.data?.pages.flatMap((page) => page.posts);

  postQuery.hasNextPage;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <main className="flex flex-col gap-[1px] bg-gray-600 p-[1px] w-full">
        {postQuery.isLoading && <h1>Loading</h1>}
        {postQuery.error && <h1>{JSON.stringify(postQuery.error)}</h1>}
        {posts && posts.map((post) => <Post post={post} key={post.id} />)}
      </main>
      {postQuery.hasNextPage && (
        <button
          onClick={() => void postQuery.fetchNextPage()}
          className="rounded-full border-gray-600 bg-slate-800 py-2 px-4"
          disabled={postQuery.isFetchingNextPage}
        >
          Load more
        </button>
      )}
    </div>
  );
};
