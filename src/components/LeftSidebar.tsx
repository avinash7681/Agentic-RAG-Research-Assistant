import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckSquare,
  Square,
  Trash2,
  Eye,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  FileCheck2,
} from 'lucide-react';
import type { DocumentRecord } from '../types/index.ts';

interface LeftSidebarProps {
  documents: DocumentRecord[];
  selectedDocIds: string[];
  onToggleSelectDoc: (id: string) => void;
  onSelectAll: (select: boolean) => void;
  onUpload: (files: FileList | File[]) => void;
  isUploading: boolean;
  onDeleteDoc: (id: string) => void;
  onInspectDoc: (doc: DocumentRecord) => void;
  onLoadSamples: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  documents,
  selectedDocIds,
  onToggleSelectDoc,
  onSelectAll,
  onUpload,
  isUploading,
  onDeleteDoc,
  onInspectDoc,
  onLoadSamples,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocs = documents.filter(
    (d) =>
      d.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.authors && d.authors.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const allSelected = documents.length > 0 && selectedDocIds.length === documents.length;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 text-sm flex items-center space-x-1.5">
              <span>Research Papers</span>
              <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-mono">
                {documents.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Uploaded & indexed PDF corpus</p>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Drop Zone */}
        <div className="p-3 border-b border-slate-100">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
                : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,application/pdf"
              multiple
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
                <UploadCloud className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-slate-800">
                {isUploading ? 'Uploading & Indexing...' : 'Upload Research PDF'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Drag & drop or click to browse (up to 30MB)
              </p>
            </div>
          </div>
        </div>

        {/* Paper Search & Select All Bar */}
        <div className="p-3 border-b border-slate-100 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter papers by title, author..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {documents.length > 0 && (
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <button
                onClick={() => onSelectAll(!allSelected)}
                className="flex items-center space-x-1.5 text-slate-600 hover:text-blue-600 transition-colors font-medium cursor-pointer"
              >
                {allSelected ? (
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Select All ({documents.length})</span>
              </button>
              <span className="text-[11px] text-slate-400">
                {selectedDocIds.length} active for queries
              </span>
            </div>
          )}
        </div>

        {/* Paper List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredDocs.length === 0 ? (
            <div className="p-6 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700">No papers found</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Upload your research PDFs or load benchmark papers to begin.
              </p>
              <button
                onClick={onLoadSamples}
                className="mt-3 inline-flex items-center space-x-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Benchmark Papers</span>
              </button>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  className={`group relative rounded-xl border p-3 transition-all ${
                    isSelected
                      ? 'border-blue-300 bg-blue-50/40 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start space-x-2.5">
                    {/* Checkbox */}
                    <button
                      onClick={() => onToggleSelectDoc(doc.id)}
                      className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      title={isSelected ? 'Deselect paper' : 'Select paper for queries'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>

                    {/* Paper Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5 mb-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <h3
                          onClick={() => onToggleSelectDoc(doc.id)}
                          className="font-semibold text-xs text-slate-900 truncate hover:text-blue-600 cursor-pointer"
                          title={doc.displayName}
                        >
                          {doc.displayName}
                        </h3>
                      </div>

                      {doc.authors && (
                        <p className="text-[11px] text-slate-500 truncate mb-1.5">
                          {doc.authors}
                        </p>
                      )}

                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-1 text-[10px]">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                          {doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'}
                        </span>
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {(doc.filesize / 1024).toFixed(0)} KB
                        </span>

                        {doc.status === 'ready' && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Indexed</span>
                          </span>
                        )}
                        {doc.status === 'indexing' && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded flex items-center space-x-0.5 animate-pulse">
                            <Clock className="w-2.5 h-2.5 text-amber-600" />
                            <span>Indexing...</span>
                          </span>
                        )}
                        {doc.isSample && (
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded">
                            Benchmark
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => onInspectDoc(doc)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition-colors cursor-pointer"
                        title="Inspect Document Abstract & Pages"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteDoc(doc.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors cursor-pointer"
                        title="Delete paper"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Grounding Engine:</span>
            </span>
            <span className="font-semibold text-slate-700">Gemini File Search</span>
          </div>
        </div>
      </aside>
    </>
  );
};
