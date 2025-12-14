import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { CloudUpload, RefreshCcw, RefreshCw } from 'lucide-react';
import React, {
  Fragment,
  useEffect,
  useState,
  type SelectHTMLAttributes,
} from 'react';
import ThemeSwitcher from './theme/Switcher';
import { apiGet, apiPost } from '@/lib/api';

interface TokenUsage {
  user_id: string;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
  last_updated: string;
}

interface CreditBalance {
  user_id: string;
  credit_balance: number;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = ({ className, ...restProps }: InputProps) => {
  return (
    <input
      {...restProps}
      className={cn(
        'bg-light-secondary dark:bg-dark-secondary px-3 py-2 flex items-center overflow-hidden border border-light-200 dark:border-dark-200 dark:text-white rounded-lg text-sm',
        className,
      )}
    />
  );
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string; disabled?: boolean }[];
}

export const Select = ({ className, options, ...restProps }: SelectProps) => {
  return (
    <select
      {...restProps}
      className={cn(
        'bg-light-secondary dark:bg-dark-secondary px-3 py-2 flex items-center overflow-hidden border border-light-200 dark:border-dark-200 dark:text-white rounded-lg text-sm',
        className,
      )}
    >
      {options.map(({ label, value, disabled }) => {
        return (
          <option key={value} value={value} disabled={disabled}>
            {label}
          </option>
        );
      })}
    </select>
  );
};

interface SettingsType {
  chatModelProviders: {
    [key: string]: [Record<string, any>];
  };
  embeddingModelProviders: {
    [key: string]: [Record<string, any>];
  };
  openaiApiKey: string;
  groqApiKey: string;
  anthropicApiKey: string;
  geminiApiKey: string;
  ollamaApiUrl: string;
}

