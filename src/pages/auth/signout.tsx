import type { NextPage } from "next";
import { Layout } from "../../components/layout";
import { signOut } from "next-auth/react";

const SignOut: NextPage = () => {
  void signOut();
  return <Layout title="Sign out" Slot={() => <div />} />;
};

export default SignOut;
