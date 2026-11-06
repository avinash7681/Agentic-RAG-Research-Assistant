import React from 'react';
import {
  BookOpen,
  Sparkles,
  Layers,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  Menu,
  Sliders,
  Download,
} from 'lucide-react';

interface HeaderProps {
  documentCount: number;
  selectedCount: number;
  onLoadSamples: () => void;
  isLoadingSamples: boolean;
  onOpenTestCases: () => void;
  activityPanelOpen: boolean;
  onToggleActivityPanel: () => void;
  onToggleLeftSidebar: () => void;
  onToggleRightSidebar: () => void;
  hasGeminiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  documentCount,
  selectedCount,
  onLoadSamples,
  isLoadingSamples,
  onOpenTestCases,
  activityPanelOpen,
  onToggleActivityPanel,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  hasGeminiKey,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-xs sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleLeftSidebar}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          title="Toggle Papers Sidebar"
          aria-label="Toggle Papers Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 tracking-tight text-lg">PaperPilot</span>
              <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200/80">
                Agentic RAG
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Gemini File Search • Multi-Paper Evidence Retrieval & Synthesis
            </p>
          </div>
        </div>
      </div>

      {/* Middle Status Indicators */}
      <div className="hidden lg:flex items-center space-x-3 text-xs">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700">
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>
            <strong>{documentCount}</strong> papers ({selectedCount} selected)
          </span>
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Gemini File Search Ready</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onLoadSamples}
          disabled={isLoadingSamples}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          title="Load Attention Is All You Need, LoRA, and RAG papers"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">
            {isLoadingSamples ? 'Loading...' : 'Benchmark Papers'}
          </span>
          <span className="sm:hidden">Samples</span>
        </button>

        <button
          onClick={onOpenTestCases}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          title="Open Academic Test Suite"
        >
          <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Test Cases</span>
        </button>

        <button
          onClick={onToggleActivityPanel}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
            activityPanelOpen
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle Real Agent Execution Trace"
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Agent Trace</span>
        </button>

        <button
          onClick={async () => {
            try {
              const res = await fetch('/api/download-zip');
              if (!res.ok) throw new Error('Download failed');
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'paperpilot-project.zip';
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            } catch (err) {
              window.location.href = '/api/download-zip';
            }
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
          title="Download complete project source as .zip"
        >
          <Download className="w-3.5 h-3.5 text-emerald-700" />
          <span className="hidden sm:inline">Download ZIP</span>
          <span className="sm:hidden">ZIP</span>
        </button>

        <button
          onClick={onToggleRightSidebar}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Toggle Citations & Sources Sidebar"
          aria-label="Toggle Citations & Sources Sidebar"
        >
          <Sliders className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </header>
  );
};
