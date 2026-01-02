
import { Node, Edge } from '@xyflow/react';

// --- CONFIGURATION ---
// "Red-Line" Logic: High Value Targets get the distinct #EF4444 (Red-500) stroke.
// Honey Pots are #10B981 (Emerald-500) for "Money Flow".
// Mechanisms are #F59E0B (Amber-500) for "Tactics".

export const PENALTY_NODES: Node[] = [
    // --- HIGH VALUE TARGETS (The Crown) ---
    {
        id: 'target-1',
        type: 'default',
        position: { x: 400, y: 50 },
        data: { label: 'TIM WALZ (Gov)' },
        style: {
            background: 'rgba(0,0,0,0.8)',
            border: '2px solid #EF4444',
            color: '#fff',
            width: 180,
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
        }
    },
    {
        id: 'target-2',
        type: 'default',
        position: { x: 650, y: 150 },
        data: { label: 'KEITH ELLISON (AG)' },
        style: {
            background: 'rgba(0,0,0,0.8)',
            border: '2px solid #EF4444',
            color: '#fff',
            width: 180,
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
        }
    },
    {
        id: 'target-3',
        type: 'default',
        position: { x: 150, y: 150 },
        data: { label: 'DHS (Jodi Harpstead)' },
        style: {
            background: 'rgba(0,0,0,0.8)',
            border: '2px solid #EF4444',
            color: '#fff',
            width: 180,
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
        }
    },

    // --- MECHANISMS (The Pipes) ---
    {
        id: 'mech-1',
        type: 'output', // 'output' usually has handle on top
        position: { x: 400, y: 300 },
        data: { label: 'OVERSIGHT FAILURE' },
        style: {
            background: '#18181b',
            border: '1px dashed #F59E0B',
            color: '#F59E0B',
            width: 160
        }
    },
    {
        id: 'mech-2',
        type: 'default',
        position: { x: 100, y: 400 },
        data: { label: 'CCAP Funding Stream' },
        style: {
            background: '#064E3B',
            border: '1px solid #10B981',
            color: '#A7F3D0',
            width: 160
        }
    },

    // --- HONEY POTS (The Catch) ---
    {
        id: 'honey-1',
        type: 'input', // Target usually
        position: { x: 100, y: 550 },
        data: { label: 'Daycare Fraud Ring' },
        style: {
            background: '#7F1D1D',
            border: '1px solid #F87171',
            color: '#FECACA'
        }
    },
    {
        id: 'honey-2',
        type: 'input',
        position: { x: 650, y: 400 },
        data: { label: 'Feeding Our Future' },
        style: {
            background: '#7F1D1D',
            border: '1px solid #F87171',
            color: '#FECACA'
        }
    },
];

export const PENALTY_EDGES: Edge[] = [
    // Funding Flows (Green)
    { id: 'e1-3', source: 'target-1', target: 'target-3', animated: true, style: { stroke: '#10B981' }, label: 'Appoints' },
    { id: 'e3-m2', source: 'target-3', target: 'mech-2', animated: true, style: { stroke: '#F59E0B' }, label: '$ Billions' },
    { id: 'e-m2-h1', source: 'mech-2', target: 'honey-1', animated: true, style: { stroke: '#EF4444', strokeWidth: 2 }, label: 'Fraud Flow' },

    // Oversight Failures (Dotted/Amber)
    { id: 'e2-m1', source: 'target-2', target: 'mech-1', style: { stroke: '#F59E0B', strokeDasharray: '5,5' }, label: 'Ignored Alerts' },
    { id: 'e1-m1', source: 'target-1', target: 'mech-1', style: { stroke: '#F59E0B', strokeDasharray: '5,5' } },

    // The Spiderweb
    { id: 'e-h2-t2', source: 'honey-2', target: 'target-2', animated: true, style: { stroke: '#EF4444' }, label: 'Donations?' },
];
