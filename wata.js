const puppeteer = require('puppeteer');

const WATA_URL = 'https://www.watagames.com/verify';  // Note: URL might need to be updated

async function wataScraper(certNumber) {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--start-maximized',
            '--window-size=1920,1080'
        ]
    });

    try {
        const page = await browser.newPage();
        
        // Set viewport to full HD resolution
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1
        });
        
        // Navigate to WATA verification page
        await page.goto(WATA_URL);

        console.log('Navigated to WATA lookup page');
        // Input the certification number
        await page.type('input[name="certification"]', certNumber);
        console.log('Inputted certification number');
        await page.click('button[type="submit"]');
        console.log('Clicked submit');

        // Wait for results to load
        await page.waitForSelector('.verification-results', { timeout: 5000 });

        // Extract game information
        const gameInfo = await page.evaluate(() => {
            const result = {
                title: document.querySelector('.game-name')?.textContent?.trim(),
                grade: document.querySelector('.grade')?.textContent?.trim(),
                platform: document.querySelector('.platform')?.textContent?.trim(),
                certificationDate: document.querySelector('.cert-date')?.textContent?.trim(),
                populationReport: {
                    available: false,
                    data: null
                }
            };

            // Check if population report exists
            const popReport = document.querySelector('.population-stats');
            if (popReport) {
                result.populationReport.available = true;
                result.populationReport.data = {
                    totalGraded: document.querySelector('.total-population')?.textContent?.trim(),
                    higherGrades: document.querySelector('.higher')?.textContent?.trim(),
                    sameGrade: document.querySelector('.same')?.textContent?.trim(),
                    lowerGrades: document.querySelector('.lower')?.textContent?.trim()
                };
            }

            return result;
        });

        return {
            success: true,
            source: 'WATA',
            certNumber,
            data: gameInfo
        };

    } catch (error) {
        console.error('WATA scraping failed:', error);
        throw new Error(`WATA scraping failed: ${error.message}`);
    } finally {
        // await browser.close();
    }
}

module.exports = { wataScraper }; 