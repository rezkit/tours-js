import TourManager from '@rezkit/tours'
import type {AxiosRequestConfig} from 'axios';
import type {Paginated} from '@rezkit/tours/modules/common';
import type {Holiday} from '@rezkit/tours/modules/holidays';


async function auth(req: AxiosRequestConfig): Promise<string> {
    return process.env.RK_API_KEY ?? ''
}

async function main(): Promise<void> {
    const c = new TourManager({ api_key: auth, base_url: 'https://rezkit-tours-staging.fly.dev' })

    const holidays: Paginated<Holiday> = await c.holidays.list()

    holidays.data.forEach(holiday => {
        console.log(`# ${holiday.name} (${holiday.id})`)
    })
}

main().then(_ => process.exit(0)).catch(console.error)
