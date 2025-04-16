import puppeteer, { Browser, Page } from 'puppeteer';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '@/middleware/error.middleware';
import config from '@/config';
import { logger } from '@/infrastructure/logger/logger.service';

interface PopulationReportData {
    totalGraded: string | null;
    higherGrades: string | null;
    sameGrade: string | null;
    lowerGrades: string | null;
}

interface PopulationReport {
    available: boolean;
    data: PopulationReportData | null;
}

interface GameInfo {
    title: string | null;
    grade: string | null;
    platform: string | null;
    certificationDate: string | null;
    populationReport: PopulationReport;
}

interface ScrapingResult {
    success: boolean;
    source: 'CGC' | 'WATA';
    certNumber: string;
    data: GameInfo;
}

class ScraperService {
    private browsers: Map<string, Browser>;

    constructor() {
        this.browsers = new Map();
    }

    private async initBrowser(service: string): Promise<Browser> {
        try {
            const browser = await puppeteer.launch({
                ...config.puppeteer,
                args: [...config.puppeteer.args]
            });
            this.browsers.set(service, browser);
            return browser;
        } catch (error) {
            logger.error(`Failed to initialize browser for ${service}:`, { error });
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

    public async closeBrowsers(): Promise<void> {
        for (const [service, browser] of this.browsers.entries()) {
            try {
                await browser.close();
                this.browsers.delete(service);
            } catch (error) {
                logger.error(`Error closing browser for ${service}:`, { error });
            }
        }
    }

    public async cgcScraper(certNumber: string): Promise<ScrapingResult> {
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

            // Wait for either success or error state
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
            logger.error(`CGC scraping failed for cert ${certNumber}:`, { error });
            throw new AppError(
                error instanceof AppError ? error.statusCode : StatusCodes.INTERNAL_SERVER_ERROR,
                error instanceof Error ? error.message : `Failed to retrieve CGC certification: ${certNumber}`
            );
        } finally {
            await page.close();
        }
    }
}

// Singleton instance
const scraperService = new ScraperService();

// Cleanup on process termination
process.on('SIGTERM', async () => {
    await scraperService.closeBrowsers();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await scraperService.closeBrowsers();
    process.exit(0);
});

export default scraperService; 