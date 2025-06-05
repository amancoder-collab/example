import { Router } from 'express';
import gameController from '../controllers/game.controller';

const router = Router();

// GET /api/games - Get all games
router.get('/', gameController.getAllGames.bind(gameController));

// GET /api/games/search - Search games (must come before /:id route)
router.get('/search', gameController.searchGames.bind(gameController));

// GET /api/games/grading/:service - Get games by grading service (must come before /:id route)
router.get('/grading/:service', gameController.getGamesByGradingService.bind(gameController));

// GET /api/games/:id - Get game by ID (must be last to avoid conflicts)
router.get('/:id', gameController.getGameById.bind(gameController));

export default router; 