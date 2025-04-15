const { validateCertNumber, validateResponse } = require('../validators/certification.validator');
const CertificationService = require('../services/certification.service');
const logger = require('../../../infrastructure/logger/logger.service');
const { AppError } = require('../../../shared/middleware/error.middleware');

// Route handlers
const lookupCertification = async (req, res, next) => {
    try {
        const certNumber = req.params.certNumber;
        const service = CertificationService.getInstance();
        
        // Get certification data
        const data = await service.lookup(certNumber);
        
        // Validate response data
        const validatedData = validateResponse(data);
        
        res.json(validatedData);
    } catch (error) {
        logger.error(`Error looking up certification: ${error.message}`);
        next(error);
    }
};

module.exports = {
    lookupCertification,
    validateCertNumber // Export middleware for route configuration
}; 