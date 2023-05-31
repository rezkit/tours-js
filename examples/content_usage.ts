import { client } from "./helpers.js";
import type { IHoliday } from "@rezkit/tours/lib/modules/holidays.js"

async function main(): Promise<void> {
  const { data: items } = await client.holidays.content.list({ limit: 100 })

  for ( const item of items ) {
    console.log(`${item.title} \t (${item.id})`)
    const holidays = await item.uses<IHoliday>()

    for (const holiday of holidays) {
      console.log(`  -> ${holiday.name} \t (${holiday.id})`)
    }
  }
}

main().then(_ => process.exit(0)).catch(console.error)
