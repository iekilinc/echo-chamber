import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { api } from "../utils/api";
import Timeline from "../components/timeline";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Echo Chamber</title>
        <meta name="description" content="Social media site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen w-full justify-items-center bg-black text-neutral-100">
        <Timeline />
      </div>
    </>
  );
};

export default Home;
