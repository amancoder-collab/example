import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { LoginDto, RegisterDto, UpdateProfileDto } from "../dto/auth.dto";
import authService from "../services/auth.service";

class AuthController {
  async login(req: Request, res: Response) {
    const loginData: LoginDto = req.body;
    const result = await authService.login(loginData);

    return result;
  }

  async register(req: Request, res: Response): Promise<void> {
    const registerData: RegisterDto = req.body;
    const result = await authService.register(registerData);

    res.status(StatusCodes.CREATED).json(result);
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await authService.getUserProfile(userId);

    res.json(result);
  }

  async updateProfile(req: Request, res: Response) {
    const userId = req.user!.id;
    const updateData: UpdateProfileDto = req.body;
    const result = await authService.updateProfile(userId, updateData);

    res.json(result);
  }
}

export default new AuthController();
