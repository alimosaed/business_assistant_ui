'use client';

/* eslint-disable @next/next/no-img-element */
import React, { MutableRefObject, useEffect, useState } from 'react';
import { Message } from './ChatWindow';
import { cn } from '@/lib/utils';
import {
  BookCopy,
  Disc3,
  Volume2,
  StopCircle,
  Layers3,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import Copy from './MessageActions/Copy';
import Rewrite from './MessageActions/Rewrite';
import MessageSources from './MessageSources';
import SearchImages from './SearchImages';
import { useSpeech } from 'react-text-to-speech';

const MessageBox = ({
  message,
  messageIndex,
  history,
  loading,
  dividerRef,
  isLast,
  rewrite,
  sendMessage,
}: {
  message: Message;
  messageIndex: number;
  history: Message[];
  loading: boolean;
  dividerRef?: MutableRefObject<HTMLDivElement | null>;
  isLast: boolean;
  rewrite: (messageId: string) => void;
  sendMessage: (message: string) => void;
}) => {
  const [parsedMessage, setParsedMessage] = useState(message.content);
  const [speechMessage, setSpeechMessage] = useState(message.content);
  const [collapsedSteps, setCollapsedSteps] = useState<boolean[]>([]);
  const [steps, setSteps] = useState<{ 
    step_number: string; 
    description: string; 
    details: string;
    requirements: { 
      materials: { 
        name: string; 
        quantity: number; 
        unit: string; 
        recommended: { 
                asin: string; 
                detail_page_url: string; 
                title: string ; 
                manufacturer: string; 
                images: { 
                  primary: { 
                    medium: { 
                      url: string; 
                      height: number; 
                      width: number; 
                    }; 
                  }; 
                }; 
                price: number;
                currency: string; 
        }[]; 
      }[]; 
      tools: { 
        name: string; 
        quantity: number; 
        unit: string; 
        recommended: { 
                asin: string; 
                detail_page_url: string; 
                title: string; 
                manufacturer: string;  
                images: { 
                  primary: { 
                    medium: { 
                      url: string; 
                      height: number; 
                      width: number; 
                    }; 
                  }; 
                }; 
                price: number;
                currency: string; 
        }[]; 
      }[]; 
    }; 
    video: string; 
  }[]>([]);

  useEffect(() => {
    const regex = /\[(\d+)\]/g;

    if (
      message.role === 'assistant' &&
      message?.sources &&
      message.sources.length > 0
    ) {
      return setParsedMessage(
        message.content.replace(
          regex,
          (_, number) =>
            `<a href="${message.sources?.[number - 1]?.metadata?.url}" target="_blank" className="bg-light-secondary dark:bg-dark-secondary px-1 rounded ml-1 no-underline text-xs text-black/70 dark:text-white/70 relative">${number}</a>`,
        ),
      );
    }

    setSpeechMessage(message.content.replace(regex, ''));
    setParsedMessage(message.content);
  }, [message.content, message.sources, message.role]);

  useEffect(() => {
    if (message.role === 'plan') {
      try {
        const plan = JSON.parse(message.content);
        setSteps(plan.steps);
        setCollapsedSteps(new Array(plan.steps.length).fill(true));
        console.log('Plan:', plan);
      } catch (error) {
        console.error('Failed to parse plan:', error);
      }
    }
  }, [message.content, message.role]);

  const { speechStatus, start, stop } = useSpeech({ text: speechMessage });

  const toggleStep = (index: number) => {
    setCollapsedSteps((prev) =>
      prev.map((collapsed, i) => (i === index ? !collapsed : collapsed)),
    );
  };

  return (
    <div>
      {message.role === 'user' && (
        <div className={cn('w-full', messageIndex === 0 ? 'pt-16' : 'pt-8')}>
          <h2 className="text-black dark:text-white font-medium text-3xl lg:w-9/12">
            {message.content}
          </h2>
        </div>
      )}

      {(message.role === 'assistant' || message.role === 'question') && (
        <div className="flex flex-col space-y-9 w-full">
          <div
            ref={dividerRef}
            className="flex flex-col space-y-6 w-full"
          >
            {message.sources && message.sources.length > 0 && (
              <div className="flex flex-col space-y-2">
                <div className="flex flex-row items-center space-x-2">
                  <BookCopy className="text-black dark:text-white" size={20} />
                  <h3 className="text-black dark:text-white font-medium text-xl">
                    Sources
                  </h3>
                </div>
                <MessageSources sources={message.sources} />
              </div>
            )}
            <div className="flex flex-col space-y-2">
              <div className="flex flex-row items-center space-x-2">
                <Disc3
                  className={cn(
                    'text-black dark:text-white',
                    isLast && loading ? 'animate-spin' : 'animate-none',
                  )}
                  size={20}
                />
                <h3 className="text-black dark:text-white font-medium text-xl">
                  {message.role === 'question' ? 'Question' : 'Answer'}
                </h3>
              </div>
              <Markdown
                className={cn(
                  'prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0',
                  'max-w-none break-words text-black dark:text-white text-sm md:text-base font-medium',
                )}
              >
                {parsedMessage}
              </Markdown>
              {loading && isLast ? null : (
                <div className="flex flex-row items-center justify-between w-full text-black dark:text-white py-4 -mx-2">
                  <div className="flex flex-row items-center space-x-1">
                    {/*  <button className="p-2 text-black/70 dark:text-white/70 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black text-black dark:hover:text-white">
                      <Share size={18} />
                    </button> */}
                    <Rewrite rewrite={rewrite} messageId={message.messageId} />
                  </div>
                  <div className="flex flex-row items-center space-x-1">
                    <Copy initialMessage={message.content} message={message} />
                    <button
                      onClick={() => {
                        if (speechStatus === 'started') {
                          stop();
                        } else {
                          start();
                        }
                      }}
                      className="p-2 text-black/70 dark:text-white/70 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white"
                    >
                      {speechStatus === 'started' ? (
                        <StopCircle size={18} />
                      ) : (
                        <Volume2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              )}
              {isLast &&
                message.suggestions &&
                message.suggestions.length > 0 &&
                message.role === 'assistant' &&
                !loading && (
                  <>
                    <div className="h-px w-full bg-light-secondary dark:bg-dark-secondary" />
                    <div className="flex flex-col space-y-3 text-black dark:text-white">
                      <div className="flex flex-row items-center space-x-2 mt-4">
                        <Layers3 />
                        <h3 className="text-xl font-medium">Related</h3>
                      </div>
                      <div className="flex flex-col space-y-3">
                        {message.suggestions.map((suggestion, i) => (
                          <div
                            className="flex flex-col space-y-3 text-sm"
                            key={i}
                          >
                            <div className="h-px w-full bg-light-secondary dark:bg-dark-secondary" />
                            <div
                              onClick={() => {
                                sendMessage(suggestion);
                              }}
                              className="cursor-pointer flex flex-row justify-between font-medium space-x-2 items-center"
                            >
                              <p className="transition duration-200 hover:text-[#24A0ED]">
                                {suggestion}
                              </p>
                              <Plus
                                size={20}
                                className="text-[#24A0ED] flex-shrink-0"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
            </div>
          </div>
        </div>
      )}

      {message.role === 'plan' && (
        <div className="flex flex-col space-y-6 w-full">
          <div className="flex flex-col space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleStep(index)}
                >
                  <h3 className="text-black dark:text-white font-medium text-xl">
                    Step {step.step_number}: {step.description}
                  </h3>
                  {collapsedSteps[index] ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronUp size={20} />
                  )}
                </div>
                {!collapsedSteps[index] && (
                  <div className="mt-2 text-black dark:text-white">
                    {step.details && (
                      <p className="text-sm text-gray-500 mt-2">{step.details}</p>
                    )}
                    {step.video && (
                      <div className="mb-4">
                        <iframe
                          width="100%"
                          height="315"
                          src={step.video}
                          title={`Step ${step.step_number} Video`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                    {step.requirements.materials.length > 0 && step.requirements.materials.map((material, matIndex) => (
                      <div key={matIndex} className="flex flex-col space-y-4 mb-4">
                        <p>{material.name} ({material.quantity} {material.unit})</p>
                        {material.recommended && material.recommended.length > 0 && (
                          <div className="flex flex-col space-y-2">
                            {material.recommended.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-center space-x-4 border p-2 rounded-lg">
                                {item.detail_page_url && (
                                  <a href={item.detail_page_url} target="_blank" rel="noopener noreferrer">
                                    <img src={item.images.primary.medium.url} alt={item.title} className="w-16 h-16 object-cover border-2 border-gray-300 rounded-md" />
                                  </a>
                                )}
                                <div className="flex flex-col">
                                  {item.detail_page_url && (
                                    <a href={item.detail_page_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                      {item.title}
                                    </a>
                                  )}
                                  <p className="text-sm text-gray-500">{item.manufacturer}</p>
                                  <p className="text-lg font-bold">{item.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {step.requirements.tools.length > 0 && step.requirements.tools.map((tool, toolIndex) => (
                      <div key={toolIndex} className="flex flex-col space-y-4 mb-4">
                        <p>{tool.name} ({tool.quantity} {tool.unit})</p>
                        {tool.recommended && tool.recommended.length > 0 && (
                          <div className="flex flex-col space-y-2">
                            {tool.recommended.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-center space-x-4 border p-2 rounded-lg">
                                {item.detail_page_url && (
                                  <a href={item.detail_page_url} target="_blank" rel="noopener noreferrer">
                                    <img src={item.images.primary.medium.url} alt={item.title} className="w-16 h-16 object-cover border-2 border-gray-300 rounded-md" />
                                  </a>
                                )}
                                <div className="flex flex-col">
                                  {item.detail_page_url && (
                                    <a href={item.detail_page_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                      {item.title}
                                    </a>
                                  )}
                                  <p className="text-sm text-gray-500">{item.manufacturer}</p>
                                  <p className="text-lg font-bold">{item.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBox;
