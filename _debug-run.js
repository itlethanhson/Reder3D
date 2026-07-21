const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const badResponses = [];

    page.on('response', (r) => {
        const u = r.url();
        if (r.status() >= 400 && (u.includes('.hdr') || u.includes('.glb') || u.includes('ingest'))) {
            badResponses.push({ url: u, status: r.status() });
        }
    });

    await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle', timeout: 30000 });
    await page.click('#load-demo-btn');
    await page.waitForTimeout(6000);

    const dbg = await page.evaluate(() => window.__dbgLog || []);
    const consoleLogs = [];
    page.on('console', (m) => consoleLogs.push(m.text()));

    console.log('BAD_RESPONSES', JSON.stringify(badResponses));
    console.log('DBG_LOG', JSON.stringify(dbg));
    await browser.close();
})().catch((e) => {
    console.error('PLAYWRIGHT_ERR', e.message);
    process.exit(1);
});
