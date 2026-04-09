const { Telegraf, Markup } = require('telegraf');

/**
 * Cloudflare Workers Fetch Handler
 */
export default {
    async fetch(request, env, ctx) {
        // Faqat POST so'rovlarni (Telegram webhook) qayta ishlash
        if (request.method !== 'POST') {
            return new Response('🤖 Bot online! Webhook orqali ulaning.', { 
                status: 200,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        }

        const token = env.BOT_TOKEN;
        const adminId = env.ADMIN_CHAT_ID;

        if (!token || !adminId) {
            console.error("❌ XATO: BOT_TOKEN yoki ADMIN_CHAT_ID sozlanmagan!");
            return new Response('Configuration Error', { status: 500 });
        }

        const bot = new Telegraf(token);

        // --- BOT LOGIKASI ---

        bot.start(async (ctx) => {
            const isFromAdmin = ctx.chat.id.toString() === adminId;

            if (!isFromAdmin) {
                const userId = ctx.from.id;
                try {
                    const userName = ctx.from.username ? `@${ctx.from.username}` : `Yo'q`;
                    await bot.telegram.sendMessage(
                        adminId, 
                        `🔔 <b>Yangi foydalanuvchi!</b>\n👤 <b>Ism:</b> ${ctx.from.first_name}\n🔗 <b>Username:</b> ${userName}\n🆔 #id${userId}`, 
                        { parse_mode: 'HTML' }
                    );
                } catch(e) { console.error("Notify error:", e.message); }
                
                await ctx.reply(`👋 Salom! Xabaringizni yuboring, adminga yetkazaman.`);
            } else {
                await ctx.reply("👋 Salom Admin!", Markup.keyboard([['🔗 Taklif havolasi']]).resize());
            }
        });

        bot.hears('🔗 Taklif havolasi', async (ctx) => {
            if (ctx.chat.id.toString() !== adminId) return;
            // Bot username olish uchun api chaqiramiz
            const botInfo = await bot.telegram.getMe();
            await ctx.reply(`Bot havolasi: https://t.me/${botInfo.username}`);
        });

        bot.on('message', async (ctx, next) => {
            const isFromAdmin = ctx.chat.id.toString() === adminId;

            // Admindan javob qaytarish
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

            // Mijozdan Adminga yuborish
            const userId = ctx.from.id;
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

        // Telegramdan kelgan update-ni qayta ishlash
        try {
            const update = await request.json();
            await bot.handleUpdate(update);
            return new Response('OK', { status: 200 });
        } catch (err) {
            console.error("Update handling error:", err);
            return new Response('Update Error', { status: 200 }); // Telegram qayta yubormasligi uchun 200 qaytaramiz
        }
    }
};
