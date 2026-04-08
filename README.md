# Telegram Sotuv/Manager Bot

Bu loyiha Node.js va Telegraf v4 yordamida yozilgan telegram sotuv bot bo'lib, o'z xizmatlaringizni (Telegram bot, Veb-sayt, SMM va boshqalar) taklif etish hamda mijozlardan navbatma-navbat savollar orqali buyurtma qabul qilishga yordam beradi.

## Ishga tushirish bo'yicha yo'riqnoma (README)

### 1-qadam: Kerakli dasturlarni o'rnating
Dastlab kompyuteringizda (yoki serveringizda) Node.js o'rnatilganligiga ishonch hosil qiling. Node.js nima ekanligini bilmasangiz [ushbu havoladan yuklab yozib oling](https://nodejs.org). Loyihani ishlatish uchun barcha kerakli kutubxonalar `package.json` ichida ko`rsatib o`tilgan.

Loyihaning ildiz papkasida (d:\YANGI BOT) komanda qatorini ochiq qilib, quyidagi komandani bering:

```bash
npm install
```
*(Bu barcha kerakli `telegraf` va `dotenv` modullarini yuklab beradi)*

### 2-qadam: Telegramdan Bot Tokeni olish
1. Telegramga kiring va **@BotFather** botni izlab toping.
2. `/newbot` komandasini yuborib o'z botingizga nom va username bering.
3. Bot yaratilgach sizga `HTTP API Token` beradi (masalan: `123456789:ABCDefghIJklmn...`).

### 3-qadam: Admin Chat ID qabul qilish
1. Botingizga yangi buyurtmalar qaysi akkauntga (sizning akkountingiz) kelishini saqlash uchun id kerak bo'ladi.
2. Telegramda **@userinfobot** yoki shunga o'xshash botini topib `/start` bosing, va u sizning shaxsiy Chat ID raqamingizni jo'natadi (masalan: `987654321`).

### 4-qadam: .env faylini sozlash
Barcha tokenlarni joyiga qo'yishimiz kerak.
1. `.env` degan fayl yarating (bu avtomatik qilib berilgan) va oching.
2. Quyidagilarni o'zgaruvchilaringizga moslab yozing:

```
BOT_TOKEN=123456789:Sizning_Bot_Tokeningiz_shu_yerda_bo'ladi
ADMIN_CHAT_ID=987654321
```

*(Eslatma: ID raqam va Token orasida probel yoki ortiqcha belgi qoldirmang)*

### 5-qadam: Dasturni ishga tushirish
Hamma narsani tayyorlagach, loyiha papkasida bo'lib terminal yoki CMD orqali quyidagi kodni ishlating:

```bash
npm start
```
yoki
```bash
node index.js
```

Terminallarda `🟢 Bot muvaffaqiyatli ishga tushdi va ulanmoqda...` degan yashil xabar chiqadi. Shundan so'ng Telegramga kirib yaratgan botingizda `/start` ni bosing va foydalaning!

---

### Bot Imkoniyatlari:
- **Asosiy menyu:** Xizmatlar, Narxlar, Buyurtma, Bog'lanish, Savollar.
- **Navbatdagi Savollar:** (Scene - sahna yordamida) Ism, Raqam, Xizmat turi kabi ma'lumotlarni suraydi.
- **Buyurtma xabari:** To'g'ridan to'g'ri .env faylida berilgan Admin ID manzilga yetib boradi.
- **Admin Statiska:** Botga admin tomonidan `/admin` xabar yuborilsa, hozirgi kunda qancha odam botga kirgani va jami nechta order/buyurtma tushganligini sanab boradi. (Kichik xotirada. Dastur restart bo'lsa statistikaga 0 bo'lib qoladi, kelajakda DB (baza) qo'shish tavsiya qilinadi).

Omad yor bo'lsin! Loyiha sizning biznesingizga rivoj olib kelsin!
