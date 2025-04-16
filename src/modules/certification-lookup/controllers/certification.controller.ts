import { logger } from '@/infrastructure/logger/logger.service';
import { NextFunction, Request, Response } from 'express';
import certificationService from '../services/certification.service';
import { validateResponse } from '../validators/certification.validator';

export const lookupCertification = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const certNumber = req.params.certNumber;
        const service = certificationService;
        
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
