import { Request, Response } from 'express';
import gameService from '../services/game.service';

export class GameController {
  /**
   * @swagger
   * /api/games:
   *   get:
   *     summary: Get all games
   *     tags: [Games]
   *     responses:
   *       200:
   *         description: List of all games
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Game'
   *       500:
   *         description: Server error
   */
  public async getAllGames(req: Request, res: Response): Promise<void> {
    const games = await gameService.getAllGames();
    res.success(games);
  }

  /**
   * @swagger
   * /api/games/{id}:
   *   get:
   *     summary: Get a game by ID
   *     tags: [Games]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the game to get
   *     responses:
   *       200:
   *         description: Game details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Game'
   *       404:
   *         description: Game not found
   *       500:
   *         description: Server error
   */
  public async getGameById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const game = await gameService.getGameById(id);
    
    if (!game) {
      res.status(404).json({
        success: false,
        message: 'Game not found'
      });
      return;
    }
    
    res.success(game);
  }

  /**
   * @swagger
   * /api/games/search:
   *   get:
   *     summary: Search games by query
   *     tags: [Games]
   *     parameters:
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *         required: true
   *         description: Search query for title, platform, or certification number
   *     responses:
   *       200:
   *         description: List of matching games
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Game'
   *       500:
   *         description: Server error
   */
  public async searchGames(req: Request, res: Response): Promise<void> {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
      return;
    }
    
    const games = await gameService.searchGames(q);
    res.success(games);
  }

  /**
   * @swagger
   * /api/games/grading/{service}:
   *   get:
   *     summary: Get games by grading service
   *     tags: [Games]
   *     parameters:
   *       - in: path
   *         name: service
   *         schema:
   *           type: string
   *           enum: [CGC, WATA]
   *         required: true
   *         description: Grading service (CGC or WATA)
   *     responses:
   *       200:
   *         description: List of games graded by the specified service
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Game'
   *       400:
   *         description: Invalid grading service
   *       500:
   *         description: Server error
   */
  public async getGamesByGradingService(req: Request, res: Response): Promise<void> {
    const { service } = req.params;
    
    if (service !== 'CGC' && service !== 'WATA') {
      res.status(400).json({
        success: false,
        message: 'Invalid grading service. Must be CGC or WATA'
      });
      return;
    }
    
    const games = await gameService.getGamesByGradingService(service as 'CGC' | 'WATA');
    res.success(games);
  }
}

export default new GameController(); 