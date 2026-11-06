import React, { useState, useEffect } from 'react';
import { X, FileText, ChevronLeft, ChevronRight, BookOpen, Search, Copy, Check } from 'lucide-react';
import type { DocumentRecord } from '../types/index.ts';

interface DocumentModalProps {
  document: DocumentRecord | null;
  onClose: () => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({ document, onClose }) => {
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);
  const [pageText, setPageText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (document) {
      setCurrentPageNum(1);
    }
  }, [document]);

  useEffect(() => {
    if (!document) return;

    const fetchPage = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/documents/${document.id}/pages/${currentPageNum}`);
        const data = await res.json();
        if (data.success) {
          setPageText(data.text);
        }
      } catch (err) {
        console.error('Failed to load page:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [document, currentPageNum]);

  if (!document) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{document.displayName}</h3>
              {document.authors && (
                <p className="text-xs text-slate-500 mt-0.5">{document.authors}</p>
              )}
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
                <span>{document.pageCount} Pages</span>
                <span>•</span>
                <span>{(document.filesize / 1024).toFixed(0)} KB</span>
                <span>•</span>
                <span className="text-emerald-700 font-medium">Gemini File Search Ready</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abstract Box */}
        {document.abstractSnippet && (
          <div className="px-5 py-3 bg-blue-50/50 border-b border-blue-100 text-xs">
            <span className="font-bold text-blue-900 uppercase tracking-wide text-[10px] block mb-1">
              Abstract Overview
            </span>
            <p className="text-slate-700 italic leading-relaxed line-clamp-3">
              "{document.abstractSnippet}"
            </p>
          </div>
        )}

        {/* Page Nav Controls */}
        <div className="px-5 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            Document Page {currentPageNum} of {document.pageCount}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Copy Page Text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              disabled={currentPageNum <= 1 || isLoading}
              onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
              className="p-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-mono text-slate-500 text-xs px-1">
              {currentPageNum}/{document.pageCount}
            </span>

            <button
              disabled={currentPageNum >= document.pageCount || isLoading}
              onClick={() => setCurrentPageNum((p) => p + 1)}
              className="p-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Page Text Area */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/40">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-slate-400 animate-pulse">
              Loading page {currentPageNum}...
            </div>
          ) : (
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap selection:bg-blue-100">
              {pageText || 'No text extracted on this page.'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
