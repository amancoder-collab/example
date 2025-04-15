const express = require('express');
const certificationController = require('../controllers/certification.controller');
const certificationValidators = require('../validators/certification.validator');

const router = express.Router();

router.get(
    '/lookup/:certNumber',
    certificationValidators.lookup,
    certificationController.lookupCertification.bind(certificationController)
);

module.exports = router; 