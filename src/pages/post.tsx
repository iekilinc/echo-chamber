import type { NextPage } from "next";
import { Layout } from "../components/layout";
import { useState, type FC } from "react";
import { api } from "../utils/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { bodyMaxLength, bodyMinLength } from "../utils/schemas";

const Input: FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  if (!session) {
    void router.push("/404");
  }
  const postMutation = api.post.create.useMutation();
  const [postContent, setPostContent] = useState("");

  const handlePost = () => {
    postMutation.mutate({ body: postContent });
  };

  if (postMutation.isSuccess) {
    void router.push("/");
  }

  return (
    <main className="flex w-full flex-col gap-4">
      <div className="bg-slate-800">
        <textarea
          rows={10}
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          className="w-full resize-none bg-slate-800 px-5 py-2 text-lg text-white"
        ></textarea>
        <div className="ml-auto w-max text-gray-400">
          <span
            className={
              postContent.length < bodyMinLength ||
              postContent.length > bodyMaxLength
                ? "text-red-500"
                : ""
            }
          >
            {postContent.length}
          </span>
          <span> / </span>
          <span>{bodyMaxLength}</span>
        </div>
      </div>
      <button
        className="place-self-end rounded-full border border-gray-600 bg-slate-800 py-2 px-4"
        onClick={handlePost}
      >
        Post
      </button>
    </main>
  );
};

const Post: NextPage = () => {
  return <Layout title="Post" Slot={Input} />;
};

export default Post;
