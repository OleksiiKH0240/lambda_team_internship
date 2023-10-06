import axios from "axios";
import TelegramBot from "node-telegram-bot-api";

const cryptoRestApiUrl = "http://localhost";
const token = process.env.ferusBestia_test_bot_token;
if (token == undefined) {
    console.log("can't get telegram bot token");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true, });


const cryptoFolowingSets: { [index: number]: Set<string> } = {}
async function getCryptoCurrencyRate(currencySymbol: string = "BTC", market: string = "all", lastUpdatedPeriod: string = "5mins") {
    const requestedBody = {
        "crypto_currency_symbol": currencySymbol,
        "market": market,
        "last_updated_period": lastUpdatedPeriod
    }
    const response = await axios.request({
        method: "get",
        url: cryptoRestApiUrl,
        data: requestedBody
    });

    if (response.data.error != undefined) {
        return response.data;
    }

    return response.data.price;
}

async function getRecentCryptoCurrencies() {
    const response = await axios.request({
        method: "get",
        url: cryptoRestApiUrl + "/availableCryptoCurrencies"
    })
    return response.data.availableSymbols;
}


bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `hello ${msg.from?.first_name}`);
})


bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id,
        "/start ;\n" +
        "/help ;\n" +
        "/listRecent ;\n" +
        "/{crypto currency symbol} For instance: /BTC ;\n" +
        "/addToFavorite {crypto currency symbol} \nFor instance: /addToFavorite BTC ;\n" +
        "/listFavorite ;\n" +
        "/deleteFromFavorite {crypto currency symbol} \nFor instance: /deleteFromFavorite BTC .\n")
})


let recentNumber = 50;
bot.onText(/\/listRecent/, async (msg) => {
    const recentCryptoCurrencies = await getRecentCryptoCurrencies();
    recentNumber = recentNumber < recentCryptoCurrencies.length ? recentNumber : recentCryptoCurrencies.length;
    let replyMessage = "", cryptoCurrencyRate: number;
    for (const cryptoSymbol of recentCryptoCurrencies.slice(0, recentNumber)) {
        cryptoCurrencyRate = await getCryptoCurrencyRate(cryptoSymbol, "all", "5mins");
        replyMessage += `/${cryptoSymbol} $ ${cryptoCurrencyRate.toFixed(2)}\n`;
    }
    bot.sendMessage(msg.chat.id, replyMessage);

})


// possible callback_data: add_to_following, remove_from_following
// possible text: Add to following, Remove from following
let inlineKeyboard = {
    "reply_markup": {
        "inline_keyboard": [[{
            "text": "",
            "callback_data": ""
        }]]
    }
}

bot.onText(/\/[A-Z]+/, async (msg) => {
    const cryptoSymbol = msg.text?.slice(1);
    if (cryptoSymbol != undefined) {
        const cryptoCurrency24hoursData: { [index: string]: string } = {};
        // let cryptoCurrencyRate: number | { [index: string]: string };
        let cryptoCurrencyRate = undefined;
        for (const lastUpdatedPeriod of ["15mins", "30mins", "1hour", "3hours", "6hours", "12hours", "24hours"]) {
            cryptoCurrencyRate = await getCryptoCurrencyRate(cryptoSymbol, "all", lastUpdatedPeriod);

            while (cryptoCurrencyRate == undefined) {
                cryptoCurrencyRate = await getCryptoCurrencyRate(cryptoSymbol, "all", lastUpdatedPeriod);
                console.log("cryptoCurrencyRate is undefined", cryptoSymbol, lastUpdatedPeriod, cryptoCurrencyRate);
            }

            if (cryptoCurrencyRate.error != undefined) {
                bot.sendMessage(msg.chat.id, cryptoCurrencyRate.error);
                break;
            }
            cryptoCurrency24hoursData["last " + lastUpdatedPeriod] = `$ ${cryptoCurrencyRate.toFixed(2)}`;
        }

        if (cryptoFolowingSets[msg.chat.id] == undefined) {
            cryptoFolowingSets[msg.chat.id] = new Set<string>()
            inlineKeyboard.reply_markup.inline_keyboard[0][0].text = "Add to following";
            inlineKeyboard.reply_markup.inline_keyboard[0][0].callback_data = "add_to_following";
        }
        else {
            if (!cryptoFolowingSets[msg.chat.id].has(cryptoSymbol)) {
                inlineKeyboard.reply_markup.inline_keyboard[0][0].text = "Add to following";
                inlineKeyboard.reply_markup.inline_keyboard[0][0].callback_data = "add_to_following";
            }
            else {
                inlineKeyboard.reply_markup.inline_keyboard[0][0].text = "Delete from following";
                inlineKeyboard.reply_markup.inline_keyboard[0][0].callback_data = "delete_from_following";
            }
        }

        bot.sendMessage(msg.chat.id,
            `${cryptoSymbol} details:\n ${JSON.stringify(cryptoCurrency24hoursData, null, 4)}`,
            { ...inlineKeyboard })
    }
})


