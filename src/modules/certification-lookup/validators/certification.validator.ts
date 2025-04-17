import { Request, Response, NextFunction } from "express";
import { z } from "zod";

// Certification number schema
export const certNumberSchema = z
  .string()
  .regex(/^[0-9]{7,10}$/, {
    message: "Certification number must be 7-10 digits",
  })
  .transform((val) => val.trim());

// Population report schema
export const populationReportSchema = z.object({
  available: z.boolean(),
  data: z
    .object({
      totalGraded: z.string().nullable(),
      higherGrades: z.string().nullable(),
      sameGrade: z.string().nullable(),
      lowerGrades: z.string().nullable(),
    })
    .nullable(),
});

// Game info schema
export const gameInfoSchema = z.object({
  title: z
    .string()
    .nullable()
    .transform((val) => val ?? "Unknown"),
  grade: z
    .string()
    .nullable()
    .transform((val) => val ?? "Unknown"),
  platform: z
    .string()
    .nullable()
    .transform((val) => val ?? "Unknown"),
  certificationDate: z
    .string()
    .nullable()
    .transform((val) => val ?? "Unknown"),
  populationReport: populationReportSchema,
});

// Certification result schema
export const certificationResultSchema = z.object({
  success: z.boolean(),
  source: z.enum(["CGC", "WATA"]),
  certNumber: certNumberSchema,
  data: gameInfoSchema,
});

// Certification lookup result schema
export const certificationLookupResultSchema = z.object({
  certNumber: certNumberSchema,
  results: z.array(certificationResultSchema),
});

// Infer types from schemas
export type CertNumber = z.infer<typeof certNumberSchema>;
export type PopulationReport = z.infer<typeof populationReportSchema>;
export type GameInfo = z.infer<typeof gameInfoSchema>;
export type CertificationResult = z.infer<typeof certificationResultSchema>;
export type CertificationLookupResult = z.infer<
  typeof certificationLookupResultSchema
>;

// Validate request parameters middleware
export const validateCertNumber = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.params.certNumber = certNumberSchema.parse(req.params.certNumber);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next({
        status: 400,
        message: error.errors[0].message,
      });
    } else {
      next(error);
    }
  }
};

// Validate response data
export const validateResponse = (data: unknown): CertificationLookupResult => {
  return certificationLookupResultSchema.parse(data);
};
