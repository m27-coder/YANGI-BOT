require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const token = process.env.BOT_TOKEN;
const adminId = process.env.ADMIN_CHAT_ID;

// Token tekshiruv
if (!token || token === 'Ushbu_joyga_bot_tokenni_yozing') {
    console.error("Xatolik: BOT_TOKEN ko'rsatilmagan! Iltimos, .env faylini to'g'rilang.");
    process.exit(1);
}

const bot = new Telegraf(token);

// Kichik anti-spam filtri uchun (xotirada)
const lastMessageMap = new Map();

// Boshlang'ich buyruq: /start yuborilganda
bot.start(async (ctx) => {
    const isFromAdmin = ctx.chat.id.toString() === adminId;

    if (!isFromAdmin) {
        // Yangi kirgan foydalanuvchi profilini adminga darhol yuborish
        const userName = ctx.from.username ? `@${ctx.from.username}` : `Yo'q`;
        const firstName = ctx.from.first_name || "Mavjud Emas";
        const userId = ctx.from.id;
        
        try {
            await bot.telegram.sendMessage(
                adminId, 
                `🔔 <b>Yangi foydalanuvchi kirdi!</b>\nBiror odam botingizga kirdi:\n👤 <b>Ism:</b> <a href="tg://user?id=${userId}">${firstName}</a>\n🔗 <b>Username:</b> ${userName}\n🆔 #id${userId}`, 
                { parse_mode: 'HTML' }
            );
        } catch(e) {
            console.error(e);
        }
        
        ctx.reply(
            `👋 Salom, <b><a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}</a></b>!\n\n` +
            `Bu yerda menga xohlagan narsangizni jo'nating: qiziq savollar, hazillar, dardingiz yoki g'iybat bo'lsa ham bo'laveradi!\n\n` +
            `👇 Matn, rasm, video, stiker yoki ovozli xabar yo'llang. Keling, gaplashamiz! 😄`,
            { 
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                reply_markup: { remove_keyboard: true } // Mijozda avvalgi tugmalar qolgan bo'lsa tozalaydi
            }
        );
    } else {
        // Agar bu Admin bo'lsa, unga maxsus Havola tugmasi ko'rsatiladi
        ctx.reply("👋 Assalomu alaykum, Admin!\nBot quloq qoqmasdan xizmatga tayyor. \n\nPastagi tugma yordamida botga jalb qiluvchi taklif havolasini osongina olasiz.", Markup.keyboard([
            ['🔗 Taklif havolasi']
        ]).resize());
    }
});

// Admin uchun: O'z kanaliga tarqatishi uchun taklif havolasini olish
bot.hears('🔗 Taklif havolasi', (ctx) => {
    // Agar buni adashib oddiy odam yozsa unga javob qaytmasligi uchun to'siq:
    if (ctx.chat.id.toString() !== adminId) return;
    
    // Bot ishga tushgach uning o'z username malumoti saqlanadi
    const botUser = ctx.botInfo.username;
    ctx.reply(
        `Mana botingizning taklif havolasi:\n\n👉 <b>https://t.me/${botUser}</b>\n\nUshbu xabarni nusxalab xohlagan kanalingizga, yoki do'stlaringiz guruhiga yuboring. Odamlar shu havolani bosa botga kirib kelishadi!`,
        { 
            parse_mode: 'HTML',
            disable_web_page_preview: true 
        }
    );
});


