export interface MasterlistEntity {
    license_id: string;
    name: string;
    owner?: string;
    status: string;
    status_date?: string;
    street: string;
    city: string;
    zip: string;
    county?: string;
    service_type?: string;
    is_ghost_office?: boolean;
    has_curated_data?: boolean;
}

export interface SearchParams {
    query?: string;
    limit?: number;
    county?: string[];
    status?: string[];
}

export interface Pagination {
    page: number;
    pageSize: number;
    total: number;
}
