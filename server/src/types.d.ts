export interface MessageRow {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface ConversationRow {
  id: number | string;
  title: string;
  created_at: string;
}

export interface SettingsRow {
  id: 1;
  model: string;
  temperature: number;
  top_p: number;
  max_tokens: number;
  theme: 'dark' | 'light';
}

