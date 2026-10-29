const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Đổi PORT từ 5000 sang 5001
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// API kiểm tra trạng thái hệ thống
app.get("/health", (req, res) => {
    const connected = mongoose.connection.readyState === 1;

    res.status(connected ? 200 : 503).json({
        status: connected ? "OK" : "ERROR",
        database: connected ? "Connected" : "Disconnected",
        message: connected
            ? "Backend và MongoDB hoạt động bình thường"
            : "MongoDB chưa kết nối"
    });
});

// API trang chủ
app.get("/", (req, res) => {
    res.json({
        message: "API quản lý món ăn đang hoạt động",
        port: PORT,
        endpoints: [
            "/health",
            "/api/foods"
        ]
    });
});

// API lấy danh sách món ăn
app.get("/api/foods", async (req, res) => {
    try {
        const foods = await mongoose.connection.db
            .collection("foods")
            .find({})
            .toArray();

        res.status(200).json(foods);
    } catch (error) {
        console.error("Lỗi lấy món ăn:", error.message);

        res.status(500).json({
            message: "Không thể lấy danh sách món ăn"
        });
    }
});

// Xử lý đường dẫn không tồn tại
app.use((req, res) => {
    res.status(404).json({
        message: "API không tồn tại"
    });
});

// Kết nối MongoDB và khởi động server
async function startServer() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("Chưa cấu hình MONGO_URI trong file .env");
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("=================================");
        console.log("Kết nối MongoDB thành công!");
        console.log("Database:", mongoose.connection.name);
        console.log("=================================");

        app.listen(PORT, () => {
            console.log(`Server chạy tại http://localhost:${PORT}`);
            console.log(`Health: http://localhost:${PORT}/health`);
            console.log(`Foods: http://localhost:${PORT}/api/foods`);
        });

    } catch (error) {
        console.error("Lỗi kết nối MongoDB:", error.message);
        process.exit(1);
    }
}

startServer();