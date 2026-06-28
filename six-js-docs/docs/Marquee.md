---
sidebar_position: 2
title: Marquee
---
<br />
Hỗ trợ tạo hiệu ứng chữ hoặc nội dung chạy liên tục (vô tận) mượt mà.

👉 **[DEMO](/marquee)**

---
<br />
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
<br />
| Attribute      | Type             | Description                 | Default |
| -------------- | ---------------- | ---------------------- | ------- |
| direction      | string           | left \| right          | left    |
| speed          | number           |                    | 50      |
| pause-on-hover | boolean          |          | true    |
| gap            | number \| string | Ví dụ: `"20"`, `"1rem"` | 16      |
| clone          | boolean          | Quyết định xem có tự động duplicate để làm đầy marquee không|true|

<br />

👉 **[DEMO](/marquee)**

<br />