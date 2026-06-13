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
|name|string|Tên slider, có thể dùng link đến nút prev, next|null|
|per-view|number|Số lượng slide trong viewport|1|
|per-move|number\|auto|Số lượng slide di chuyển mỗi lần. Nếu số âm thì = 1, nếu số lớn như 999 thì = số lượng slide trong viewport, `auto`: 1 hoặc dừng lại ở slide gần nhất khi thả|auto|
|right-padding|number|Lộ một phần slide tiếp theo nếu có|0|
|left-padding|number|Lộ một phần slide trước đó nếu có|0|
|speed|number|Tốc độ trượt slide|300|
|edge-resistance|number|Khoảng cách cản khi kéo ở mép đầu/cuối.|100|
|loop|boolean||false|
|autoplay|boolean||false|
|interval|number|thời gian chờ trước khi chuyển slide tiếp theo ở `autoplay mode`|3000|
|rewind|boolean|Tua lại khi đến slide cuối|false|
|direction|string|horizontal \| vertical|horizontal|
|start-index|number|start index|0|
|auto-size|boolean|tự động chia per-view theo width của slide content (hoặc theo height nếu là `vertical`), `per-vew` khi này sẽ disable|false|
|auto-height|boolean|Height sẽ tự động khớp theo height content của từng slide|false|
|effect|string|slide \| fade|false|
|gap|number \| string|Ví dụ: `"20"`, `"1rem"`|0|
|centered|boolean|Slide active luôn nằm giữa viewport|false|
|auto-centered|boolean|Slide active luôn nằm giữa viewport nhưng xóa khoảng trắng ở 2 bên|false|
|center-if-short|boolean|Khi tổng số slide không đủ để lấp đầy viewport. `false`: slide căn trái, `true`: slide căn giữa|false|
|grab-cursor|boolean|Bật tắt grab cursor|false|
|drag|boolean \| free|`true`: cho phép drag \| `false`: chặn drag \| `free`: cho phép drag và slide trượt theo quán tính |true|
|vertical-scroll|boolean|Khi `direction="vertical"`, có thể cuộn slide bằng con lăn|false|
|snap|boolean|Tự động về vị trí slide gần nhất ở chế độ `drag="free"`|false|
|breakpoints|json||undefined|

<br />
👉 **[DEMO](/sx-marquee-demo)**
<br />