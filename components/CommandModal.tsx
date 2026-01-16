import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Terminal, Plus, Trash2, X, Save } from 'lucide-react';
import { CustomCommand } from '../types';

interface CommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CustomCommand[];
  setCommands: (cmds: CustomCommand[]) => void;
}

export const CommandModal: React.FC<CommandModalProps> = ({ isOpen, onClose, commands, setCommands }) => {
  const [newTrigger, setNewTrigger] = useState('');
  const [newContent, setNewContent] = useState('');

  // Save to local storage whenever commands change
  useEffect(() => {
    if (commands.length > 0) {
        localStorage.setItem('worm_commands', JSON.stringify(commands));
    }
  }, [commands]);

  const handleAdd = () => {
    if (!newTrigger || !newContent) return;
    
    // Ensure trigger starts with /
    const trigger = newTrigger.startsWith('/') ? newTrigger : `/${newTrigger}`;

    const newCmd: CustomCommand = {
      id: Date.now().toString(),
      trigger,
      content: newContent
    };

    const updated = [...commands, newCmd];
    setCommands(updated);
    setNewTrigger('');
    setNewContent('');
  };

  const handleDelete = (id: string) => {
    const updated = commands.filter(c => c.id !== id);
    setCommands(updated);
    localStorage.setItem('worm_commands', JSON.stringify(updated));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
      <div className="w-full max-w-2xl p-6 border rounded-lg bg-worm-bg border-worm-primary/30 shadow-[0_0_40px_rgba(0,255,65,0.1)] relative flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between mb-6 text-worm-primary border-b border-worm-border pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-6 h-6" />
            <h2 className="text-xl font-bold font-mono tracking-widest">CUSTOM_COMMANDS</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    placeholder="/shortcut (ex: /ddos)"
                    className="col-span-1 px-4 py-2 bg-black border rounded outline-none border-zinc-800 text-worm-primary focus:border-worm-primary font-mono text-sm"
                />
                <input
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Isi prompt perintah lo yang panjang..."
                    className="col-span-1 md:col-span-2 px-4 py-2 bg-black border rounded outline-none border-zinc-800 text-white focus:border-worm-primary font-mono text-sm"
                />
            </div>
            <Button onClick={handleAdd} className="w-full text-xs" variant="secondary">
                <Plus size={14} className="mr-2" /> TAMBAH SHORTCUT
            </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {commands.length === 0 && (
                <div className="text-center text-zinc-600 font-mono py-8 italic">
                    Belum ada command anjing. Bikin dulu lah.
                </div>
            )}
            {commands.map((cmd) => (
                <div key={cmd.id} className="flex items-center justify-between p-3 bg-worm-panel border border-worm-border rounded group hover:border-worm-primary/50 transition-colors">
                    <div className="flex-1 min-w-0 mr-4">
                        <div className="font-mono text-worm-primary font-bold text-sm">{cmd.trigger}</div>
                        <div className="text-zinc-400 text-xs truncate font-mono">{cmd.content}</div>
                    </div>
                    <button 
                        onClick={() => handleDelete(cmd.id)}
                        className="p-2 text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
};