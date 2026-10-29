import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const initialForm = {
  foodId: "",
  name: "",
  category: "",
  cuisine: "",
  ingredients: "",
  price: "",
  quantity: "",
  description: "",
  imageUrl: "",
};

function App() {
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Lấy danh sách món ăn
  const fetchFoods = async (keyword = "") => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/foods?search=${encodeURIComponent(keyword)}`
      );

      if (!response.ok) {
        throw new Error("Không thể tải danh sách món ăn");
      }

      const data = await response.json();
      setFoods(data);
    } catch (error) {
      setMessage("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // Nhập dữ liệu
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Thêm hoặc cập nhật món ăn
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      foodId: form.foodId.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
      ingredients: form.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    if (
      !payload.foodId ||
      !payload.name ||
      !payload.category ||
      form.price === "" ||
      form.quantity === "" ||
      !Number.isFinite(payload.price) ||
      !Number.isInteger(payload.quantity) ||
      payload.price < 0 ||
      payload.quantity < 0
    ) {
      setMessage("Vui lòng nhập đầy đủ thông tin hợp lệ!");
      return;
    }

    try {
      const url = editingId
        ? `${API_URL}/api/foods/${editingId}`
        : `${API_URL}/api/foods`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Thao tác thất bại");
      }

      setMessage(
        editingId
          ? "Cập nhật món ăn thành công!"
          : "Thêm món ăn thành công!"
      );

      setForm(initialForm);
      setEditingId(null);
      setSelectedFood(null);

      await fetchFoods(search);
    } catch (error) {
      setMessage("Lỗi: " + error.message);
    }
  };

  // Xem chi tiết món ăn
  const handleDetail = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/foods/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể xem chi tiết");
      }

      setSelectedFood(data);
    } catch (error) {
      setMessage("Lỗi: " + error.message);
    }
  };

  // Chọn món ăn để sửa
  const handleEdit = (food) => {
    setEditingId(food._id);

    setForm({
      foodId: food.foodId || "",
      name: food.name || "",
      category: food.category || "",
      cuisine: food.cuisine || "",
      ingredients: (food.ingredients || []).join(", "),
      price: food.price ?? "",
      quantity: food.quantity ?? "",
      description: food.description || "",
      imageUrl: food.imageUrl || "",
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Xóa món ăn
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa món ăn này?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/foods/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Xóa thất bại");
      }

      setMessage("Xóa món ăn thành công!");

      if (selectedFood?._id === id) {
        setSelectedFood(null);
      }

      if (editingId === id) {
        setEditingId(null);
        setForm(initialForm);
      }

      await fetchFoods(search);
    } catch (error) {
      setMessage("Lỗi: " + error.message);
    }
  };

  // Hủy sửa
  const handleCancel = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <h1>🍜 HỆ THỐNG QUẢN LÝ MÓN ĂN</h1>
        <p>Đề thi thực hành Điện toán đám mây</p>
        <p>Sinh viên: Võ Duy Anh | MSSV: 236684</p>
      </header>

      <main className="container">
        {/* FORM THÊM / SỬA */}
        <section className="card">
          <h2>
            {editingId ? "✏️ CẬP NHẬT MÓN ĂN" : "➕ THÊM MÓN ĂN"}
          </h2>

          <form onSubmit={handleSubmit} className="food-form">
            <div className="form-group">
              <label>Mã món ăn *</label>
              <input
                name="foodId"
                placeholder="VD: F001"
                value={form.foodId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Tên món ăn *</label>
              <input
                name="name"
                placeholder="VD: Phở bò"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Loại món ăn *</label>
              <input
                name="category"
                placeholder="VD: Món nước"
                value={form.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Ẩm thực / Vùng miền</label>
              <input
                name="cuisine"
                placeholder="VD: Việt Nam"
                value={form.cuisine}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Nguyên liệu</label>
              <input
                name="ingredients"
                placeholder="Thịt bò, bánh phở, hành"
                value={form.ingredients}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Giá tiền (VNĐ) *</label>
              <input
                type="number"
                name="price"
                placeholder="45000"
                min="0"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Số lượng *</label>
              <input
                type="number"
                name="quantity"
                placeholder="30"
                min="0"
                step="1"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Đường dẫn hình ảnh</label>
              <input
                name="imageUrl"
                placeholder="https://..."
                value={form.imageUrl}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Mô tả món ăn</label>
              <textarea
                name="description"
                placeholder="Nhập mô tả món ăn..."
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? "💾 Lưu thay đổi" : "➕ Thêm món ăn"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Hủy sửa
                </button>
              )}
            </div>
          </form>
        </section>

        {/* DANH SÁCH MÓN ĂN */}
        <section className="card">
          <div className="section-title">
            <h2>📋 DANH SÁCH MÓN ĂN</h2>
            <span className="count">
              Tổng số: {foods.length} món
            </span>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Nhập tên, mã hoặc loại món ăn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchFoods(search);
                }
              }}
            />

            <button
              className="btn btn-primary"
              onClick={() => fetchFoods(search)}
            >
              Tìm kiếm
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearch("");
                fetchFoods("");
              }}
            >
              Làm mới
            </button>
          </div>

          {message && <div className="message">{message}</div>}

          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : foods.length === 0 ? (
            <div className="empty">
              <p>📭 Chưa có món ăn nào.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã món</th>
                    <th>Hình ảnh</th>
                    <th>Tên món ăn</th>
                    <th>Loại</th>
                    <th>Giá tiền</th>
                    <th>Số lượng</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {foods.map((food, index) => (
                    <tr key={food._id}>
                      <td>{index + 1}</td>
                      <td>{food.foodId}</td>

                      <td>
                        {food.imageUrl ? (
                          <img
                            src={food.imageUrl}
                            alt={food.name}
                            className="food-image"
                          />
                        ) : (
                          <span className="no-image">🍽️</span>
                        )}
                      </td>

                      <td className="food-name">{food.name}</td>
                      <td>{food.category}</td>

                      <td className="price">
                        {Number(food.price).toLocaleString("vi-VN")} đ
                      </td>

                      <td>{food.quantity}</td>

                      <td>
                        <div className="actions">
                          <button
                            className="btn btn-info"
                            onClick={() => handleDetail(food._id)}
                          >
                            Chi tiết
                          </button>

                          <button
                            className="btn btn-warning"
                            onClick={() => handleEdit(food)}
                          >
                            Sửa
                          </button>

                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(food._id)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* CHI TIẾT MÓN ĂN */}
        {selectedFood && (
          <section className="card detail-card">
            <h2>📖 CHI TIẾT MÓN ĂN</h2>

            {selectedFood.imageUrl && (
              <img
                src={selectedFood.imageUrl}
                alt={selectedFood.name}
                className="detail-image"
              />
            )}

            <div className="detail-info">
              <p><strong>Mã món ăn:</strong> {selectedFood.foodId}</p>
              <p><strong>Tên món ăn:</strong> {selectedFood.name}</p>
              <p><strong>Loại:</strong> {selectedFood.category}</p>
              <p><strong>Ẩm thực:</strong> {selectedFood.cuisine}</p>

              <p>
                <strong>Nguyên liệu:</strong>{" "}
                {(selectedFood.ingredients || []).join(", ")}
              </p>

              <p>
                <strong>Giá tiền:</strong>{" "}
                {Number(selectedFood.price).toLocaleString("vi-VN")} đ
              </p>

              <p><strong>Số lượng:</strong> {selectedFood.quantity}</p>
              <p><strong>Mô tả:</strong> {selectedFood.description}</p>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => setSelectedFood(null)}
            >
              Đóng chi tiết
            </button>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <p>
          © 2026 - Hệ thống quản lý món ăn | Võ Duy Anh - 236684
        </p>
      </footer>
    </div>
  );
}

export default App;