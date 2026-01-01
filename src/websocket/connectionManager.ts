import { WebSocket } from 'ws';
import { handleMessage } from './messageHandler';
import {
  getAvailableEmbeddingModelProviders,
  getAvailableChatModelProviders,
} from '../lib/providers';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { Embeddings } from '@langchain/core/embeddings';
import type { IncomingMessage } from 'http';
import logger from '../utils/logger';
import { ChatOpenAI } from '@langchain/openai';

export const handleConnection = async (
  ws: WebSocket,
  request: IncomingMessage,
) => {
  try {
    // Set timeout to 5 minutes (300000ms) on the underlying socket
    if (request.socket) {
      request.socket.setTimeout(300000); // 5 minutes timeout
      request.socket.setKeepAlive(true, 30000); // Enable TCP keepalive with 30s interval

      // Handle timeout event - reset the timer when timeout occurs
      request.socket.on('timeout', () => {
        logger.debug('Socket timeout reached, refreshing timeout');
        // Reset the timeout instead of closing the connection
        request.socket.setTimeout(300000);
      });
    }

    const searchParams = new URL(request.url, `http://${request.headers.host}`)
      .searchParams;

    const [chatModelProviders, embeddingModelProviders] = await Promise.all([
      getAvailableChatModelProviders(),
      getAvailableEmbeddingModelProviders(),
    ]);

    const chatModelProvider =
      searchParams.get('chatModelProvider') ||
      Object.keys(chatModelProviders)[0];
    const chatModel =
      searchParams.get('chatModel') ||
      Object.keys(chatModelProviders[chatModelProvider])[0];

    const embeddingModelProvider =
      searchParams.get('embeddingModelProvider') ||
      Object.keys(embeddingModelProviders)[0];
    const embeddingModel =
      searchParams.get('embeddingModel') ||
      Object.keys(embeddingModelProviders[embeddingModelProvider])[0];

    let llm: BaseChatModel | undefined;
    let embeddings: Embeddings | undefined;

    if (
      chatModelProviders[chatModelProvider] &&
      chatModelProviders[chatModelProvider][chatModel] &&
      chatModelProvider != 'custom_openai'
    ) {
      llm = chatModelProviders[chatModelProvider][chatModel]
        .model as unknown as BaseChatModel | undefined;
    } else if (chatModelProvider == 'custom_openai') {
      llm = new ChatOpenAI({
        modelName: chatModel,
        openAIApiKey: searchParams.get('openAIApiKey'),
        temperature: 0.7,
        configuration: {
          baseURL: searchParams.get('openAIBaseURL'),
        },
      }) as unknown as BaseChatModel;
    }

    if (
      embeddingModelProviders[embeddingModelProvider] &&
      embeddingModelProviders[embeddingModelProvider][embeddingModel]
    ) {
      embeddings = embeddingModelProviders[embeddingModelProvider][
        embeddingModel
      ].model as Embeddings | undefined;
    }

    if (!llm || !embeddings) {
      ws.send(
        JSON.stringify({
          type: 'error',
          data: 'Invalid LLM or embeddings model selected, please refresh the page and try again.',
          key: 'INVALID_MODEL_SELECTED',
        }),
      );
      ws.close();
    }

    const interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'signal',
            data: 'open',
          }),
        );
        clearInterval(interval);
      }
    }, 5);

    // Set up keepalive ping to prevent connection timeout during long operations
    // Send a ping every 25 seconds (well before the 2-minute default timeout)
    const keepAliveInterval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.ping();
        // Also refresh the socket timeout on each ping
        if (request.socket) {
          request.socket.setTimeout(300000);
        }
      } else {
        clearInterval(keepAliveInterval);
      }
    }, 25000); // 25 seconds - frequent enough to prevent 2-minute timeout

    // Handle pong responses to ensure connection is alive
    ws.on('pong', () => {
      logger.debug('Received pong from client');
      // Refresh socket timeout on pong
      if (request.socket) {
        request.socket.setTimeout(300000);
      }
    });

    ws.on(
      'message',
      async (message) => {
        // Refresh socket timeout on each message
        if (request.socket) {
          request.socket.setTimeout(300000);
        }
        await handleMessage(message.toString(), ws, llm, embeddings);
      },
    );

    ws.on('close', () => {
      clearInterval(keepAliveInterval);
      logger.debug('Connection closed');
    });

    ws.on('error', (error) => {
      clearInterval(keepAliveInterval);
      logger.error('WebSocket error:', error);
    });
  } catch (err) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: 'Internal server error.',
        key: 'INTERNAL_SERVER_ERROR',
      }),
    );
    ws.close();
    logger.error(err);
  }
};
