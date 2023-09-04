import axios from 'axios';
import TelegramBot from "node-telegram-bot-api";

// @ferusBestia_test_bot
const token = "6317463778:AAHFNnvwQP3RRqE5tKdG1ww45vRIyiM4qhg";
const bot = new TelegramBot(token, { polling: true });

console.log("bot is waiting for your messages ");



bot.on("message", async function (msg) {
    const chatId = msg.chat.id;
    if (msg.text == "photo") {
        console.log(`User ${msg.from.first_name} ${msg.from.last_name} requested a photo`);
        const photoUrl = await getRandomPhotoUrl();
        bot.sendPhoto(chatId, photoUrl);

    } else {
        console.log(`User ${msg.from.first_name} ${msg.from.last_name} sended message: ${msg.text}`);
        bot.sendMessage(chatId, "You sended: " + msg.text);
    }
})

async function getRandomPhotoUrl() {
    const response = await axios.get("https://picsum.photos/200/300");
    console.log(`status code: ${response.status}`);
    if (response.status == 200) {
        return response.request.res.responseUrl;
    }
}
