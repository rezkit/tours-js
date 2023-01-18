import {ApiGroup, Entity} from "./common";

export interface User extends Entity {

    /**
     * User's full name
     */
    name: string

    /**
     * User's RezKit ID
     */
    rezkit_id: string

    /**
     * User's Organization ID (tour manager ID)
     */
    organization_id: string

    /**
     * User email
     */
    email: string

    /**
     * User's preferences
     */
    preferences: null
}

export interface Organization extends Entity {
    name: string
    rezkit_id: string
    data: object
}

export class Api extends ApiGroup {

    /**
     * Get the user profile of the API caller
     */
    async user(): Promise<User> {
        return (await this.axios.get<User>('/user')).data
    }

    async organization(): Promise<Organization> {
        return (await this.axios.get<Organization>('/organization')).data
    }
}
