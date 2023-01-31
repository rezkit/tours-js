import {default as Axios, AxiosRequestConfig, AxiosInstance, AxiosError, AxiosResponse} from 'axios'
import * as Modules from './modules'
import Config from "./config";
export * from './config';
import {NotFoundError, ValidationError} from "./errors";

export const BASE_URL = 'https://api.tours.rezkit.app';

const USER_AGENT = `RezKit/Tours js`

/**
 * Tour Manager API Client
 *
 * API client for connecting to the RezKit Tour Manager
 */
export default class TourManager {

    private readonly axios: AxiosInstance

    /**
     * Create a new API Client instance
     *
     * @param config - Client configuration
     * @param requestConfig - Optional Axios request config overrides.
     */
    constructor(config: Config, requestConfig?: AxiosRequestConfig) {
        this.axios = Axios.create(requestConfig)

        this.axios.defaults.baseURL = config?.base_url || BASE_URL

        this.axios.defaults.headers.common = {
            'Accept': 'application/json',
            'User-Agent': USER_AGENT,
        }

        this.axios.interceptors.response.use(null, handleResponseError)

        if (config.api_key) {
            this.axios.interceptors.request.use( async (req) => {
                if (typeof config.api_key === 'string') {
                    req.headers.set({
                        'Authorization': `Bearer ${config.api_key}`
                    })
                } else if (typeof config.api_key === 'function') {
                    const api_key = await config.api_key(req)

                    req.headers.set({
                        'Authorization': `Bearer ${api_key}`
                    })
                }

                return req
            })
        } else {
            // Interactive/session auth
            this.axios.defaults.withCredentials = true
            this.axios.defaults.xsrfCookieName = 'XSRF_TOKEN'
            this.axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN'
        }
    }

    get holidays(): Modules.Holidays.Api {
        return new Modules.Holidays.Api(this.axios)
    }

    get user(): Modules.User.Api {
        return new Modules.User.Api(this.axios)
    }

    /**
     * Field Management
     */
    get fields(): Modules.Fields.Api {
        return new Modules.Fields.Api(this.axios)
    }

    /**
     * API Key Management
     */
    get apiKeys(): Modules.ApiKeys.Api {
        return new Modules.ApiKeys.Api(this.axios)
    }
}

/**
 * Axios Response Error Handler
 * @param error
 * @private
 */
function handleResponseError(error: any) {

    if (error.hasOwnProperty('response')) {
        const { response }: { response: AxiosResponse } = error

        switch (response.status) {
            case 422:
                throw new ValidationError(response.data)
            case 404:
                throw new NotFoundError(response.data.message, error.request.url)
        }
    }

    throw error
}
