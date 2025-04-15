# Video Game Grading Certification Lookup API

This API provides a unified endpoint to look up video game certification information across multiple grading services including CGC and WATA.

## Features

- Single endpoint to check multiple grading services simultaneously
- Supports CGC and WATA certification lookups
- Retrieves population reports when available
- Cross-platform compatibility
- Concurrent processing for faster results

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory with:

```
PORT=3000
```

## Usage

Start the server:

```bash
node src/server.js
```

### API Endpoint

Universal Certification Lookup:
```
GET /api/lookup/:certNumber
```

### Response Format

```json
{
    "success": true,
    "certNumber": "12345678",
    "resultsFound": 2,
    "results": [
        {
            "success": true,
            "source": "CGC",
            "certNumber": "12345678",
            "data": {
                "title": "Game Title",
                "grade": "9.8 A++",
                "platform": "Nintendo NES",
                "certificationDate": "2023-01-01",
                "populationReport": {
                    "available": true,
                    "data": {
                        "totalGraded": "100",
                        "higherGrades": "10",
                        "sameGrade": "15",
                        "lowerGrades": "75"
                    }
                }
            }
        },
        {
            "success": true,
            "source": "WATA",
            "certNumber": "12345678",
            "data": {
                "title": "Game Title",
                "grade": "9.8 A++",
                "platform": "Nintendo NES",
                "certificationDate": "2023-01-01",
                "populationReport": {
                    "available": false,
                    "data": null
                }
            }
        }
    ]
}
```

### Error Response Format

When no results are found:
```json
{
    "success": false,
    "message": "Certificate not found in any supported grading service",
    "certNumber": "12345678"
}
```

When an error occurs:
```json
{
    "success": false,
    "error": "Error message",
    "certNumber": "12345678"
}
```

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Successful request with results
- 404: Certificate not found in any service
- 500: Server error (with error message)

## Notes

- The API uses web scraping to gather information, so it depends on the structure of the grading services' websites
- Population reports may not be available for all certifications
- Rate limiting may be implemented by the grading services' websites
- The API checks all services concurrently for faster results 