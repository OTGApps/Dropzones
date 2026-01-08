#!/usr/bin/env node

import { DZScraper } from "./scraper.js"

async function main() {
  const scraper = new DZScraper()
  await scraper.run()
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
