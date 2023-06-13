import type {
  InferGetServerSidePropsType,
  GetServerSideProps,
  NextPage,
} from "next";
import { Layout } from "../../components/layout";
import { Timeline } from "../../components/timeline";
import { prisma } from "../../server/db";

export const getServerSideProps: GetServerSideProps<{
  id: string;
  username: string;
}> = async (ctx) => {
  if (typeof ctx?.params?.username !== "string") {
    return { notFound: true };
  }
  const { username } = ctx.params;

  const profile = await prisma.profile.findFirst({
    where: { username },
    select: { id: true },
  });
  if (!profile) {
    return { notFound: true };
  }

  return {
    props: {
      id: profile.id,
      username,
    },
  };
};

const Profile = ({
  id,
  username,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return <Layout title={username} Slot={() => <Timeline authorId={id} />} />;
};

export default Profile;
