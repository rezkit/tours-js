import { client } from './helpers.js'
import type * as TourManager from '@rezkit/tours'

async function main(): Promise<void> {
  const holidays: TourManager.Paginated<TourManager.Holidays.Holiday> = await client.holidays.list()

  const walk = (c: TourManager.Categories.Category, level: number): null => {
    console.log('-'.repeat(level) + ' ' + c.name)
    c.children.forEach((c: TourManager.Categories.Category) => walk(c, level++))
    return null
  }

  await Promise.all(holidays.data.map(async (holiday: TourManager.Holidays.Holiday) => {
    console.log(`# ${holiday.name} (${holiday.id})`)

    const categories = await holiday.categories().list({ children: 1 })

    categories.data.forEach((c: TourManager.Categories.Category) => walk(c, 1))
  }))
}

main().then(_ => process.exit(0)).catch(console.error)
