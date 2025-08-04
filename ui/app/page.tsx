import HomeComponent from '@/components/Home';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bixpod',
  description: 'Build everything faster.',
};

const Home = () => {
  return <HomeComponent />;
};

export default Home;
