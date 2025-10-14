export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model",
    name: "gemini-2.0-flash-lite",
    description: "Context 1M Input Tokens $0.07/M Output Tokens $0.30/M",
  },
  {
    id: "chat-model-reasoning",
    name: "gemini-2.5-flash-lite",
    description:
      "Context 1M Input Tokens $0.10/M Output Tokens $0.40/M",
  },
];
