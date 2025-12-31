'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import MessageInput from './MessageInput';
import { File, Message } from './ChatWindow';
import MessageBox from './MessageBox';
import MessageBoxLoading from './MessageBoxLoading';

const Chat = ({
  loading,
  messages,
  sendMessage,
  messageAppeared,
  rewrite,
  fileIds,
  setFileIds,
  files,
  setFiles,
  progressMessage,
}: {
  messages: Message[];
  sendMessage: (message: string) => void;
  loading: boolean;
  messageAppeared: boolean;
  rewrite: (messageId: string) => void;
  fileIds: string[];
  setFileIds: (fileIds: string[]) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  progressMessage: string | null;
}) => {
  const [dividerWidth, setDividerWidth] = useState(0);
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const messageEnd = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateDividerWidth = () => {
      if (dividerRef.current) {
        setDividerWidth(dividerRef.current.scrollWidth);
      }
    };

    updateDividerWidth();

    window.addEventListener('resize', updateDividerWidth);

    return () => {
      window.removeEventListener('resize', updateDividerWidth);
    };
  });

  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: 'smooth' });

    if (messages.length === 1) {
      document.title = `${messages[0].content.substring(0, 30)} - Bixpod`;
    }
  }, [messages]);

  return (
    <div className="flex flex-col space-y-6 pt-8 pb-72 lg:pb-64 sm:mx-4 md:mx-8">
      {messages.map((msg, i) => {
        const isLast = i === messages.length - 1;

        return (
          <Fragment key={msg.messageId}>
            <MessageBox
              key={i}
              message={msg}
              messageIndex={i}
              history={messages}
              loading={loading}
              dividerRef={isLast ? dividerRef : undefined}
              isLast={isLast}
              rewrite={rewrite}
              sendMessage={sendMessage}
            />
            {!isLast && msg.role === 'assistant' && (
              <div className="h-px w-full bg-light-secondary dark:bg-dark-secondary" />
            )}
          </Fragment>
        );
      })}
      {loading && !messageAppeared && progressMessage && (
        <MessageBoxLoading message={progressMessage} />
      )}
      <div ref={messageEnd} className="h-0 pb-4" />
      <div
        className="bottom-24 lg:bottom-10 fixed z-40 left-0 right-0 flex justify-center px-4 md:px-8"
      >
        <div
          style={{ width: dividerWidth || '100%', maxWidth: '100%' }}
        >
          <MessageInput
            loading={loading}
            sendMessage={sendMessage}
            fileIds={fileIds}
            setFileIds={setFileIds}
            files={files}
            setFiles={setFiles}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
