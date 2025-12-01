from fastapi import FastAPI, Query
import csv
import io
import requests
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/search")
def search_hudoc(
    query: str = Query(..., description="Search terms like 'Article 10'"),
    language: str = Query(None, description="Language filter e.g. ENG"),
    year: int = Query(None, description="Year filter e.g. 2022"),
):
    try:
        # Build HUDOC CSV export URL
        csv_url = (
            "https://hudoc.echr.coe.int/app/conversion/csv?"
            "library=ECHR&searchMode=quick&query=" + query.replace(" ", "%20")
        )

        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; HudocBot/1.0)"
        }

        r = requests.get(csv_url, headers=headers, timeout=10)

        if r.status_code != 200:
            return JSONResponse(
                status_code=500,
                content={
                    "error": "HUDOC CSV request failed",
                    "status_code": r.status_code,
                    "response_excerpt": r.text[:300]
                }
            )

        results = []
        reader = csv.DictReader(io.StringIO(r.text))

        for row in reader:
            # Safely check missing fields
            doc_lang = row.get("DocLanguage", "").upper()
            decision_date = row.get("DecisionDate", "")

            if language and doc_lang and doc_lang != language.upper():
                continue
            if year and decision_date and str(year) not in decision_date:
                continue

            results.append({
                "title": row.get("ItemID") or "Untitled",
                "url": row.get("Url"),
                "date": decision_date,
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

    except Exception as e:
        # Catch any unexpected crash and return helpful info
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
