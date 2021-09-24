const Index = () => {
  return null;
};

export default Index;

export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/dashboard",
      permanent: true,
    },
  };
}
