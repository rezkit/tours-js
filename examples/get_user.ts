import TourManager from '../lib/client'
import {AxiosRequestConfig} from "axios";

async function auth(req: AxiosRequestConfig): Promise<string> {
    return process.env.RK_API_KEY ?? ''
}

const c = new TourManager({ api_key: auth, base_url: 'https://rezkit-tours-staging.fly.dev' })

c.user.user().then(console.log)
