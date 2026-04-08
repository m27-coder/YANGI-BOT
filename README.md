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

## ☁️ Render.com orqali 24/7 Deploy qilish (Bepul)

Bu loyiha Render.com platformasida bepul ishlash uchun sozlangan.

1. Loyihani GitHub-ga yuklang (**Push**).
2. [Render.com](https://render.com) saytiga kiring va **New +** > **Web Service** ni tanlang.
3. GitHub omboringizni (YANGI-BOT) ulang.
4. Sozlamalarda quyidagilarni kiriting:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
5. **Environment Variables** bo'limida quyidagilarni qo'shing:
   - `BOT_TOKEN`: Sizning bot tokeningiz.
   - `ADMIN_CHAT_ID`: Sizning Telegram ID raqamingiz.
6. **Create Web Service** tugmasini bosing. Done! ✅

Omad yor bo'lsin! 🎭

