const { z } = require('zod');

// Certification number schema
const certNumberSchema = z.string()
    .regex(/^[0-9]{7,10}$/, {
        message: 'Certification number must be 7-10 digits'
    })
    .transform(val => val.trim());

// Population report schema
const populationReportSchema = z.object({
    available: z.boolean(),
    data: z.object({
        totalGraded: z.string().optional(),
        higherGrades: z.string().optional(),
        sameGrade: z.string().optional(),
        lowerGrades: z.string().optional()
    }).nullable()
});

// Game info schema
const gameInfoSchema = z.object({
    title: z.string(),
    grade: z.string(),
    platform: z.string(),
    certificationDate: z.string(),
    populationReport: populationReportSchema
});

// Response schema
const responseSchema = z.object({
    success: z.boolean(),
    source: z.enum(['CGC', 'WATA']),
    certNumber: certNumberSchema,
    data: gameInfoSchema
});

// Validate request parameters middleware
const validateCertNumber = (req, res, next) => {
    try {
        req.params.certNumber = certNumberSchema.parse(req.params.certNumber);
        next();
    } catch (error) {
        next({
            status: 400,
            message: error.errors[0].message
        });
    }
};

// Validate response data
const validateResponse = (data) => {
    return responseSchema.parse(data);
};

module.exports = {
    certNumberSchema,
    gameInfoSchema,
    responseSchema,
    validateCertNumber,
    validateResponse
}; 