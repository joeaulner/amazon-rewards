import * as Nightmare from 'nightmare';

enum GiveawayType {
    RedeemBox = 'RedeemBox',
    YoutubeVideo = 'YoutubeVideo',
    AiryVideo = 'AiryVideo',
    Redeemed = 'Redeemed',
    Unknown = 'Unknown'
}

class NightmareExtended extends Nightmare {
    constructor(private username: string, private password: string, options: Nightmare.IConstructorOptions) {
        super(options);
    }

    login() {
        return this
            .goto('https://www.amazon.com')
            .wait('.nav-action-button')
            .click('.nav-action-button')
            .wait('input#ap_email')
            .type('input#ap_email', this.username)
            .click('input#continue')
            .wait('input#ap_password')
            .type('input#ap_password', this.password)
            .click('input#signInSubmit')
            .wait(5000) as NightmareExtended;
    }

    async getGiveaways() {
        return this
            .goto('https://www.amazon.com/ga/giveaways')
            .evaluate(() => {
                const iterator = document.querySelectorAll('.giveawayItemContainer').values();
                return Array.from(iterator)
                    .map((element) => element.querySelector('a.giveAwayItemDetails'))
                    .map((anchor: HTMLAnchorElement) => anchor.href);
            })
            .then((hrefs: string[]) => hrefs);
    }

    // todo: add logic to handle various giveaway formats
    async redeemGiveaway(href: string) {
        const giveawayType = await this.goto(href)
            .wait('.qa-giveaway-participation-action-container')
            .evaluate(() => {
                return document.querySelectorAll('#box_click_target').length ? 'RedeemBox'
                    : document.querySelectorAll('#youtube-outer-container').length ? 'YoutubeVideo'
                        : document.querySelectorAll('#airy-outer-container').length ? 'AiryVideo'
                            : document.querySelectorAll('.qa-giveaway-result-text').length ? 'Redeemed'
                                : 'Unknown';
            })
            .then((type) => type as GiveawayType);
        let resultText = '';
        switch (giveawayType) {
            case GiveawayType.RedeemBox:
                resultText = await this.click('#box_click_target')
                    .wait('.qa-giveaway-result-text')
                    .evaluate(() => document.querySelectorAll('.qa-giveaway-result-text').item(0).textContent)
                    .then(_ => _ as string);
                console.log(`${giveawayType}: ${resultText}`);
                break;
            case GiveawayType.Redeemed:
                resultText = await this
                    .evaluate(() => document.querySelectorAll('.qa-giveaway-result-text').item(0).textContent)
                    .then(_ => _ as string);
                console.log(`${giveawayType}: ${resultText}`);
                break;
            default:
                console.log(giveawayType);
        }
    }

    // youtube button selector: .enter-youtube-video-button:not(.disabled)
}

export default NightmareExtended;
