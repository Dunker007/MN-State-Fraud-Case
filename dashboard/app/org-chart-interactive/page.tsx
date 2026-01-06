'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dagre from 'dagre';
import {
  ReactFlowProvider,
  useReactFlow,
  Position,
  Handle,
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Music, Image, File, FileText as NoteIcon } from 'lucide-react';
import { orgData, OrgNode } from "@/lib/org-data";
import { evidenceData } from "@/lib/data";

interface OrgNodeData {
  title: string;
  person?: string;
  status: string;
  notes?: string;
  [key: string]: unknown;
}

type OrgNodeType = Node<OrgNodeData>;

interface EdgeType extends Edge { }

const nodeTypes = {
  orgNode: ({ data }: { data: OrgNodeData }) => (
    <div className={`p-4 rounded-lg border-2 shadow-lg min-w-[200px] cursor-pointer group hover:scale-105 transition-all
      ${data.status === 'VACANT' || data.status === 'OVERWHELMED' ? 'bg-red-950 border-red-500 shadow-red-500/50' : 'bg-zinc-900 border-zinc-700 shadow-zinc-900/50'}
      ${data.status === 'ILLUSION' ? 'bg-blue-950/50 border-blue-500 shadow-blue-500/30' : ''}`}>
      <Handle type="target" position={Position.Top} className="-top-5 w-16 h-1 bg-zinc-600" />
      <div className="font-bold text-white mb-1 text-center">{data.title}</div>
      {data.person && <div className="text-zinc-300 text-sm mb-1">{data.person}</div>}
      {data.notes && <div className="text-xs text-zinc-400 italic">{data.notes}</div>}
      <div className={`mt-2 text-[10px] font-bold px-2 py-1 rounded w-fit mx-auto uppercase tracking-wider
        ${data.status === 'VACANT' ? 'bg-red-900 text-red-200 border-red-500' : data.status === 'OVERWHELMED' ? 'bg-orange-900 text-orange-200 border-orange-500' : 'bg-zinc-800 text-zinc-300 border-zinc-600'}`}>
        {data.status}
      </div>
      <Handle type="source" position={Position.Bottom} className="-bottom-5 w-16 h-1 bg-zinc-600" />
    </div>
  ),
};

function flattenOrgTree(node: OrgNode, parentId?: string, nodes: OrgNodeType[] = [], edges: EdgeType[] = []): { nodes: OrgNodeType[], edges: EdgeType[] } {
  const nodeId = node.id;
  nodes.push({
    id: nodeId,
    position: { x: 0, y: 0 },
    data: {
      title: node.title,
      person: node.person,
      status: node.status,
      notes: node.notes,
    },
    type: 'orgNode',
  });

  if (parentId) {
    edges.push({
      id: `e${parentId}-${nodeId}`,
      source: parentId,
      target: nodeId,
      type: 'smoothstep',
      style: { stroke: '#666' },
    });
  }

  if (node.children) {
    node.children.forEach(child => flattenOrgTree(child, nodeId, nodes, edges));
  }

  return { nodes, edges };
}

const initialLayout = flattenOrgTree(orgData);

interface FlowProps {
  initialNodes: OrgNodeType[];
  initialEdges: EdgeType[];
  onNodeClick: (event: React.MouseEvent, node: OrgNodeType) => void;
}

function Flow({ initialNodes, initialEdges, onNodeClick }: FlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowInstance = useReactFlow();

  const getLayoutedElements = useCallback((nodes: OrgNodeType[], edges: EdgeType[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 220, height: 120 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    return {
      nodes: nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = Position.Top;
        node.sourcePosition = Position.Bottom;
        node.position = {
          x: nodeWithPosition.x - nodeWithPosition.width / 2,
          y: nodeWithPosition.y - nodeWithPosition.height / 2,
        };
        return node;
      }),
      edges,
    };
  }, []);

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    window.requestAnimationFrame(() => {
      reactFlowInstance.fitView();
    });
  }, [initialNodes, initialEdges, getLayoutedElements, setNodes, setEdges, reactFlowInstance]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      fitView={false}
      nodeTypes={nodeTypes}
      nodesConnectable={true}
      nodesDraggable={true}
      elementsSelectable={true}
      minZoom={0.1}
      maxZoom={2}
      fitViewOptions={{ padding: 0.2 }}
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}

// DashboardNavigation removed as CompactTopNav handles navigation
// ... imports remain the same

