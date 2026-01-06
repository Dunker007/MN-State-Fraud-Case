import 'server-only';

// Database abstraction layer
// For now, uses JSON files for persistence (can migrate to SQLite later)

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Collection types
export interface FundSnapshot {
    date: string;
    fund_balance_millions: number;
    claims_received: number;
    claims_approved: number;
    total_payout_millions: number;
    notes?: string;
    source?: string;
}

export interface Article {
    url: string;
    title: string;
    description?: string;
    source?: string;
    published_date?: string;
    sentiment?: string;
}

export interface Official {
    name: string;
    title?: string;
    agency?: string;
    statements: Array<{
        date: string;
        quote: string;
        source?: string;
        source_url?: string;
    }>;
}

export interface Bill {
    bill_number: string;
    title: string;
    summary?: string;
    status: string;
    last_action?: string;
    last_action_date?: string;
    authors?: string;
    url?: string;
}

export interface CourtCase {
    case_number: string;
    title: string;
    court?: string;
    status: string;
    filing_date?: string;
    parties?: string;
    summary?: string;
    url?: string;
}

export interface CollectionLog {
    collector: string;
    status: string;
    items_collected: number;
    error_message?: string;
    timestamp: string;
}

// Ensure data directory exists
function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

// Generic JSON file operations
function readJson<T>(filename: string, defaultValue: T): T {
    ensureDataDir();
    const filepath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filepath)) {
        return defaultValue;
    }
    try {
        return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    } catch {
        return defaultValue;
    }
}

function writeJson<T>(filename: string, data: T): void {
    ensureDataDir();
    const filepath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// Snapshots
export function getSnapshots(): FundSnapshot[] {
    return readJson<FundSnapshot[]>('snapshots.json', []);
}

export function upsertSnapshot(snapshot: FundSnapshot): void {
    const snapshots = getSnapshots();
    const existingIndex = snapshots.findIndex(s => s.date === snapshot.date);
    if (existingIndex >= 0) {
        snapshots[existingIndex] = snapshot;
    } else {
        snapshots.unshift(snapshot); // Add to front (newest first)
    }
    writeJson('snapshots.json', snapshots);
}

// Articles
export function getArticles(): Article[] {
    return readJson<Article[]>('articles.json', []);
}

export function addArticle(article: Article): void {
    const articles = getArticles();
    if (!articles.find(a => a.url === article.url)) {
        articles.unshift(article);
        writeJson('articles.json', articles);
    }
}

// Bills
export function getBills(): Bill[] {
    return readJson<Bill[]>('bills.json', []);
}

export function upsertBill(bill: Bill): void {
    const bills = getBills();
    const existingIndex = bills.findIndex(b => b.bill_number === bill.bill_number);
    if (existingIndex >= 0) {
        bills[existingIndex] = bill;
    } else {
        bills.unshift(bill);
    }
    writeJson('bills.json', bills);
}

// Court cases
export function getCourtCases(): CourtCase[] {
    return readJson<CourtCase[]>('court_cases.json', []);
}

export function upsertCourtCase(courtCase: CourtCase): void {
    const cases = getCourtCases();
    const existingIndex = cases.findIndex(c => c.case_number === courtCase.case_number);
    if (existingIndex >= 0) {
        cases[existingIndex] = courtCase;
    } else {
        cases.unshift(courtCase);
    }
    writeJson('court_cases.json', cases);
}

// Collection logs
export function logCollection(collector: string, status: string, itemsCollected = 0, errorMessage?: string): void {
    const logs = readJson<CollectionLog[]>('collection_logs.json', []);
    logs.unshift({
        collector,
        status,
        items_collected: itemsCollected,
        error_message: errorMessage,
        timestamp: new Date().toISOString()
    });
    // Keep only last 100 logs
    writeJson('collection_logs.json', logs.slice(0, 100));
}

export function getCollectionLogs(): CollectionLog[] {
    return readJson<CollectionLog[]>('collection_logs.json', []);
}
