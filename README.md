# Video Game Certification Lookup API

A robust Node.js API for looking up video game certification information from multiple grading services including CGC and WATA.

## Features

- Single endpoint to check multiple grading services simultaneously
- Supports CGC and WATA certification lookups
- Retrieves population reports when available
- Comprehensive error handling
- Rate limiting and security features
- Logging system
- Input validation
- Cross-platform compatibility

## Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd game-cert-lookup
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
PUPPETEER_HEADLESS=false
CGC_TIMEOUT=10000
WATA_TIMEOUT=10000
LOG_LEVEL=info
```

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## API Endpoints

### Lookup Certification

```
GET /api/lookup/:certNumber
```

#### Parameters

- `certNumber` (required): The certification number to look up (7-10 digits)

#### Response Format

Success Response:

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
    }
  ]
}
```

Error Response:

```json
{
  "status": "error",
  "message": "Error message"
}
```

## Security Features

- Helmet.js for security headers
- Rate limiting
- CORS protection
- Request size limiting
- Input validation
- Error sanitization in production

## Error Handling

The API implements a comprehensive error handling system:

- Operational errors (4xx)
- Programming errors (5xx)
- Unhandled rejections
- Uncaught exceptions

## Logging

- Winston logger implementation
- Separate error and combined logs
- Console logging in development
- Structured JSON logging in production

## Development

### Scripts

- `npm start` - Start the server
- `npm run dev` - Start the server with nodemon
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middlewares/    # Custom middleware
├── models/         # Data models
├── routes/         # Route definitions
├── services/       # Business logic
├── utils/          # Utility functions
└── scrapers/       # Web scraping modules
```

## Best Practices Implemented

1. **Security**

   - Rate limiting
   - Security headers
   - Input validation
   - CORS protection

2. **Error Handling**

   - Global error handling
   - Custom error classes
   - Operational vs Programming errors
   - Graceful shutdown

3. **Performance**

   - Response compression
   - Concurrent scraping
   - Browser instance management
   - Request timeout handling

4. **Code Quality**

   - ESLint configuration
   - Proper project structure
   - Dependency management
   - Type checking

5. **Monitoring**
   - Winston logging
   - Morgan request logging
   - Error tracking
   - Performance monitoring

## License

ISC

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
