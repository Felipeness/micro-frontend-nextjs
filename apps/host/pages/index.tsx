import dynamic from 'next/dynamic';

// Create a client-only component for the home page
const ClientHomePage = dynamic(() => import('../src/components/ClientHomePage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function HomePage() {
  return <ClientHomePage />;
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}