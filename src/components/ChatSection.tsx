import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Quote,
  Clock,
  Layers,
  Activity,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Columns3,
  FlaskConical,
  BookOpen,
  Info,
} from 'lucide-react';
import type { ChatMessage, Citation, DocumentRecord } from '../types/index.ts';
import { ComparisonTableView } from './ComparisonTableView.tsx';
import { ExperimentPlanView } from './ExperimentPlanView.tsx';

interface ChatSectionProps {
  messages: ChatMessage[];
  onSendMessage: (query: string) => void;
  isLoading: boolean;
  selectedDocuments: DocumentRecord[];
  allDocuments: DocumentRecord[];
  onSelectCitation: (citation: Citation) => void;
  onOpenTraceForMessage: (msg: ChatMessage) => void;
  onRunPreset: (prompt: string) => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({
  messages,
  onSendMessage,
  isLoading,
  selectedDocuments,
  allDocuments,
  onSelectCitation,
  onOpenTraceForMessage,
  onRunPreset,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;
    onSendMessage(inputQuery.trim());
    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputQuery(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  // Suggestion chips
  const suggestions = [
    {
      label: 'Compare Transformer & LoRA',
      prompt: 'Compare Attention Is All You Need and LoRA in terms of architecture, training efficiency, parameter footprint, and benchmark results.',
    },
    {
      label: 'How does LoRA save memory?',
      prompt: 'How does LoRA reduce trainable parameters and GPU memory requirements without introducing inference latency?',
    },
    {
      label: 'Suggest an Experiment',
      prompt: 'Suggest an experiment based on these research papers: combine LoRA parameter-efficient fine-tuning with a RAG retrieval system.',
    },
    {
      label: 'Limitations & Gaps',
      prompt: 'What are the main research limitations and computational bottlenecks documented in the RAG and Transformer papers?',
    },
    {
      label: 'Verify BLEU & EM Metrics',
      prompt: 'What exact BLEU translation scores and Exact Match QA scores are reported across the papers?',
    },
  ];

  const getClassificationBadge = (classification?: string) => {
    if (!classification) return null;
    const colors: Record<string, string> = {
      question_answering: 'bg-blue-50 text-blue-700 border-blue-200',
      paper_summarization: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      paper_comparison: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      research_gap_analysis: 'bg-amber-50 text-amber-700 border-amber-200',
      experiment_planning: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    const color = colors[classification] || 'bg-slate-50 text-slate-700 border-slate-200';
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${color}`}>
        {classification.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Context Bar */}
      <div className="px-4 py-2 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 truncate">
          <span className="font-semibold text-slate-700 shrink-0">Active Scope:</span>
          {selectedDocuments.length > 0 ? (
            <div className="flex items-center space-x-1.5 truncate">
              {selectedDocuments.slice(0, 3).map((d) => (
                <span
                  key={d.id}
                  className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md truncate max-w-[200px]"
                  title={d.displayName}
                >
                  {d.displayName}
                </span>
              ))}
              {selectedDocuments.length > 3 && (
                <span className="text-slate-400">+{selectedDocuments.length - 3} more</span>
              )}
            </div>
          ) : (
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              No papers selected (All {allDocuments.length} available papers will be queried)
            </span>
          )}
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-slate-500 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Strict Anti-Hallucination Grounding</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto py-10 px-4 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-blue-500/20">
              <Bot className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                PaperPilot Academic Research Assistant
              </h2>
              <p className="text-xs text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
                Empowered by Gemini File Search and an Agentic RAG pipeline. Ask deep technical questions,
                generate structured paper comparisons, analyze research gaps, or plan novel experiments with exact page citations.
              </p>
            </div>

            {/* Suggestions Grid */}
            <div className="text-left space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block text-center">
                Recommended Inquiries & Benchmarks
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => onRunPreset(s.prompt)}
                    className="p-3 text-left rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {s.label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{s.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-3xl rounded-2xl p-4 transition-all ${
                    isUser
                      ? 'bg-blue-600 text-white shadow-xs ml-12 rounded-tr-xs'
                      : 'bg-white border border-slate-200 shadow-2xs mr-12 rounded-tl-xs'
                  }`}
                >
                  {/* Assistant Meta Header */}
                  {!isUser && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 text-xs">
                      <div className="flex items-center space-x-2">
                        {getClassificationBadge(message.classification)}
                        {message.executionTimeMs && (
                          <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{message.executionTimeMs}ms</span>
                          </span>
                        )}
                        {message.retryOccurred && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center space-x-1">
                            <RefreshCw className="w-2.5 h-2.5 text-amber-600" />
                            <span>Evidence Refined via 1-Retry</span>
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => onOpenTraceForMessage(message)}
                        className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200"
                        title="View step-by-step query planning, retrieval, and evidence check trace"
                      >
                        <Activity className="w-3 h-3" />
                        <span>Inspect Agent Trace</span>
                      </button>
                    </div>
                  )}

                  {/* Message Body */}
                  <div className={`text-xs sm:text-[13px] leading-relaxed ${isUser ? 'text-white' : 'text-slate-800 prose prose-slate max-w-none'}`}>
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  {/* Comparison Table View if present */}
                  {!isUser && message.comparisonTable && (
                    <ComparisonTableView
                      table={message.comparisonTable}
                      onCitationClick={(cStr) => {
                        const matchedCit = (message.citations || []).find((c) =>
                          cStr.toLowerCase().includes(c.documentTitle.toLowerCase())
                        );
                        if (matchedCit) onSelectCitation(matchedCit);
                      }}
                    />
                  )}

                  {/* Experiment Plan View if present */}
                  {!isUser && message.experimentPlan && (
                    <ExperimentPlanView plan={message.experimentPlan} />
                  )}

                  {/* Grounded Citation Badges */}
                  {!isUser && message.citations && message.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center space-x-1.5 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <Quote className="w-3 h-3 text-blue-600" />
                        <span>Grounded Citations ({message.citations.length}):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {message.citations.map((cit, idx) => (
                          <button
                            key={cit.id || idx}
                            onClick={() => onSelectCitation(cit)}
                            className="inline-flex items-center space-x-1 text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-md border border-blue-200 transition-colors cursor-pointer"
                            title={`Click to inspect Page ${cit.pageNumber || 1} in Document Verifier`}
                          >
                            <span className="font-semibold truncate max-w-[150px]">
                              {cit.documentTitle}
                            </span>
                            {cit.pageNumber && (
                              <span className="font-mono text-[10px] bg-blue-200/70 text-blue-900 px-1 rounded">
                                p.{cit.pageNumber}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start space-x-3 justify-start animate-in fade-in-50 duration-200">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-2xs max-w-md">
              <div className="flex items-center space-x-2 text-xs font-semibold text-blue-700 mb-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Agentic RAG In Progress...</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                  <span>1. Analyzing intent & query planning...</span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span>2. Querying Gemini File Search store...</span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span>3. Verifying evidence sufficiency (1-retry limit)...</span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span>4. Synthesizing grounded response with citations...</span>
                </p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputQuery}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedDocuments.length > 0
                ? `Ask anything about ${selectedDocuments.map((d) => d.displayName).join(', ')}... (Shift+Enter for newline)`
                : `Ask a question, compare papers, or suggest an experiment...`
            }
            className="w-full text-xs sm:text-[13px] bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-24 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 resize-none transition-all"
            style={{ maxHeight: '160px' }}
          />

          <div className="absolute right-2.5 bottom-2.5 flex items-center space-x-1.5">
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
              title="Submit Inquiry"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-1">
          <span>Zero-hallucination policy: The agent will state if evidence is absent.</span>
          <span className="hidden sm:inline">Press Enter to send</span>
        </div>
      </div>
    </div>
  );
};
