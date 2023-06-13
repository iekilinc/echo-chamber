import type { NextPage } from "next";
import { Layout } from "../components/layout";
import { Timeline } from "../components/timeline";

const Home: NextPage = () => {
  return <Layout Slot={Timeline} />;
};

export default Home;
