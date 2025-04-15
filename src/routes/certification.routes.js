const express = require('express');
const { param } = require('express-validator');
const { lookupCertification } = require('../controllers/certification.controller');

const router = express.Router();

router.get(
    '/lookup/:certNumber',
    [
        param('certNumber')
            .trim()
            .notEmpty()
            .withMessage('Certification number is required')
            .matches(/^[0-9]{7,10}$/)
            .withMessage('Invalid certification number format')
    ],
    lookupCertification
);

module.exports = router; 