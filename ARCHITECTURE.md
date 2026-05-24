# ZIYOKOR NONLARI — Real Marketplace Architecture

## 1. UMUMIY ARXITEKTURA

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (SPA)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ Customer │  │  Seller  │  │ Delivery │  │ Admin  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
│       └──────────────┼──────────────┼────────────┘       │
│                      ▼              ▼                     │
│              ┌─────────────────────────┐                 │
│              │    API Client (fetch)    │                 │
│              │   + WebSocket (socket)   │                 │
│              │   + P2P (Gun.js relay)  │                 │
│              └────────────┬────────────┘                 │
└───────────────────────────┼─────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────┐
│                    Backend (NestJS)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │   Auth   │  │  Order   │  │ Payment  │  │  Chat  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ Product  │  │ Delivery │  │  Admin   │  │  Push  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│                         │                                │
│  ┌──────────────────────┼────────────────────────────┐  │
│  │         Database Layer                             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │  │
│  │  │PostgreSQL│  │  Redis   │  │ MinIO S3 │         │  │
│  │  └──────────┘  └──────────┘  └──────────┘         │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

## 2. ROLLAR VA ULARNING IMKONIYATLARI

### 🛒 Xaridor (Customer)
- Telefon orqali ro'yxatdan o'tish (SMS OTP)
- Nonlarni kategoriya bo'yicha ko'rish, qidirish
- Nonvoyxonalar bo'yicha filter (masofa, reyting, narx)
- Savatga qo'shish, miqdor o'zgartirish
- Buyurtma berish (manzil, vaqt, to'lov usuli)
- **To'lov tizimlari**: Naqd, Click, Payme, Uzum, Kartadan kartaga
- Buyurtmani real-time kuzatish (GPS xarita)
- Yetkazuvchi bilan chat
- Nonvoy bilan chat
- Reyting va izoh qoldirish
- Sevimlilar (favorites)
- Buyurtmalar tarixi
- Aksiyalar va chegirmalar
- Push bildirishnomalar
- Manzillar kitobi (bir nechta manzil saqlash)
- Til tanlash (O'zbek, Русский, English)

### 🏪 Nonvoy / Sotuvchi (Seller)
- O'z nonvoyxonasini boshqarish
- Mahsulotlarni CRUD (nom, narx, rasm, kategoriya, tavsif)
- Nonvoyxona ma'lumotlari (nomi, manzil, GPS, ish vaqti, telefon)
- Buyurtmalarni qabul qilish / rad etish
- Buyurtma holatini o'zgartirish (qabul → pishirish → tayyor)
- Yetkazuvchini tayinlash
- Daromad statistikasi (kunlik, haftalik, oylik)
- Mahsulotlarni vaqtincha o'chirish (out of stock)
- Xaridor bilan chat
- Yetkazuvchi bilan chat
- Reyting va izohlarni ko'rish
- Ombor/qoldiq boshqaruvi
- Maximum buyurtma masofasi

### 🚚 Yetkazib beruvchi (Delivery)
- Ro'yxatdan o'tish (transport turi, hujjatlar)
- Mavjud buyurtmalarni ko'rish va olish
- GPS joylashuvni real-time yuborish
- Yo'nalish optimizatsiyasi
- Buyurtmani "yetkazildi" deb belgilash
- Xaridor bilan chat
- Nonvoy bilan chat
- Kunlik daromad va statistikasi
- Reyting va izohlar
- Ish grafigi (online/offline)

### ⚙️ Administrator (Admin)
- Barcha foydalanuvchilarni boshqarish
- Nonvoyxonalarni tasdiqlash / bloklash
- Yetkazuvchilarni tasdiqlash / bloklash
- Buyurtmalarni monitiring qilish
- Daromad va platforma statistikasi
- Dashboard (grafiklar, diagrammalar)
- Push bildirishnomalarni boshqarish
- Aksiyalar va promo-kodlar yaratish
- Qo'llab-quvvatlash xizmati (ticketlar)
- Sozlamalar (komissiya, minimal buyurtma)

## 3. MA'LUMOTLAR BAZASI (PostgreSQL)

### Asosiy jadvallar
```
users (id, phone, name, role, avatar, status, created_at)
  ├── customers (id, user_id, bonus_balance, total_orders)
  ├── sellers (id, user_id, bakery_name, address, lat, lng, 
  │           open_time, close_time, status, rating, is_verified)
  │   └── products (id, seller_id, name, desc, price, category, 
  │                images[], stock, is_active, created_at)
  └── drivers (id, user_id, vehicle_type, license_number, 
               is_available, rating, total_deliveries)

orders (id, customer_id, seller_id, driver_id, status, 
        items[], total, delivery_fee, address, lat, lng,
        payment_method, payment_status, created_at, 
        scheduled_time, delivered_at)

payments (id, order_id, user_id, amount, method, status, 
          transaction_id, created_at)

reviews (id, order_id, from_user_id, to_user_id, rating, comment)

chat_messages (id, room_id, sender_id, content, type, 
               attachment_url, created_at)

notifications (id, user_id, title, body, data, is_read, created_at)

promocodes (id, code, discount_type, discount_value, 
            max_uses, used_count, expires_at)

user_addresses (id, user_id, label, address, lat, lng, is_default)
```

## 4. UI/UX DIZAYN KONSEPSIYASI

### Ranglar palitrasi
```
--bg: #0a0806            (chuqur qora)
--card: #1a1612          (kartochka foni)
--gold: #d4a574          (oltin - asosiy aksent)
--gold-light: #e8c9a6    (och oltin)
--accent: #e86a3a        (to'q sariq - CTA)
--green: #4caf50         (yetkazildi, muvaffaqiyat)
--blue: #42a5f5          (xaridor, link)
--purple: #ab47bc        (yetkazuvchi)
--red: #ff6b6b           (xatolik, bekor)
--text: #f0ece6          (asosiy matn)
```

### Ekranlar

#### 1. Login / Ro'yxatdan o'tish
- Telefon raqam kiritish
- SMS OTP tasdiqlash
- Rol tanlash (Customer/Seller/Driver)
- Profil yaratish

#### 2. Customer asosiy ekran
- **Home tab**: Kategoriyalar, tavsiya qilingan nonlar, bannerlar
- **Search tab**: Qidiruv + filtrlash
- **Cart tab**: Savat + buyurtma berish
- **Orders tab**: Buyurtmalar tarixi + jonli kuzatish
- **Profile tab**: Sozlamalar, manzillar, sevimlilar

#### 3. Seller dashboard
- **Overview**: Bugungi buyurtmalar, daromad, statistika
- **Products**: Mahsulotlar CRUD
- **Orders**: Jonli buyurtmalar boshqaruvi
- **Analytics**: Grafiklar, eng ko'p sotilgan nonlar
- **Settings**: Nonvoyxona sozlamalari

#### 4. Delivery ekran
- **Available**: Tayyor buyurtmalar
- **Active**: Mening yetkazishlarim
- **Map**: GPS xarita + yo'nalish
- **Stats**: Kunlik daromad, masofa
- **Profile**: Sozlamalar

#### 5. Admin panel
- **Dashboard**: Platforma statistikasi
- **Users**: Foydalanuvchilar boshqaruvi
- **Orders**: Barcha buyurtmalar
- **Promotions**: Aksiyalar, promo-kodlar
- **Settings**: Platforma sozlamalari

## 5. ALOQA MEXANIZMI

### Xaridor ↔ Nonvoy
- **Chat**: To'g'ridan-to'g'ri xabar yozish
- **Status**: Buyurtma holati avtomatik yangilanadi
- **Phone**: Telefon raqam ko'rinadi

### Xaridor ↔ Yetkazuvchi
- **Chat**: Buyurtma olgandan keyin chat ochiladi
- **GPS**: Yetkazuvchini real-time kuzatish
- **Call**: Telefon qilish (agar ruxsat berilgan bo'lsa)

### Nonvoy ↔ Yetkazuvchi
- **Chat**: Buyurtma bo'yicha kelishish
- **Notification**: "Buyurtma tayyor" bildirishnomasi

### Aloqa vositalari
1. **In-app Chat** — WebSocket + Gun.js P2P
2. **Push Notifications** — Firebase Cloud Messaging
3. **SMS** — Buyurtma holati uchun (Twilio/PlayMobile)
4. **In-app Calls** — WebRTC (kelajakda)

## 6. BUYURTMA LIFECYCLE

```
Xaridor → Buyurtma beradi
    │
    ▼
Nonvoy → Qabul qiladi / Rad etadi
    │
    ▼ (qabul qilindi)
Nonvoy → Tayyorlaydi
    │
    ▼ (tayyor)
Nonvoy → Yetkazuvchini tayinlaydi
    │
    ▼ (yetkazilmoqda)
Yetkazuvchi → Olib ketadi
    │
    ▼ (yetkazilmoqda)
Yetkazuvchi → Yetkazib beradi
    │
    ▼ (yetkazildi)
Xaridor → Reyting qoldiradi
```

## 7. QO'SHIMCHA FEATURES (Super App uchun)

### MVP (hozir)
- [x] Barcha 4 rol
- [x] P2P + API
- [x] GPS + xarita
- [x] Chat

### V2 (keyingi)
- [ ] SMS OTP autentifikatsiya
- [ ] To'lov tizimlari (Click, Payme)
- [ ] Push bildirishnomalar
- [ ] Reyting va izohlar
- [ ] Non rasmlari (upload)
- [ ] Sevimlilar
- [ ] Manzillar kitobi
- [ ] Buyurtma vaqtini rejalashtirish

### V3 (premium)
- [ ] Telegram bot integratsiyasi
- [ ] Admin Telegram panel
- [ ] Loyalty dasturi (bonus ballar)
- [ ] Multi-til (uz/ru/en)
- [ ] Dark/Light mode
- [ ] PWA (offline ishlash)
- [ ] Native Android app (Capacitor)
- [ ] Yetkazuvchi uchon yo'nalish optimizatsiyasi

### V4 (enterprise)
- [ ] AI asosida tavsiyalar
- [ ] Talab bo'yicha pishirish
- [ ] Obuna tizimi (har kuni non)
- [ ] Analytics dashboard
- [ ] Ochiq API (3rd party integratsiya)
- [ ] Sovg'a sertifikatlari
- [ ] Ko'p tilli to'lov shlyuzlari

## 8. TEXNOLOGIYALAR

| Frontend | Backend | Database | DevOps |
|----------|---------|----------|--------|
| HTML/CSS/JS | NestJS | PostgreSQL | Railway |
| Gun.js | Prisma ORM | Redis | Docker |
| Leaflet | WebSocket | MinIO S3 | GitHub Actions |
| Capacitor | JWT Auth | | Render |
| PWA | Firebase Admin | | |

## 9. DEPLOY STRUKTURASI

```
┌────────────────────────────────────────────────┐
│              Railway / Render                    │
│  ┌─────────────┐  ┌─────────────┐              │
│  │  P2P Server  │  │  API Server │              │
│  │  (Gun.js)   │  │  (NestJS)  │              │
│  │  :3456      │  │  :4000     │              │
│  └──────┬──────┘  └──────┬──────┘              │
│         └────────┬───────┘                      │
│                  ▼                               │
│  ┌─────────────────────────────┐                │
│  │      PostgreSQL + Redis     │                │
│  └─────────────────────────────┘                │
│  ┌─────────────────────────────┐                │
│  │      Static Files (SPA)     │                │
│  └─────────────────────────────┘                │
└────────────────────────────────────────────────┘
```

## 10. XAVFSIZLIK

- JWT token asosida auth
- Telefon OTP verifikatsiya
- HTTPS majburiy
- Rate limiting
- CORS cheklovlari
- SQL injection protection (Prisma ORM)
- XSS protection (input sanitization)
- RBAC (Role-based access control)
- Audit log
- Ma'lumotlarni shifrlash (at rest)
