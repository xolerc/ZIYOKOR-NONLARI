from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timedelta
import sqlite3
import hashlib
import hmac
import math
import asyncio
from concurrent.futures import ProcessPoolExecutor

app = FastAPI(title="Ziyokor Nonlari API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

executor = ProcessPoolExecutor(max_workers=2)

DB_PATH = "ziyokor.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            phone TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'CUSTOMER',
            avatar TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS seller_profiles (
            id TEXT PRIMARY KEY,
            user_id TEXT UNIQUE NOT NULL REFERENCES users(id),
            bakery_name TEXT NOT NULL,
            address TEXT,
            lat REAL,
            lng REAL,
            rating REAL DEFAULT 0,
            status TEXT DEFAULT 'open',
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            seller_id TEXT NOT NULL REFERENCES seller_profiles(id),
            name TEXT NOT NULL,
            description TEXT,
            price INTEGER NOT NULL,
            category TEXT,
            image_url TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            customer_id TEXT NOT NULL REFERENCES users(id),
            seller_id TEXT REFERENCES seller_profiles(id),
            driver_id TEXT REFERENCES users(id),
            status TEXT DEFAULT 'PENDING',
            total INTEGER NOT NULL,
            delivery_fee INTEGER DEFAULT 0,
            address TEXT NOT NULL,
            lat REAL,
            lng REAL,
            payment_method TEXT DEFAULT 'CASH',
            payment_status TEXT DEFAULT 'PENDING',
            created_at TEXT DEFAULT (datetime('now')),
            delivered_at TEXT
        );
        CREATE TABLE IF NOT EXISTS order_items (
            id TEXT PRIMARY KEY,
            order_id TEXT NOT NULL REFERENCES orders(id),
            product_id TEXT REFERENCES products(id),
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            quantity INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS reviews (
            id TEXT PRIMARY KEY,
            order_id TEXT UNIQUE NOT NULL REFERENCES orders(id),
            author_id TEXT NOT NULL REFERENCES users(id),
            target_id TEXT NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id),
            title TEXT NOT NULL,
            body TEXT,
            is_read INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        );
    """)
    conn.commit()
    conn.close()

init_db()

# ── Models ──────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: str; phone: str; name: str; role: str
    avatar: Optional[str] = None; is_active: bool = True

class ProductOut(BaseModel):
    id: str; name: str; price: int; description: Optional[str] = None
    category: Optional[str] = None; image_url: Optional[str] = None

class OrderOut(BaseModel):
    id: str; status: str; total: int; address: str; created_at: str

# ── Auth ────────────────────────────────────────────────────────────

def generate_id():
    import uuid
    return uuid.uuid4().hex[:24]

def make_token(user_id: str, role: str) -> str:
    payload = f"{user_id}:{role}:{datetime.utcnow().timestamp() + 86400 * 7}"
    sig = hmac.new(b"ziyokor-secret", payload.encode(), hashlib.sha256).hexdigest()[:16]
    return f"{payload}:{sig}"

def verify_token(token: str) -> Optional[dict]:
    try:
        parts = token.split(":")
        if len(parts) != 4: return None
        user_id, role, ts, sig = parts
        expected = hmac.new(b"ziyokor-secret", f"{user_id}:{role}:{ts}".encode(), hashlib.sha256).hexdigest()[:16]
        if sig != expected or float(ts) < datetime.utcnow().timestamp():
            return None
        return {"id": user_id, "role": role}
    except:
        return None

async def get_current_user(authorization: str = ""):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    payload = verify_token(authorization[7:])
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

# ── Auth Routes ─────────────────────────────────────────────────────

class SendOtpBody(BaseModel):
    phone: str

class VerifyOtpBody(BaseModel):
    phone: str
    code: str

class RegisterBody(BaseModel):
    phone: str
    name: str
    role: str = "CUSTOMER"
    bakery_name: Optional[str] = None

@app.post("/api/auth/send-otp")
async def send_otp(body: SendOtpBody):
    return {"success": True, "message": "SMS yuborildi", "code": "1234"}

@app.post("/api/auth/verify-otp")
async def verify_otp(body: VerifyOtpBody):
    if body.code != "1234":
        raise HTTPException(status_code=401, detail="Noto'g'ri kod")
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE phone = ?", (body.phone,)).fetchone()
    conn.close()
    if not user:
        return {"token": "", "exists": False}
    token = make_token(user["id"], user["role"])
    return {"token": token, "user": dict(user), "exists": True}

@app.post("/api/auth/register")
async def register(body: RegisterBody):
    conn = get_db()
    existing = conn.execute("SELECT id FROM users WHERE phone = ?", (body.phone,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Bu raqam avval ro'yxatdan o'tgan")
    uid = generate_id()
    conn.execute("INSERT INTO users (id, phone, name, role) VALUES (?, ?, ?, ?)",
                 (uid, body.phone, body.name, body.role))
    if body.role == "SELLER":
        sid = generate_id()
        conn.execute("INSERT INTO seller_profiles (id, user_id, bakery_name) VALUES (?, ?, ?)",
                     (sid, uid, body.bakery_name or body.name))
    conn.commit()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (uid,)).fetchone()
    conn.close()
    token = make_token(uid, body.role)
    return {"token": token, "user": dict(user)}

@app.get("/api/auth/me")
async def me(user: dict = Depends(get_current_user)):
    conn = get_db()
    u = conn.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
    conn.close()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return dict(u)

# ── Bakery Routes ───────────────────────────────────────────────────

@app.get("/api/bakeries")
async def get_bakeries():
    conn = get_db()
    rows = conn.execute("""
        SELECT s.*, u.name as owner_name, u.phone as owner_phone
        FROM seller_profiles s JOIN users u ON s.user_id = u.id
        WHERE u.is_active = 1
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/bakeries/nearby")
async def nearby_bakeries(lat: float, lng: float, radius: float = 10):
    conn = get_db()
    rows = conn.execute("""
        SELECT s.*, u.name as owner_name, u.phone as owner_phone
        FROM seller_profiles s JOIN users u ON s.user_id = u.id
        WHERE u.is_active = 1 AND s.lat IS NOT NULL AND s.lng IS NOT NULL
    """).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = haversine_calc(lat, lng, r["lat"], r["lng"])
        if d <= radius * 1000:
            item = dict(r)
            item["distance"] = d
            result.append(item)
    result.sort(key=lambda x: x["distance"])
    return result

@app.get("/api/bakeries/{bakery_id}")
async def get_bakery(bakery_id: str):
    conn = get_db()
    row = conn.execute("""
        SELECT s.*, u.name as owner_name, u.phone as owner_phone
        FROM seller_profiles s JOIN users u ON s.user_id = u.id
        WHERE s.id = ?
    """, (bakery_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Bakery not found")
    products = conn.execute("SELECT * FROM products WHERE seller_id = ? AND is_active = 1",
                            (bakery_id,)).fetchall()
    conn.close()
    return {**dict(row), "products": [dict(p) for p in products]}

# ── Product Routes ──────────────────────────────────────────────────

@app.get("/api/products/bakery/{bakery_id}")
async def get_products(bakery_id: str):
    conn = get_db()
    rows = conn.execute("SELECT * FROM products WHERE seller_id = ? AND is_active = 1",
                        (bakery_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ── Order Routes ────────────────────────────────────────────────────

class OrderItemBody(BaseModel):
    name: str; price: int; quantity: int = 1

class CreateOrderBody(BaseModel):
    seller_id: str
    items: List[OrderItemBody]
    total: int
    address: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    payment_method: str = "CASH"

@app.post("/api/orders")
async def create_order(body: CreateOrderBody, user: dict = Depends(get_current_user)):
    conn = get_db()
    oid = generate_id()
    conn.execute("""
        INSERT INTO orders (id, customer_id, seller_id, total, address, lat, lng, payment_method, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
    """, (oid, user["id"], body.seller_id, body.total, body.address, body.lat, body.lng, body.payment_method))
    for item in body.items:
        iid = generate_id()
        conn.execute("INSERT INTO order_items (id, order_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)",
                     (iid, oid, item.name, item.price, item.quantity))
    conn.commit()
    order = conn.execute("SELECT * FROM orders WHERE id = ?", (oid,)).fetchone()
    items = conn.execute("SELECT * FROM order_items WHERE order_id = ?", (oid,)).fetchall()
    conn.close()
    return {**dict(order), "items": [dict(i) for i in items]}

@app.get("/api/orders")
async def get_orders(status: Optional[str] = None, user: dict = Depends(get_current_user)):
    conn = get_db()
    query = "SELECT * FROM orders WHERE customer_id = ?"
    params = [user["id"]]
    if status:
        query += " AND status = ?"
        params.append(status)
    query += " ORDER BY created_at DESC"
    rows = conn.execute(query, params).fetchall()
    result = []
    for r in rows:
        items = conn.execute("SELECT * FROM order_items WHERE order_id = ?", (r["id"],)).fetchall()
        result.append({**dict(r), "items": [dict(i) for i in items]})
    conn.close()
    return result

# ── Admin Routes ────────────────────────────────────────────────────

@app.get("/api/admin/dashboard")
async def admin_dashboard(user: dict = Depends(get_current_user)):
    if user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin only")
    conn = get_db()
    users_count = conn.execute("SELECT COUNT(*) as c FROM users").fetchone()["c"]
    bakeries = conn.execute("SELECT COUNT(*) as c FROM seller_profiles").fetchone()["c"]
    orders = conn.execute("SELECT COUNT(*) as c FROM orders").fetchone()["c"]
    revenue_row = conn.execute("SELECT COALESCE(SUM(total), 0) as c FROM orders WHERE status = 'DELIVERED'").fetchone()
    conn.close()
    return {"users": users_count, "bakeries": bakeries, "orders": orders, "revenue": revenue_row["c"]}

# ── Heavy Task Route (ProcessPool) ──────────────────────────────────

class RouteOptimizeBody(BaseModel):
    driver_lat: float; driver_lng: float
    bakery_lat: float; bakery_lng: float
    customer_lat: float; customer_lng: float

@app.post("/api/optimize/route")
async def optimize_route(body: RouteOptimizeBody):
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(executor, _compute_route, body)
    return result

def _compute_route(body: RouteOptimizeBody):
    d_db = haversine_calc(body.driver_lat, body.driver_lng, body.bakery_lat, body.bakery_lng)
    d_bc = haversine_calc(body.bakery_lat, body.bakery_lng, body.customer_lat, body.customer_lng)
    d_dc = haversine_calc(body.driver_lat, body.driver_lng, body.customer_lat, body.customer_lng)
    route1 = d_db + d_bc
    route2 = d_dc + d_bc
    return {
        "route": "bakery_first" if route1 <= route2 else "customer_first",
        "distance": min(route1, route2),
        "fee": calculate_delivery_fee(min(route1, route2)),
        "breakdown": {"driver_to_bakery": d_db, "bakery_to_customer": d_bc, "driver_to_customer": d_dc}
    }

# ── Helpers ─────────────────────────────────────────────────────────

def haversine_calc(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371000
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

def calculate_delivery_fee(distance_m: float) -> int:
    km = distance_m / 1000
    if km <= 1: return 5000
    if km <= 3: return 8000
    if km <= 5: return 12000
    if km <= 10: return 18000
    return 25000

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
