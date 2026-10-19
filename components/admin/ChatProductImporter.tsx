'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  AlertCircle,
  Tag,
  Layers,
  ArrowRight,
  RefreshCw,
  Store,
  Edit3,
  CheckCircle2,
  ImageOff,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
//   ChatProductImporter — AI Extraction Chatbox
//   Vendor pastes a product URL → AI extracts data
//   → Redirect to /admin/produse/nou pre-filled
//   *** Does NOT save to DB directly ***
// ============================================

export interface DraftProduct {
  title: string;
  description: string;
  brand: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  sku: string;
  images: string[];
  sizes: string[];
  colors: string[];
  categorySlug: string;
  material: string;
  warranty: string;
  weight: string;
  features: string[];
  sourceUrl: string | null;
  extractedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  draft?: DraftProduct;
  sourceUrl?: string;
  isError?: boolean;
  aiUsed?: boolean;
}

const SAMPLE_PROMPTS = [
  'https://www.trendyol.com/ro/jolly-kids/leagan-pentru-copii-de-interior-si-exterior-jolly-kids-115-x-100-x-70-cm-roz-p-1198360741',
  'https://www.trendyol.com/ro/apple/iphone-15-128gb-negru-p-761358914',
  'Jolly Kids Leagăn pentru copii, de interior și exterior roz, preț 184.50 lei',
];

function ImageWithFallback({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [errored, setErrored] = useState(false);
  if (errored || !src) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-100 text-gray-300', className)}>
        <ImageOff size={20} />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={cn('object-cover', className)}
      onError={() => setErrored(true)}
    />
  );
}