const SettingsDialog = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [config, setConfig] = useState<SettingsType | null>(null);
  const [chatModels, setChatModels] = useState<Record<string, any>>({});
  const [embeddingModels, setEmbeddingModels] = useState<Record<string, any>>(
    {},
  );
  const [selectedChatModelProvider, setSelectedChatModelProvider] = useState<
    string | null
  >(null);
  const [selectedChatModel, setSelectedChatModel] = useState<string | null>(
    null,
  );
  const [selectedEmbeddingModelProvider, setSelectedEmbeddingModelProvider] =
    useState<string | null>(null);
  const [selectedEmbeddingModel, setSelectedEmbeddingModel] = useState<
    string | null
  >(null);
  const [customOpenAIApiKey, setCustomOpenAIApiKey] = useState<string>('');
  const [customOpenAIBaseURL, setCustomOpenAIBaseURL] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [isLoadingTokenUsage, setIsLoadingTokenUsage] = useState(false);
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [isLoadingCreditBalance, setIsLoadingCreditBalance] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchConfig = async () => {
        setIsLoading(true);
        try {
          const data = await apiGet<SettingsType>(
            `${process.env.NEXT_PUBLIC_API_URL}/config`,
            { skipAuthRedirect: true }
          );
          setConfig(data);

          const chatModelProvidersKeys = Object.keys(
            data.chatModelProviders || {},
          );
          const embeddingModelProvidersKeys = Object.keys(
            data.embeddingModelProviders || {},
          );

          const defaultChatModelProvider =
            chatModelProvidersKeys.length > 0 ? chatModelProvidersKeys[0] : '';
          const defaultEmbeddingModelProvider =
            embeddingModelProvidersKeys.length > 0
              ? embeddingModelProvidersKeys[0]
              : '';

          const chatModelProvider =
            localStorage.getItem('chatModelProvider') ||
            defaultChatModelProvider ||
            '';
          const chatModel =
            localStorage.getItem('chatModel') ||
            (data.chatModelProviders &&
            data.chatModelProviders[chatModelProvider]?.length > 0
              ? data.chatModelProviders[chatModelProvider][0].name
              : undefined) ||
            '';
          const embeddingModelProvider =
            localStorage.getItem('embeddingModelProvider') ||
            defaultEmbeddingModelProvider ||
            '';
          const embeddingModel =
            localStorage.getItem('embeddingModel') ||
            (data.embeddingModelProviders &&
              data.embeddingModelProviders[embeddingModelProvider]?.[0].name) ||
            '';

          setSelectedChatModelProvider(chatModelProvider);
          setSelectedChatModel(chatModel);
          setSelectedEmbeddingModelProvider(embeddingModelProvider);
          setSelectedEmbeddingModel(embeddingModel);
          setCustomOpenAIApiKey(localStorage.getItem('openAIApiKey') || '');
          setCustomOpenAIBaseURL(localStorage.getItem('openAIBaseURL') || '');
          setChatModels(data.chatModelProviders || {});
          setEmbeddingModels(data.embeddingModelProviders || {});
        } catch (error) {
          console.error('Failed to fetch config:', error);
          // Don't redirect here - allow theme switching even if config fails
        } finally {
          setIsLoading(false);
        }
      };

      const fetchTokenUsage = async () => {
        setIsLoadingTokenUsage(true);
        try {
          const data = await apiGet<TokenUsage>(
            `${process.env.NEXT_PUBLIC_API_URL}/token-usage/me`,
            { skipAuthRedirect: true }
          );
          setTokenUsage(data);
        } catch (error) {
          console.error('Failed to fetch token usage:', error);
          // Silently fail - token usage is optional information
        } finally {
          setIsLoadingTokenUsage(false);
        }
      };

      const fetchCreditBalance = async () => {
        setIsLoadingCreditBalance(true);
        try {
          const data = await apiGet<CreditBalance>(
            `${process.env.NEXT_PUBLIC_API_URL}/token-usage/credit/me`,
            { skipAuthRedirect: true }
          );
          setCreditBalance(data);
        } catch (error) {
          console.error('Failed to fetch credit balance:', error);
          // Silently fail - credit balance is optional information
        } finally {
          setIsLoadingCreditBalance(false);
        }
      };

      fetchConfig();
      fetchTokenUsage();
      fetchCreditBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async () => {
    setIsUpdating(true);

    try {
      await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/config`, config);

      localStorage.setItem('chatModelProvider', selectedChatModelProvider!);
      localStorage.setItem('chatModel', selectedChatModel!);
      localStorage.setItem(
        'embeddingModelProvider',
        selectedEmbeddingModelProvider!,
      );
      localStorage.setItem('embeddingModel', selectedEmbeddingModel!);
      localStorage.setItem('openAIApiKey', customOpenAIApiKey!);
      localStorage.setItem('openAIBaseURL', customOpenAIBaseURL!);
    } catch (err) {
      console.log(err);
    } finally {
      setIsUpdating(false);
      setIsOpen(false);

      window.location.reload();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsOpen(false)}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-white/50 dark:bg-black/50" />
        </TransitionChild>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-200"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform rounded-2xl bg-light-secondary dark:bg-dark-secondary border border-light-200 dark:border-dark-200 p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle className="text-xl font-medium leading-6 dark:text-white">
                  Settings
                </DialogTitle>
                {!isLoading && (
                  <div className="flex flex-col space-y-4 mt-6">
                    <div className="flex flex-col space-y-1">
                      <p className="text-black/70 dark:text-white/70 text-sm">
                        Theme
                      </p>
                      <ThemeSwitcher />
                    </div>

                    {/* Token Usage Section */}
                    <div className="flex flex-col space-y-1">
                      <p className="text-black/70 dark:text-white/70 text-sm">
                        Token Usage
                      </p>
                      <div className="bg-light-primary dark:bg-dark-primary px-4 py-3 rounded-lg border border-light-200 dark:border-dark-200">
                        {isLoadingTokenUsage ? (
                          <div className="flex items-center justify-center py-2">
                            <RefreshCcw className="animate-spin text-black/50 dark:text-white/50" size={16} />
                          </div>
                        ) : tokenUsage ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-black/70 dark:text-white/70">Total Cost:</span>
                              <span className="font-semibold text-black dark:text-white">
                                ${tokenUsage.total_cost.toFixed(4)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-black/70 dark:text-white/70">Input Tokens:</span>
                              <span className="text-black dark:text-white">
                                {tokenUsage.total_input_tokens.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-black/70 dark:text-white/70">Output Tokens:</span>
                              <span className="text-black dark:text-white">
                                {tokenUsage.total_output_tokens.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-light-200 dark:border-dark-200">
                              <span className="text-black/50 dark:text-white/50 text-xs">Last Updated:</span>
                              <span className="text-black/50 dark:text-white/50 text-xs">
                                {new Date(tokenUsage.last_updated).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-black/50 dark:text-white/50 text-sm text-center py-2">
                            No usage data available
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Credit Balance Section */}
                    <div className="flex flex-col space-y-1">
                      <p className="text-black/70 dark:text-white/70 text-sm">
                        Credit Balance
                      </p>
                      <div className="bg-light-primary dark:bg-dark-primary px-4 py-3 rounded-lg border border-light-200 dark:border-dark-200">
                        {isLoadingCreditBalance ? (
                          <div className="flex items-center justify-center py-2">
                            <RefreshCcw className="animate-spin text-black/50 dark:text-white/50" size={16} />
                          </div>
                        ) : creditBalance ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-black/70 dark:text-white/70">Available Balance:</span>
                              <span className={cn(
                                "font-semibold text-lg",
                                creditBalance.credit_balance <= 0
                                  ? "text-red-600 dark:text-red-400"
                                  : creditBalance.credit_balance < 1.0
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : "text-green-600 dark:text-green-400"
                              )}>
                                ${creditBalance.credit_balance.toFixed(2)}
                              </span>
                            </div>
                            {creditBalance.credit_balance <= 0 && (
                              <div className="pt-2 border-t border-light-200 dark:border-dark-200">
                                <p className="text-red-600 dark:text-red-400 text-xs">
                                  ⚠️ Your balance is insufficient. Please recharge to continue.
                                </p>
                              </div>
                            )}
                            {creditBalance.credit_balance > 0 && creditBalance.credit_balance < 1.0 && (
                              <div className="pt-2 border-t border-light-200 dark:border-dark-200">
                                <p className="text-yellow-600 dark:text-yellow-400 text-xs">
                                  ⚠️ Low balance. Consider recharging soon.
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-black/50 dark:text-white/50 text-sm text-center py-2">
                            No balance data available
                          </p>
                        )}
                      </div>
                    </div>

{/*
                    {config.chatModelProviders && (
                      <div className="flex flex-col space-y-1">
                        <p className="text-black/70 dark:text-white/70 text-sm">
                          Chat model Provider
                        </p>
                        <Select
                          value={selectedChatModelProvider ?? undefined}
                          onChange={(e) => {
                            setSelectedChatModelProvider(e.target.value);
                            if (e.target.value === 'custom_openai') {
                              setSelectedChatModel('');
                            } else {
                              setSelectedChatModel(
                                config.chatModelProviders[e.target.value][0]
                                  .name,
                              );
                            }
                          }}
                          options={Object.keys(config.chatModelProviders).map(
                            (provider) => ({
                              value: provider,
                              label:
                                provider.charAt(0).toUpperCase() +
                                provider.slice(1),
                            }),
                          )}
                        />
                      </div>
                    )}
                    {selectedChatModelProvider &&
                      selectedChatModelProvider != 'custom_openai' && (
                        <div className="flex flex-col space-y-1">
                          <p className="text-black/70 dark:text-white/70 text-sm">
                            Chat Model
                          </p>
                          <Select
                            value={selectedChatModel ?? undefined}
                            onChange={(e) =>
                              setSelectedChatModel(e.target.value)
                            }
                            options={(() => {
                              const chatModelProvider =
                                config.chatModelProviders[
                                  selectedChatModelProvider
                                ];

                              return chatModelProvider
                                ? chatModelProvider.length > 0
                                  ? chatModelProvider.map((model) => ({
                                      value: model.name,
                                      label: model.displayName,
                                    }))
                                  : [
                                      {
                                        value: '',
                                        label: 'No models available',
                                        disabled: true,
                                      },
                                    ]
                                : [
                                    {
                                      value: '',
                                      label:
                                        'Invalid provider, please check backend logs',
                                      disabled: true,
                                    },
                                  ];
                            })()}
                          />
                        </div>
                      )}
                    {selectedChatModelProvider &&
                      selectedChatModelProvider === 'custom_openai' && (
                        <>
                          <div className="flex flex-col space-y-1">
                            <p className="text-black/70 dark:text-white/70 text-sm">
                              Model name
                            </p>
                            <Input
                              type="text"
                              placeholder="Model name"
                              defaultValue={selectedChatModel!}
                              onChange={(e) =>
                                setSelectedChatModel(e.target.value)
                              }
                            />
                          </div>
                          <div className="flex flex-col space-y-1">
                            <p className="text-black/70 dark:text-white/70 text-sm">
                              Custom OpenAI API Key
                            </p>
                            <Input
                              type="text"
                              placeholder="Custom OpenAI API Key"
                              defaultValue={customOpenAIApiKey!}
                              onChange={(e) =>
                                setCustomOpenAIApiKey(e.target.value)
                              }
                            />
                          </div>
                          <div className="flex flex-col space-y-1">
                            <p className="text-black/70 dark:text-white/70 text-sm">
                              Custom OpenAI Base URL
                            </p>
                            <Input
                              type="text"
                              placeholder="Custom OpenAI Base URL"
                              defaultValue={customOpenAIBaseURL!}
                              onChange={(e) =>
                                setCustomOpenAIBaseURL(e.target.value)
                              }
                            />
                          </div>
                        </>
                      )}
                    {config.embeddingModelProviders && (
                      <div className="flex flex-col space-y-1">
                        <p className="text-black/70 dark:text-white/70 text-sm">
                          Embedding model Provider
                        </p>
                        <Select
                          value={selectedEmbeddingModelProvider ?? undefined}
                          onChange={(e) => {
                            setSelectedEmbeddingModelProvider(e.target.value);
                            setSelectedEmbeddingModel(
                              config.embeddingModelProviders[e.target.value][0]
                                .name,
                            );
                          }}
                          options={Object.keys(
                            config.embeddingModelProviders,
                          ).map((provider) => ({
                            label:
                              provider.charAt(0).toUpperCase() +
                              provider.slice(1),
                            value: provider,
                          }))}
                        />
                      </div>
                    )}
                    {selectedEmbeddingModelProvider && (
                      <div className="flex flex-col space-y-1">
                        <p className="text-black/70 dark:text-white/70 text-sm">
                          Embedding Model
                        </p>
                        <Select
                          value={selectedEmbeddingModel ?? undefined}
                          onChange={(e) =>
                            setSelectedEmbeddingModel(e.target.value)
                          }
                          options={(() => {
                            const embeddingModelProvider =
                              config.embeddingModelProviders[
                                selectedEmbeddingModelProvider
                              ];

                            return embeddingModelProvider
                              ? embeddingModelProvider.length > 0
                                ? embeddingModelProvider.map((model) => ({
                                    label: model.displayName,
                                    value: model.name,
                                  }))
                                : [
                                    {
                                      label: 'No embedding models available',
                                      value: '',
                                      disabled: true,
                                    },
                                  ]
                              : [
                                  {
                                    label:
                                      'Invalid provider, please check backend logs',
                                    value: '',
                                    disabled: true,
                                  },
                                ];
                          })()}
                        />
                      </div>
                    )}
                    <div className="flex flex-col space-y-1">
                      <p className="text-black/70 dark:text-white/70 text-sm">
                        OpenAI API Key
                      </p>
                      <Input
                        type="text"
                        placeholder="OpenAI API Key"
                        defaultValue={config.openaiApiKey}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            openaiApiKey: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-black/70 dark:text-white/70 text-sm">
                        Ollama API URL
                      </p>
                      <Input
                        type="text"
                        placeholder="Ollama API URL"
                        defaultValue={config.ollamaApiUrl}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            ollamaApiUrl: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-black/70 dark:text-white/70 text-sm">
                        GROQ API Key
                      </p>
                      <Input
                        type="text"
                        placeholder="GROQ API Key"
                        defaultValue={config.groqApiKey}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            groqApiKey: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-black/70 dark:text-white/70 text-sm">
                        Anthropic API Key
                      </p>
                      <Input
                        type="text"
                        placeholder="Anthropic API key"
                        defaultValue={config.anthropicApiKey}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            anthropicApiKey: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-black/70 dark:text-white/70 text-sm">
                        Gemini API Key
                      </p>
                      <Input
                        type="text"
                        placeholder="Gemini API key"
                        defaultValue={config.geminiApiKey}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            geminiApiKey: e.target.value,
                          })
                        }
                      />
                    </div> */}
                  </div>
                )}
                
                {isLoading && (
                  <div className="w-full flex items-center justify-center mt-6 text-black/70 dark:text-white/70 py-6">
                    <RefreshCcw className="animate-spin" />
                  </div>
                )}
                <div className="w-full mt-6 space-y-2">
                  <p className="text-xs text-black/50 dark:text-white/50">
                    We&apos;ll refresh the page after updating the settings.
                  </p>
                  <button
                    onClick={handleSubmit}
                    className="bg-[#24A0ED] flex flex-row items-center space-x-2 text-white disabled:text-white/50 hover:bg-opacity-85 transition duration-100 disabled:bg-[#ececec21] rounded-full px-4 py-2"
                    disabled={isLoading || isUpdating}
                  >
                    {isUpdating ? (
                      <RefreshCw size={20} className="animate-spin" />
                    ) : (
                      <CloudUpload size={20} />
                    )}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SettingsDialog;
