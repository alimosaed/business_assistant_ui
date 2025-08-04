'use client';

import { Suspense } from 'react';
import ChatWindow from '@/components/ChatWindow';
import withAuth from '@/components/withAuth';
import Sidebar from './Sidebar';

const Home = () => {
  return (
    <Sidebar>
      <div>
        <Suspense>
          <ChatWindow />
        </Suspense>
      </div>
    </Sidebar>
  );
};

export default withAuth(Home);