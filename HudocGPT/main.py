import csv
import os
import tempfile
from fastapi import FastAPI, Query
from playwright.sync_api import sync_playwright

app = FastAPI()

@app.get("/search")
def search_hudoc(
    query: str = Query(..., description="Search terms like 'Article 10' or 'freedom of expression'"),
    language: str = Query(None, description="Language of the document, e.g., 'ENG'"),
    year: int = Query(None, description="Year of the judgment, e.g., 2022")
):
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(accept_downloads=True)
        page = context.new_page()

        # Go to HUDOC and input search query
        page.goto("https://hudoc.echr.coe.int/eng")
        page.fill('input[placeholder="Search..."]', query)
        page.keyboard.press("Enter")
        page.wait_for_timeout(5000)  # Wait for results to load

        # Click Export > Export as CSV
        page.click("text=Export")
        with page.expect_download() as download_info:
            page.click("text=Export as CSV")
        download = download_info.value

        # Save and parse the downloaded CSV
        temp_dir = tempfile.gettempdir()
        csv_path = os.path.join(temp_dir, download.suggested_filename)
        download.save_as(csv_path)

        with open(csv_path, encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Optional filters
                if language and row.get("DocLanguage") and row["DocLanguage"].upper() != language.upper():
                    continue
                if year and row.get("Date") and not str(year) in row["Date"]:
                    continue

                results.append({
                    "title": row.get("DocName") or row.get("ItemID") or "Untitled",
                    "url": row.get("Url") or "https://hudoc.echr.coe.int/",
                    "date": row.get("Date"),
                    "applicationNumber": row.get("ApplicationNumber"),
                    "importance": row.get("Importance")
                })

                if len(results) >= 5:
                    break

        browser.close()

    return {
        "query": query,
        "filters": {
            "language": language,
            "year": year
        },
        "results": results
    }
