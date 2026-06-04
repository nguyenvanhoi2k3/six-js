---
sidebar_position: 1
title: sx-animate
---

Thẻ `<sx-animate>` hỗ trợ tạo các hiệu ứng xuất hiện nhanh cho phần tử con mà không làm giảm điểm Core Web Vitals.

👉 **[DEMO](/sx-animate-demo)**

---

### Usage

```html
<sx-animate>
  <div>Nội dung của bạn ở đây</div>
</sx-animate>
```

|Attribute|Type|Values|Default|Description|
|---|---|---|---|---|
|type|string|fade-up \| fade-down \| fade-left \| fade-right|fade-up|Kiểu animate
|duration|number|600|
|delay|number|0|
