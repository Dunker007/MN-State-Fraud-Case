
export interface DocumentMeta {
    id: string;
    title: string;
    filename: string;
    path: string;
    category: 'Federal Indictments' | 'State Documents' | 'Whistleblower Reports' | 'Evidence Files' | 'System Logs';
    size: string;
    pages: number;
    date_added: string;
    summary: string;
    tags: string[];
    flagged?: boolean;
}

export const DOCUMENT_LIBRARY: DocumentMeta[] = [
    {
        id: 'doc_001',
        title: 'The Active Deception',
        filename: 'The_Active_Deception.pdf',
        path: '/evidence/The_Active_Deception.pdf',
        category: 'Whistleblower Reports',
        size: '2.4 MB',
        pages: 12,
        date_added: '2024-12-30',
        summary: "Analysis of entities maintaining 'Active' status despite suspensions. Detailed logs of system access during the silence period.",
        tags: ['alibi', 'status_mismatch', 'critical'],
        flagged: true
    },
    {
        id: 'doc_002',
        title: 'Whistleblower Warning Unheeded',
        filename: 'Whistleblower_Warning_Unheeded_System_Failure_Crisis.pdf',
        path: '/evidence/Whistleblower_Warning_Unheeded_System_Failure_Crisis.pdf',
        category: 'Whistleblower Reports',
        size: '1.8 MB',
        pages: 8,
        date_added: '2024-12-30',
        summary: 'Internal memo detailing critical system failures and lack of oversight in the HCBS billing portal.',
        tags: ['whistleblower', 'system_failure'],
        flagged: true
    },
    {
        id: 'doc_003',
        title: 'Minnesota DHS Overview',
        filename: 'Minnesota _ DHS.pdf',
        path: '/evidence/Minnesota _ DHS.pdf',
        category: 'State Documents',
        size: '3.1 MB',
        pages: 45,
        date_added: '2024-12-30',
        summary: 'Official DHS documentation, organizational charts, and standard operating procedures for licensure.',
        tags: ['official', 'procedures']
    },
    {
        id: 'doc_004',
        title: 'U.S. v. Fowsiya Adan - Indictment',
        filename: 'US_vs_Adan_Indictment.pdf',
        path: '/evidence/US_vs_Adan_Indictment.pdf',
        category: 'Federal Indictments',
        size: '4.2 MB',
        pages: 28,
        date_added: '2024-11-15',
        summary: 'Federal indictment charging Fowsiya Adan with wire fraud and money laundering regarding EIDBI billing.',
        tags: ['indictment', 'federal', 'eidbi']
    },
    {
        id: 'doc_005',
        title: 'System Access Logs - Oct 2024',
        filename: 'sys_logs_oct24.txt',
        path: '/evidence/sys_logs_oct24.txt',
        category: 'System Logs',
        size: '156 KB',
        pages: 1,
        date_added: '2024-12-30',
        summary: 'Raw server logs showing login activity from suspended accounts during the silence period.',
        tags: ['logs', 'forensic', 'raw_data']
    }
];
