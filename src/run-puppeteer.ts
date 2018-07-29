import * as Puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';

dotenv.config();

let browser: Puppeteer.Browser;
let page: Puppeteer.Page;

(async () => {
    browser = await Puppeteer.launch({
        headless: false
    });
    page = await browser.newPage();

    // ! why won't you click >:(

    await page.goto('https://www.amazon.com');
    await page.waitFor(5000);
    await waitAndClick('a.nav-action-button .nav-action-inner');
    await waitAndType('input#ap_email', process.env.AMAZON_USERNAME);
    await page.click('input#continue');
    await waitAndType('input#ap_password', process.env.AMAZON_PASSWORD);
    await page.click('input#signInSubmit');

    await page.waitForNavigation();
    console.log('logged in!');

    await browser.close();
})();

async function waitAndClick(selector: string) {
    await page.waitForSelector(selector, {visible: false});
    await page.click(selector);
}

async function waitAndType(selector: string, inputText: string) {
    await page.waitFor(selector);
    await page.type(selector, inputText);
}
