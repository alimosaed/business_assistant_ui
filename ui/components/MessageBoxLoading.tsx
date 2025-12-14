'use client';

import React from 'react';

const MessageBoxLoading = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col space-y-9 w-full pt-8">
      <div className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-2xl max-w-[80%]">
        <div className="flex items-center space-x-2">
          <span className="text-base">{message}</span>
          <div className="flex space-x-1">
            <span className="animate-bounce animation-delay-0">.</span>
            <span className="animate-bounce animation-delay-200">.</span>
            <span className="animate-bounce animation-delay-400">.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBoxLoading;