export default function InteractiveOrgChart() {
  const initialNodes = initialLayout.nodes;
  const initialEdges = initialLayout.edges;
  const [selectedNode, setSelectedNode] = useState<OrgNodeData | null>(null);
  const [activeTab, setActiveTab] = useState<'pdfs' | 'audio' | 'images' | 'csvs' | 'notes'>('pdfs');

  const onNodeClick = useCallback((_event: React.MouseEvent, node: OrgNodeType) => {
    setSelectedNode(node.data);
  }, [setSelectedNode]);

  const nodeEvidence = selectedNode ? (evidenceData.documents || []).filter(doc =>
    doc.title.toLowerCase().includes(selectedNode.person?.toLowerCase() || '') ||
    selectedNode.title.toLowerCase().includes(doc.title.toLowerCase())
  ) : [];

  const pdfs = nodeEvidence.filter(doc => doc.path?.toLowerCase().includes('.pdf'));
  const audio = nodeEvidence.filter(doc => doc.path?.toLowerCase().includes('.m4a') || doc.path?.toLowerCase().includes('.mp3'));
  const images = nodeEvidence.filter(doc => doc.path?.toLowerCase().includes('.png') || doc.path?.toLowerCase().includes('.jpg') || doc.path?.toLowerCase().includes('.svg') || doc.path?.toLowerCase().includes('.jpeg'));
  const csvs = nodeEvidence.filter(doc => doc.path?.toLowerCase().includes('.csv'));
  const notes = nodeEvidence.filter(doc => doc.path?.toLowerCase().includes('.txt') || doc.type?.toLowerCase().includes('raw'));

  return (
    <div className="flex flex-col h-screen bg-[#050505]">
      {/* Header handled by Layout */}

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 w-full border-b border-zinc-800 relative">
          <ReactFlowProvider>
            <Flow initialNodes={initialNodes} initialEdges={initialEdges} onNodeClick={onNodeClick} />
          </ReactFlowProvider>
        </div>

        <div className="h-[35vh] bg-zinc-900 border-t border-zinc-800 overflow-hidden flex shrink-0">
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key="dossier"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex-1 flex overflow-hidden"
              >
                <div className="w-80 bg-zinc-950 border-r border-zinc-800 p-4 flex flex-col overflow-y-auto">
                  <h3 className="font-bold text-white mb-2">{selectedNode.title}</h3>
                  {selectedNode.person && <p className="text-zinc-400 mb-4">{selectedNode.person}</p>}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${selectedNode.status === 'VACANT' ? 'bg-red-500' : 'bg-green-500'}`} />
                      <span className="uppercase tracking-wider font-mono">{selectedNode.status}</span>
                    </div>
                    {selectedNode.notes && <p className="text-zinc-500">{selectedNode.notes}</p>}
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-auto">
                  {/* Content Section */}
                  <div className="flex border-b border-zinc-700 mb-4 sticky top-0 bg-zinc-900 pt-1 z-10">
                    <button onClick={() => setActiveTab('pdfs')} className={`flex-1 py-2 px-4 text-xs uppercase font-mono ${activeTab === 'pdfs' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-zinc-400 hover:text-white'}`}>
                      <FileText className="w-4 h-4 inline mr-1" /> PDFs
                    </button>
                    <button onClick={() => setActiveTab('audio')} className={`flex-1 py-2 px-4 text-xs uppercase font-mono ${activeTab === 'audio' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-zinc-400 hover:text-white'}`}>
                      <Music className="w-4 h-4 inline mr-1" /> Audio
                    </button>
                    <button onClick={() => setActiveTab('images')} className={`flex-1 py-2 px-4 text-xs uppercase font-mono ${activeTab === 'images' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-zinc-400 hover:text-white'}`}>
                      <Image className="w-4 h-4 inline mr-1" /> Images
                    </button>
                    <button onClick={() => setActiveTab('csvs')} className={`flex-1 py-2 px-4 text-xs uppercase font-mono ${activeTab === 'csvs' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-zinc-400 hover:text-white'}`}>
                      <File className="w-4 h-4 inline mr-1" /> CSVs
                    </button>
                    <button onClick={() => setActiveTab('notes')} className={`flex-1 py-2 px-4 text-xs uppercase font-mono ${activeTab === 'notes' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-zinc-400 hover:text-white'}`}>
                      <NoteIcon className="w-4 h-4 inline mr-1" /> Notes
                    </button>
                  </div>
                  <div className="space-y-2">
                    {activeTab === 'pdfs' && (
                      <div>
                        {pdfs.length > 0 ? pdfs.map(doc => (
                          <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="block p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-sm">
                            {doc.title}
                          </a>
                        )) : <p className="text-zinc-500 text-sm">No PDFs for this node</p>}
                      </div>
                    )}
                    {activeTab === 'audio' && (
                      <div>
                        {audio.length > 0 ? audio.map(doc => (
                          <div key={doc.id} className="mb-2">
                            <div className="text-xs text-zinc-400 mb-1">{doc.title}</div>
                            <audio controls className="w-full">
                              <source src={doc.url} />
                            </audio>
                          </div>
                        )) : <p className="text-zinc-500 text-sm">No Audio</p>}
                      </div>
                    )}
                    {activeTab === 'images' && (
                      <div className="flex flex-wrap gap-2">
                        {images.length > 0 ? images.map(doc => (
                          <img key={doc.id || doc.title} src={doc.url} alt={doc.title} className="max-w-full h-32 object-contain border rounded bg-zinc-800" />
                        )) : <p className="text-zinc-500 text-sm">No Images</p>}
                      </div>
                    )}
                    {activeTab === 'csvs' && (
                      <div>
                        {csvs.length > 0 ? csvs.map(doc => (
                          <a key={doc.id || doc.title} href={doc.url} target="_blank" rel="noopener noreferrer" className="block p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-sm">
                            {doc.title}
                          </a>
                        )) : <p className="text-zinc-500 text-sm">No CSVs</p>}
                      </div>
                    )}
                    {activeTab === 'notes' && (
                      <div className="space-y-2">
                        {notes.length > 0 ? notes.map(doc => (
                          <div key={doc.id || doc.title} className="p-2 bg-zinc-800 rounded text-xs">
                            <h4 className="font-bold text-sm mb-1">{doc.title}</h4>
                            <p className="whitespace-pre-wrap">{doc.description}</p>
                          </div>
                        )) : <p className="text-zinc-500 text-sm">No Notes</p>}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex items-center justify-center text-zinc-500 text-sm font-mono uppercase tracking-wider"
              >
                Click a node to view dossier
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
