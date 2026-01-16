export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isError?: boolean;
  attachment?: {
    mimeType: string;
    data: string; // Base64
  };
}

export interface ChatSessionConfig {
  apiKey: string;
  systemInstruction?: string;
}

export interface CustomCommand {
  id: string;
  trigger: string;
  content: string;
}

export enum ModelType {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview',
}

export enum PersonaMode {
  TOXIC = 'TOXIC',
  MARAH = 'MARAH',
  NYANTAI = 'NYANTAI',
  BESTOD = 'BESTOD'
}