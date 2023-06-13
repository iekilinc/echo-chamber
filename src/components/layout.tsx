import type { FC } from "react";
import { Navbar } from "./navbar";
import Head from "next/head";

export const Layout: FC<{ Slot: FC; title?: string }> = ({ Slot, title }) => {
  return (
    <div className="bg-gray-900 text-gray-300">
      <Head>
        <title>{(title ? `${title} ⸱ ` : "") + "Echo Chamber"}</title>
        <meta
          name="description"
          content="Echo Chamber, the social media site"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="mx-auto flex h-full min-h-screen w-full justify-center sm:w-[640px] md:w-[768px]">
        <div className="w-12 flex-none sm:w-32">
          <Navbar />
        </div>
        <div className="w-full py-5">
          <Slot />
        </div>
      </div>
    </div>
  );
};
