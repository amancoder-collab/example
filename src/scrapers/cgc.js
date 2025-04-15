const puppeteer = require('puppeteer');

const CGC_URL = 'https://www.cgcvideogames.com/en-US/cert-lookup';

async function cgcScraper(certNumber) {
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
        
        // Navigate to CGC lookup page
        await page.goto(CGC_URL);

        console.log('Navigated to CGC lookup page');
        
        // Wait for the input field to be available
        await page.waitForSelector('fieldset.certlookup-search__inputs input[name="certNumber"]');
        
        // Input the certification number
        await page.type('fieldset.certlookup-search__inputs input[name="certNumber"]', certNumber);
        console.log('Inputted certification number');
        
        // Click the Go button using the correct selector
        await page.click('fieldset.certlookup-search__inputs button.button--small.button--secondary');
        console.log('Clicked submit');

        // Wait for results to load
        await page.waitForSelector('.certlookup-result', { timeout: 10000 });

        // Extract game information
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

            // Check if population report exists
            // const popReport = document.querySelector('.population-data');
            // if (popReport) {
            //     result.populationReport.available = true;
            //     result.populationReport.data = {
            //         totalGraded: document.querySelector('.total-graded')?.textContent?.trim(),
            //         higherGrades: document.querySelector('.higher-grades')?.textContent?.trim(),
            //         sameGrade: document.querySelector('.same-grade')?.textContent?.trim(),
            //         lowerGrades: document.querySelector('.lower-grades')?.textContent?.trim()
            //     };
            // }

            return result;
        });

        return {
            success: true,
            source: 'CGC',
            certNumber,
            data: gameInfo
        };

    } catch (error) {
        console.error('CGC scraping failed:', error);
        throw new Error(`CGC scraping failed: ${error.message}`);
    } finally {
        // await browser.close();
    }
}

module.exports = { cgcScraper }; 