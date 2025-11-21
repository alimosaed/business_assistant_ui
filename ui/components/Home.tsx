'use client';

import { Suspense, useState } from 'react';
import ChatWindow from '@/components/ChatWindow';
import withAuth from '@/components/withAuth';
import Sidebar from './Sidebar';

const Home = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(undefined);

  return (
    <Sidebar selectedChatId={selectedChatId} setSelectedChatId={setSelectedChatId}>
      <div>
        <Suspense>
          <ChatWindow key={selectedChatId} id={selectedChatId} />
        </Suspense>
      </div>
    </Sidebar>
  );
};

export default withAuth(Home);