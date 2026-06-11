---
sidebar_position: 1
title: Animate
---
<br />
Hỗ trợ tạo các hiệu ứng xuất hiện mượt mà khi phần tử đi vào viewport.

👉 **[DEMO](/sx-animate-demo)**

---
<br />

## Usage

```html
<sx-animate type="fade-up" group>
  <div>Nội dung của bạn ở đây</div>
</sx-animate>
```
<br />
|Attribute|Type|Description|Default|
|---|---|---|---|
|type|string|fade \| fade-up \| fade-down \| fade-left \| fade-right|fade-up|
|duration|number||400|
|delay|number||0|
|strength|number|Độ mạnh của hiệu ứng|30|
|easing|string|ease-in \| ease-out \| ease-in-out \| expo-in \| expo-out \| expo-in-out \| back-in \| back-out \| back-in-out \| linear|ease-in-out|
|group|boolean|Khi true các thẻ sẽ chạy theo thứ tự|false|
