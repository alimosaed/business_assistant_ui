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
  DollarSign,
  Video,
  Wrench,
  Package,
  ExternalLink,
  Star,
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
  const [collapsedReasons, setCollapsedReasons] = useState<boolean[]>([]);
  const [steps, setSteps] = useState<{ 
    step_number: string; 
    description: string; 
    details: string;
    requirements: { 
      materials: { 
        name: string; 
        quantity: number; 
        reason: string[];
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
        reason: string[];
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
    video: {
      url: string; 
    }
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
        setCollapsedReasons(new Array(plan.steps.length).fill(true));
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

  const toggleReason = (index: number) => {
    setCollapsedReasons((prev) =>
      prev.map((collapsed, i) => (i === index ? !collapsed : collapsed)),
    );
  };

  const formatReason = (reason: string[]) => {
    return reason.map((line, index) => (
      <li key={index} className="text-base mt-2">
        {line}
      </li>
    ));
  };

  return (
    <div>
      {message.role === 'user' && (
        <div
          className={cn(
            'w-full flex justify-end',
            messageIndex === 0 ? 'pt-16' : 'pt-8',
          )}
        >
          <div className="bg-blue-600 text-white p-4 rounded-2xl max-w-[80%]">
            <p className="text-base whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      )}

      {(message.role === 'assistant' || message.role === 'question') && (
        <div className="flex flex-col space-y-9 w-full">
          <div className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-2xl max-w-[80%]">
            <div
              ref={dividerRef}
              className="flex flex-col space-y-6 w-full"
            >
              {message.sources && message.sources.length > 0 && (
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-row items-center space-x-2">
                    <BookCopy className="text-slate-900 dark:text-slate-100" size={20} />
                    <h3 className="text-slate-900 dark:text-slate-100 font-medium text-xl">
                      Sources
                    </h3>
                  </div>
                  <MessageSources sources={message.sources} />
                </div>
              )}
              <div className="flex flex-col space-y-2">
                <Markdown
                  className={cn(
                    'prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0',
                    'max-w-none break-words text-slate-700 dark:text-slate-300 text-base',
                  )}
                >
                  {parsedMessage}
                </Markdown>
                {loading && isLast ? null : (
                  <div className="flex flex-row items-center justify-between w-full text-slate-900 dark:text-slate-100 py-4 -mx-2">
                    <div className="flex flex-row items-center space-x-1">
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
                        className="p-2 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition duration-200"
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
                  (message.role === 'assistant') &&
                  !loading && (
                    <>
                      <div className="h-px w-full bg-slate-300 dark:bg-slate-600" />
                      <div className="flex flex-col space-y-3 text-slate-900 dark:text-slate-100">
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
                              <div className="h-px w-full bg-slate-300 dark:bg-slate-600" />
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
        </div>
      )}

      {message.role === 'plan' && (
        <div ref={dividerRef} className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 rounded-2xl max-w-[95%]">
          <div className="flex flex-col space-y-4 w-full">
            {steps.map((step, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div
                  className="flex items-center justify-between cursor-pointer p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => toggleStep(index)}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full w-8 h-8 flex items-center justify-center bg-blue-600 text-white font-medium text-sm">
                      {step.step_number}
                    </div>
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                      {step.description}
                    </h3>
                  </div>
                  {collapsedSteps[index] ? (
                    <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                  )}
                </div>
                
                {!collapsedSteps[index] && (
                  <div className="p-4 pt-0 space-y-4">
                    {step.details && (
                      <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                        {step.details}
                      </p>
                    )}

                    {/* Training Video */}
                    {step.video && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Video className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <a
                          href={step.video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-sm"
                        >
                          Watch Training Video
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    <div className="h-px bg-slate-200 dark:bg-slate-700" />

                    {/* Materials Section */}
                    {step.requirements.materials.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Package className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">Required Materials</h4>
                        </div>
                        <div className="space-y-3">
                          {step.requirements.materials.map((material, matIndex) => (
                            <MaterialToolItem
                              key={matIndex}
                              item={material}
                              index={matIndex}
                              isCollapsed={collapsedReasons[matIndex]}
                              onToggle={() => toggleReason(matIndex)}
                              formatReason={formatReason}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tools Section */}
                    {step.requirements.tools.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Wrench className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">Required Tools</h4>
                        </div>
                        <div className="space-y-3">
                          {step.requirements.tools.map((tool, toolIndex) => (
                            <MaterialToolItem
                              key={toolIndex}
                              item={tool}
                              index={toolIndex}
                              isCollapsed={collapsedReasons[toolIndex]}
                              onToggle={() => toggleReason(toolIndex)}
                              formatReason={formatReason}
                            />
                          ))}
                        </div>
                      </div>
                    )}
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

// Separate component for Material/Tool items with improved styling
function MaterialToolItem({
  item,
  index,
  isCollapsed,
  onToggle,
  formatReason
}: {
  item: any;
  index: number;
  isCollapsed: boolean;
  onToggle: () => void;
  formatReason: (reason: string[]) => JSX.Element[];
}) {
  const [showPurchaseOptions, setShowPurchaseOptions] = useState(false);

  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-900 dark:text-slate-100 font-medium">{item.name}</span>
            <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-sm">
              {item.quantity} {item.unit}
            </span>
          </div>
        </div>
        {item.recommended && item.recommended.length > 0 && (
          <button
            onClick={() => setShowPurchaseOptions(!showPurchaseOptions)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 ml-2 text-sm underline flex-shrink-0"
          >
            {showPurchaseOptions ? 'Hide' : 'Buy'}
          </button>
        )}
      </div>

      {/* Purchase Options */}
      {showPurchaseOptions && item.recommended && item.recommended.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
          {item.recommended.map((option: any, idx: number) => (
            <a
              key={idx}
              href={option.detail_page_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors group"
            >
              {option.images?.primary?.medium?.url && (
                <img
                  src={option.images.primary.medium.url}
                  alt={option.title}
                  className="w-12 h-12 object-cover rounded border border-slate-300 dark:border-slate-600"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {option.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-900 dark:text-slate-100 font-medium flex items-center">
                    <DollarSign size={14} className="mr-0.5" />
                    {option.price} {option.currency}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0" />
            </a>
          ))}
        </div>
      )}

      {/* Why do you need section */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={onToggle}
        >
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Why do you need this?
          </h4>
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          )}
        </div>
        {!isCollapsed && (
          <ul className="list-disc pl-5 mt-2 space-y-1">
            {formatReason(item.reason)}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MessageBox;
