---
sidebar_position: 2
title: sx-marquee
---

Thẻ `<sx-marquee>` hỗ trợ tạo hiệu ứng chữ hoặc nội dung chạy liên tục (vô tận) mượt mà.

👉 **[DEMO](/sx-marquee-demo)**

---

## Usage

```html
<sx-marquee>
  <sx-marquee-inner>
    <sx-marquee-item>
      <span>🔥 Tin tức mới nhất: Hot sale tháng 11!</span>
    </sx-marquee-item>
  </sx-marquee-inner>
</sx-marquee>

```

|Attribute|Type|Values|Default|Description|
|---|---|---|---|---|
|direction|string|left \| right|left|Hướng di chuyển|
|speed|number|>= 0|50|Tốc độ chạy|
|pause-on-hover|boolean|true \| false|true|Dừng khi hover|
|gap|number \| string|Ví dụ: 20(=20px), 1rem|16|Khoảng cách giữa các item|
|clone|boolean|true \| false|true|Tự động nhân bản item|
