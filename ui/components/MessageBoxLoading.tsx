'use client';

import React from 'react';
import { Settings } from 'lucide-react';

const MessageBoxLoading = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col space-y-9 w-full pt-8">
      <div className="flex items-center space-x-3 px-2 max-w-[80%]">
        <Settings
          className="text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0"
          size={20}
        />
        <span className="text-base text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
          {message}
        </span>
      </div>
    </div>
  );
};

export default MessageBoxLoading;
