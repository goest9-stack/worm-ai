import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { TerminalIcon } from './TerminalIcon';
import { User, AlertTriangle, FileImage } from 'lucide-react';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isBot = message.role === 'model';
  const isError = message.isError;

  return (
    <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] gap-4 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded border flex items-center justify-center
          ${isBot 
            ? 'border-worm-primary/30 bg-worm-dim text-worm-primary shadow-[0_0_10px_rgba(0,255,65,0.1)]' 
            : 'border-zinc-700 bg-zinc-900 text-zinc-400'
          }`}>
          {isBot ? <TerminalIcon className="w-6 h-6" /> : <User className="w-5 h-5" />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col min-w-0 ${isBot ? 'items-start' : 'items-end'}`}>
            <div className={`flex items-center gap-2 mb-1 text-xs font-mono uppercase tracking-widest ${isBot ? 'text-worm-primary' : 'text-zinc-500'}`}>
                {isBot ? 'WORM/ZERO_CORE' : 'USER_ID_UNKNOWN'}
                {isError && <span className="text-red-500 flex items-center gap-1"><AlertTriangle size={12}/> ERROR</span>}
            </div>
            
            <div className={`relative px-5 py-3 rounded-lg border text-sm md:text-base leading-relaxed overflow-hidden
              ${isBot 
                ? 'bg-worm-panel border-worm-border text-worm-text' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-300'
              } 
              ${isError ? 'border-red-900/50 bg-red-950/10 text-red-400' : ''}
            `}>
              {/* Scanline effect for bot */}
              {isBot && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-worm-primary/5 to-transparent opacity-10 pointer-events-none bg-[length:100%_4px]" />
              )}
              
              {/* Attachment Display */}
              {message.attachment && (
                <div className="mb-3 rounded overflow-hidden border border-zinc-700">
                    <img 
                        src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`} 
                        alt="User Upload" 
                        className="max-w-full max-h-64 object-cover"
                    />
                    <div className="bg-black/50 p-1 text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                        <FileImage size={10} /> ENCRYPTED_IMG_DATA
                    </div>
                </div>
              )}

              <div className="prose prose-invert prose-p:my-1 prose-pre:bg-black prose-pre:border prose-pre:border-zinc-800 prose-code:text-worm-primary max-w-none font-sans">
                 <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
        </div>

      </div>
    </div>
  );
};