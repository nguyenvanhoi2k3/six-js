# 🪐 Six-JS Project Monorepo

Dự án này bao gồm hai thành phần chính:
1. `six-js/` : Mã nguồn lõi của thư viện Web Components (Sử dụng TypeScript + Rollup/Vite).
2. `six-js-docs/` : Trang tài liệu hướng dẫn và bãi thử nghiệm playground (Sử dụng Docusaurus + Rspack).

---

## 🛠️ Quy trình Phát triển Local (Development)

Khi chỉnh sửa code và test local, mở 2 cửa sổ Terminal song song:

### 1. Phía Thư viện (`six-js`)
Cập nhật code core và xuất bản ra thư mục `dist`:
```bash
cd six-js
npm run build
```

### 2. Phía Tài liệu (six-js-docs)
Khởi động server tài liệu và bài test HTML độc lập:
```bash
cd six-js-docs
npm run start
```

### 3. Hướng dẫn Build & Phát hành lên NPM (Publish)

Khi thư viện đã hoàn thiện và bạn muốn đẩy lên chợ ứng dụng npm để mọi người có thể cài đặt qua lệnh npm i six-js, hãy làm theo các bước sau:

Bước 1: Đăng nhập tài khoản NPM trên máy tính
Nếu là lần đầu tiên, bạn cần kết nối Terminal với tài khoản npm của mình:
```bash
npm login
```

Bước 2: Build sản phẩm cuối cùng
Di chuyển vào thư mục thư viện và chạy build để đảm bảo file dist là bản mới nhất:
```bash
cd six-js
npm run build
```

Bước 3: Tăng số Version của thư viện
Trước mỗi lần push lên npm, bạn bắt buộc phải tăng số phiên bản trong file package.json lên (Ví dụ từ 0.0.1 lên 0.0.2). Bạn có thể sửa tay hoặc dùng lệnh tự động:
```bash
# Tăng số phiên bản nhỏ (Patch) - Ví dụ: 0.0.1 -> 0.0.2
npm version patch
```

Bước 4: Đẩy chính thức lên chợ NPM
Chạy lệnh xuất bản (mặc định cấu hình trong package.json sẽ chỉ đẩy thư mục dist và các file cần thiết):
```bash
npm publish
```
