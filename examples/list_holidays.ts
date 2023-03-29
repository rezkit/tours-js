import type {Paginated} from '@rezkit/tours/lib/modules/common'
import type {Holiday} from '@rezkit/tours/lib/modules/holidays'
import {client} from "./helpers.js";
import type {Category} from "@rezkit/tours/lib/modules/categories";

async function main(): Promise<void> {
    const holidays: Paginated<Holiday> = await client.holidays.list()

    const walk = (c: Category, level: number): void => {
        console.log( '-'.repeat(level) + ' ' + c.name)

        c.children.forEach(c => walk(c, level++))
    }

    await Promise.all(holidays.data.map(async (holiday) => {
        console.log(`# ${holiday.name} (${holiday.id})`)

        const categories = await holiday.categories().list({children: 1})

        categories.data.forEach((c: Category) => walk(c, 1))
    }))
}

main().then(_ => process.exit(0)).catch(console.error)
