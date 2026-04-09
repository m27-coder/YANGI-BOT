require('dotenv').config();
console.log("🚀 STARTUP: Application execution started.");


// --- CRITICAL ERROR HANDLERS ---
process.on('uncaughtException', (err) => {
    console.error('🔥 FATAL ERROR (Uncaught Exception):', err.stack || err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 FATAL ERROR (Unhandled Rejection) at:', promise, 'reason:', reason);
});

// Portni sozlash (Railway/Render uchun PORT env)
const PORT = process.env.PORT || 8080;


// --- EXPRESS SERVER (PORTScan va Health Check uchun) ---
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('<h1>Bot is online!</h1><p>Status: Active</p>');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 HEALTH CHECK: Express listening on port ${PORT} (0.0.0.0)`);
});

// --- DOIMIY ISHLASHNI TA'MINLASH (Anti-Exit) ---
// Ilovadan chiqib ketishning oldini olish uchun
setInterval(() => {
    console.log(`💎 KEEPALIVE: Service is active at ${new Date().toLocaleTimeString()}`);
}, 60000);

// dotenv already loaded at top

const { Telegraf, Markup } = require('telegraf');

const token = process.env.BOT_TOKEN;
const adminId = process.env.ADMIN_CHAT_ID;
const isValidAdminId = adminId && /^\d+$/.test(adminId);

console.log("🛠 CONFIG: Checking environment variables...");

if (!token || token === 'Ushbu_joyga_bot_tokenni_yozing') {
    console.error("🔴 ERROR: BOT_TOKEN topilmadi! Railway dashboard-da Environment Variables-ni sozlaganingizga ishonch hosil qiling.");
}


if (!isValidAdminId) {
    console.error("🔴 ERROR: ADMIN_CHAT_ID topilmadi yoki xato!");
}

// Bot obyekti (Token tekshiruvi bilan)
const bot = (token && token !== 'Ushbu_joyga_bot_tokenni_yozing') ? new Telegraf(token) : null;

if (bot) {
    console.log("🤖 BOT: Initializing setup...");
    
    const lastMessageMap = new Map();

    bot.start(async (ctx) => {
        const isFromAdmin = ctx.chat.id.toString() === adminId;

        if (!isFromAdmin) {
            const userId = ctx.from.id;
            try {
                if (isValidAdminId) {
                    const userName = ctx.from.username ? `@${ctx.from.username}` : `Yo'q`;
                    await bot.telegram.sendMessage(
                        adminId, 
                        `🔔 <b>Yangi foydalanuvchi!</b>\n👤 <b>Ism:</b> ${ctx.from.first_name}\n🔗 <b>Username:</b> ${userName}\n🆔 #id${userId}`, 
                        { parse_mode: 'HTML' }
                    );
                }
            } catch(e) { console.error("Notify error:", e.message); }
            
            ctx.reply(`👋 Salom! Xabaringizni yuboring, adminga yetkazaman.`);
        } else {
            ctx.reply("👋 Salom Admin!", Markup.keyboard([['🔗 Taklif havolasi']]).resize());
        }
    });

    bot.hears('🔗 Taklif havolasi', (ctx) => {
        if (ctx.chat.id.toString() !== adminId) return;
        ctx.reply(`Bot havolasi: https://t.me/${ctx.botInfo.username}`);
    });

    bot.on('message', async (ctx, next) => {
        const isFromAdmin = ctx.chat.id.toString() === adminId;

        if (isFromAdmin && ctx.message.reply_to_message) {
            const replyMsg = ctx.message.reply_to_message;
            const infoText = replyMsg.text || replyMsg.caption || '';
            const match = infoText.match(/#id(\d+)/);

            if (match) {
                const targetUserId = match[1];
                try {
                    await bot.telegram.sendMessage(targetUserId, `💬 <b>DIQQAT! ADMINDAN JAVOB KELDI:</b>`, { parse_mode: 'HTML' });
                    await ctx.telegram.copyMessage(targetUserId, ctx.chat.id, ctx.message.message_id);
                } catch(e) { await ctx.reply("🚫 Xato: bot bloklangan."); }
                return;
            }
        }

        if (isFromAdmin) return next();

        const userId = ctx.from.id;
        const now = Date.now();
        if (lastMessageMap.has(userId) && (now - lastMessageMap.get(userId) < 3000)) {
            return ctx.reply("⏳ Biroz kutib turing...");
        }
        lastMessageMap.set(userId, now);

        const header = `👤 <b>Mijoz:</b> ${ctx.from.first_name}\n🆔 #id${userId}\n\n`;
        try {
            if (ctx.message.text) {
                await bot.telegram.sendMessage(adminId, header + `📝 <b>Xabar:</b>\n` + ctx.message.text, { parse_mode: 'HTML' });
            } else {
                await ctx.copyMessage(adminId, { caption: header + (ctx.message.caption || ''), parse_mode: 'HTML' });
            }
            await ctx.reply("✅ Yuborildi!");
        } catch (err) { console.error("Forwarding error:", err.message); }
    });

    bot.catch((err) => console.error("Telegraf Error:", err));

    bot.launch()
        .then(() => console.log("🚀 BOT: Polling started!"))
        .catch(err => console.error("🚀 BOT: Start ERROR!", err));

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

} else {
    console.error("🛑 BOT: Bot initialization skipped. Please set the BOT_TOKEN variable.");
}
