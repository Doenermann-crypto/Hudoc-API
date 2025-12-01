import csv
import io
import requests
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/search")
def search_hudoc(
    query: str = Query(..., description="Search terms like 'Article 10'"),
    language: str = Query(None, description="Language filter e.g. ENG"),
    year: int = Query(None, description="Year filter e.g. 2022"),
):
    # Build a more complete HUDOC CSV query URL
    csv_url = (
        "https://hudoc.echr.coe.int/app/conversion/csv?"
        "library=ECHR&searchMode=quick&query="
        + query.replace(" ", "%20")
    )

    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; HudocBot/1.0)"
    }

    r = requests.get(csv_url, headers=headers)

    if r.status_code != 200:
        return JSONResponse(
            status_code=500,
            content={
                "error": "HUDOC CSV request failed",
                "status_code": r.status_code,
                "response_excerpt": r.text[:300]  # just a preview
            }
        )

    results = []
    reader = csv.DictReader(io.StringIO(r.text))

    for row in reader:
        if language and row.get("DocLanguage") and row["DocLanguage"].upper() != language.upper():
            continue
        if year and row.get("DecisionDate") and str(year) not in row["DecisionDate"]:
            continue

        results.append({
            "title": row.get("ItemID") or "Untitled",
            "url": row.get("Url"),
            "date": row.get("DecisionDate"),
            "applicationNumber": row.get("AppNo"),
            "importance": row.get("ImportanceLevel")
        })

        if len(results) >= 5:
            break

    return {
        "query": query,
        "filters": {"language": language, "year": year},
        "results": results
    }

