const { StatusCodes } = require('http-status-codes');
const { validationResult } = require('express-validator');
const certificationService = require('../services/certification.service');
const { AppError } = require('../../../shared/middleware/error.middleware');
const logger = require('../../../infrastructure/logger/logger.service');

class CertificationController {
    async lookupCertification(req, res, next) {
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

            const results = await certificationService.lookupCertification(certNumber);

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
    }
}

module.exports = new CertificationController(); 