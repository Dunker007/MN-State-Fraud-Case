
import { type Entity, type Document } from "./schemas";

export function findRelatedDocuments(entity: Entity, allDocuments: Document[]): Document[] {
    if (!allDocuments || allDocuments.length === 0) return [];

    const searchTerms = [
        entity.name.toLowerCase(),
        entity.id.toLowerCase(),
        ...entity.name.toLowerCase().split(' ').filter(word => word.length > 4) // Search by significant name parts
    ];

    // Also checking for owner name if available
    if (entity.owner && entity.owner !== "UNKNOWN") {
        searchTerms.push(entity.owner.toLowerCase());
    }

    return allDocuments.filter(doc => {
        const docText = (doc.title + " " + doc.description).toLowerCase();
        return searchTerms.some(term => docText.includes(term));
    });
}

export function findSuspectDocuments(suspectName: string, entities: Entity[], allDocuments: Document[]): Document[] {
    // 1. Find documents matching the suspect's name directly
    const directMatches = allDocuments.filter(doc =>
        (doc.title + " " + doc.description).toLowerCase().includes(suspectName.toLowerCase())
    );

    // 2. Find documents matching any of their entities
    const suspectEntities = entities.filter(e => e.owner === suspectName);
    const entityMatches = suspectEntities.flatMap(e => findRelatedDocuments(e, allDocuments));

    // Dedup by ID
    const uniqueDocs = new Map<string, Document>();
    [...directMatches, ...entityMatches].forEach(d => uniqueDocs.set(d.id || d.title, d));

    return Array.from(uniqueDocs.values());
}
