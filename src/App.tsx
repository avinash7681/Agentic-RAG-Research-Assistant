import React, { useState, useEffect } from 'react';
import type { DocumentRecord, ChatMessage, Citation, AgentStep, TestCase } from './types/index.ts';
import { Header } from './components/Header.tsx';
import { LeftSidebar } from './components/LeftSidebar.tsx';
import { RightSidebar } from './components/RightSidebar.tsx';
import { ChatSection } from './components/ChatSection.tsx';
import { AgentActivityPanel } from './components/AgentActivityPanel.tsx';
import { DocumentModal } from './components/DocumentModal.tsx';

export default function App() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeCitations, setActiveCitations] = useState<Citation[]>([]);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [activeAgentSteps, setActiveAgentSteps] = useState<AgentStep[]>([]);
  const [lastExecutionTimeMs, setLastExecutionTimeMs] = useState<number | undefined>();

  // UI state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isLoadingQuery, setIsLoadingQuery] = useState<boolean>(false);
  const [isLoadingSamples, setIsLoadingSamples] = useState<boolean>(false);
  const [inspectedDoc, setInspectedDoc] = useState<DocumentRecord | null>(null);

  // Panels
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(true);
  const [activityPanelOpen, setActivityPanelOpen] = useState<boolean>(true);
  const [rightSidebarTab, setRightSidebarTab] = useState<'citations' | 'verifier' | 'tests'>('citations');

  // Load documents on mount
  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.success && data.documents) {
        setDocuments(data.documents);
        // Default select all if no previous selection
        setSelectedDocIds((prev) => {
          if (prev.length === 0) {
            return data.documents.map((d: DocumentRecord) => d.id);
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Upload handler
  const handleUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    try {
      setIsUploading(true);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.documents) {
        await fetchDocuments();
        // Automatically select newly uploaded documents
        const newIds = data.documents.map((d: DocumentRecord) => d.id);
        setSelectedDocIds((prev) => Array.from(new Set([...prev, ...newIds])));
      } else {
        alert(data.error || 'Upload failed.');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Upload failed: ' + (err.message || 'Network error'));
    } finally {
      setIsUploading(false);
    }
  };

  // Load benchmark sample papers
  const handleLoadSamples = async () => {
    try {
      setIsLoadingSamples(true);
      const res = await fetch('/api/documents/load-samples', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.documents) {
        await fetchDocuments();
        setSelectedDocIds(data.documents.map((d: DocumentRecord) => d.id));
      }
    } catch (err) {
      console.error('Failed to load sample papers:', err);
    } finally {
      setIsLoadingSamples(false);
    }
  };

  // Delete document
  const handleDeleteDoc = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        setSelectedDocIds((prev) => prev.filter((dId) => dId !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Toggle selection
  const handleToggleSelectDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (select: boolean) => {
    setSelectedDocIds(select ? documents.map((d) => d.id) : []);
  };

  // Query Agent
  const handleSendMessage = async (queryText: string) => {
    const userMessage: ChatMessage = {
      id: 'msg_user_' + Date.now(),
      role: 'user',
      content: queryText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoadingQuery(true);

    // Initial placeholder agent steps in the trace
    const initialSteps: AgentStep[] = [
      {
        id: 'step_planner_init',
        name: 'Query Planner',
        stepType: 'query_planning',
        status: 'in_progress',
        timestamp: new Date().toISOString(),
        summary: 'Decomposing query and selecting research scope...',
      },
    ];
    setActiveAgentSteps(initialSteps);
    setActivityPanelOpen(true);

    try {
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/agent/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          selectedDocumentIds: selectedDocIds,
          chatHistory: historyPayload,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: data.id || 'msg_asst_' + Date.now(),
          role: 'assistant',
          content: data.answer,
          timestamp: new Date().toISOString(),
          classification: data.classification,
          agentSteps: data.agentSteps,
          citations: data.citations,
          comparisonTable: data.comparisonTable,
          experimentPlan: data.experimentPlan,
          retryOccurred: data.retryOccurred,
          executionTimeMs: data.executionTimeMs,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setActiveCitations(data.citations || []);
        setActiveAgentSteps(data.agentSteps || []);
        setLastExecutionTimeMs(data.executionTimeMs);

        // Open right sidebar citations tab
        setRightSidebarOpen(true);
        setRightSidebarTab('citations');
      } else {
        const errorMessage: ChatMessage = {
          id: 'msg_err_' + Date.now(),
          role: 'assistant',
          content: `**Error processing query:** ${data.error || 'Server error'}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err: any) {
      console.error('Agent query failed:', err);
      const errorMessage: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content: `**Execution failure:** ${err.message || 'Network error occurred while calling the agent.'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoadingQuery(false);
    }
  };

  // Inspect citation in Document Verifier
  const handleSelectCitation = (citation: Citation) => {
    setSelectedCitation(citation);
    setRightSidebarOpen(true);
    setRightSidebarTab('verifier');
  };

  // Inspect trace for specific message
  const handleOpenTraceForMessage = (msg: ChatMessage) => {
    if (msg.agentSteps) {
      setActiveAgentSteps(msg.agentSteps);
    }
    setLastExecutionTimeMs(msg.executionTimeMs);
    setActivityPanelOpen(true);
  };

  // Run test case
  const handleRunTestCase = (testCase: TestCase) => {
    // If target papers specified, match and select them
    if (testCase.targetPapers && testCase.targetPapers.length > 0) {
      const matchedIds = documents
        .filter((d) =>
          testCase.targetPapers.some((tp) =>
            d.displayName.toLowerCase().includes(tp.toLowerCase()) ||
            tp.toLowerCase().includes(d.displayName.toLowerCase())
          )
        )
        .map((d) => d.id);
      if (matchedIds.length > 0) {
        setSelectedDocIds(matchedIds);
      }
    }

    handleSendMessage(testCase.prompt);
  };

  const selectedDocuments = documents.filter((d) => selectedDocIds.includes(d.id));

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 text-slate-900">
      {/* Top Header */}
      <Header
        documentCount={documents.length}
        selectedCount={selectedDocIds.length}
        onLoadSamples={handleLoadSamples}
        isLoadingSamples={isLoadingSamples}
        onOpenTestCases={() => {
          setRightSidebarOpen(true);
          setRightSidebarTab('tests');
        }}
        activityPanelOpen={activityPanelOpen}
        onToggleActivityPanel={() => setActivityPanelOpen(!activityPanelOpen)}
        onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
        onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
        hasGeminiKey={true}
      />

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Uploaded Papers & Upload Area) */}
        <LeftSidebar
          documents={documents}
          selectedDocIds={selectedDocIds}
          onToggleSelectDoc={handleToggleSelectDoc}
          onSelectAll={handleSelectAll}
          onUpload={handleUpload}
          isUploading={isUploading}
          onDeleteDoc={handleDeleteDoc}
          onInspectDoc={(doc) => setInspectedDoc(doc)}
          onLoadSamples={handleLoadSamples}
          isOpenMobile={leftSidebarOpen}
          onCloseMobile={() => setLeftSidebarOpen(false)}
        />

        {/* Center: AI Research Chat & Experiment Section */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <ChatSection
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoadingQuery}
            selectedDocuments={selectedDocuments}
            allDocuments={documents}
            onSelectCitation={handleSelectCitation}
            onOpenTraceForMessage={handleOpenTraceForMessage}
            onRunPreset={(prompt) => handleSendMessage(prompt)}
          />

          {/* Bottom Docked Agent Activity Panel */}
          <AgentActivityPanel
            steps={activeAgentSteps}
            isOpen={activityPanelOpen}
            onClose={() => setActivityPanelOpen(false)}
            isExecuting={isLoadingQuery}
            executionTimeMs={lastExecutionTimeMs}
          />
        </main>

        {/* Right Sidebar (Citations, Doc Verifier, Test Suite) */}
        <RightSidebar
          citations={activeCitations}
          documents={documents}
          onSelectCitation={handleSelectCitation}
          selectedCitation={selectedCitation}
          isOpen={rightSidebarOpen}
          onClose={() => setRightSidebarOpen(false)}
          onRunTestCase={handleRunTestCase}
          initialTab={rightSidebarTab}
        />
      </div>

      {/* Modal for Raw Paper Inspector */}
      {inspectedDoc && (
        <DocumentModal
          document={inspectedDoc}
          onClose={() => setInspectedDoc(null)}
        />
      )}
    </div>
  );
}
