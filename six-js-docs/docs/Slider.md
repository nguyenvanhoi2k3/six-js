---
sidebar_position: 3
title: Slider
---

<br />
Hỗ trợ tạo trình chiếu nội dung (carousel/slider), cho phép người dùng vuốt hoặc điều hướng giữa nhiều slide tương tự.

👉 **[DEMO](/slider)**

---

<br />

## sx-slider

```html
  <sx-slider
    name="slider-1"
    per-view="1"
    gap="0"
    speed="400"
    breakpoints="{
      360: {
        per-view: 2,
        gap: 20,
        effect: fade,
      },
      768: {
        per-view: 3,
        gap: 0
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
      <!-- render thanh tiến trình, thanh tiến trình này phục vụ cho cả chức năng draggable -->
    </sx-slider-progress>
  </sx-slider>
```
<br />
|Attribute|Type|Description|Default|
|---|---|---|---|
|name|string|Tên duy nhất của slider|null|
|per-view|number|Số lượng slide trong viewport|1|
|per-move|number\|string|`auto`: 1 hoặc dừng lại ở slide gần nhất khi thả|auto|
|right-padding|number\|string|Lộ một phần slide tiếp theo nếu có|0|
|left-padding|number\|string|Lộ một phần slide trước đó nếu có|0|
|speed|number|Tốc độ trượt slide|300|
|edge-resistance|number|Khoảng cách cản khi kéo ở mép đầu/cuối.|100|
|loop|boolean||false|
|autoplay|boolean||false|
|interval|number|Thời gian chờ trước khi chuyển slide tiếp theo ở `autoplay mode`|3000|
|rewind|boolean|Tua lại khi đến slide cuối|false|
|direction|string|horizontal \| vertical|horizontal|
|start-index|number|Slide bắt đầu khi khởi tạo|0|
|auto-size|boolean|Tự động chia per-view theo width của slide content (hoặc theo height nếu là direction `vertical`), `per-vew` khi này sẽ disable|false|
|auto-height|boolean|Height slider tổng sẽ tự động ăn theo height slide trong viewport|false|
|effect|string|slide \| fade, `fade` chỉ hoạt động ở per-view="1"|false|
|gap|number \| string|Ví dụ: `"20"`, `"1rem"`|0|
|centered|boolean|Slide active luôn nằm giữa viewport|false|
|auto-centered|boolean|Slide active luôn nằm giữa viewport nhưng xóa khoảng trắng ở 2 bên|false|
|center-if-short|boolean|Khi tổng số slide không đủ để lấp đầy viewport. `false`: slide căn trái, `true`: slide căn giữa|false|
|grab-cursor|boolean|Bật tắt grab cursor|false|
|drag|boolean \| free|`true`: cho phép drag \| `false`: chặn drag \| `free`: slide trượt có quán tính |true|
|vertical-scroll|boolean|Khi `direction="vertical"`, có thể cuộn slide bằng con lăn|false|
|snap|boolean|Tự động về vị trí slide gần nhất ở chế độ `drag="free"`|false|
|sync|string|Thuộc tính `sync` cho phép liên kết hai hoặc nhiều slider với nhau. Khi người dùng thao tác (chuyển slide) trên một slider, các slider được liên kết sẽ tự động chuyển đổi tương ứng. Phục vụ làm thumbnails|null|
|lock-active|boolean|Khi `true`: Sự kiện drag, next, prev sẽ cho phép trượt slide để xem các slide khác mà vẫn giữ nguyên slide đang active. Phục vụ trong việc xem thumbnail|false|
|breakpoints|json|Hỗ trợ responsive mọi thuộc tính trừ `direction`|undefined|

<br />

## sx-slider-prev, sx-slider-next
```html
  <sx-slider-prev name="slider-1">Prev</sx-slider-prev>
  <sx-slider-next name="slider-1">Next</sx-slider-next>
```
<br />
|Attribute|Type|Description|Default|
|---|---|---|---|
|name|string|Dùng trong trường hợp navigation nằm ngoài slider|null|
<br />

## sx-slider-pagination
```html
  <sx-slider-pagination name="slider-1" effect="dynamic"></sx-slider-pagination>
```

<br />
|Attribute|Type|Description|Default|
|---|---|---|---|
|name|string|Dùng trong trường hợp pagination nằm ngoài slider|null|
|effect|string|Có 4 dạng: dynamic \| snake \| number \| fraction|Default sẽ render ra các thẻ span rỗng để css|
<br />
:::note
effect hỗ trợ render html cần thiết, vẫn cần css để có hiệu ứng, xem 👉 **[Tại đây](/slider)**
:::
<br />
## sx-slider-progress
Thanh tiến trình slider
```html
   <sx-slider-progress name="slider-1"></sx-slider-progress>
```
<br />
|Attribute|Type|Description|Default|
|---|---|---|---|
|name|string|Dùng trong trường hợp progress nằm ngoài slider|null|
<br />

👉 **[DEMO](/slider)**
<br />