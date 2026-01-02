
import { orgData, OrgNode } from './org-data';

export type InvestigationStatus = 'CLEAN' | 'TARGET' | 'POI' | 'PROTECTED' | 'WITNESS' | 'BURIED';

export interface DossierEntry {
    id: string;
    name: string;
    role: string;
    investigationStatus: InvestigationStatus;
    notes: string;
    priorityScore: number;
    intelNotes: string[];
}

export const INTEL_DATABASE: Record<string, { status: InvestigationStatus; notes: string }> = {
    'Dawn Davis': {
        status: 'TARGET',
        notes: "ACTIVE / HIGH EXPOSURE. Architect of the 'Systems Issue'. Testified to 85% clearance rate right before failure. Operational face of the collapse."
    },
    'Kate Bigg': {
        status: 'POI',
        notes: "CONFIRMED GHOST. Compliance wing effectively silent during raids. Search results show zero public defense of record. Validates 'Empty Department' theory."
    },
    'Taylor Dejvongsa': {
        status: 'WITNESS',
        notes: "Payment Processing Lead. The 'bottleneck'. Intelligence suggests she was directed to approve payments despite known errors. High-value subpoena target."
    },
    'Megan Thompson': {
        status: 'POI',
        notes: "Asst Deputy IG overseeing the hollowed-out Compliance wing. Direct report to Davis."
    },
    'Josh Quigley': {
        status: 'POI',
        notes: "Asst Deputy IG overseeing the high-volume Research factory. Focus on throughput metrics."
    },
    'Mary Sparish': {
        status: 'POI',
        notes: "EOS to Dawn Davis. Gatekeeper."
    },
    'Chuck Jaeger': {
        status: 'CLEAN',
        notes: "Survivalist Bureaucrat. No criminal hits detected. Keeping head down to avoid the purge. Supervisory failure likely due to systemic lack of resources rather than malice."
    },
    'Kelly MacGregor': {
        status: 'CLEAN',
        notes: "Survivalist Bureaucrat. No criminal hits detected. Keeping head down to avoid the purge. Managing multiple vacancies with zero support."
    },
    'Julie Lange': {
        status: 'CLEAN',
        notes: "Survivalist Bureaucrat. Keeping head down. No significant news hits or criminal records found in forensic sweep."
    },
    'Jana Nicolaison': {
        status: 'POI',
        notes: "Failure to maintain proper staffing levels. Area Manager oversight failure."
    }
};

const getPriorityScore = (status: InvestigationStatus): number => {
    switch (status) {
        case 'TARGET': return 95;
        case 'BURIED': return 85;
        case 'POI': return 70;
        case 'PROTECTED': return 50;
        case 'WITNESS': return 40;
        case 'CLEAN': return 10;
        default: return 0;
    }
};

export function getDossierList(): DossierEntry[] {
    const entries: DossierEntry[] = [];

    const traverse = (node: OrgNode) => {
        if (node.person && !node.person.includes('Vacant') && !node.person.includes('VACANT')) {
            const cleanedName = node.person.split('(')[0].trim();
            let intel = INTEL_DATABASE[cleanedName];

            if (!intel) {
                const key = Object.keys(INTEL_DATABASE).find(k => node.person?.includes(k));
                if (key) intel = INTEL_DATABASE[key];
            }

            const status = intel?.status || 'CLEAN';
            const notesText = intel?.notes || "No known wrongdoing at this time. Standard regulatory function.";

            entries.push({
                id: node.id,
                name: node.person,
                role: node.title,
                investigationStatus: status,
                notes: notesText,
                priorityScore: getPriorityScore(status),
                intelNotes: notesText.split('. ').filter(n => n.length > 0)
            });
        }
        if (node.children) {
            node.children.forEach(traverse);
        }
    };

    traverse(orgData);

    // Add Manuals
    entries.push({
        id: 'kulani_moti',
        name: 'Kulani Moti',
        role: 'Former Inspector General',
        investigationStatus: 'BURIED',
        notes: "Transferred to Senior Counsel role Jan 2025. Communications shielded by Attorney-Client Privilege.",
        priorityScore: 85,
        intelNotes: ['Transferred to Senior Counsel role Jan 2025', 'Communications shielded by Attorney-Client Privilege']
    });

    entries.push({
        id: 'shireen_gandhi',
        name: 'Shireen Gandhi',
        role: 'Temporary Commissioner (DHS)',
        investigationStatus: 'TARGET',
        notes: "Signed Sept/Oct 2025 'Credible Fraud' suspension letters. bridging the 'Glitch' narrative and 'Purge' reality.",
        priorityScore: 95,
        intelNotes: ["Signed Sept/Oct 2025 'Credible Fraud' suspension letters", "Bridging the 'Glitch' narrative and 'Purge' reality"]
    });


    return entries.sort((a, b) => b.priorityScore - a.priorityScore);
}
