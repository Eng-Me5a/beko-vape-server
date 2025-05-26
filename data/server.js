// server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // تحميل متغيرات البيئة من .env

const app = express();
const PORT = 5000;

// مفتاح JWT السري من ملف .env
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// مسار ملف الطلبات
const ordersFilePath = path.join(__dirname, "orders.json");

// دالة لقراءة الطلبات من ملف JSON
function readOrders() {
  try {
    const data = fs.readFileSync(ordersFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// دالة لحفظ الطلبات في ملف JSON
function saveOrders(orders) {
  fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
}

// 🛒 إضافة طلب جديد
app.post("/api/orders", (req, res) => {
  const orders = readOrders();
  const newOrder = req.body;
  newOrder.id = uuidv4();
  newOrder.status = "pending";
  orders.push(newOrder);
  saveOrders(orders);
  res.status(201).json({ message: "Order placed successfully", order: newOrder });
});

// 🔐 تسجيل دخول الأدمن
app.post("/api/admin-login", (req, res) => {
  const { username, password } = req.body;

  const ADMIN_USERNAME = "me5a";
  const ADMIN_PASSWORD = "246813579";

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // تأكد أن المفتاح السري موجود
    if (!JWT_SECRET) {
      return res.status(500).json({ message: "Server misconfigured: JWT_SECRET not set." });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } else {
    res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
  }
});

// ✏️ تحديث حالة الطلب
app.patch("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: "Missing status field" });

  const orders = readOrders();
  const index = orders.findIndex(order => order.id === id);
  if (index === -1) return res.status(404).json({ message: "Order not found" });

  orders[index].status = status;
  saveOrders(orders);
  res.json({ message: "Order status updated", order: orders[index] });
});

// 🗑️ حذف طلب
app.delete("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const orders = readOrders();
  const index = orders.findIndex(order => order.id === id);
  if (index === -1) return res.status(404).json({ message: "Order not found" });

  orders.splice(index, 1);
  saveOrders(orders);
  res.json({ message: "Order deleted successfully" });
});

// 📄 جلب كل الطلبات
app.get("/api/orders", (req, res) => {
  const orders = readOrders();
  res.json(orders);
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
