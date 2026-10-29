const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const foodRoutes = require("./routes/foods");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Trang chủ API
app.get("/", (req, res) => {
    res.json({
        message: "Hệ thống quản lý món ăn",
        status: "Running"
    });
});

// Kiểm tra trạng thái Backend
app.get("/health", (req, res) => {
    const connected = mongoose.connection.readyState === 1;

    res.status(connected ? 200 : 503).json({
        status: connected ? "OK" : "ERROR",
        database: connected ? "Connected" : "Disconnected"
    });
});

// API quản lý món ăn
app.use("/api/foods", foodRoutes);

// API không tồn tại
app.use((req, res) => {
    res.status(404).json({
        message: "API không tồn tại"
    });
});

// Kết nối MongoDB
async function startServer() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("Thiếu MONGO_URI trong file .env");
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("================================");
        console.log("Kết nối MongoDB thành công!");
        console.log("Database:", mongoose.connection.name);
        console.log("================================");

        app.listen(PORT, () => {
            console.log(`Server chạy tại http://localhost:${PORT}`);
            console.log(`API Foods: http://localhost:${PORT}/api/foods`);
        });

    } catch (error) {
        console.error("Lỗi kết nối MongoDB:", error.message);
        process.exit(1);
    }
}

startServer();