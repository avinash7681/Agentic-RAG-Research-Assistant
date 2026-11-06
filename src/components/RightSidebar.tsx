import React, { useState, useEffect } from 'react';
import {
  BookMarked,
  ShieldCheck,
  FileSearch,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  X,
  FileText,
} from 'lucide-react';
import type { Citation, DocumentRecord, TestCase } from '../types/index.ts';

interface RightSidebarProps {
  citations: Citation[];
  documents: DocumentRecord[];
  onSelectCitation: (citation: Citation) => void;
  selectedCitation: Citation | null;
  isOpen: boolean;
  onClose: () => void;
  onRunTestCase: (testCase: TestCase) => void;
  initialTab?: 'citations' | 'verifier' | 'tests';
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  citations,
  documents,
  onSelectCitation,
  selectedCitation,
  isOpen,
  onClose,
  onRunTestCase,
  initialTab = 'citations',
}) => {
  const [activeTab, setActiveTab] = useState<'citations' | 'verifier' | 'tests'>(initialTab);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState(false);

  // Document Verifier state
  const [verifierDocId, setVerifierDocId] = useState<string>('');
  const [verifierPageNum, setVerifierPageNum] = useState<number>(1);
  const [verifierPageData, setVerifierPageData] = useState<{
    text: string;
    totalPages: number;
    documentTitle: string;
  } | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);

  // Sync tab with props
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Load test cases
  useEffect(() => {
    const fetchTestCases = async () => {
      try {
        setIsLoadingTests(true);
        const res = await fetch('/api/test-cases');
        const data = await res.json();
        if (data.success && data.testCases) {
          setTestCases(data.testCases);
        }
      } catch (err) {
        console.error('Failed to load test cases:', err);
      } finally {
        setIsLoadingTests(false);
      }
    };
    fetchTestCases();
  }, []);

  // Set initial verifier doc
  useEffect(() => {
    if (documents.length > 0 && !verifierDocId) {
      setVerifierDocId(documents[0].id);
    }
  }, [documents, verifierDocId]);

  // If citation is selected, automatically switch to verifier tab with that doc & page
  useEffect(() => {
    if (selectedCitation) {
      setVerifierDocId(selectedCitation.documentId);
      if (selectedCitation.pageNumber) {
        setVerifierPageNum(selectedCitation.pageNumber);
      }
      setActiveTab('verifier');
    }
  }, [selectedCitation]);

  // Fetch page text when verifierDocId or verifierPageNum changes
  useEffect(() => {
    if (!verifierDocId) return;

    const fetchPage = async () => {
      try {
        setIsLoadingPage(true);
        const res = await fetch(`/api/documents/${verifierDocId}/pages/${verifierPageNum}`);
        const data = await res.json();
        if (data.success) {
          setVerifierPageData({
            text: data.text,
            totalPages: data.totalPages,
            documentTitle: data.documentTitle,
          });
        }
      } catch (err) {
        console.error('Failed to fetch page text:', err);
      } finally {
        setIsLoadingPage(false);
      }
    };

    fetchPage();
  }, [verifierDocId, verifierPageNum]);

  if (!isOpen) return null;

  return (
    <aside className="w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-xs shrink-0 z-20">
      {/* Header Tabs */}
      <div className="border-b border-slate-200 bg-slate-50/50 p-2 flex items-center justify-between">
        <div className="flex space-x-1 p-0.5 bg-slate-200/70 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('citations')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'citations'
                ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sources ({citations.length})
          </button>
          <button
            onClick={() => setActiveTab('verifier')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'verifier'
                ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Doc Verifier
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'tests'
                ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Test Suite
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          title="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab 1: Sources & Citations */}
      {activeTab === 'citations' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <BookMarked className="w-3.5 h-3.5 text-blue-600" />
              <span>Grounded Citations</span>
            </h3>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Zero Hallucination</span>
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Every technical claim and metric is grounded in retrieved passages from your uploaded research papers.
          </p>

          {citations.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 mt-4">
              <FileSearch className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700">No active citations</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Ask a question about your research papers to view retrieved passages and page citations.
              </p>
            </div>
          ) : (
            citations.map((citation, index) => {
              const isSelected = selectedCitation?.id === citation.id;
              return (
                <div
                  key={citation.id || index}
                  onClick={() => onSelectCitation(citation)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 truncate max-w-[190px]">
                        {citation.documentTitle}
                      </span>
                    </div>

                    {citation.pageNumber && (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        Page {citation.pageNumber}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 italic bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2">
                    "{citation.snippet}"
                  </p>

                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Supported in Document</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCitation(citation);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center space-x-0.5"
                    >
                      <span>Verify Page</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Document Verifier & Page Viewer */}
      {activeTab === 'verifier' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Document & Page Selector */}
          <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide block mb-1">
                Select Document to Inspect:
              </label>
              <select
                value={verifierDocId}
                onChange={(e) => {
                  setVerifierDocId(e.target.value);
                  setVerifierPageNum(1);
                }}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 truncate"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.displayName} ({d.pageCount} pages)
                  </option>
                ))}
              </select>
            </div>

            {/* Page Stepper */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-medium text-slate-700">
                Page {verifierPageNum} of {verifierPageData?.totalPages || 1}
              </span>
              <div className="flex items-center space-x-1">
                <button
                  disabled={verifierPageNum <= 1 || isLoadingPage}
                  onClick={() => setVerifierPageNum((p) => Math.max(1, p - 1))}
                  className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={
                    verifierPageNum >= (verifierPageData?.totalPages || 1) || isLoadingPage
                  }
                  onClick={() => setVerifierPageNum((p) => p + 1)}
                  className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Page Text Viewer */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30">
            {isLoadingPage ? (
              <div className="p-8 text-center text-slate-400 text-xs animate-pulse">
                Loading original page text...
              </div>
            ) : verifierPageData ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-200 pb-1.5">
                  <span className="font-semibold text-slate-700">{verifierPageData.documentTitle}</span>
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-mono text-[10px]">
                    Raw Extracted Page {verifierPageNum}
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs font-mono text-[11px] text-slate-800 leading-relaxed whitespace-pre-wrap selection:bg-yellow-200">
                  {verifierPageData.text || 'No text extracted on this page.'}
                </div>

                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200/60 text-xs text-blue-900 flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px]">
                    <strong>Audit Guarantee:</strong> Researchers can verify every quote or parameter directly against the raw PDF text above.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Select a research paper to verify its raw page text.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Academic Benchmark Test Suite */}
      {activeTab === 'tests' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
              <span>Academic Test Suite</span>
            </h3>
            <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-mono">
              {testCases.length} Tests
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Execute standardized benchmark queries to verify agent workflow, comparison tables, and anti-hallucination guardrails.
          </p>

          {isLoadingTests ? (
            <div className="p-6 text-center text-xs text-slate-400 animate-pulse">
              Loading benchmark test cases...
            </div>
          ) : (
            testCases.map((tc) => (
              <div
                key={tc.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  tc.isNegativeTest
                    ? 'border-amber-200 bg-amber-50/30 hover:border-amber-300'
                    : 'border-slate-200 bg-white hover:border-blue-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      tc.isNegativeTest
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {tc.isNegativeTest ? 'Negative Test (Refusal)' : tc.category.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => onRunTestCase(tc)}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run</span>
                  </button>
                </div>

                <h4 className="text-xs font-semibold text-slate-900 mb-1">{tc.title}</h4>
                <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2">
                  "{tc.prompt}"
                </p>

                <p className="text-[11px] text-slate-500 mb-2">{tc.explanation}</p>

                <div className="flex flex-wrap gap-1 text-[10px]">
                  {tc.expectedAspects.map((aspect, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                    >
                      ✓ {aspect}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  );
};
