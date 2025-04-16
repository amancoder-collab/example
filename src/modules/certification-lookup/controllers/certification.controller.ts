import { Request, Response, NextFunction } from 'express';
import { validateCertNumber, validateResponse } from '../validators/certification.validator';
import CertificationService from '../services/certification.service';
import logger from '../../../infrastructure/logger/logger.service';
import { AppError } from '../../../shared/middleware/error.middleware';

// Route handlers
export const lookupCertification = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const certNumber = req.params.certNumber;
        const service = CertificationService.getInstance<CertificationService>();
        
        // Get certification data
        const data = await service.lookup(certNumber);
        
        // Validate response data
        const validatedData = validateResponse(data);
        
        res.json(validatedData);
    } catch (error) {
        logger.error(`Error looking up certification: ${error instanceof Error ? error.message : 'Unknown error'}`);
        next(error);
    }
};

export { validateCertNumber }; 