const TelegramBot = require('node-telegram-bot-api');
const { Pool } = require('pg');

// 1. رابط قاعدة البيانات ديالك في Koyeb
const dbUrl = "postgres://koyeb-adm:npg_bYgGQ7lZJo8d@ep-patient-hill-alza9ryd.c-3.eu-central-1.pg.koyeb.app/koyebdb";

// 2. حط هنا التوكن اللي غيعطيك BotFather ފ Telegram
const token = '8308447806:AAGpj-E-_1jOTvA7vk9Nq1zKH48sC3YCjK8';

// 3. باش البوت يجاوب غير نتا (الادمين)، حط الأيدي ديالك هنا
// تقدر تجبدو من البوت @ShowJsonBot
const ADMIN_ID = 7210704553; // بدلو بالأيدي ديالك الحقيقي

const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
});

const bot = new TelegramBot(token, { polling: true });

console.log("🤖 Telegram Bot is running...");

// ملي شي حد كيصيفط /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "مرحبا بيك فالبوت ديال فخر! \nإلا كنتي الأدمين صيفط /genkey باش تصاوب ساروت جديد.");
});

// أمر صناعة السوارت /genkey
bot.onText(/\/genkey/, async (msg) => {
    const chatId = msg.chat.id;

    // تأكد واش المرسل هو الأدمين
    // إيلا بغيتي أي واحد يصاوب السوارت حبس هاد الشرط (Commenter it)
    if (chatId !== ADMIN_ID) {
        bot.sendMessage(chatId, "❌ ماعندكش الصلاحية تصاوب السوارت!");
        return;
    }

    // توليد ساروت عشوائي (مثلا: FAKHER-VIP-A1B2C3D4)
    const randomString = Math.random().toString(36).substring(2, 10).toUpperCase();
    const newKey = `FAKHER-VIP-${randomString}`;

    try {
        // حط الساروت في قاعدة البيانات ديال Koyeb
        await pool.query('INSERT INTO user_keys (key_string) VALUES ($1)', [newKey]);

        // جاوب الأدمين
        bot.sendMessage(chatId, `✅ تم صنع الساروت بنجاح!\n\n🔑 الساروت: \`${newKey}\`\n\nصيفطو للكليان دابا.`, { parse_mode: 'Markdown' });
        console.log(`[+] New Key Generated: ${newKey}`);

    } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, "❌ وقع مشكل فالاتصال بقاعدة البيانات. جرب عاود.");
    }
});

// أمر لمعرفة شحال من ساروت مبيوع /stats
bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        const result = await pool.query('SELECT COUNT(*) FROM user_keys');
        const count = result.rows[0].count;

        bot.sendMessage(chatId, `📊 الإحصائيات:\nعندك حاليا ${count} ساروت مسجل في قاعدة البيانات.`);
    } catch (err) {
        bot.sendMessage(chatId, "❌ وقع مشكل.");
    }
});

