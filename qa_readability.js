const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2
    });

    const page = await context.newPage();
    try {
        await page.goto('http://localhost:8112', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Scroll to story section to capture square portrait and newly dark text
        await page.evaluate(() => window.scrollTo(0, document.querySelector('.story-section').offsetTop));
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'C:\\Users\\lucid\\.gemini\\antigravity\\brain\\3c060041-ef9f-4292-b15c-c9806fcdc2bf\\readability_story.png' });

        // Scroll to operator section to capture webgl and new dark text contrast
        await page.evaluate(() => window.scrollTo(0, document.querySelector('.operator-system-section').offsetTop - 100));
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'C:\\Users\\lucid\\.gemini\\antigravity\\brain\\3c060041-ef9f-4292-b15c-c9806fcdc2bf\\readability_operator.png' });

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
})();
