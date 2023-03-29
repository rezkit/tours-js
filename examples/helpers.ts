import type {AxiosRequestConfig} from "axios/index";
import TourManager from '@rezkit/tours'

export async function auth(req: AxiosRequestConfig): Promise<string> {
    return process.env.RK_API_KEY ?? ''
}

const base_url = process.env.RK_API_URL ?? 'https://rezkit-tours-staging.fly.dev'

export const client = new TourManager({ api_key: auth, base_url })

