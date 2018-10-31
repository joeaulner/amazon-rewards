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

    await page.goto('https://www.amazon.com/ap/signin?_encoding=UTF8&ignoreAuthState=1&openid.assoc_handle=usflex&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2F%3Fref_%3Dnav_signin&switch_account=');
    await page.type('input#ap_email', process.env.AMAZON_USERNAME);
    await page.type('input#ap_password', process.env.AMAZON_PASSWORD);
    await page.click('input#signInSubmit');
    await page.waitForNavigation();
    console.log('logged in!');

    await page.goto('https://www.amazon.com/ga/giveaways');
    const giveawayLinks = await page.evaluate(() => {
        const iterator = document.querySelectorAll('.giveawayItemContainer').values();
        return Array.from(iterator)
            .map((element) => element.querySelector('a.giveAwayItemDetails'))
            .map((anchor: HTMLAnchorElement) => anchor.href);
    });
    console.log('giveaway links:', giveawayLinks);

    for (const href of giveawayLinks) {
        await page.goto(href);
        await page.waitFor('.qa-giveaway-participation-action-container');
        const giveawayType = await page.evaluate(() => {
            const hasElement = (selector) => Boolean(document.querySelectorAll(selector).length);
            return hasElement('#box_click_target') ? 'RedeemBox'
                : hasElement('#youtube-outer-container') ? 'YoutubeVideo'
                    : hasElement('#airy-outer-container') ? 'AiryVideo'
                        : hasElement('.qa-giveaway-result-text') ? 'Redeemed'
                            : 'Unknown';
        });
        console.log('giveaway type:', giveawayType);
    }

    await browser.close();
})();
