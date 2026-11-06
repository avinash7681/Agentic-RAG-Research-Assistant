import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Brain,
  Search,
  ShieldCheck,
  FileText,
  Code2,
  X,
  Zap,
} from 'lucide-react';
import type { AgentStep } from '../types/index.ts';

interface AgentActivityPanelProps {
  steps: AgentStep[];
  isOpen: boolean;
  onClose: () => void;
  isExecuting: boolean;
  executionTimeMs?: number;
}

export const AgentActivityPanel: React.FC<AgentActivityPanelProps> = ({
  steps,
  isOpen,
  onClose,
  isExecuting,
  executionTimeMs,
}) => {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedStepId(expandedStepId === id ? null : id);
  };

  const getStepIcon = (type: AgentStep['stepType'], status: AgentStep['status']) => {
    if (status === 'in_progress') {
      return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
    }
    if (status === 'retrying') {
      return <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />;
    }
    if (status === 'failed') {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }

    switch (type) {
      case 'query_planning':
        return <Brain className="w-4 h-4 text-indigo-600" />;
      case 'retrieval':
        return <Search className="w-4 h-4 text-blue-600" />;
      case 'evidence_check':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'response_generation':
        return <FileText className="w-4 h-4 text-violet-600" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="border-t border-slate-200 bg-slate-50/95 backdrop-blur-xs shadow-lg transition-all z-20">
      {/* Header Bar */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Agentic RAG Execution Trace
              </h3>
              {isExecuting ? (
                <span className="flex items-center space-x-1 text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full animate-pulse">
                  <Zap className="w-2.5 h-2.5 text-blue-600" />
                  <span>Agent Active</span>
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Completed {executionTimeMs ? `(${executionTimeMs}ms)` : ''}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Real-time tool invocations: Query Planner → Gemini File Search → Evidence Checker (1-retry limit) → Response Generator
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Minimize trace panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Steps List */}
      <div className="p-3 max-h-72 overflow-y-auto space-y-2">
        {steps.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Send an inquiry to observe the agent's real-time query planning, search, and evidence verification steps.
          </div>
        ) : (
          steps.map((step, idx) => {
            const isExpanded = expandedStepId === step.id;
            return (
              <div
                key={step.id || idx}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all"
              >
                {/* Step Row */}
                <div
                  onClick={() => toggleExpand(step.id)}
                  className="px-3 py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                      {getStepIcon(step.stepType, step.status)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">
                          {idx + 1}. {step.name}
                        </span>
                        {step.durationMs !== undefined && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {step.durationMs}ms
                          </span>
                        )}
                        {step.status === 'retrying' && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            Retry Attempt Triggered
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 truncate">{step.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {step.status === 'completed' && (
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Done</span>
                      </span>
                    )}
                    {step.status === 'in_progress' && (
                      <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 animate-pulse">
                        Executing...
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details View */}
                {isExpanded && step.details && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50/60 text-xs">
                    <div className="flex items-center space-x-1.5 mb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <Code2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Execution Payload & Grounding Metadata</span>
                    </div>

                    <pre className="p-2.5 bg-slate-900 text-slate-100 font-mono rounded-lg text-[11px] overflow-x-auto leading-relaxed">
                      {JSON.stringify(step.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
