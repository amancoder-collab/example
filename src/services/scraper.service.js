const puppeteer = require('puppeteer');
const { StatusCodes } = require('http-status-codes');
const config = require('../config/config');
const logger = require('../utils/logger');
const { AppError } = require('../middlewares/error');

class ScraperService {
    constructor() {
        this.browsers = new Map();
    }

    async initBrowser(service) {
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

    async getBrowser(service) {
        if (!this.browsers.has(service)) {
            await this.initBrowser(service);
        }
        return this.browsers.get(service);
    }

    async closeBrowsers() {
        for (const [service, browser] of this.browsers.entries()) {
            try {
                await browser.close();
                this.browsers.delete(service);
            } catch (error) {
                logger.error(`Error closing browser for ${service}:`, error);
            }
        }
    }

    async cgcScraper(certNumber) {
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
                const result = {
                    title: document.querySelector('.game-title')?.textContent?.trim(),
                    grade: document.querySelector('.grade-value')?.textContent?.trim(),
                    platform: document.querySelector('.platform')?.textContent?.trim(),
                    certificationDate: document.querySelector('.cert-date')?.textContent?.trim(),
                    populationReport: {
                        available: false,
                        data: null
                    }
                };

                const popReport = document.querySelector('.population-data');
                if (popReport) {
                    result.populationReport.available = true;
                    result.populationReport.data = {
                        totalGraded: document.querySelector('.total-graded')?.textContent?.trim(),
                        higherGrades: document.querySelector('.higher-grades')?.textContent?.trim(),
                        sameGrade: document.querySelector('.same-grade')?.textContent?.trim(),
                        lowerGrades: document.querySelector('.lower-grades')?.textContent?.trim()
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
                error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
                error.message || `Failed to retrieve CGC certification: ${certNumber}`
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

module.exports = scraperService; 