// --- ASOSIY XABARLARNI BOSHQARISH ---
bot.on('message', async (ctx, next) => {
    const isFromAdmin = ctx.chat.id.toString() === adminId;

    // 1) QISM: Agar chat adminniki bo'lsa va u suhbatga javob (reply) berayotgan bo'lsa
    if (isFromAdmin && ctx.message.reply_to_message) {
        const replyMsg = ctx.message.reply_to_message;
        const infoText = replyMsg.text || replyMsg.caption || '';
        const match = infoText.match(/#id(\d+)/);

        if (match) {
            const targetUserId = match[1];
            try {
                // Hech qanday reaksiyalarsiz faqat Admin yozgan xabarni yetkizamiz
                await bot.telegram.sendMessage(targetUserId, `💬 <b>DIQQAT! ADMINDAN JAVOB KELDI:</b>`, { parse_mode: 'HTML' });
                await ctx.telegram.copyMessage(targetUserId, ctx.chat.id, ctx.message.message_id);
                
                // Muvaffaqiyatli qabul qilinganligi haqida admin bildirishnomasi o'chirildi (jim ishlaydi)
            } catch(e) {
                console.error("Yuborishda xatolik:", e);
                await ctx.reply("🚫 Xatolik: foydalanuvchi botni bloklagan bo'lishi mumkin.");
            }
            return; // Javobni yakunlash
        }
    }

    // Agar admin shunchaki guruhda reply qilmasdan o'z-o'zidan yozgan bo'lsa:
    if (isFromAdmin) return next();

    // 2) QISM: Oddiy foydalanuvchi Adminga savol/xabar yuborsa
    const userId = ctx.from.id;
    const now = Date.now();

    // Spam-filtr: bir xabar kelgandan keyin navbatdagisi uchun 3 soniya tanaffus
    if (lastMessageMap.has(userId) && (now - lastMessageMap.get(userId) < 3000)) {
        return ctx.reply("⏳ Voooy, juda tezsiz! Iltimos, keyingi xabargacha 3 soniyagina tanaffus qiling.");
    }
    lastMessageMap.set(userId, now);

    const userName = ctx.from.username ? `@${ctx.from.username}` : `Yo'q`;
    const firstName = ctx.from.first_name || "Mavjud Emas";
    
    // Foydalanuvchi ma'lumotlari jamlangan shablon (Adminga ko'rsatiladigan sodda forma)
    const header = `👤 <b>Mijoz:</b> <a href="tg://user?id=${userId}">${firstName}</a>\n` +
                   `🔗 <b>Username:</b> ${userName}\n` +
                   `🆔 #id${userId}\n\n`;

    try {
        if (ctx.message.text) {
            // Matn bo'lsa, bitta qilib yuboriladi
            await bot.telegram.sendMessage(adminId, header + `📝 <b>Xabar:</b>\n` + ctx.message.text, { parse_mode: 'HTML' });
        } 
        else if (ctx.message.photo || ctx.message.video || ctx.message.document || ctx.message.audio || ctx.message.voice) {
            // Media (+ caption) bo'lsa
            const cap = ctx.message.caption || '';
            await ctx.copyMessage(adminId, {
                caption: header + (cap ? `📝 ${cap}` : ''),
                parse_mode: 'HTML'
            });
        } 
        else if (ctx.message.sticker || ctx.message.animation) {
            // Stiker/GIFlarda format buzilmasligi uchun oldin obyekti tashlab, ostiga kimdanligini yozamiz
            const mediaMsg = await ctx.copyMessage(adminId);
            await bot.telegram.sendMessage(adminId, header + `👆 (Yuqoridagi stiker egasi)`, { 
                parse_mode: 'HTML', 
                reply_to_message_id: mediaMsg.message_id 
            });
        } else {
            // Boshqa turdagi xabarlar (Location, Contact)
            const otherMsg = await ctx.copyMessage(adminId);
            await bot.telegram.sendMessage(adminId, header + `👆 (Yuqoridagi xabar egasi)`, { 
                parse_mode: 'HTML',
                reply_to_message_id: otherMsg.message_id
            });
        }

        // Tasdiqlash xabari: Qiziqarli Entertainment varianti
        const funnyReplies = [
            "✅ O'q kabi adminga uchib ketdi! Kuting...",
            "✅ Xabaringiz manzilga yetdi! Uyquda bo'lmasa javob qaytadi.",
            "✅ Vohha-ha, bu yetib bordi! Endi sabr bilan javob kutamiz 😌",
            "✅ Ajoyib! Xabaringiz eson-omon adminga yetkazildi. 🚀"
        ];
        const randomReply = funnyReplies[Math.floor(Math.random() * funnyReplies.length)];

        await ctx.reply(randomReply);

    } catch (err) {
        console.error(err);
        ctx.reply("🚫 Uzr, xabar yuborishda texnik xatolik yuz berdi. Balki limitdan oshib ketgandirmiz?");
    }
});

// Kutilmagan xatoliklarni ushlab qolish
bot.catch((err, ctx) => {
    console.error(`Xatolik yuz berdi: ${ctx.updateType}`, err);
});

bot.launch().then(() => {
    console.log("🚀 Qiziqarli Savol-Javob boti hamma yangiliklar bilan ishga tushdi!");
});

// Xavfsiz o'chirish jarayonlari
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
