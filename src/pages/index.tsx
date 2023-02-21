import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../utils/api";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Echo Chamber</title>
        <meta name="description" content="Social media site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>Init</main>
    </>
  );
};

export default Home;