bot.on("callback_query", (callbackQuery) => {
    const cryptoSymbol = callbackQuery.message?.text?.split("\n")[0].split(" ")[0];
    if (cryptoSymbol != undefined) {
        if (callbackQuery.data == "add_to_following") {
            if (cryptoFolowingSets[callbackQuery.from.id] == undefined) {
                cryptoFolowingSets[callbackQuery.from.id] = new Set<string>()
            }

            cryptoFolowingSets[callbackQuery.from.id].add(cryptoSymbol);
        }
        else if (callbackQuery.data == "delete_from_following") {
            if (cryptoFolowingSets[callbackQuery.from.id] != undefined) {
                cryptoFolowingSets[callbackQuery.from.id].delete(cryptoSymbol);
            }
        }
    }
    else {
        console.log("crypto symbol in callback query is undefined")
    }

    bot.answerCallbackQuery(callbackQuery.id);

})


bot.onText(/\/addToFavorite [a-zA-Z]+/, async (msg) => {
    let cryptoSymbol = msg.text?.split(" ")[1];
    const availableCryptoCurrencies: string[] = await getRecentCryptoCurrencies();

    if (cryptoSymbol != undefined && availableCryptoCurrencies.findIndex((value) => value == cryptoSymbol?.toUpperCase()) != -1) {
        if (cryptoFolowingSets[msg.chat.id] == undefined) {
            cryptoFolowingSets[msg.chat.id] = new Set<string>()
        }

        cryptoSymbol = cryptoSymbol.toUpperCase();
        cryptoFolowingSets[msg.chat.id].add(cryptoSymbol);

        bot.sendMessage(msg.chat.id, `crypto currency ${cryptoSymbol} was successfully added to the following list`)
    }
    else {
        bot.sendMessage(msg.chat.id, "crypto currency symbol is either undefined or unavailable")
    }


})


bot.onText(/\/listFavorite/, async (msg) => {
    let replyMessage = "", cryptoCurrencyRate: number;
    const cryptoSymbols = cryptoFolowingSets[msg.chat.id];

    if (cryptoSymbols != undefined && cryptoSymbols.size != 0) {
        for (const cryptoSymbol of cryptoSymbols) {
            cryptoCurrencyRate = await getCryptoCurrencyRate(cryptoSymbol, "all", "5mins");
            replyMessage += `/${cryptoSymbol} $ ${cryptoCurrencyRate.toFixed(2)}\n`;
        }
    }
    else {
        replyMessage = "you didn't have any crypto currencies in your following list.";
    }

    bot.sendMessage(msg.chat.id, replyMessage);


})


bot.onText(/\/deleteFromFavorite [a-zA-Z]+/, (msg) => {
    let cryptoSymbol = msg.text?.split(" ")[1];

    if (cryptoSymbol != undefined) {
        if (cryptoFolowingSets[msg.chat.id] == undefined) {
            bot.sendMessage(msg.chat.id, "you didn't have any crypto currencies in your following list.");
        }
        else {
            cryptoSymbol = cryptoSymbol.toUpperCase();
            const isExist = cryptoFolowingSets[msg.chat.id].delete(cryptoSymbol);
            if (isExist) {
                bot.sendMessage(msg.chat.id, `crypto currency ${cryptoSymbol} was successfully deleted from the following list.`);
            }
            else {
                bot.sendMessage(msg.chat.id, `crypto currency ${cryptoSymbol} was not in your following list.`);
            }

        }
    }
    else {
        bot.sendMessage(msg.chat.id, "crypto currency symbol is undefined.");
    }
})

console.log("bot is waiting for messages.")

// console.log(await getRecentCryptoCurrencies());
// console.log(await getCryptoCurrencyRate());
