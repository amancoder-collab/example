import { Request, Response } from "express";
import certificationService from "../services/certification.service";
import { validateResponse } from "../validators/certification.validator";

class CertificationController {
  async getVideoGameByCertNumber(req: Request, res: Response): Promise<void> {
    const certNumber = req.params.certNumber;

    const data = await certificationService.getVideoGameByCertNumber(
      certNumber
    );

    const validatedData = validateResponse(data);

    res.json(validatedData);
  }
}

export default new CertificationController();
