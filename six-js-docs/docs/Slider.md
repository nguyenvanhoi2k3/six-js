---
sidebar_position: 3
title: Slider
---

<br />
Hỗ trợ tạo trình chiếu nội dung (carousel/slider), cho phép người dùng vuốt hoặc điều hướng giữa nhiều slide tương tự.

👉 **[DEMO](/sx-marquee-demo)**

---

<br />
## Usage

```html
  <sx-slider
    name="slider-1"
    per-view="1"
    gap="10"
    speed="400"
    breakpoints="{
      360: {
        per-view: 2,
        gap: 20
      },
      768: {
        per-view: 3,
        gap: 30
      },
      1080: {
        per-view: 4,
        gap: 40
      }
    }"
  >
    <sx-slider-track>
      <sx-slider-slide>
        <div class="slide">Slide 1</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide">Slide 2</div>
      </sx-slider-slide>
      <sx-slider-slide>
        <div class="slide">Slide 3</div>
      </sx-slider-slide>
    </sx-slider-track>
    <sx-slider-prev>Prev</sx-slider-prev>
    <sx-slider-next>Next</sx-slider-next>
    <sx-slider-pagination>
      <!-- các thẻ dot (tượng trưng cho từng slide) sẽ được render,
       dot được active sẽ có attr riêng để tự do css -->
    </sx-slider-pagination>
    <sx-slider-progress>
      <!-- render thanh tiến trình cơ bản để tự do css,
       thanh tiến trình này phải phục vụ cho cả chức năng draggable -->
    </sx-slider-progress>
    <sx-slider-thumbnail>
      <!-- render thumbnail ở đây -->
    </sx-slider-thumbnail>
  </sx-slider>
  <h3>Điều khiển slider bằng name</h3>
  <sx-slider-prev name="slider-1">Prev</sx-slider-prev>
  <sx-slider-next name="slider-1">Next</sx-slider-next>
```
<br />
|Attribute|Type|Description|Default|
|---|---|---|---|
|per-view|number|Số lượng slide trong viewport. Có thể viết `1.5` cho side padding|1|
|speed|number|Tốc độ trượt slide|500|
|loop|boolean||false|
|autoplay|boolean||false|
|autoplay-delay|number||4000|
|rewind|boolean|Tua lại khi đến slide cuối|false|
|direction|string|horizontal \| vertical|horizontal|
|start|number|start index|0|
|auto-height|boolean||false|
|effect|string|slide \| fade|false|
|gap|number \| string|Ví dụ: `"20"`, `"1rem"`|0|
|centered|boolean|Slide active luôn nằm giữa viewport|false|
|centered-bounds|boolean|Căn giữa nhưng không để xuất hiện khoảng trắng ở 2 bên|false|
|center-if-short|boolean|Khi tổng số slide không đủ để lấp đầy viewport. `false`: slide căn trái, `true`: slide căn giữa|false|
|grab-cursor|boolean|Bật tắt grab cursor|false|
|drag-disable|boolean|Chỉ cho phép trượt bằng navigation|false|
|draggable|boolean|Slider trượt tự do khi vuốt|false|
|vertical-scroll|boolean|Khi direction="vertical", có thể cuộn slide bằng con lăn|false|
|snap|boolean|Tự động về vị trí slide gần nhất|false|
|breakpoints|json||undefined|
