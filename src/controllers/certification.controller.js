const { StatusCodes } = require('http-status-codes');
const { validationResult } = require('express-validator');
const scraperService = require('../services/scraper.service');
const { AppError } = require('../middlewares/error');
const logger = require('../utils/logger');

const lookupCertification = async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                'Invalid certification number format'
            );
        }

        const { certNumber } = req.params;
        logger.info(`Looking up certification: ${certNumber}`);

        // Run both scrapers concurrently
        const [cgcResult, wataResult] = await Promise.allSettled([
            scraperService.cgcScraper(certNumber),
            scraperService.wataScraper(certNumber)
        ]);

        const results = {
            certNumber,
            results: []
        };

        // Process CGC result
        if (cgcResult.status === 'fulfilled') {
            results.results.push(cgcResult.value);
        }

        // Process WATA result
        if (wataResult.status === 'fulfilled') {
            results.results.push(wataResult.value);
        }

        // If no results found, return appropriate message
        if (results.results.length === 0) {
            throw new AppError(
                StatusCodes.NOT_FOUND,
                'Certificate not found in any supported grading service'
            );
        }

        logger.info(`Found ${results.results.length} results for cert: ${certNumber}`);
        res.status(StatusCodes.OK).json({
            success: true,
            certNumber,
            resultsFound: results.results.length,
            results: results.results
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    lookupCertification
}; 