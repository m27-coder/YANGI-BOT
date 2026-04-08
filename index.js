require('dotenv').config(); // .env faylidan o'zgaruvchilarni yuklash
const { Telegraf, Scenes, session, Markup } = require('telegraf');

// .env faylidan token va admin chat id olish
const token = process.env.BOT_TOKEN;
const adminId = process.env.ADMIN_CHAT_ID;

// Token tekshiruvi
if (!token || token === 'Ushbu_joyga_bot_tokenni_yozing') {
    console.error("Xatolik: BOT_TOKEN ko'rsatilmagan! Iltimos, .env faylini to'g'rilang.");
    process.exit(1);
}

// Bot obyekti yaratish
const bot = new Telegraf(token);

// --- Admin Statistikasi Uchun ---
// (Bu o'zgaruvchilar vaqtinchalik xotirada saqlanadi. Dastur o'chib yonsa, uzilish bo'lsa nolga tushadi. 
// Doimiy saqlash uchun Ma'lumotlar bazasi (MongoDB/PostgreSQL) ulash kerak)
let totalUsers = new Set();
let totalOrders = 0;

// Botga har bir xabar kelganda foydalanuvchini ro'yxatga oluvchi middleware
bot.use((ctx, next) => {
    if (ctx.from) {
        totalUsers.add(ctx.from.id);
    }
    return next();
});

// --- Buyurtma Qabul Qilish Bosqichlari (Wizard Scene) ---
const orderWizard = new Scenes.WizardScene(
    'order-wizard',
    
    // 1-qadam: Ismni so'rash
    (ctx) => {
        ctx.wizard.state.order = {};
        
        // Agar Foydalanuvchi "Buyurtma berish" menyusida o'z xizmatini oldindan tanlab kirgan bo'lsa:
        if (ctx.wizard.state.serviceName) {
            ctx.wizard.state.order.service = ctx.wizard.state.serviceName;
        }
        
        ctx.reply("Siz bilan bog'lanishimiz uchun ismingizni kiriting:");
        return ctx.wizard.next();
    },
    
    // 2-qadam: Kontakt so'rash
    (ctx) => {
        if (!ctx.message || !ctx.message.text) return; // matn bo'lmasa qaytarish
        ctx.wizard.state.order.name = ctx.message.text;
        ctx.reply("Telefon raqamingizni yuboring (masalan: +998901234567):");
        return ctx.wizard.next();
    },
    
    // 3-qadam: Xizmat turini so'rash (agar tanlanmagan bo'lsa)
    (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        ctx.wizard.state.order.phone = ctx.message.text;
        
        // Agar xizmat nomi oldindan tanlanmagan bo'lsa ro'yxatni ko'rsatamiz
        if (!ctx.wizard.state.order.service) {
            ctx.reply("Sizga qaysi xizmatimiz kerak?", 
                Markup.keyboard(['Telegram bot', 'Veb-sayt', 'SMM']).oneTime().resize()
            );
            return ctx.wizard.next();
        } else {
            // Agar oldindan narxlar orqali xizmat tanlangan bo'lsa, to'g'ridan-to'g'ri izohga o'tamiz
            ctx.reply("Qo'shimcha izoh yoki talablaringiz bormi?");
            return ctx.wizard.selectStep(4); // 4-indeksdagi funksiyaga sakrash (keyingi funksiyani tashlab o'tish)
        }
    },
    
    // 4-qadam: Xizmat tanlandi, endi Qo'shimcha Izoh so'rash
    (ctx) => {
        if (ctx.message && ctx.message.text) {
            ctx.wizard.state.order.service = ctx.message.text;
        }
        ctx.reply("Qo'shimcha izoh yoki talablaringiz bormi? (Yo'q bo'lsa 'yoq' deb yozishingiz mumkin):", Markup.removeKeyboard());
        return ctx.wizard.next();
    },
    
    // 5-qadam: Yakunlash va Adminga yuborish
    async (ctx) => {
        if (ctx.message && ctx.message.text) {
            ctx.wizard.state.order.comment = ctx.message.text;
        }
        
        totalOrders++; // Buyurtma sonini 1 taga oshiramiz
        
        // Adminga bildirishnoma xabari
        if (adminId && adminId !== 'Ushbu_joyga_admin_chat_id_yozing') {
            const username = ctx.from.username ? `@${ctx.from.username}` : 'Mavjud emas';
            const adminMsg = `🟢 *Yangi buyurtma qabul qilindi!*\n\n` +
                             `👤 *Ism:* ${ctx.wizard.state.order.name}\n` +
                             `📞 *Telefon:* ${ctx.wizard.state.order.phone}\n` +
                             `💼 *Xizmat:* ${ctx.wizard.state.order.service}\n` +
                             `💬 *Izoh:* ${ctx.wizard.state.order.comment}\n\n` +
                             `[TG User]: ${username} | Profil Linki: [Link](tg://user?id=${ctx.from.id})`;
                             
            // Admin id raqamiga yuboramiz. Xato bo'lsa console'da ko'rsatiladi
            bot.telegram.sendMessage(adminId, adminMsg, { parse_mode: 'Markdown' })
                .catch(err => console.log("Adminga xabar yuborishda xatolik yuz berdi. ADMIN_CHAT_ID to'g'riligini tekshiring."));
        }

        // Mijozga javob
        await ctx.reply("✅ Buyurtmangiz muvaffaqiyatli qabul qilindi! Tez orada mutaxassislarimiz siz bilan aloqaga chiqishadi.", 
            mainMenu // Yana asosiy menyuni ochiq qoldiramiz
        );
        return ctx.scene.leave(); // Sahnadan chiqish
    }
);

