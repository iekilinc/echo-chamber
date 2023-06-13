import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getProviders, signIn } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../server/auth";
import { Layout } from "../../components/layout";

const SignIn = ({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <Layout
      title="Sign in"
      Slot={() => (
        <ul className="flex w-full flex-col">
          {Object.values(providers).map((provider) => (
            <li
              key={provider.name}
              className="rounded-full border border-gray-600 bg-slate-800 px-5 py-3 text-lg text-gray-100 text-center"
            >
              <button onClick={() => void signIn(provider.id)}>
                Sign in with <span className="font-bold">{provider.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    />
  );
};

export default SignIn;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session) {
    return { redirect: { destination: "/" } };
  }

  const providers = await getProviders();

  return {
    props: { providers: providers ?? [] },
  };
};
