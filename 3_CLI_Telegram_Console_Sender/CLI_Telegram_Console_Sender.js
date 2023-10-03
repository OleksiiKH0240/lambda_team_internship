import { program } from "commander";
import TelegramBot from "node-telegram-bot-api";

const token = "6317463778:AAHFNnvwQP3RRqE5tKdG1ww45vRIyiM4qhg";
const bot = new TelegramBot(token, { polling: false });

// Initialize variable below with your telegram user id.
let telegram_user_id = 588266453;


// If you don't know what your telegram user id is, run script with argument 'get_id' and send message to the bot 
// in order to check your telegram user id. Bot: @ferusBestia_test_bot
async function get_id() {
    if (isNaN(telegram_user_id)) {
        await bot.startPolling();
        console.log("bot <@ferusBestia_test_bot> is waiting for message")
        bot.on('message', (msg) => {
            const chatId = msg.chat.id;
            console.log("your telegram user id is " + chatId);
            bot.stopPolling();
        });
    } else{
        console.log("you already know your telegram_user_id, otherwise you should set telegram_user_id to NaN")
    }
}

program.command("get_id").description("check your telegram user id")
    .action(async function () { await get_id(); });

program.command("message")
    .description("send a message to a specific telegram user")
    .argument("<msg_content>", "content of message you would like to send, surrounded with double quotes if the message contains spaces")
    .action(async function (msg_content) {
        await bot.sendMessage(telegram_user_id, msg_content);
        console.log("message: '%s' was successfully delivered", msg_content);
    });

program.command("photo")
    .description("send a photo to a specific telegram user")
    .argument("<path_to_photo>", "path of photo you would like to send")
    .action(async function (path_to_photo) {
        await bot.sendPhoto(telegram_user_id, path_to_photo)
        console.log("photo was successfully delivered")
    });

program.parse();
