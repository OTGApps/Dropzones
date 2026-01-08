import axios from "axios"
import * as cheerio from "cheerio"
import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import puppeteer from "puppeteer"
import { fileURLToPath } from "url"

import { parseAircraftString } from "./parsers/aircraft.js"
import { normalizeWhitespace } from "./utils/strings.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// HTTP client for API calls
const httpClient = axios.create({
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Accept": "application/json",
  },
  timeout: 30000,
})

export class DZScraper {
  constructor() {
    this.localFilesDir = path.join(__dirname, "..", "local_files")
    this.dropzoneDir = path.join(this.localFilesDir, "dropzone")
    this.outputFile = path.join(__dirname, "..", "..", "assets", "dropzones.geojson")
    this.allAircraft = []
    this.browser = null

    // Account numbers to skip (military, duplicates, non-operational)
    this.skipAnchors = [
      "260335", // Military Only
      "238840", // Military Only
      "261413", // Military Club
      "206689", // Not a dropzone
      "196509", // Military only
      "100490", // Blue Sky Ranch is Skydive the Ranch's school
      "193132", // Skydive the Farm merged with SD Georgia
      "354757", // Skydive "Weland"? In China
      "377901", // College club: Air Bears - Skydiving Club at Berkeley
      "363265", // College club: Blue Skies Skydiving Club (Indiana State)
      "301805", // College club: Skydive Broncos at Western Michigan University
      "100677", // College club: Kansas State University Parachute Club
    ]

    // Country name normalization map
    this.countryNormalization = {
      "COLOMBIA": "Colombia",
      "Russia Federation": "Russian Federation",
      "GU": "Guatemala",
    }

    // US state full name to abbreviation map
    this.stateAbbreviations = {
      "Alabama": "AL",
      "Alaska": "AK",
      "Arizona": "AZ",
      "Arkansas": "AR",
      "California": "CA",
      "Colorado": "CO",
      "Connecticut": "CT",
      "Delaware": "DE",
      "Florida": "FL",
      "Georgia": "GA",
      "Hawaii": "HI",
      "Idaho": "ID",
      "Illinois": "IL",
      "Indiana": "IN",
      "Iowa": "IA",
      "Kansas": "KS",
      "Kentucky": "KY",
      "Louisiana": "LA",
      "Maine": "ME",
      "Maryland": "MD",
      "Massachusetts": "MA",
      "Michigan": "MI",
      "Minnesota": "MN",
      "Mississippi": "MS",
      "Missouri": "MO",
      "Montana": "MT",
      "Nebraska": "NE",
      "Nevada": "NV",
      "New Hampshire": "NH",
      "New Jersey": "NJ",
      "New Mexico": "NM",
      "New York": "NY",
      "North Carolina": "NC",
      "North Dakota": "ND",
      "Ohio": "OH",
      "Oklahoma": "OK",
      "Oregon": "OR",
      "Pennsylvania": "PA",
      "Rhode Island": "RI",
      "South Carolina": "SC",
      "South Dakota": "SD",
      "Tennessee": "TN",
      "Texas": "TX",
      "Utah": "UT",
      "Vermont": "VT",
      "Virginia": "VA",
      "Washington": "WA",
      "West Virginia": "WV",
      "Wisconsin": "WI",
      "Wyoming": "WY",
    }
  }

  /**
   * Main entry point - runs the full scraping process
   */
  async run() {
    console.log("Starting USPA Dropzone Scraper...\n")

    try {
      // Step 1: Fetch dropzone list from API
      const dropzones = await this.fetchDropzoneList()
      console.log(`Found ${dropzones.length} dropzones from API.\n`)

      // Step 2: Launch browser and cache rendered detail pages
      await this.initBrowser()
      await this.cacheDetailPages(dropzones)

      // Step 3: Build GeoJSON from API data + scraped details
      const result = await this.buildGeoJson(dropzones)

      // Step 4: Write output
      this.writeGeoJson(result)

      console.log(`\nDone! Output written to: ${this.outputFile}`)
      console.log(`Total dropzones: ${result.features.length}`)
    } finally {
      await this.closeBrowser()
    }
  }

  /**
   * Initialize Puppeteer browser
   */
  async initBrowser() {
    console.log("Launching headless browser...")

    // Try to find Chrome on macOS
    const chromePaths = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      process.env.CHROME_PATH,
    ].filter(Boolean)

