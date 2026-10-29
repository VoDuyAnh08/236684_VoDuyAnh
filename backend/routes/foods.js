const express = require("express");
const mongoose = require("mongoose");
const Food = require("../models/Food");

const router = express.Router();

// Hàm xử lý lỗi
function handleError(res, error) {
    console.error(error.message);

    if (error.code === 11000) {
        return res.status(409).json({
            message: "Mã món ăn đã tồn tại"
        });
    }

    if (error.name === "ValidationError") {
        return res.status(400).json({
            message: error.message
        });
    }

    return res.status(500).json({
        message: "Lỗi máy chủ"
    });
}

// GET: Lấy danh sách và tìm kiếm món ăn
router.get("/", async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();

        const filter = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { foodId: { $regex: search, $options: "i" } },
                    { category: { $regex: search, $options: "i" } }
                ]
            }
            : {};

        const foods = await Food.find(filter);

        res.status(200).json(foods);
    } catch (error) {
        handleError(res, error);
    }
});

// GET: Xem chi tiết món ăn
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "ID không hợp lệ"
            });
        }

        const food = await Food.findById(id);

        if (!food) {
            return res.status(404).json({
                message: "Không tìm thấy món ăn"
            });
        }

        res.json(food);
    } catch (error) {
        handleError(res, error);
    }
});

// POST: Thêm món ăn
router.post("/", async (req, res) => {
    try {
        const food = new Food(req.body);

        await food.save();

        res.status(201).json({
            message: "Thêm món ăn thành công",
            food
        });
    } catch (error) {
        handleError(res, error);
    }
});

// PUT: Cập nhật món ăn
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "ID không hợp lệ"
            });
        }

        const allowedFields = [
            "foodId",
            "name",
            "category",
            "cuisine",
            "ingredients",
            "price",
            "quantity",
            "description",
            "imageUrl"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates[field] = req.body[field];
            }
        }

        const food = await Food.findByIdAndUpdate(
            id,
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!food) {
            return res.status(404).json({
                message: "Không tìm thấy món ăn"
            });
        }

        res.json({
            message: "Cập nhật món ăn thành công",
            food
        });
    } catch (error) {
        handleError(res, error);
    }
});

// DELETE: Xóa món ăn
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "ID không hợp lệ"
            });
        }

        const food = await Food.findByIdAndDelete(id);

        if (!food) {
            return res.status(404).json({
                message: "Không tìm thấy món ăn"
            });
        }

        res.json({
            message: "Xóa món ăn thành công"
        });
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router;