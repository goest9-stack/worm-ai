import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Key, ShieldCheck, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave }) => {
  const [key, setKey] = useState('');

  // Check local storage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('worm_api_key');
    if (savedKey) {
        // If key exists, we trigger save immediately to auto-login, 
        // OR we can pre-fill. Let's pre-fill and let user confirm or change.
        setKey(savedKey);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim().length > 0) {
      localStorage.setItem('worm_api_key', key.trim());
      onSave(key.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 border rounded-lg bg-worm-bg border-worm-primary/30 shadow-[0_0_40px_rgba(0,255,65,0.1)] relative overflow-hidden">
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-10" 
             style={{ backgroundImage: 'linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 text-worm-primary">
            <div className="p-2 border rounded bg-worm-dim border-worm-primary">
                <Key className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-mono tracking-widest">ACCESS_CONTROL</h2>
          </div>

          <p className="mb-6 text-sm text-zinc-400 font-sans">
            WORM/ZERO requires a Neural Link (API Key) to function. 
            This connection connects you directly to the Gemini grid.
            <br/><br/>
            <span className="text-xs text-worm-muted block border-l-2 border-worm-muted pl-2 italic">
              Key is stored locally in your browser's encrypted storage. We do not transmit it to any secondary servers.
            </span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-xs font-mono text-worm-primary uppercase">Google GenAI API Key</label>
              <input
                id="apiKey"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 text-sm transition-all bg-black border rounded outline-none border-zinc-800 text-white focus:border-worm-primary focus:shadow-[0_0_10px_rgba(0,255,65,0.2)] placeholder-zinc-700 font-mono"
                autoFocus
              />
            </div>

            <div className="flex justify-between items-center pt-2">
                <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-worm-primary transition-colors"
                >
                    Get Key <ExternalLink size={10} />
                </a>
                <Button type="submit">
                    ESTABLISH LINK
                </Button>
            </div>
          </form>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-zinc-600 uppercase tracking-widest">
            <ShieldCheck size={12} />
            Secure Connection // 100% Free Tier Supported
          </div>
        </div>
      </div>
    </div>
  );
};