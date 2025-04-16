import puppeteer, { Browser, Page } from 'puppeteer';
import { StatusCodes } from 'http-status-codes';
import config from '../../../shared/config';
import logger from '../../../infrastructure/logger/logger.service';
import { AppError } from '../../../shared/middleware/error.middleware';
import processHandler from '../../../infrastructure/server/process-handler';
import { BaseService } from '../../../shared/utils/base.service';

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
    source: 'CGC' | 'WATA';
    certNumber: string;
    data: GameInfo;
}

interface CertificationLookupResult {
    certNumber: string;
    results: CertificationResult[];
}

class CertificationService extends BaseService {
    private browsers: Map<string, Browser>;

    constructor() {
        super();
        if (this.browsers) return this;

        this.browsers = new Map();

        // Register cleanup handler
        processHandler.addCleanupHandler(async () => {
            await this.closeBrowsers();
        });
    }

    private async initBrowser(service: string): Promise<Browser> {
        try {
            const browser = await puppeteer.launch(config.puppeteer);
            this.browsers.set(service, browser);
            return browser;
        } catch (error) {
            logger.error(`Failed to initialize browser for ${service}:`, error);
            throw new AppError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to initialize browser for ${service}`
            );
        }
    }

    private async getBrowser(service: string): Promise<Browser> {
        if (!this.browsers.has(service)) {
            await this.initBrowser(service);
        }
        return this.browsers.get(service)!;
    }

    private async closeBrowsers(): Promise<void> {
        for (const [service, browser] of this.browsers.entries()) {
            try {
                await browser.close();
                this.browsers.delete(service);
            } catch (error) {
                logger.error(`Error closing browser for ${service}:`, error);
            }
        }
    }

    public async lookup(certNumber: string): Promise<CertificationLookupResult> {
        logger.info(`Looking up certification: ${certNumber}`);

        const [cgcResult, wataResult] = await Promise.allSettled([
            this.cgcScraper(certNumber),
            this.wataScraper(certNumber)
        ]);

        const results: CertificationLookupResult = {
            certNumber,
            results: []
        };

        if (cgcResult.status === 'fulfilled') {
            results.results.push(cgcResult.value);
        }

        if (wataResult.status === 'fulfilled') {
            results.results.push(wataResult.value);
        }

        if (results.results.length === 0) {
            throw new AppError(
                StatusCodes.NOT_FOUND,
                'Certificate not found in any supported grading service'
            );
        }

        logger.info(`Found ${results.results.length} results for cert: ${certNumber}`);
        return results;
    }

    private async cgcScraper(certNumber: string): Promise<CertificationResult> {
        const browser = await this.getBrowser('cgc');
        const page = await browser.newPage();

        try {
            await page.setViewport({
                width: 1920,
                height: 1080,
                deviceScaleFactor: 1
            });

            await page.goto(config.services.cgc.url, {
                waitUntil: 'networkidle0',
                timeout: config.services.cgc.timeout
            });

            logger.info(`Searching CGC certification: ${certNumber}`);

            await page.waitForSelector('fieldset.certlookup-search__inputs input[name="certNumber"]');
            await page.type('fieldset.certlookup-search__inputs input[name="certNumber"]', certNumber);
            await page.click('fieldset.certlookup-search__inputs button.button--small.button--secondary');

            const [response] = await Promise.all([
                page.waitForResponse(response => response.url().includes('cert-lookup') && response.status() === 200),
                page.waitForSelector('.certlookup-result', { timeout: config.services.cgc.timeout })
                    .catch(() => null)
            ]);

            const gameInfo = await page.evaluate(() => {
                const result: GameInfo = {
                    title: document.querySelector('.game-title')?.textContent?.trim() ?? null,
                    grade: document.querySelector('.grade-value')?.textContent?.trim() ?? null,
                    platform: document.querySelector('.platform')?.textContent?.trim() ?? null,
                    certificationDate: document.querySelector('.cert-date')?.textContent?.trim() ?? null,
                    populationReport: {
                        available: false,
                        data: null
                    }
                };

                const popReport = document.querySelector('.population-data');
                if (popReport) {
                    result.populationReport.available = true;
                    result.populationReport.data = {
                        totalGraded: document.querySelector('.total-graded')?.textContent?.trim() ?? null,
                        higherGrades: document.querySelector('.higher-grades')?.textContent?.trim() ?? null,
                        sameGrade: document.querySelector('.same-grade')?.textContent?.trim() ?? null,
                        lowerGrades: document.querySelector('.lower-grades')?.textContent?.trim() ?? null
                    };
                }

                return result;
            });

            if (!gameInfo.title) {
                throw new AppError(
                    StatusCodes.NOT_FOUND,
                    `No results found for CGC certification number: ${certNumber}`
                );
            }

            logger.info(`Successfully retrieved CGC data for cert: ${certNumber}`);
            return {
                success: true,
                source: 'CGC',
                certNumber,
                data: gameInfo
            };

        } catch (error) {
            logger.error(`CGC scraping failed for cert ${certNumber}:`, error);
            throw new AppError(
                error instanceof AppError ? error.statusCode : StatusCodes.INTERNAL_SERVER_ERROR,
                error instanceof Error ? error.message : `Failed to retrieve CGC certification: ${certNumber}`
            );
        } finally {
            await page.close();
        }
    }

    private async wataScraper(certNumber: string): Promise<CertificationResult> {
        // Similar implementation for WATA...
        throw new AppError(
            StatusCodes.NOT_IMPLEMENTED,
            'WATA certification lookup is not implemented yet'
        );
    }
}

export default CertificationService.getInstance<CertificationService>(); 