const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { cgcScraper } = require('./src/scrapers/cgc');
const { wataScraper } = require('./wata');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/lookup/:certNumber', async (req, res) => {
    try {
        const { certNumber } = req.params;
        
        // Run both scrapers concurrently
        const [cgcResult] = await Promise.allSettled([
            cgcScraper(certNumber),
            // wataScraper(certNumber)
        ]);

        const results = {
            certNumber,
            results: []
        };

        console.log(cgcResult);

        // Process CGC result
        if (cgcResult.status === 'fulfilled' && cgcResult.value.success) {
            results.results.push(cgcResult.value);
        }

        // Process WATA result
        if (wataResult.status === 'fulfilled' && wataResult.value.success) {
            results.results.push(wataResult.value);
        }

        // If no results found, return appropriate message
        if (results.results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found in any supported grading service',
                certNumber
            });
        }

        res.json({
            success: true,
            certNumber,
            resultsFound: results.results.length,
            results: results.results
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message,
            certNumber 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 