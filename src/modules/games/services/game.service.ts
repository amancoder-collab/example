import { Game } from '../models/game.model';

// Mock data for demonstration purposes
const games: Game[] = [
  {
    id: '1',
    title: 'Super Mario Bros.',
    platform: 'NES',
    releaseYear: 1985,
    publisher: 'Nintendo',
    developer: 'Nintendo',
    condition: 'Sealed',
    certificationNumber: 'CGC123456',
    gradingService: 'CGC',
    grade: '9.8 A++',
  },
  {
    id: '2',
    title: 'The Legend of Zelda: Ocarina of Time',
    platform: 'Nintendo 64',
    releaseYear: 1998,
    publisher: 'Nintendo',
    developer: 'Nintendo EAD',
    condition: 'Sealed',
    certificationNumber: 'WATA789012',
    gradingService: 'WATA',
    grade: '9.6 A+',
  },
  {
    id: '3',
    title: 'Final Fantasy VII',
    platform: 'PlayStation',
    releaseYear: 1997,
    publisher: 'Square',
    developer: 'Square',
    condition: 'Complete',
    certificationNumber: 'CGC345678',
    gradingService: 'CGC',
    grade: '9.0 A',
  },
];

export class GameService {
  /**
   * Get all games
   */
  public async getAllGames(): Promise<Game[]> {
    return games;
  }

  /**
   * Get game by ID
   */
  public async getGameById(id: string): Promise<Game | undefined> {
    return games.find(game => game.id === id);
  }

  /**
   * Search games by title, platform, or certification number
   */
  public async searchGames(query: string): Promise<Game[]> {
    const lowerQuery = query.toLowerCase();
    return games.filter(
      game =>
        game.title.toLowerCase().includes(lowerQuery) ||
        game.platform.toLowerCase().includes(lowerQuery) ||
        game.certificationNumber?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get games by grading service
   */
  public async getGamesByGradingService(service: 'CGC' | 'WATA'): Promise<Game[]> {
    return games.filter(game => game.gradingService === service);
  }
}

export default new GameService(); 