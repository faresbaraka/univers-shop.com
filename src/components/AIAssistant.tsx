import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, X, Sparkles, ShoppingCart, HelpCircle } from 'lucide-react';
import { Product } from '../types';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface AIAssistantProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onCompleteQuest?: (questId: string, pts: number, name: string) => void;
}

export default function AIAssistant({ products, onAddToCart, onShowToast, onCompleteQuest }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Salam ! Marhaba chez Univers Shop ! 😊 Je suis Yanis, votre conseiller IA personnel. \n\nPour que je trouve le produit idéal pour vous, dites-moi :\n- Quel est votre **budget maximum** ? (en DA)\n- Quel **type d'article** recherchez-vous ?\n- Quelle sera son **utilisation principale** ?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    if (!textToSend) {
      setInput('');
    }

    const newMessages = [...messages, { role: 'user', content: text } as Message];
    setMessages(newMessages);
    setIsLoading(true);

    // Track quest "Parler à l'assistant IA" (if any) or simply interact
    if (onCompleteQuest) {
      onCompleteQuest('chat_ia', 40, "Discuter avec l'assistant IA");
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          products
        })
      });

      if (!response.ok) {
        throw new Error("Impossible de joindre le serveur IA");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', content: data.text }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: "Désolé, j'ai rencontré un petit problème de réseau. Pouvez-vous répéter votre question ? Je reste à votre entière disposition !"
        }
      ]);
      onShowToast("Erreur de connexion avec le conseiller IA.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const parseMessageContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      let formatted = line;
      // Bullet list item
      const isBullet = line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().startsWith('•');
      if (isBullet) {
        // Strip bullet char
        formatted = line.replace(/^[-*•]\s*/, '');
      }

      // Bold text parser
      const parts: React.ReactNode[] = [];
      const boldRegex = /\*\*(.*?)\*\*/g;
      let lastIdx = 0;
      let match;

      while ((match = boldRegex.exec(formatted)) !== null) {
        if (match.index > lastIdx) {
          parts.push(formatted.substring(lastIdx, match.index));
        }
        parts.push(
          <strong key={match.index} className="font-extrabold text-slate-900">
            {match[1]}
          </strong>
        );
        lastIdx = boldRegex.lastIndex;
      }
      if (lastIdx < formatted.length) {
        parts.push(formatted.substring(lastIdx));
      }

      // Fallback if no bold matches
      const content = parts.length > 0 ? parts : formatted;

      if (isBullet) {
        return (
          <li key={i} className="ml-4 list-disc pl-1 my-1 text-slate-700 text-xs sm:text-sm">
            {content}
          </li>
        );
      }

      return (
        <p key={i} className="my-1 text-slate-700 text-xs sm:text-sm leading-relaxed min-h-[0.5rem]">
          {content}
        </p>
      );
    });
  };

  const quickReplies = [
    { label: "💰 Quel est l'article le moins cher ?", text: "Quels sont les produits les moins chers ou les meilleures offres ?" },
    { label: "🔥 Quels sont les produits phares ?", text: "Quels sont vos meilleurs produits disponibles en ce moment ?" },
    { label: "📦 Comment commander ?", text: "Comment puis-je passer une commande et comment se passe la livraison ?" },
    { label: "⚖️ Comparez les articles", text: "Pouvez-vous me faire un comparatif rapide de vos articles de la boutique ?" }
  ];

  return (
    <div className="fixed bottom-5 right-5 z-45 flex flex-col items-end font-sans">
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-[350px] sm:w-[380px] h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden mb-4 transition-all duration-300 transform scale-100 origin-bottom-right">
          {/* Header */}
          <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-400">
                  <Bot className="w-5 h-5 text-sky-400" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-display font-bold text-sm flex items-center gap-1.5">
                  Yanis 
                  <span className="text-[10px] bg-sky-500/20 text-sky-400 border border-sky-500/30 px-1.5 py-0.5 rounded-full font-semibold">Conseiller IA</span>
                </h3>
                <p className="text-[10px] text-slate-400">En ligne &bull; Réponse instantanée</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs ${
                  msg.role === 'user' 
                    ? 'bg-sky-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.role === 'model' && (
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-sky-600 mb-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Univers Shop IA</span>
                    </div>
                  )}
                  <div className={msg.role === 'user' ? 'text-white text-xs sm:text-sm' : 'space-y-1'}>
                    {msg.role === 'user' ? msg.content : parseMessageContent(msg.content)}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-none p-4 border border-slate-100 shadow-xs flex items-center gap-2">
                  <span className="w-2 h-2 bg-sky-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-sky-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-sky-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(reply.text)}
                  className="bg-white border border-slate-200 text-slate-700 hover:text-sky-600 hover:border-sky-500 hover:bg-sky-50/20 text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-2xs transition-all cursor-pointer flex-shrink-0"
                >
                  {reply.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Posez votre question (ex: Quel est mon budget ?)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2.5 rounded-xl transition-all ${
                input.trim() && !isLoading
                  ? 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasNewMessage(false);
        }}
        className={`relative flex items-center gap-2 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-105 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer group ${
          !isOpen ? 'animate-bounce' : ''
        }`}
        style={{ animationDuration: '3s' }}
        id="ai-assistant-toggle"
      >
        <div className="absolute inset-0 rounded-full bg-sky-500/20 animate-ping group-hover:hidden opacity-75"></div>
        <Bot className="w-6 h-6 text-sky-400" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold text-xs whitespace-nowrap">
          Conseiller IA Vendeur
        </span>
        {hasNewMessage && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
        )}
      </button>
    </div>
  );
}
