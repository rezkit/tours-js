import { AxiosInstance } from "axios";

export abstract class ApiGroup {
   protected axios: AxiosInstance

    constructor(axios: AxiosInstance) {
       this.axios = axios
    }
}

export interface Entity {
    id: string

    created_at: string

    updated_at: string
}

/**
 * A paginated response
 */
export interface Paginated<T> {
    /**
     * Total number of results
     */
    total: number
    /**
     * Current page number
     */
    current_page: number
    /**
     * Total number of pages
     */
    last_page: number
    /**
     * Index of first item in `data`
     */
    from: number
    /**
     * Index of last item in `data`
     */
    to: number
    /**
     * Page of results
     */
    data: T[]
}

export interface PaginatedQuery {
    page?: number

    limit?: number

    offset?: number
}