import { signIn, signOut, useSession } from "next-auth/react";
import { api } from "../utils/api";
import { Post } from "./post";

const Timeline: React.FC = () => {
  // const postQuery = api.post.getScrolling.useInfiniteQuery(
  //   {},
  //   {
  //     getNextPageParam: (lastPage) => lastPage.nextCursor,
  //   }
  // );
  const { data: session } = useSession();
  const postQuery = api.post.getMany.useQuery();

  console.log({ session });

  return (
    <main className="mx-auto flex max-w-lg flex-col py-4 sm:max-w-2xl">
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={session ? () => void signOut() : () => void signIn()}
      >
        {session ? "Sign out" : "Sign in"}
      </button>
      {postQuery.isLoading && <h1>Loading</h1>}
      {postQuery.error && <h1>{JSON.stringify(postQuery.error)}</h1>}
      {/* {postQuery.data &&
        postQuery.data.pages.flatMap(({ posts }) =>
          posts.map((post) => <Post post={post} key={post.id} />)
        )} */}
      {postQuery.data &&
        postQuery.data.map((post) => <Post post={post} key={post.id} />)}
    </main>
  );
};

export default Timeline;