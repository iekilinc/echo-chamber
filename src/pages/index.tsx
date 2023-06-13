import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Navbar } from "../components/navbar";
import { api } from "../utils/api";
import Timeline from "../components/timeline";

const Home: NextPage = () => {
  return (
    <div className="bg-gray-900 text-gray-300">
      <Head>
        <title>Echo Chamber</title>
        <meta
          name="description"
          content="Echo Chamber, the social media site"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="mx-auto flex h-full min-h-screen w-full justify-center sm:max-w-2xl">
        <div className="w-12 flex-none sm:w-28">
          <Navbar />
        </div>
        <Timeline />
      </div>
    </div>
  );
};

export default Home;
