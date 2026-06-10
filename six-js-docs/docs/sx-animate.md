---
sidebar_position: 1
title: sx-animate
---

Thẻ `<sx-animate>` hỗ trợ tạo các hiệu ứng xuất hiện nhanh cho phần tử con mà không làm giảm điểm Core Web Vitals.

👉 **[DEMO](/sx-animate-demo)**

---

## Usage

```html
<sx-animate type="fade-up" group>
  <div>Nội dung của bạn ở đây</div>
</sx-animate>
```

|Attribute|Type|Values|Default|Description|
|---|---|---|---|---|
|type|string|fade \| fade-up \| fade-down \| fade-left \| fade-right|fade-up|Kiểu hiệu ứng|
|duration|number|>= 0|400|Thời lượng hiệu ứng|
|delay|number|>= 0|0|Thời gian chờ hiệu ứng chạy|
|strength|number|>= 0|30|Độ mạnh của hiệu ứng|
|easing|string|ease-in \| ease-out \| ease-in-out \| expo-in \| expo-out \| expo-in-out \| back-in \| back-out \| back-in-out \| linear|ease-in-out|Kiểu chuyển động|
|group|||false|Các thẻ sx-animate có attr group sẽ tự động chạy lần lượt|
