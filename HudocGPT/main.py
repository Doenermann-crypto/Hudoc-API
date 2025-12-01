import csv
import io
import requests
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/search")
def search_hudoc(
    query: str = Query(..., description="Search terms like 'Article 10'"),
    language: str = Query(None, description="Language filter e.g. ENG"),
    year: int = Query(None, description="Year filter e.g. 2022"),
):

    # BUILD HUDOC CSV EXPORT URL
    csv_url = (
        "https://hudoc.echr.coe.int/app/conversion/csv?"
        "library=ECHR&query="
        f"{query.replace(' ', '%20')}"
    )

    # DOWNLOAD CSV FILE
    r = requests.get(csv_url)
    if r.status_code != 200:
        return {"error": "HUDOC CSV request failed"}

    # PARSE CSV
    data = []
    csv_text = r.text
    reader = csv.DictReader(io.StringIO(csv_text))

    for row in reader:
        # Filters
        if language and row.get("DocLanguage") and row["DocLanguage"].upper() != language.upper():
            continue

        if year and row.get("DecisionDate") and not str(year) in row["DecisionDate"]:
            continue

        data.append({
            "title": row.get("ItemID") or "Untitled",
            "url": row.get("Url"),
            "date": row.get("DecisionDate"),
            "applicationNumber": row.get("AppNo"),
            "importance": row.get("ImportanceLevel")
        })

        # Limit results
        if len(data) >= 5:
            break

    return {
        "query": query,
        "filters": {"language": language, "year": year},
        "results": data
    }