export default function ChatProductImporter({ onDraftExtracted }: { onDraftExtracted?: (draft: DraftProduct) => void }) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Salut! Sunt asistentul tău AI pentru importul de produse pe TOPinStock.\n\nLipești link-ul oricărui produs, iar eu extrag automat titlul, descrierea, prețul, imaginile și specificațiile. Vei fi redirecționat la formularul de adăugare unde poți verifica și ajusta orice detaliu înainte de publicare.',
      timestamp: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  function handleGoToEditForm(draft: DraftProduct) {
    try {
      sessionStorage.setItem('topinstock_product_draft', JSON.stringify(draft));
    } catch {}
    try {
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(draft))));
      router.push(`/admin/produse/nou?draft=${encoded}`);
    } catch {
      router.push('/admin/produse/nou');
    }
  }

  async function handleSend(textToSend?: string) {
    const messageText = (textToSend || input).trim();
    if (!messageText || isProcessing) return;

    setInput('');

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);
    setProcessingStatus('🔍 Se analizează link-ul și se descarcă pagina produsului...');

    const statusTimer1 = setTimeout(() => {
      setProcessingStatus('🤖 AI extrage titlul, descrierea, prețul și specificațiile...');
    }, 1800);

    const statusTimer2 = setTimeout(() => {
      setProcessingStatus('🖼️ Se detectează imaginile HD ale produsului...');
    }, 3400);

    try {
      const response = await fetch('/api/admin/chat-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await response.json();
      clearTimeout(statusTimer1);
      clearTimeout(statusTimer2);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Nu am putut extrage produsul din link.');
      }

      const draft: DraftProduct = data.draft;

      if (onDraftExtracted) onDraftExtracted(draft);

      const imagesCount = draft.images?.length || 0;
      const hasGoodData = !!(draft.title || draft.description || imagesCount > 0);

      const summaryParts: string[] = [];
      if (draft.title) summaryParts.push(`titlu: „${draft.title.slice(0, 45)}${draft.title.length > 45 ? '...' : ''}”`);
      if (draft.brand) summaryParts.push(`brand: ${draft.brand}`);
      if (imagesCount > 0) summaryParts.push(`${imagesCount} imagini`);
      if (draft.price > 0) summaryParts.push(`preț ${draft.price} LEI`);
      if (draft.colors && draft.colors.length > 0) summaryParts.push(`culori (${draft.colors.join(', ')})`);
      if (draft.sizes && draft.sizes.length > 0) summaryParts.push(`mărimi (${draft.sizes.join(', ')})`);

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: hasGoodData
          ? `Am extras datele produsului cu succes! 🎉\n\nIdentificat: ${summaryParts.join(' • ')}.\n\n${draft.price === 0 ? '💡 Prețul nu a fost specificat în link — îl poți seta direct în formularul de editare.\n\n' : ''}⬇️ Apasă „Editează detaliile și Publică” pentru a verifica sau ajusta produsul înainte de publicare.`
          : 'Am procesat link-ul, dar nu am reușit să extrag date clare. Poți încerca să lipești direct titlul și specificațiile copiate din magazin.',
        timestamp: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
        draft,
        sourceUrl: data.sourceUrl,
        aiUsed: data.aiUsed,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      clearTimeout(statusTimer1);
      clearTimeout(statusTimer2);

      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'bot',
        text: `Nu am reușit să procesez link-ul: ${err.message || 'Eroare la procesare.'}\n\nVerifică dacă URL-ul este corect și accesibil sau încearcă să descrii produsul manual (ex: „Adaugă tricou bărbați alb, 89 lei, mărimi S-XL").`,
        timestamp: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[720px] max-h-[85vh] bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ── Chat Header ── */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-[#006b80] text-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-orange-400 backdrop-blur-xs">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[15px] leading-tight">AI Product Importer</h3>
              <span className="text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-full">
                v2 Draft
              </span>
            </div>
            <p className="text-white/70 text-xs">Extrage → Verifică → Publică</p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome_reset',
                sender: 'bot',
                text: 'Conversația a fost resetată. Lipește un link de produs pentru a continua.',
                timestamp: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors text-xs flex items-center gap-1"
          title="Resetează conversația"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* ── Flow Info Banner ── */}
      <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200/70 flex items-start gap-2 text-xs text-amber-800">
        <Info size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Nou flux:</strong> AI extrage date → Tu verifici și ajustezi → Tu publici. Nimic nu se salvează automat.
        </span>
      </div>

      {/* ── Chat Messages ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gray-50/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex gap-3 max-w-[90%] sm:max-w-[82%]',
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs shadow-xs',
                msg.sender === 'user' ? 'bg-blue-800 text-white' : 'bg-emerald-600 text-white'
              )}
            >
              {msg.sender === 'user' ? <User size={15} /> : <Bot size={16} />}
            </div>

            {/* Bubble + Draft Card */}
            <div className="space-y-2.5 min-w-0">
              <div
                className={cn(
                  'p-4 rounded-2xl text-[13.5px] leading-relaxed shadow-xs',
                  msg.sender === 'user'
                    ? 'bg-blue-800 text-white rounded-tr-none'
                    : msg.isError
                    ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-none'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                )}
              >
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                <div
                  className={cn(
                    'text-[10px] mt-1.5 flex items-center justify-end gap-1',
                    msg.sender === 'user' ? 'text-white/60' : 'text-gray-400'
                  )}
                >
                  {msg.aiUsed && <span className="text-emerald-600 font-bold">AI</span>}
                  {msg.timestamp}
                </div>
              </div>

              {/* ── Draft Preview Card ── */}
              {msg.draft && (
                <div className="bg-white rounded-2xl border-2 border-orange-200 shadow-md overflow-hidden animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                  {/* Card Header */}
                  <div className="px-4 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-800 flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-orange-600" />
                      Previzualizare Date Extrase
                    </span>
                    {msg.sourceUrl && (
                      <a
                        href={msg.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        Sursă <ExternalLink size={10} />
                      </a>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Images Row */}
                    {msg.draft.images.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {msg.draft.images.slice(0, 4).map((img, i) => (
                          <div
                            key={i}
                            className="w-16 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100"
                          >
                            <ImageWithFallback src={img} alt={`Imagine ${i + 1}`} className="w-full h-full" />
                          </div>
                        ))}
                        {msg.draft.images.length > 4 && (
                          <div className="w-16 h-20 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">
                            +{msg.draft.images.length - 4}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-10 rounded-xl bg-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
                        <ImageOff size={14} /> Nicio imagine detectată — poți adăuga manual
                      </div>
                    )}

                    {/* Title + Brand */}
                    <div>
                      {msg.draft.brand && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                          {msg.draft.brand}
                        </span>
                      )}
                      <h4 className="text-[13.5px] font-bold text-gray-900 leading-snug line-clamp-2 mt-0.5">
                        {msg.draft.title || <span className="text-gray-400 italic">Titlu nedetectat</span>}
                      </h4>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      {msg.draft.price > 0 ? (
                        <>
                          <span className="text-lg font-black text-gray-900">
                            {msg.draft.price.toFixed(2)} LEI
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-amber-600 font-bold">
                          ⚠️ Preț nedetectat — completează în formular
                        </span>
                      )}
                    </div>

                    {/* Meta pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {msg.draft.categorySlug && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full border border-blue-100">
                          <Layers size={10} /> {msg.draft.categorySlug}
                        </span>
                      )}
                      {msg.draft.sizes.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-800 px-2 py-0.5 rounded-full border border-purple-100">
                          <Tag size={10} /> {msg.draft.sizes.slice(0, 4).join(', ')}{msg.draft.sizes.length > 4 ? '...' : ''}
                        </span>
                      )}
                      {msg.draft.colors.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-800 px-2 py-0.5 rounded-full border border-rose-100">
                          🎨 {msg.draft.colors.slice(0, 3).join(', ')}
                        </span>
                      )}
                      {msg.draft.material && (
                        <span className="text-[10px] font-medium bg-gray-50 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">
                          {msg.draft.material.slice(0, 30)}
                        </span>
                      )}
                    </div>

                    {/* CTA: Go to edit form */}
                    <button
                      type="button"
                      onClick={() => handleGoToEditForm(msg.draft!)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all active:scale-98"
                    >
                      <Edit3 size={16} />
                      <span>Editează detaliile și Publică</span>
                      <ArrowRight size={15} />
                    </button>

                    <p className="text-[10px] text-center text-gray-400">
                      Vei putea modifica orice câmp înainte de publicare
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex items-start gap-3 mr-auto max-w-[80%] animate-in fade-in-50 duration-200">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs">
              <Bot size={16} />
            </div>
            <div className="bg-white border border-gray-200/80 rounded-2xl rounded-tl-none p-4 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                <span className="text-xs font-bold text-gray-800">{processingStatus}</span>
              </div>
              <div className="flex gap-1.5 py-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Sample Prompts ── */}
      <div className="px-4 py-2 bg-white border-t border-gray-100 flex items-center gap-2 overflow-x-auto scrollbar-hidden">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">
          Exemple:
        </span>
        {SAMPLE_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(p)}
            disabled={isProcessing}
            className="text-[11.5px] font-medium text-gray-600 hover:text-blue-800 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-full px-3 py-1 whitespace-nowrap transition-colors flex-shrink-0 disabled:opacity-50"
          >
            {p.length > 38 ? p.slice(0, 38) + '...' : p}
          </button>
        ))}
      </div>

      {/* ── Input Bar ── */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="flex-1 relative flex items-center">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Lipește link-ul produsului (Trendyol etc.) sau textul copiat din pagină..."
              disabled={isProcessing}
              className="w-full resize-none border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 placeholder:text-gray-400 disabled:bg-gray-50"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="w-11 h-11 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex-shrink-0"
            aria-label="Trimite"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
