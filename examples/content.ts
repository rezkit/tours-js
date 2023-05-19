import { client } from "./helpers.js";
import ora from "ora";
import type { ContentItem, CreateContentItemParams } from "@rezkit/tours/lib/modules/content.js"
import { faker } from "@faker-js/faker";


async function main(): Promise<void> {
  const items = await createContentItems()
  await linkContentItems(items)
}

/**
 * Creates some content against various categories at random
 */
async function createContentItems(): Promise<ContentItem[]> {
  const items: ContentItem[] = []
  const spinner = ora("Loading Categories").start()

  const { data: categories } = await client.categories('content').list()

  spinner.text = "Creating Some Content..."


  for (let i = 0; i < 25; i++) {

    spinner.suffixText = ` ${i+1} / 25`

    const payload: CreateContentItemParams = {
      published: true,
      title: faker.lorem.words(5),
      content: faker.lorem.paragraphs(5),
      category_id: faker.helpers.arrayElement(faker.helpers.shuffle(categories)).id
    }

    const item = await client.holidays.content.create(payload)

    items.push(item)
  }

  spinner.text = `Created ${items.length} content items`
  spinner.stopAndPersist({ symbol: 'o' })

  return items
}

/**
 * Links all given items to all first 100 holidays
 * @param contentItems Content items to link
 */
async function linkContentItems(contentItems: ContentItem[]): Promise<void> {
  const spinner = ora("Loading Holidays").start()
  const holidays = await client.holidays.list({limit: 100})

  spinner.text = "Attaching items to holidays..."
  const ids = contentItems.map(c => c.id)
  for ( const holiday of holidays.data ) {
      spinner.suffixText = ' ' + holiday.id
      await holiday.content().attach(ids)
  }

  spinner.suffixText = ''
  spinner.text = `Attached ${contentItems.length} content items to ${holidays.data.length} holidays`
  spinner.stopAndPersist()
}

main().then(_ => process.exit(0)).catch(console.error)
