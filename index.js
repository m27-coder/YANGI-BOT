console.log("🚀 STARTUP: Application execution started.");

// --- CRITICAL ERROR HANDLERS ---
process.on('uncaughtException', (err) => {
    console.error('🔥 FATAL ERROR (Uncaught Exception):', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 FATAL ERROR (Unhandled Rejection):', reason);
});

const http = require('http');
// Render odatda 10000 portni kutadi, agar PORT env berilmagan bo'lsa
const PORT = process.env.PORT || 10000;

// Render Health Check uchun serverni darhol ishga tushiramiz
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot STATUS: OK\n');
}).listen(PORT, '0.0.0.0', () => {
    console.log(`📡 HEALTH CHECK: Server is listening on port ${PORT} (interface 0.0.0.0)`);
});

require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const token = process.env.BOT_TOKEN;
const adminId = process.env.ADMIN_CHAT_ID;
const isValidAdminId = adminId && /^\d+$/.test(adminId);

console.log("🛠 CONFIG: Checking environment variables...");

if (!token || token === 'Ushbu_joyga_bot_tokenni_yozing') {
    console.error("🔴 ERROR: BOT_TOKEN is missing or invalid in Environment Variables!");
} else {
    console.log("✅ CONFIG: BOT_TOKEN found.");
}

if (!isValidAdminId) {
    console.error("🔴 ERROR: ADMIN_CHAT_ID is missing or invalid in Environment Variables!");
} else {
    console.log("✅ CONFIG: ADMIN_CHAT_ID found.");
}

// Bot obyekti
const bot = (token && token !== 'Ushbu_joyga_bot_tokenni_yozing') ? new Telegraf(token) : null;

if (bot) {
    console.log("🤖 BOT: Initializing commands...");
    
    // Antispam map
    const lastMessageMap = new Map();

    bot.start(async (ctx) => {
        const isFromAdmin = ctx.chat.id.toString() === adminId;

        if (!isFromAdmin) {
            const userName = ctx.from.username ? `@${ctx.from.username}` : `Yo'q`;
            const firstName = ctx.from.first_name || "Mavjud Emas";
            const userId = ctx.from.id;
            
            try {
                if (isValidAdminId) {
                    await bot.telegram.sendMessage(
                        adminId, 
                        `🔔 <b>Yangi foydalanuvchi kirdi!</b>\n👤 <b>Ism:</b> <a href="tg://user?id=${userId}">${firstName}</a>\n🔗 <b>Username:</b> ${userName}\n🆔 #id${userId}`, 
                        { parse_mode: 'HTML' }
                    );
                }
            } catch(e) {
                console.error("Admin notify error:", e.message);
            }
            
            ctx.reply(
                `👋 Salom, <b><a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}</a></b>!\n\nMenga xohlagan narsangizni yuboring, adminga yetkaziladi.`,
                { parse_mode: 'HTML', disable_web_page_preview: true }
            );
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
                } catch(e) {
                    await ctx.reply("🚫 Xato: bot bloklangan bo'lishi mumkin.");
                }
                return;
            }
        }

        if (isFromAdmin) return next();

        // User message logic
        const userId = ctx.from.id;
        const now = Date.now();
        if (lastMessageMap.has(userId) && (now - lastMessageMap.get(userId) < 3000)) {
            return ctx.reply("⏳ Biroz kutib turing...");
        }
        lastMessageMap.set(userId, now);

        const userName = ctx.from.username ? `@${ctx.from.username}` : `Yo'q`;
        const header = `👤 <b>Mijoz:</b> <a href="tg://user?id=${userId}">${ctx.from.first_name}</a>\n🔗 <b>Username:</b> ${userName}\n🆔 #id${userId}\n\n`;

        try {
            if (ctx.message.text) {
                await bot.telegram.sendMessage(adminId, header + `📝 <b>Xabar:</b>\n` + ctx.message.text, { parse_mode: 'HTML' });
            } else {
                await ctx.copyMessage(adminId, { caption: header + (ctx.message.caption || ''), parse_mode: 'HTML' });
            }
            await ctx.reply("✅ Yuborildi!");
        } catch (err) {
            console.error("Forwarding error:", err.message);
        }
    });

    bot.catch((err) => console.error("Telegraf Error:", err));

    bot.launch()
        .then(() => console.log("🚀 BOT: Bot is online and polling!"))
        .catch(err => console.error("🚀 BOT: Launch failed!", err));

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

} else {
    console.error("🛑 BOT: Bot could not be started due to configuration issues.");
}