    let executablePath = null
    for (const p of chromePaths) {
      if (fs.existsSync(p)) {
        executablePath = p
        break
      }
    }

    const launchOptions = {
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    }

    if (executablePath) {
      console.log(`Using Chrome at: ${executablePath}`)
      launchOptions.executablePath = executablePath
    }

    this.browser = await puppeteer.launch(launchOptions)
    console.log("Browser launched.\n")
  }

  /**
   * Close Puppeteer browser
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      console.log("Browser closed.")
    }
  }

  /**
   * Fetch dropzone list from USPA API
   */
  async fetchDropzoneList() {
    console.log("Fetching dropzone list from USPA API...")

    try {
      const response = await httpClient.post(
        "https://uspa.org/api/DZList",
        "DZName=&City=&Region=&Country=&State=",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      )

      // Save API response for reference
      fs.mkdirSync(this.localFilesDir, { recursive: true })
      fs.writeFileSync(
        path.join(this.localFilesDir, "api_response.json"),
        JSON.stringify(response.data, null, 2),
      )

      return response.data
    } catch (error) {
      console.error("Error fetching dropzone list:", error.message)
      throw error
    }
  }

  /**
   * Cache rendered detail pages using Puppeteer
   */
  async cacheDetailPages(dropzones) {
    fs.mkdirSync(this.dropzoneDir, { recursive: true })

    let downloaded = 0
    let skipped = 0
    let failed = 0

    for (const dz of dropzones) {
      const accountNumber = dz.Id

      if (this.skipAnchors.includes(accountNumber)) {
        console.log(`SKIPPING: ${dz.AccountName} (${accountNumber})`)
        continue
      }

      const fileName = path.join(this.dropzoneDir, `${accountNumber}.html`)

      if (!fs.existsSync(fileName)) {
        console.log(`Rendering: ${dz.AccountName} (${accountNumber})`)
        try {
          const html = await this.renderPage(accountNumber)
          fs.writeFileSync(fileName, html)
          downloaded++

          // Random delay between requests (2-5 seconds) to be polite
          const delay = await this.randomDelay(2000, 5000)
          console.log(`  Saved. Waited ${(delay / 1000).toFixed(1)}s`)
        } catch (error) {
          console.error(`  Error rendering ${accountNumber}: ${error.message}`)
          failed++
        }
      } else {
        skipped++
      }
    }

    console.log(`\nCaching complete: ${downloaded} rendered, ${skipped} cached, ${failed} failed.`)
  }

  /**
   * Render a detail page using Puppeteer and return the HTML
   */
  async renderPage(accountNumber) {
    const page = await this.browser.newPage()

    try {
      // Set viewport and user agent
      await page.setViewport({ width: 1280, height: 800 })
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      )

      // Navigate to the page
      const url = `https://uspa.org/DZdetails?accountnumber=${accountNumber}`
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 60000,
      })

      // Wait for the content to load - look for specific elements
      // The ActionForm modules populate content into pnlContent divs
      await page
        .waitForFunction(
          () => {
            // Wait until at least one of the content panes has content
            const pane1 = document.querySelector("#pnlContent4766")
            const pane2 = document.querySelector("#pnlContent4416")
            return (
              (pane1 && pane1.innerHTML.trim().length > 100) ||
              (pane2 && pane2.innerHTML.trim().length > 100)
            )
          },
          { timeout: 30000 },
        )
        .catch(() => {
          // If specific elements don't appear, just wait a bit for general load
          console.log(`  Warning: Content may not have fully loaded for ${accountNumber}`)
        })

      // Additional wait to ensure all dynamic content is loaded
      await this.sleep(1500)

      // Get the full rendered HTML
      const html = await page.content()
      return html
    } finally {
      await page.close()
    }
  }

  /**
   * Generate version string in YYY.MM.DD.V format
   */
  getVersion() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const version = 1 // Can be incremented if multiple versions generated per day
    return `${year}.${month}.${day}.${version}`
  }

  /**
   * Build GeoJSON from API data and scraped details
   */
  async buildGeoJson(dropzones) {
    const geojson = {
      type: "FeatureCollection",
      metadata: {
        version: this.getVersion(),
        generatedAt: new Date().toISOString(),
        count: dropzones.length,
      },
      features: [],
    }

    console.log(`\nProcessing ${dropzones.length} dropzones...\n`)

    for (const dz of dropzones) {
      const accountNumber = dz.Id

      if (this.skipAnchors.includes(accountNumber)) {
        continue
      }

      console.log(`Processing: ${dz.AccountName.trim()}`)

      try {
        // Start with API data
        const feature = {
          type: "Feature",
          properties: {
            anchor: parseInt(accountNumber, 10),
            name: dz.AccountName || "",
            website: "",
            phone: dz.PhoneDZ || "",
            email: dz.Email || "",
            aircraft: [],
            description: "",
            location: this.buildLocationArray(dz),
            training: [],
            services: [],
            state: dz.PhysicalState || "",
            country: dz.PhysicalCountry || "",
            airport: dz.AirportName || "",
          },
          geometry: {
            type: "Point",
            coordinates: [parseFloat(dz.Longitude) || 0, parseFloat(dz.Latitude) || 0],
          },
        }

        // Try to get additional details from cached HTML
        const htmlFile = path.join(this.dropzoneDir, `${accountNumber}.html`)
        if (fs.existsSync(htmlFile)) {
          const additionalData = await this.parseDetailPage(htmlFile)

          // Merge additional data
          if (additionalData.website) feature.properties.website = additionalData.website
          if (additionalData.aircraft.length) feature.properties.aircraft = additionalData.aircraft
          if (additionalData.description)
            feature.properties.description = additionalData.description
          if (additionalData.training.length) feature.properties.training = additionalData.training
          if (additionalData.services.length) feature.properties.services = additionalData.services
        }

        // Normalize data
        this.normalizeFeature(feature)

        // Sort properties alphabetically
        feature.properties = Object.keys(feature.properties)
          .sort()
          .reduce((obj, key) => {
            obj[key] = feature.properties[key]
            return obj
          }, {})

        geojson.features.push(feature)
      } catch (error) {
        console.error(`  Error processing ${dz.AccountName}: ${error.message}`)
      }
    }

    // Sort features by anchor
    geojson.features.sort((a, b) => a.properties.anchor - b.properties.anchor)

    return geojson
  }

  /**
   * Build location array from API data
   */
  buildLocationArray(dz) {
    const location = []

    if (dz.PhysicalAddressLine1) location.push(dz.PhysicalAddressLine1)
    if (dz.PhysicalAddressLine2) location.push(dz.PhysicalAddressLine2)

    const cityStateZip = [dz.PhysicalCity, dz.PhysicalState, dz.PhysicalZip]
      .filter(Boolean)
      .join(", ")

    if (cityStateZip) location.push(cityStateZip)
    if (dz.PhysicalCountry && dz.PhysicalCountry !== "US") {
      location.push(dz.PhysicalCountry)
    }

    return location
  }

  /**
   * Normalize feature data for consistency
   * - Trims whitespace from name
   * - Normalizes country names
   * - Converts full US state names to abbreviations
   */
  normalizeFeature(feature) {
    const props = feature.properties

    // Trim whitespace from name
    if (props.name) {
      props.name = props.name.trim()
    }

    // Normalize country names
    if (props.country && this.countryNormalization[props.country]) {
      props.country = this.countryNormalization[props.country]
    }

    // Convert full US state names to abbreviations
    if (props.country === "US" && props.state && this.stateAbbreviations[props.state]) {
      props.state = this.stateAbbreviations[props.state]
    }
  }

  /**
   * Parse a rendered detail page for additional information
   */
  async parseDetailPage(filePath) {
    const html = fs.readFileSync(filePath, "utf-8")
    const $ = cheerio.load(html)

    const result = {
      website: "",
      aircraft: [],
      description: "",
      training: [],
      services: [],
    }

    // The rendered page should have content in #pnlContent4766 (main details)
    // and #pnlContent4416 (amenities/training)
    const mainContent = $("#pnlContent4766")
    const amenitiesContent = $("#pnlContent4416")

    // Look for website - external link icon or direct URL
    const externalLink = mainContent
      .find('.fa-external-link, .fa-external-link-alt, [class*="external"]')
      .first()
    if (externalLink.length) {
      // Get the text next to the icon or the parent's text
      const parent = externalLink.parent()
      const text = parent.text().trim()
      const urlMatch = text.match(/https?:\/\/[^\s<>"]+/)
      if (urlMatch) {
        result.website = urlMatch[0].replace(/[,;.\s]+$/, "") // Clean trailing punctuation
      }
    }

    // Alternative: look for any http link in main content
    if (!result.website) {
      mainContent.find('a[href^="http"]').each((_, el) => {
        const href = $(el).attr("href")
        if (href && !href.includes("google.com/maps") && !href.includes("uspa.org")) {
          result.website = href
          return false // break
        }
      })
    }

    // Look for aircraft info - plane icon or labeled "Aircraft"
    const planeIcon = mainContent.find('.fa-plane, [class*="plane"]').first()
    if (planeIcon.length) {
      // Get text from parent or sibling
      const parent = planeIcon.parent()
      let text = parent.text().trim()
      // Remove the icon text and clean up
      text = text.replace(/Aircraft:?\s*/i, "").trim()
      if (text && text.length > 2) {
        result.aircraft = parseAircraftString(normalizeWhitespace(text))
        this.allAircraft.push(...result.aircraft)
      }
    }

    // Alternative aircraft search in full text
    if (result.aircraft.length === 0) {
      const fullText = mainContent.text()
      // Look for common aircraft patterns
      const aircraftPatterns = [
        /Aircraft:?\s*([^<\n]+)/i,
        /(\d+\s+(?:Cessna|Caravan|Twin Otter|King Air|Beech|Pilatus|Porter|Antonov|DC-3|Skyvan|PAC|Let)[^<\n,]*)/gi,
      ]
      for (const pattern of aircraftPatterns) {
        const match = fullText.match(pattern)
        if (match) {
          const aircraftText = match[1] || match[0]
          result.aircraft = parseAircraftString(normalizeWhitespace(aircraftText))
          if (result.aircraft.length > 0) {
            this.allAircraft.push(...result.aircraft)
            break
          }
        }
      }
    }

    // Look for description - longer paragraph text
    mainContent.find("p, div").each((_, el) => {
      const text = $(el).text().trim()
      // Description is usually 100+ chars and doesn't look like a label
      if (
        text.length > 100 &&
        !text.match(/^(Aircraft|Training|Services|Phone|Email|Website)/i) &&
        !result.description
      ) {
        result.description = normalizeWhitespace(text)
      }
    })

    // Look for training programs in amenities section
    const trainingTerms = ["AFF", "Tandem", "Static Line", "IAD", "SL", "Accelerated Freefall"]
    const amenitiesText = amenitiesContent.text()

    // Check for each training term
    for (const term of trainingTerms) {
      if (amenitiesText.toLowerCase().includes(term.toLowerCase())) {
        // Normalize the term
        let normalizedTerm = term
        if (term === "SL") normalizedTerm = "Static Line"
        if (term === "IAD") normalizedTerm = "Instructor Assisted Deployment"
        if (!result.training.includes(normalizedTerm)) {
          result.training.push(normalizedTerm)
        }
      }
    }

    // Look for services/amenities
    const serviceTerms = [
      "Packing Service",
      "Rigging",
      "Equipment Rental",
      "Equipment Sales",
      "Video Services",
      "Camera Flyer",
      "Pro Shop",
      "Camping",
      "Bunkhouse",
      "Restaurant",
      "Snack Bar",
      "Swimming Pool",
      "Showers",
    ]

    for (const term of serviceTerms) {
      if (amenitiesText.toLowerCase().includes(term.toLowerCase())) {
        if (!result.services.includes(term)) {
          result.services.push(term)
        }
      }
    }

    // Also check main content for services
    const mainText = mainContent.text()
    for (const term of serviceTerms) {
      if (mainText.toLowerCase().includes(term.toLowerCase())) {
        if (!result.services.includes(term)) {
          result.services.push(term)
        }
      }
    }

    return result
  }

  /**
   * Write GeoJSON to file and format with Prettier
   */
  writeGeoJson(geojson) {
    const output = JSON.stringify(geojson, null, 2)
    fs.writeFileSync(this.outputFile, output)

    // Run prettier on the output file
    try {
      console.log("\nFormatting with Prettier...")
      execSync(`npx prettier --write "${this.outputFile}"`, {
        cwd: path.join(__dirname, "..", ".."),
        stdio: "inherit",
      })
      console.log("Formatting complete.")
    } catch (error) {
      console.error("Warning: Prettier formatting failed:", error.message)
    }
  }

  /**
   * Sleep helper for rate limiting
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Random delay between min and max milliseconds
   * Makes scraping look more natural/human-like
   * @returns {Promise<number>} - The actual delay in ms
   */
  async randomDelay(minMs = 1000, maxMs = 3000) {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
    await this.sleep(delay)
    return delay
  }
}