// Barcha sahnalarni ro'yxatdan o'tkazish
const stage = new Scenes.Stage([orderWizard]);

// Session o'chirilmasligi / Telegraf state saqlangishi uchun
bot.use(session());
bot.use(stage.middleware());

// --- Bot interfeysi: Tugmalar (Asosiy Menyu) ---
const mainMenu = Markup.keyboard([
    ['📋 Xizmatlarimiz', '💰 Narxlar'],
    ['🛒 Buyurtma berish', '📞 Bog\'lanish'],
    ['❔ Savollar']
]).resize(); // Tugmalar ekran o'chamiga moslashishi uchun

// /start komandasi
bot.start((ctx) => {
    ctx.reply(
        `Assalomu alaykum, *${ctx.from.first_name}*! Bizning xizmatlarimiz botiga xush kelibsiz.\n\nQuyidagi bosh menyu orqali kerakli bo'limni tanlashingiz mumkin:`, 
        {
            parse_mode: 'Markdown',
            ...mainMenu
        }
    );
});

// /admin komandasi
bot.command('admin', (ctx) => {
    // Faqat admin ishlata olishi uchun
    if (ctx.from.id.toString() !== adminId) {
        return ctx.reply("Sizda administrator huquqlari yo'q!");
    }
    
    const txt = `📊 *Botning joriy holati (Statistika):*\n\n` +
                `👥 *Mijozlar soni:* ${totalUsers.size} ta\n` +
                `🛒 *Jami buyurtmalar:* ${totalOrders} ta\n\n` +
                `_Izoh: Bot qayta ishga tushirilsa ushbu raqamlar yana noldan boshlanadi._`;
    ctx.reply(txt, { parse_mode: 'Markdown' });
});

// 1. "Xizmatlarimiz" tugmasi hodisasi
bot.hears('📋 Xizmatlarimiz', (ctx) => {
    const text = "Biz sizga quyidagi xizmatlarni taklif qilamiz.\nBatafsil ma'lumot olish uchun tugmalarni bosing:";
    
    // Xizmatlarning o'zining inline tugmalari
    const inlineKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🤖 Telegram bot yasash', 'info_bot')],
        [Markup.button.callback('🌐 Veb-sayt yasash', 'info_web')],
        [Markup.button.callback('📱 SMM xizmati', 'info_smm')]
    ]);
    
    ctx.reply(text, inlineKeyboard);
});

// "Xizmatlarimiz" ichidagi inline tugmalar javoblari
bot.action('info_bot', (ctx) => {
    ctx.answerCbQuery(); // Loading (soat belgisi) yo'qolishi uchun
    ctx.reply("🤖 *Telegram bot yasash*\n\nSizning biznesingiz uchun qulay va zamonaviy bot yasab beramiz. Turli botlarni yaratishimiz mumkin:\n- Do'kon / Dostavka botlari\n- Xizmat sotish botlari\n- Avto-javobger va sun'iy intellekt qo'shilgan botlar", { parse_mode: 'Markdown' });
});

bot.action('info_web', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply("🌐 *Veb-sayt yasash*\n\nZamonaviy veb-sayt yasab beramiz:\n- Vizitka va landing saytlar\n- Korporativ saytlar\n- Katta onlayn do'konlar (e-commerce)", { parse_mode: 'Markdown' });
});

