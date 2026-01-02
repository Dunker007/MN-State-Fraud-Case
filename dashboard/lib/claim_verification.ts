
export interface ClaimEvidence {
    primary_source: string;
    verification_url?: string;
    csv_row?: Record<string, unknown>;
    calculation?: Record<string, unknown>;
    cross_references?: string[];
}

export interface Claim {
    id: string;
    type: entity_risk | pattern | timeline | financial | status;
    statement: string;
    evidence: ClaimEvidence;
    verification_steps: string[];
    legal_citation?: string;
    entity_id?: string;
}

export interface GeneratedReceipt {
    receipt_id: string;
    generated_at: string;
    claim: Claim;
    qr_code_url: string; // We'll just generate the string URL for now
    printable: boolean;
    shareable_link: string;
}

export function generateReceipt(claim: Claim): GeneratedReceipt {
    const timestamp = Date.now();
    return {
        receipt_id: `RECEIPT-${timestamp.toString(36).toUpperCase()}`,
        generated_at: new Date().toISOString(),
        claim: claim,
        qr_code_url: `https://glasshouse.mn.gov/evidence/receipt?id=${claim.id}`, // Mock base URL
        printable: true,
        shareable_link: `/evidence/receipt/${claim.id}` // In a real app, this would route to a dynamic page
    };
}
