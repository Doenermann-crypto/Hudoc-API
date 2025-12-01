from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/search")
def search_hudoc(
    query: str = Query(..., description="Search keywords (e.g. 'freedom of expression')"),
    language: str = Query(None, description="Language code (e.g. ENG)"),
    year: int = Query(None, description="Judgment year (e.g. 2022)")
):