bot.action('info_smm', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply("📱 *SMM xizmati*\n\nIjtimoiy tarmoqlarni sifatli va trendda boshqaramiz:\n- Instagram, Telegram sahifalar yuritamiz\n- Reals va postlar tayyorlaymiz\n- Target reklama yordamida haridorlar jalb qilamiz", { parse_mode: 'Markdown' });
});

// 2. "Narxlar" tugmasi hodisasi
bot.hears('💰 Narxlar', (ctx) => {
    const text = "💎 *Bizning xizmatlar narxi (Boshlang'ich):*\n\n" +
                 "🤖 Telegram bot yasash: *200 dollardan*\n" +
                 "🌐 Veb-sayt yasash: *300 dollardan*\n" +
                 "📱 SMM xizmati: *oyiga 150 dollar*\n\n" +
                 "Qaysi xizmatni buyurtma qilmoqchisiz?";
                 
    const inlineKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🛒 Buyurtma: Telegram Bot', 'order_bot')],
        [Markup.button.callback('🛒 Buyurtma: Veb-sayt', 'order_web')],
        [Markup.button.callback('🛒 Buyurtma: SMM', 'order_smm')]
    ]);
    
    ctx.reply(text, { parse_mode: 'Markdown', ...inlineKeyboard });
});

// "Narxlar" ichidagi "Buyurtma berish" tugmalari hodisasi
bot.action('order_bot', (ctx) => {
    ctx.answerCbQuery();
    ctx.scene.enter('order-wizard', { serviceName: 'Telegram bot' });
});
bot.action('order_web', (ctx) => {
    ctx.answerCbQuery();
    ctx.scene.enter('order-wizard', { serviceName: 'Veb-sayt' });
});
bot.action('order_smm', (ctx) => {
    ctx.answerCbQuery();
    ctx.scene.enter('order-wizard', { serviceName: 'SMM' });
});

// 3. "Buyurtma berish" tugmasi hodisasi (umumiy buyurtma)
bot.hears('🛒 Buyurtma berish', (ctx) => {
    ctx.scene.enter('order-wizard');
});

// 4. "Bog'lanish" tugmasi hodisasi
bot.hears("📞 Bog'lanish", (ctx) => {
    const text = `📞 *Biz bilan aloqa ma'lumotlari:*\n\n` +
                 `✈️ *Telegram administrator:* @username (O'rniga o'z yuzernimingiz yozing)\n` +
                 `📱 *Telefon raqam:* +998 90 123 45 67\n` +
                 `🕒 *Ish vaqtimiz:* Dushanba - Juma (09:00 — 18:00)\n`;
    ctx.reply(text, { parse_mode: 'Markdown' });
});

// 5. "Savollar" tugmasi hodisasi
bot.hears('❔ Savollar', (ctx) => {
    const text = `ℹ️ *Ko'p beriladigan savollar (FAQ):*\n\n` +
                 `*1. "Loyiha qancha vaqtda tayyor bo'ladi?"*\n` +
                 `— O'rtacha 3 kundan 14 kungacha ish olib boriladi. Bu topshiriqning murakkabligiga bog'liq.\n\n` +
                 `*2. "To'lov qanday usulda qabul qilinadi?"*\n` +
                 `— Buyurtma olinganda 50% miqdorda oldindan to'lov (avans) so'raladi. Qolgan qismi ish muvaffaqiyatli topshirilganidan keyin to'lanadi.\n\n` +
                 `*3. "Kafolat bormi?"*\n` +
                 `— Ha. Loyiha tugatilganidan so'ng 30 kun davomida kelib chiquvchi xatoliklarni bepul texnik qo'llab quvvatlash orqali tuzatib beramiz.\n`;
    ctx.reply(text, { parse_mode: 'Markdown' });
});

// Qolgan keraksiz matnlarni xendling qilish
bot.on('text', (ctx) => {
    // Faqat agar odam state/scenarioda bo'lmasa qisqa javob qaytarish
    const textIsCommand = ctx.message.text.startsWith('/');
    if (!textIsCommand) {
        ctx.reply("Iltimos, pastdagi menyu tugmalaridan foydalaning.", mainMenu);
    }
});

// Botni tarmoqqa ulash
bot.launch().then(() => {
    console.log("🟢 Bot muvaffaqiyatli ishga tushdi va ulanmoqda...");
}).catch((err) => {
    console.error("🔴 Bot ishga tushishida xatolik yuz berdi:", err);
});

// Dastur to'xtatilishini nazorat qilish
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
