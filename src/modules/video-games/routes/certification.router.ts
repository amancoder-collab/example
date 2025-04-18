import { Router } from "express";
import certificationController from "../controllers/certification.controller";
import { validate } from "@/shared/validators/global.validator";
import { certNumberSchema } from "../validators/certification.validator";

const router = Router();

/**
 * @swagger
 * /api/video-games/{certNumber}:
 *   get:
 *     summary: Get video game certification information by certification number
 *     description: Retrieves certification details for a video game from CGC and/or WATA grading services
 *     tags:
 *       - Video Games
 *     parameters:
 *       - in: path
 *         name: certNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Certification number of the graded video game
 *     responses:
 *       200:
 *         description: Certification details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 certNumber:
 *                   type: string
 *                   description: The certification number
 *                 results:
 *                   type: array
 *                   description: Results from different grading services
 *                   items:
 *                     type: object
 *                     properties:
 *                       success:
 *                         type: boolean
 *                       source:
 *                         type: string
 *                         enum: [CGC, WATA]
 *                       certNumber:
 *                         type: string
 *                       data:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                           grade:
 *                             type: string
 *                           platform:
 *                             type: string
 *                           certificationDate:
 *                             type: string
 *                           populationReport:
 *                             type: object
 *                             properties:
 *                               available:
 *                                 type: boolean
 *                               data:
 *                                 type: object
 *                                 nullable: true
 *       400:
 *         description: Invalid certification number format
 *       404:
 *         description: Certification not found in any supported grading service
 *       500:
 *         description: Server error
 */
router.get(
  "/:certNumber",
  validate(certNumberSchema, { source: "params" }),
  certificationController.getVideoGameByCertNumber
);

export default router;
