import { GetServerSideProps } from "next";

const FireplaceRedirect = () => null;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const mac = params?.mac as string;
  return {
    redirect: {
      destination: `/stove/${mac}`,
      permanent: true, // 301 redirect for SEO
    },
  };
};

export default FireplaceRedirect;
