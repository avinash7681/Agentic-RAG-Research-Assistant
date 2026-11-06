import React from 'react';
import {
  FlaskConical,
  Target,
  Workflow,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import type { ExperimentPlan } from '../types/index.ts';

interface ExperimentPlanViewProps {
  plan: ExperimentPlan;
}

export const ExperimentPlanView: React.FC<ExperimentPlanViewProps> = ({ plan }) => {
  if (!plan) return null;

  return (
    <div className="my-5 rounded-xl border border-indigo-200 bg-white shadow-xs overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3 border-b border-indigo-200/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Agentic Experiment Plan
            </h4>
            <p className="text-[11px] text-slate-500">
              Novel experiment hypothesis formulated from grounded paper findings
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full border border-indigo-200">
          Hypothesis & Protocol
        </span>
      </div>

      {/* Distinction Banner */}
      <div className="px-4 py-2.5 bg-amber-50/70 border-b border-amber-200/60 text-xs text-amber-900 flex items-start space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Academic Distinction Note:</strong> {plan.distinctionNote || 'The proposed experiment protocol and hypothesis below are novel suggestions synthesized by the agent, extending beyond the authors\' published empirical results.'}
        </p>
      </div>

      {/* Plan Grid */}
      <div className="p-4 space-y-4 text-xs">
        {/* Research Objective */}
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wide mb-1">
              1. Research Objective
            </h5>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              {plan.researchObjective}
            </p>
          </div>
        </div>

        {/* Proposed Experiment */}
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wide mb-1">
              2. Proposed Experiment Setup
            </h5>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              {plan.proposedExperiment}
            </p>
          </div>
        </div>

        {/* Methodology */}
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
            <Workflow className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wide mb-1">
              3. Proposed Methodology & Architecture
            </h5>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              {plan.possibleMethodology}
            </p>
          </div>
        </div>

        {/* Evaluation Metrics */}
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wide mb-1">
              4. Quantitative Evaluation Metrics
            </h5>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              {plan.evaluationMetrics}
            </p>
          </div>
        </div>

        {/* Expected Challenges */}
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wide mb-1">
              5. Expected Technical & Empirical Challenges
            </h5>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              {plan.expectedChallenges}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
