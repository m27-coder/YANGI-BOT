# 🎭 Entertainment Q&A Bot

Bu loyiha Node.js va Telegraf v4 yordamida yozilgan, ko'ngilochar Savol-Javob (Q&A) botidir. Foydalanuvchilar bot orqali adminga matn, rasm, video va boshqa turdagi xabarlarni yuborishlari mumkin. Admin esa bot orqali to'g'ridan-to'g'ri javob qaytara oladi.

## ✨ Bot Imkoniyatlari:

- **🚀 Tezkor Savol-Javob:** Foydalanuvchilar istalgan vaqtda savol yoki xabar yozishlari mumkin.
- **💬 Admin Direct Reply:** Admin kelgan xabarga "Reply" (Javob berish) qilish orqali bot nomidan foydalanuvchiga javob qaytaradi.
- **🔔 Foydalanuvchi Monitoringi:** Kimdir botga `/start` bossa, adminga darhol uning profil ma'lumotlari (Ismi, Username, Profil havolasi) boradi.
- **🔗 Admin Taklif Havolasi:** Admin botga kirganda maxsus "Taklif havolasi" tugmasini ko'radi va u orqali botni tarqatish uchun link oladi.
- **🖼 Media Qabul Qilish:** Bot matnli xabarlardan tashqari rasm, video, stiker, ovozli xabar va fayllarni ham qabul qiladi.
- **🛡 Anti-Spam:** Foydalanuvchilar ketma-ket (sekundiga bir necha marta) xabar yubora olmasliklari uchun 3 soniyalik cheklov o'rnatilgan.

---

## 🚀 Ishga tushirish (Local)

1. **Kutubxonalarni o'rnating:**
   ```bash
   npm install
   ```

2. **.env faylini sozlang:**
   `.env` faylida quyidagi o'zgaruvchilarni to'ldiring:
   ```
   BOT_TOKEN=Sizning_Bot_Tokeningiz
   ADMIN_CHAT_ID=Sizning_Telegram_ID
   ```

3. **Botni boshlang:**
   ```bash
   npm start
   ```

---

## ☁️ Railway.app orqali 24/7 Deploy qilish

Bu loyiha Railway.app serverida doimiy ishlash uchun `railway.toml` va `nixpacks.toml` fayllari bilan tayyorlab qo'yilgan.

1. Loyihani GitHub-ga yuklang (**Push**).
2. Railway.app-da yangi loyiha yarating va GitHub omboringizni ulang.
3. Railway **Variables** bo'limida `BOT_TOKEN` va `ADMIN_CHAT_ID` qiymatlarini qo'shing.
4. Railway avtomatik ravishda botni ishga tushiradi!

Omad yor bo'lsin! 🎭

