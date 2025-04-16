import { Router } from 'express';
import { lookupCertification } from '../controllers/certification.controller';
import { validateCertNumber } from '../validators/certification.validator';

const router = Router();

router.get(
    '/lookup/:certNumber',
    validateCertNumber,
    lookupCertification
);

export default router; 