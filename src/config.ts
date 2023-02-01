import type {AxiosRequestConfig} from "axios";

/**
 * A CredentialProvider function is a function which takes a request and
 * returns the API credential to use for the request.
 */
export type CredentialProvider = (request: AxiosRequestConfig) => Promise<string>

export default class Config {
    /**
     * API Key
     *
     * Can be a static key string, or a credential provider function.
     */
    api_key?: string | CredentialProvider

    /**
     * Override the base URL for the API (used primarily for testing)
     */
    base_url?: string
}
