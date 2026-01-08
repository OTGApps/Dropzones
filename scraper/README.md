# USPA Dropzone Scraper (Node.js)

A Node.js web scraper that extracts USPA (United States Parachute Association) certified dropzone data and outputs it as GeoJSON.

## Features

- Fetches dropzone list from the USPA API (basic info: name, location, phone, email, coordinates)
- Uses Puppeteer (headless Chrome) to render detail pages and extract additional data
- Extracts: aircraft, training programs, services, website, description
- Caches rendered HTML files locally to avoid repeated requests
- Outputs standardized GeoJSON format

Note: Puppeteer will automatically download a compatible version of Chromium.

## Usage

The scraper will:

1. Fetch all dropzone data from the USPA API (`/api/DZList`)
2. Launch headless Chrome browser
3. Render each dropzone detail page and save the HTML (if not cached)
4. Parse rendered HTML for additional details (aircraft, training, services)
5. Merge API data with scraped details
6. Output `dropzones.geojson` with all dropzone data

## Output Format

The output is a GeoJSON FeatureCollection:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "aircraft": ["2 Cessna 208 Caravans", "1 Twin Otter"],
        "anchor": 123456,
        "airport": "Example Municipal Airport (ABC)",
        "country": "US",
        "description": "Open 7 days a week...",
        "email": "info@example.com",
        "location": ["123 Main St", "City, CA, 12345"],
        "name": "Example Skydiving",
        "phone": "555-123-4567",
        "services": ["Equipment Rental", "Packing Service"],
        "state": "CA",
        "training": ["AFF", "Tandem"],
        "website": "https://example.com"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-122.123, 37.456]
      }
    }
  ]
}
```

## Local Caching

Rendered HTML files are cached in the `local_files/` directory:

- `local_files/api_response.json` - Raw API response
- `local_files/dropzone/*.html` - Rendered dropzone detail pages

Delete these files to force a fresh download/render.

## Rate Limiting

- Random 2-5 second delay between page renders (to be polite to the server)
- Each page render takes ~3-5 seconds (waiting for JavaScript to load content)

## Dependencies

- **axios** - HTTP client for API calls
- **cheerio** - HTML parsing (jQuery-like API)
- **puppeteer** - Headless Chrome for rendering JavaScript-heavy pages

## Why Puppeteer?

The USPA website loads dropzone details dynamically via JavaScript. The initial HTML response contains empty placeholder divs that get populated after page load. Puppeteer renders the page in a real browser environment, waits for the JavaScript to execute, and then extracts the fully-rendered HTML.
