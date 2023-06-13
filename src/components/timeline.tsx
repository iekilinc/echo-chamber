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
    <main className="flex flex-col gap-[1px] bg-gray-600">
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
