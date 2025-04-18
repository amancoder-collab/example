import { logger } from "@/infrastructure/logger/logger.service";
import { scraperService } from "@/services/scraper.service";
import { AppError } from "@/shared/exceptions";
import { BaseService } from "@/shared/utils/base.service";
import { StatusCodes } from "http-status-codes";

interface PopulationReport {
  available: boolean;
  data: {
    totalGraded: string | null;
    higherGrades: string | null;
    sameGrade: string | null;
    lowerGrades: string | null;
  } | null;
}

interface GameInfo {
  title: string | null;
  grade: string | null;
  platform: string | null;
  certificationDate: string | null;
  populationReport: PopulationReport;
}

interface CertificationResult {
  success: boolean;
  source: "CGC" | "WATA";
  certNumber: string;
  data: GameInfo;
}

interface CertificationLookupResult {
  certNumber: string;
  results: CertificationResult[];
}

class CertificationService extends BaseService {
  constructor() {
    super();
  }

  async getVideoGameByCertNumber(
    certNumber: string
  ): Promise<CertificationLookupResult> {
    logger.info(`Looking up certification: ${certNumber}`);

    const [cgcResult] = await Promise.allSettled([
      scraperService.cgcScraper(certNumber),
      // scraperService.wataScraper(certNumber),
    ]);

    const results: CertificationLookupResult = {
      certNumber,
      results: [],
    };

    console.log(cgcResult);
    if (cgcResult.status === "fulfilled") {
      results.results.push(cgcResult.value);
    }

    // if (wataResult.status === "fulfilled") {
    //   results.results.push(wataResult.value);
    // }

    if (results.results.length === 0) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        "Certificate not found in any supported grading service"
      );
    }

    logger.info(
      `Found ${results.results.length} results for cert: ${certNumber}`
    );
    return results;
  }
}

export default CertificationService.getInstance<CertificationService>();
