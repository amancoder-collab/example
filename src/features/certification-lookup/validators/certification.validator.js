const { param } = require('express-validator');

const certificationValidators = {
    lookup: [
        param('certNumber')
            .trim()
            .notEmpty()
            .withMessage('Certification number is required')
            .matches(/^[0-9]{7,10}$/)
            .withMessage('Invalid certification number format - must be 7-10 digits')
            .escape()
    ]
};

module.exports = certificationValidators; 