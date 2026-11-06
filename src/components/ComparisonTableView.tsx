import React from 'react';
import { Columns3, BookOpen, Quote, ShieldCheck } from 'lucide-react';
import type { ComparisonTableRow } from '../types/index.ts';

interface ComparisonTableViewProps {
  table: ComparisonTableRow[];
  onCitationClick?: (citation: string) => void;
}

export const ComparisonTableView: React.FC<ComparisonTableViewProps> = ({
  table,
  onCitationClick,
}) => {
  if (!table || table.length === 0) return null;

  // Extract all paper names from first row
  const paperNames = Object.keys(table[0].papers || {});

  return (
    <div className="my-5 rounded-xl border border-blue-200 bg-white shadow-xs overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 px-4 py-3 border-b border-blue-200/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Columns3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Paper Comparison Matrix
            </h4>
            <p className="text-[11px] text-slate-500">
              Comparative analysis across {paperNames.length} research publications
            </p>
          </div>
        </div>

        <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200">
          Source-Grounded Table
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-semibold">
              <th className="py-2.5 px-3.5 w-36 uppercase text-[10px] tracking-wider text-slate-500">
                Evaluation Axis
              </th>
              {paperNames.map((paperName, idx) => (
                <th key={idx} className="py-2.5 px-3.5 min-w-[220px] text-slate-800">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{paperName}</span>
                  </div>
                </th>
              ))}
              <th className="py-2.5 px-3.5 w-48 text-[10px] uppercase tracking-wider text-slate-500">
                Key Citations
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? 'bg-white hover:bg-blue-50/20' : 'bg-slate-50/50 hover:bg-blue-50/20'}
              >
                <td className="py-3 px-3.5 font-bold text-slate-900 align-top bg-slate-50/80 border-r border-slate-100">
                  <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200/60 text-[11px]">
                    {row.axis}
                  </span>
                </td>

                {paperNames.map((pName, pIdx) => {
                  const content = row.papers[pName] || 'Not reported';
                  const isMissing = content.toLowerCase().includes('not reported');
                  return (
                    <td
                      key={pIdx}
                      className={`py-3 px-3.5 text-slate-700 align-top leading-relaxed ${
                        isMissing ? 'italic text-slate-400' : ''
                      }`}
                    >
                      {content}
                    </td>
                  );
                })}

                <td className="py-3 px-3.5 text-slate-500 align-top border-l border-slate-100">
                  {row.citations && row.citations.length > 0 ? (
                    <div className="flex flex-col space-y-1">
                      {row.citations.map((c, cIdx) => (
                        <span
                          key={cIdx}
                          onClick={() => onCitationClick && onCitationClick(c)}
                          className="inline-flex items-center space-x-1 text-[10px] font-mono bg-blue-50 text-blue-700 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 cursor-pointer"
                          title="Click to inspect citation in Document Verifier"
                        >
                          <Quote className="w-2.5 h-2.5 text-blue-500" />
                          <span className="truncate max-w-[170px]">{c}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Synthesized from paper text</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
