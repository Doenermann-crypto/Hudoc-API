from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/search")
def search_hudoc(
    query: str = Query(..., description="Search terms like 'Article 10' or 'freedom of expression'"),
    language: str = Query(None, description="Language of the document, e.g., 'ENG'"),
    year: int = Query(None, description="Year of the judgment, e.g., 2022")
):
    # Temporary hardcoded results to test deployment
    results = [
        {
            "title": "CASE OF SMITH v. UNITED KINGDOM",
            "url": "https://hudoc.echr.coe.int/eng?i=001-123456",
            "date": "2022-06-01",
            "applicationNumber": "12345/22",
            "importance": "1"
        },
        {
            "title": "CASE OF DOE v. FRANCE",
            "url": "https://hudoc.echr.coe.int/eng?i=001-654321",
            "date": "2022-04-10",
            "applicationNumber": "67890/22",
            "importance": "2"
        }
    ]

    return {
        "query": query,
        "filters": {
            "language": language,
            "year": year
        },
        "results": results
    }
