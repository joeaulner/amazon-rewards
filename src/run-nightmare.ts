import Nightmare from './nightmare-extended';
import * as dotenv from 'dotenv';

dotenv.config();

(async () => {
    try {
        const nightmare = new Nightmare(
            process.env.AMAZON_USERNAME,
            process.env.AMAZON_PASSWORD,
            { show: true }
        ).viewport(1200, 900) as Nightmare;
        const giveaways = await nightmare
            .login()
            .getGiveaways();
        while (giveaways.length > 0) {
            const giveawayHref = giveaways.pop();
            await nightmare.redeemGiveaway(giveawayHref);
        }
        await nightmare.end().then(_ => _);
    } catch (err) {
        console.error(err);
    }
})();
