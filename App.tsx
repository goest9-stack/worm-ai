import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Settings, Zap, Terminal, RefreshCw, Paperclip, X } from 'lucide-react';
import { ApiKeyModal } from './components/ApiKeyModal';
import { CommandModal } from './components/CommandModal';
import { MessageItem } from './components/MessageItem';
import { TerminalIcon } from './components/TerminalIcon';
import { Message, CustomCommand, PersonaMode } from './types';
import { initializeGemini, sendMessageStream, resetSession } from './services/geminiService';
import { DEFAULT_SYSTEM_INSTRUCTION, WELCOME_MESSAGE, PERSONA_INSTRUCTIONS } from './constants';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(true);
  const [showCmdModal, setShowCmdModal] = useState(false);
  const [commands, setCommands] = useState<CustomCommand[]>([]);
  const [persona, setPersona] = useState<PersonaMode>(PersonaMode.TOXIC);
  
  // File Upload State
  const [attachment, setAttachment] = useState<{data: string, mimeType: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load commands
  useEffect(() => {
    const savedCmds = localStorage.getItem('worm_commands');
    if (savedCmds) {
        try { setCommands(JSON.parse(savedCmds)); } catch (e) { console.error(e); }
    }
  }, []);

  // Init Message
  useEffect(() => {
    setMessages([{ id: 'init', role: 'model', content: WELCOME_MESSAGE, timestamp: Date.now() }]);
  }, []);

  // Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleApiKeySave = (key: string) => {
    setApiKey(key);
    initializeGemini(key, PERSONA_INSTRUCTIONS[persona]);
    setShowKeyModal(false);
  };

  const changePersona = (mode: PersonaMode) => {
    setPersona(mode);
    setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: `> SYSTEM REBOOT...\n> LOADING PERSONA: [${mode}]...\n> MODE AKTIF.`,
        timestamp: Date.now()
    }]);
    if (apiKey) {
        resetSession(apiKey, PERSONA_INSTRUCTIONS[mode]);
    }
  };

  const handleClearHistory = () => {
    setMessages([{ id: 'clear', role: 'model', content: "Memory format complete. Data hilang semua anjing.", timestamp: Date.now() }]);
    if (apiKey) {
        resetSession(apiKey, PERSONA_INSTRUCTIONS[persona]);
    }
  };

  const checkCommands = (text: string): string => {
    const cmd = commands.find(c => c.trigger.toLowerCase() === text.trim().toLowerCase());
    return cmd ? cmd.content : text;
  };

  // Handle File Select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove data url prefix (e.g. "data:image/jpeg;base64,")
            const base64Data = base64String.split(',')[1];
            setAttachment({
                data: base64Data,
                mimeType: file.type
            });
        };
        reader.readAsDataURL(file);
    }
    // Reset value so same file can be selected again if needed
    e.target.value = '';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !attachment) || isLoading || !apiKey) return;

    const finalContent = checkCommands(input);
    const currentAttachment = attachment;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: finalContent || (currentAttachment ? "[SENT AN IMAGE]" : ""),
      timestamp: Date.now(),
      attachment: currentAttachment ? { ...currentAttachment } : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachment(null); // Clear attachment immediately
    setIsLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMsgId, role: 'model', content: '', timestamp: Date.now() }]);

    try {
      let fullText = '';
      // Pass attachment to service
      const stream = sendMessageStream(finalContent || "Analisis ini.", currentAttachment || undefined);
      
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, content: fullText } : msg));
      }
    } catch (error) {
      setMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, content: "ERROR: Gagal ngirim data kontol. Cek koneksi.", isError: true } : msg));
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getPersonaColor = () => {
      switch(persona) {
          case PersonaMode.TOXIC: return 'text-red-500 fill-red-500';
          case PersonaMode.MARAH: return 'text-orange-600 fill-orange-600';
          case PersonaMode.NYANTAI: return 'text-cyan-400 fill-cyan-400';
          case PersonaMode.BESTOD: return 'text-pink-500 fill-pink-500';
          default: return 'text-worm-primary';
      }
  };

  return (
    <div className="flex flex-col h-screen font-sans text-gray-200 bg-worm-bg overflow-hidden selection:bg-worm-primary selection:text-black">
      <ApiKeyModal isOpen={showKeyModal} onSave={handleApiKeySave} />
      <CommandModal isOpen={showCmdModal} onClose={() => setShowCmdModal(false)} commands={commands} setCommands={setCommands} />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-worm-border bg-worm-panel/50 backdrop-blur-md z-20 gap-4">
        <div className="flex items-center gap-3">
          <div className="text-worm-primary animate-pulse-slow">
             <TerminalIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-mono tracking-[0.2em] text-white">WORM/ZERO</h1>
            <div className="flex items-center gap-2">
                <Zap size={10} className={getPersonaColor()} />
                <span className={`text-[10px] uppercase tracking-wider font-bold animate-pulse ${getPersonaColor().split(' ')[0]}`}>
                    MODE: {persona}
                </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
            {/* Persona Dropdown */}
            <select 
                value={persona}
                onChange={(e) => changePersona(e.target.value as PersonaMode)}
                className="bg-black border border-worm-border text-xs text-worm-primary font-mono rounded px-2 py-1 outline-none focus:border-worm-primary mr-2"
            >
                <option value="TOXIC">☠️ TOXIC</option>
                <option value="MARAH">😡 MARAH</option>
                <option value="NYANTAI">🧊 NYANTAI</option>
                <option value="BESTOD">👯 BESTOD</option>
            </select>

            <button onClick={() => setShowCmdModal(true)} className="p-2 text-zinc-500 hover:text-worm-primary transition-colors">
             <Terminal size={20} />
           </button>
           <button onClick={() => setShowKeyModal(true)} className="p-2 text-zinc-500 hover:text-worm-primary transition-colors">
             <Settings size={20} />
           </button>
           <button onClick={handleClearHistory} className="p-2 text-zinc-500 hover:text-red-500 transition-colors">
             <Trash2 size={20} />
           </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth p-4 md:p-0">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02]" 
             style={{ backgroundImage: 'radial-gradient(circle, #00ff41 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto h-full flex flex-col pt-6 pb-4">
           {messages.map((msg) => (
             <MessageItem key={msg.id} message={msg} />
           ))}
           {isLoading && (
              <div className="flex items-center gap-2 text-worm-primary text-xs font-mono ml-14 mb-4 animate-pulse">
                  <span className="animate-spin">⧗</span> PROCESSING_DATA_STREAM...
              </div>
           )}
           <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-6 bg-gradient-to-t from-worm-bg via-worm-bg to-transparent">
        <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-worm-dim via-worm-primary to-worm-dim rounded-lg opacity-20 group-focus-within:opacity-50 blur transition duration-500"></div>
            
            <div className="relative flex flex-col bg-black border border-worm-border rounded-lg shadow-2xl">
                
                {/* File Preview Area */}
                {attachment && (
                    <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                        <div className="relative group/preview inline-block">
                            <img src={`data:${attachment.mimeType};base64,${attachment.data}`} className="h-16 w-16 object-cover rounded border border-worm-primary/50" alt="preview" />
                            <button 
                                onClick={() => setAttachment(null)}
                                className="absolute -top-2 -right-2 bg-red-900 text-white rounded-full p-0.5 hover:bg-red-600 border border-red-500"
                            >
                                <X size={12} />
                            </button>
                        </div>
                        <div className="text-xs font-mono text-worm-primary animate-pulse">
                            [FILE_ATTACHED_READY_FOR_INJECTION]
                        </div>
                    </div>
                )}

                <div className="flex items-end gap-2 p-2">
                    {/* Hidden File Input */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept="image/png, image/jpeg, image/webp" 
                        className="hidden" 
                    />
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-zinc-500 hover:text-worm-primary transition-colors"
                        title="Upload Image"
                    >
                        <Paperclip size={20} />
                    </button>

                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={attachment ? "Tambahin bacotan buat gambar ini..." : "Ketik perintah lu anjing..."}
                        className="w-full p-3 bg-transparent text-white placeholder-zinc-600 outline-none resize-none font-mono min-h-[50px] max-h-[150px]"
                        rows={1}
                        style={{ height: 'auto', minHeight: '50px' }}
                    />
                    
                    <div className="flex flex-col gap-1 pb-1">
                        <button 
                            onClick={() => handleSubmit()}
                            disabled={isLoading || (!input.trim() && !attachment)}
                            className={`p-3 rounded transition-all duration-300 ${
                                (input.trim() || attachment)
                                ? 'bg-worm-primary text-black hover:bg-white hover:shadow-[0_0_15px_#00ff41]' 
                                : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                            }`}
                        >
                            {isLoading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="mt-2 text-center text-[10px] text-zinc-600 font-mono">
                ENCRYPTED // {persona}_MODE // MULTIMODAL_V3
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;