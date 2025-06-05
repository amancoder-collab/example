/**
 * @swagger
 * components:
 *   schemas:
 *     Game:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - platform
 *         - releaseYear
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the game
 *         title:
 *           type: string
 *           description: The title of the game
 *         platform:
 *           type: string
 *           description: The gaming platform (e.g., NES, SNES, PlayStation)
 *         releaseYear:
 *           type: integer
 *           description: Year the game was released
 *         publisher:
 *           type: string
 *           description: The publisher of the game
 *         developer:
 *           type: string
 *           description: The developer of the game
 *         condition:
 *           type: string
 *           description: Condition of the game (e.g., sealed, loose)
 *         certificationNumber:
 *           type: string
 *           description: Certification number from grading service
 *         gradingService:
 *           type: string
 *           enum: [CGC, WATA]
 *           description: The grading service that certified the game
 *         grade:
 *           type: string
 *           description: The grade assigned to the game (e.g., 9.8 A++, 85+)
 *       example:
 *         id: "60d21b4667d0d8992e610c85"
 *         title: "Super Mario Bros."
 *         platform: "NES"
 *         releaseYear: 1985
 *         publisher: "Nintendo"
 *         developer: "Nintendo"
 *         condition: "Sealed"
 *         certificationNumber: "CGC123456"
 *         gradingService: "CGC"
 *         grade: "9.8 A++"
 */

export interface Game {
  id: string;
  title: string;
  platform: string;
  releaseYear: number;
  publisher?: string;
  developer?: string;
  condition?: string;
  certificationNumber?: string;
  gradingService?: 'CGC' | 'WATA';
  grade?: string;
} 