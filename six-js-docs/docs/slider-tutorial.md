# 🎠 Hướng Dẫn Xây Dựng sx-slider - Học Từ Swiper

## 📐 PHẦN 1: KIẾN TRÚC TỔNG QUAN

### 1.1 Cấu Trúc File

```
sx-slider/
├── sx-slider.js              # Component chính
├── slider-core.js            # Engine xử lý slide
├── slider-events.js          # Xử lý touch events
├── slider-translate.js       # Transform & vị trí
├── slider-animation.js       # Animation/transition
├── slider-navigation.js      # Next/Prev logic
├── slider-state.js           # State management
├── slider-responsive.js      # Breakpoints
└── sx-slider.css
```

### 1.2 Kiến Trúc Class

```javascript
class SxSlider {
  constructor(options) {
    this.config = {...defaults, ...options};
    this.state = {
      activeIndex: this.config.start || 0,
      translate: 0,           // Vị trí hiện tại
      isAnimating: false,
      touchData: {},          // Lưu dữ liệu touch
      slides: [],
      slidesGrid: [],         // Vị trí tất cả slide
      snapGrid: [],           // Điểm dừng có thể
    };
    this.init();
  }

  init() {
    this.collectElements();    // Tìm các element HTML
    this.calculateGrid();      // Tính toán vị trí slide
    this.attachEvents();       // Gắn event listeners
    this.render();             // Vẽ UI
  }
}
```

---

## 📐 PHẦN 2: SỰ KIỆN VUỐT (TOUCH EVENTS)

### 2.1 Bắt Sự Kiện Touch (onTouchStart)

**Mục đích**: Ghi lại điểm bắt đầu khi người dùng bắt đầu vuốt

```javascript
onTouchStart(event) {
  const touch = event.touches[0];
  
  this.state.touchData = {
    startX: touch.pageX,      // Vị trí X ban đầu
    startY: touch.pageY,      // Vị trí Y ban đầu
    currentX: touch.pageX,
    currentY: touch.pageY,
    startTime: Date.now(),    // Thời gian bắt đầu
    startTranslate: this.state.translate,  // Vị trí slide khi bắt đầu
    isTouched: true,
    isMoved: false,           // Chưa di chuyển
  };

  // Hủy animation hiện tại nếu đang chạy
  if (this.state.isAnimating) {
    this.stopAnimation();
  }
}
```

---

### 2.2 Theo Dõi Di Chuyển (onTouchMove)

**Mục đích**: Cập nhật vị trí slide khi ngón tay di chuyển **theo thời gian thực**

```javascript
onTouchMove(event) {
  const touch = event.touches[0];
  const diffX = touch.pageX - this.state.touchData.startX;  // Khoảng cách di chuyển
  
  this.state.touchData.currentX = touch.pageX;
  this.state.touchData.isMoved = true;
  
  // Kiểm tra ngưỡng (phải di chuyển tối thiểu 5px mới tính là drag)
  if (Math.abs(diffX) < 5) return;
  
  // ⭐ ĐẬY LÀ CHỖ MAGIC: Cập nhật vị trí slide theo từng pixel
  const newTranslate = this.state.touchData.startTranslate + diffX;
  this.setTranslate(newTranslate, false);  // false = không cần animation
  
  // Emit event để pagination cập nhật
  this.emit('sliding', { translate: newTranslate });
}
```

**Kết quả**: Slide theo dõi ngón tay realtime, không delay

---

### 2.3 Kết Thúc Vuốt (onTouchEnd)

**Mục đích**: Quyết định slide tiếp theo dựa trên vận tốc & khoảng cách

```javascript
onTouchEnd(event) {
  const { touchData, config } = this.state;
  
  if (!touchData.isMoved) return;
  
  // Tính toán
  const diffX = touchData.currentX - touchData.startX;  // Tổng khoảng cách
  const timeDiff = Date.now() - touchData.startTime;    // Tổng thời gian
  const velocity = diffX / timeDiff;                     // Vận tốc (pixel/ms)
  
  let targetIndex = this.state.activeIndex;
  
  // Quy tắc quyết định:
  // 1. Nếu vận tốc > 0.1 → chuyển sang slide kế tiếp
  if (Math.abs(velocity) > 0.1) {
    targetIndex = diffX > 0 ? this.state.activeIndex - 1 : this.state.activeIndex + 1;
  } 
  // 2. Hoặc nếu khoảng cách > 25% chiều rộng viewport
  else if (Math.abs(diffX) > this.viewportWidth * 0.25) {
    targetIndex = diffX > 0 ? this.state.activeIndex - 1 : this.state.activeIndex + 1;
  }
  
  // Kiểm tra giới hạn index
  targetIndex = Math.max(0, Math.min(targetIndex, this.state.slides.length - 1));
  
  // ⭐ Animate sang slide mục tiêu
  this.slideTo(targetIndex, config.speed || 400);
}
```

**Công thức vận tốc**: `velocity = pixel / millisecond`

---

## 📐 PHẦN 3: TÍNH TOÁN GRID VỊ TRÍ

### 3.1 Tính Toán slidesGrid & snapGrid

**Mục đích**: Xác định chính xác vị trí của mỗi slide và điểm dừng

```javascript
calculateGrid() {
  const { perView, gap, slides } = this.state;
  const viewportWidth = this.trackEl.clientWidth;
  const slideWidth = (viewportWidth - gap * (perView - 1)) / perView;
  
  this.state.slidesGrid = [];      // Vị trí bắt đầu của từng slide
  this.state.snapGrid = [];        // Điểm dừng (dựa trên centered, aligned...)
  
  let position = 0;
  
  for (let i = 0; i < slides.length; i++) {
    this.state.slidesGrid[i] = position;
    
    // snapGrid = vị trí để slide i nằm ở lề trái viewport
    // Nếu centered: snapGrid = vị trí để slide i nằm ở giữa
    if (this.config.centered) {
      this.state.snapGrid[i] = position - (viewportWidth - slideWidth) / 2;
    } else {
      this.state.snapGrid[i] = position;
    }
    
    position += slideWidth + gap;
  }
}
```

**Ví dụ**:
```
Viewport: 300px
perView: 1
gap: 10px
Có 5 slide

slidesGrid = [0, 310, 620, 930, 1240]
snapGrid   = [0, 310, 620, 930, 1240]

Khi chuyển sang slide thứ 2:
setTranslate(-310)  // Dịch trái 310px
```

---

### 3.2 Tính Min/Max Translate

```javascript
getMinTranslate() {
  // Vị trí tối thiểu (slide cuối cùng ở bên phải)
  return -(this.state.snapGrid[this.state.snapGrid.length - 1]);
}

getMaxTranslate() {
  // Vị trí tối đa (slide đầu ở bên trái)
  return 0;
}

// Khi drag, giới hạn translate để không vượt quá
const translate = Math.max(this.getMinTranslate(), 
                           Math.min(translate, this.getMaxTranslate()));
```

---

## 📐 PHẦN 4: TRANSFORM & ANIMATION

### 4.1 Set Translate (Di Chuyển Không Có Animation)

**Mục đích**: Cập nhật vị trí slide bằng CSS transform

```javascript
setTranslate(translate, byController = false) {
  this.state.translate = translate;
  
  if (this.config.cssMode) {
    // Mode 1: CSS scroll (native smooth scroll)
    const isH = this.config.direction === 'horizontal';
    this.trackEl[isH ? 'scrollLeft' : 'scrollTop'] = -translate;
  } else {
    // Mode 2: Transform (hardware accelerated, nhanh hơn)
    const x = this.config.direction === 'horizontal' ? translate : 0;
    const y = this.config.direction === 'vertical' ? translate : 0;
    
    // ⭐ GPU acceleration: translate3d thay vì translate
    this.trackEl.style.transform = `translate3d(${x}px, ${y}px, 0px)`;
  }
  
  // Emit event
  this.emit('setTranslate', translate);
}
```

**Tại sao `translate3d`?**
- Kích hoạt GPU acceleration
- Smooth hơn, không chớp
- Tiêu thụ pin ít hơn

---

### 4.2 Set Transition (Animation)

**Mục đích**: Thêm animation khi chuyển slide

```javascript
setTransition(duration) {
  // duration = 0 → không animation (immediate)
  // duration = 400 → animate 400ms
  
  if (!this.config.cssMode) {
    this.trackEl.style.transitionDuration = `${duration}ms`;
    
    if (duration === 0) {
      this.trackEl.style.transitionDelay = '0ms';
    }
  }
  
  this.emit('setTransition', duration);
}
```

**CSS phía dưới**:
```css
.sx-slider-track {
  transition: transform var(--duration) ease-out;
  /* Hoặc */
  transition: transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

---

### 4.3 Animate to Slide (Quy Trình Hoàn Chỉnh)

```javascript
slideTo(index, speed, runCallbacks = true) {
  let slideIndex = index;
  
  // Giới hạn index
  if (slideIndex < 0) slideIndex = 0;
  if (slideIndex >= this.state.slides.length) slideIndex = this.state.slides.length - 1;
  
  // Kiểm tra nếu đã ở slide này
  if (slideIndex === this.state.activeIndex) return;
  
  // ⭐ QUY TRÌNH:
  // Bước 1: Thông báo trước khi animation bắt đầu
  this.emit('slideChangeStart', { index: slideIndex });
  
  // Bước 2: Lấy vị trí target từ snapGrid
  const targetTranslate = -this.state.snapGrid[slideIndex];
  
  // Bước 3: Bật animation
  this.state.isAnimating = true;
  this.setTransition(speed);  // Set animation duration
  
  // Bước 4: Thực hiện di chuyển
  this.setTranslate(targetTranslate);
  
  // Bước 5: Cập nhật activeIndex
  this.state.activeIndex = slideIndex;
  
  // Bước 6: Chờ animation kết thúc
  setTimeout(() => {
    this.state.isAnimating = false;
    this.setTransition(0);  // Tắt animation
    
    if (runCallbacks) {
      this.emit('slideChangeEnd', { index: slideIndex });
    }
  }, speed);
}
```

---

## 📐 PHẦN 5: NAVIGATION (NEXT/PREV)

### 5.1 Logic Next

```javascript
slideNext(speed) {
  const nextIndex = this.state.activeIndex + 1;
  
  if (nextIndex >= this.state.slides.length) {
    if (this.config.loop) {
      // Vòng lặp: về slide đầu
      this.slideTo(0, speed);
    } else if (this.config.rewind) {
      // Tua lại: về slide đầu
      this.slideTo(0, speed);
    }
    // Nếu không: dừng, không làm gì
  } else {
    this.slideTo(nextIndex, speed);
  }
}

slidePrev(speed) {
  const prevIndex = this.state.activeIndex - 1;
  
  if (prevIndex < 0) {
    if (this.config.loop) {
      this.slideTo(this.state.slides.length - 1, speed);
    } else if (this.config.rewind) {
      this.slideTo(this.state.slides.length - 1, speed);
    }
  } else {
    this.slideTo(prevIndex, speed);
  }
}
```

---

## 📐 PHẦN 6: RESPONSIVE BREAKPOINTS

### 6.1 Tính Toán Breakpoints

```javascript
updateBreakpoints() {
  const windowWidth = window.innerWidth;
  const { breakpoints, config } = this.state;
  
  if (!breakpoints) return;
  
  // Sắp xếp breakpoints
  const sortedBreakpoints = Object.keys(breakpoints)
    .map(Number)
    .sort((a, b) => b - a);  // Giảm dần: [1080, 768, 360]
  
  // Tìm breakpoint phù hợp
  for (let bp of sortedBreakpoints) {
    if (windowWidth >= bp) {
      const settings = breakpoints[bp];
      
      // Cập nhật config
      Object.assign(this.config, settings);
      
      // Tính toán lại grid
      this.calculateGrid();
      
      // Cập nhật vị trí slide hiện tại
      this.setTranslate(-this.state.snapGrid[this.state.activeIndex]);
      
      break;
    }
  }
}
```

**Ví dụ**:
```javascript
breakpoints: {
  360: { perView: 2, gap: 20 },   // Mobile nhỏ
  768: { perView: 3, gap: 30 },   // Tablet
  1080: { perView: 4, gap: 40 },  // Desktop
}

// Khi window resize từ 800px → 500px:
// Sẽ tích hợp settings từ 360 breakpoint
```

---

## 📐 PHẦN 7: PAGINATION DOTS

### 7.1 Render Dots

```javascript
renderPagination() {
  const { slides } = this.state;
  const paginationEl = this.el.querySelector('sx-slider-pagination');
  
  if (!paginationEl) return;
  
  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.className = 'sx-slider-dot';
    dot.setAttribute('data-index', index);
    
    if (index === this.state.activeIndex) {
      dot.setAttribute('active', '');  // Dùng attr thay class
    }
    
    dot.addEventListener('click', () => {
      this.slideTo(index, this.config.speed);
    });
    
    paginationEl.appendChild(dot);
  });
}
```

### 7.2 Cập Nhật Dots Khi Slide Change

```javascript
updatePaginationDots(newIndex) {
  const dots = this.el.querySelectorAll('.sx-slider-dot');
  
  dots.forEach((dot, index) => {
    if (index === newIndex) {
      dot.setAttribute('active', '');
    } else {
      dot.removeAttribute('active');
    }
  });
}

// Gắn vào sự kiện
this.on('slideChangeEnd', ({ index }) => {
  this.updatePaginationDots(index);
});
```

---

## 📐 PHẦN 8: PROGRESS BAR (Draggable)

### 8.1 Render Progress Bar

```javascript
renderProgress() {
  const progressEl = this.el.querySelector('sx-slider-progress');
  
  if (!progressEl) return;
  
  const progressTrack = document.createElement('div');
  progressTrack.className = 'sx-slider-progress-track';
  
  const progressFill = document.createElement('div');
  progressFill.className = 'sx-slider-progress-fill';
  
  progressTrack.appendChild(progressFill);
  progressEl.appendChild(progressTrack);
  
  // Gắn event drag
  progressTrack.addEventListener('mousedown', (e) => {
    this.onProgressDragStart(e);
  });
}

updateProgressBar() {
  const fillEl = this.el.querySelector('.sx-slider-progress-fill');
  
  if (!fillEl) return;
  
  const progress = this.state.activeIndex / (this.state.slides.length - 1);
  const percentage = (progress * 100).toFixed(2);
  
  fillEl.style.width = `${percentage}%`;
}
```

### 8.2 Drag Progress Bar

```javascript
onProgressDragStart(event) {
  const track = event.currentTarget;
  const clickPosition = event.clientX - track.getBoundingClientRect().left;
  const percentage = clickPosition / track.clientWidth;
  const newIndex = Math.round(percentage * (this.state.slides.length - 1));
  
  this.slideTo(newIndex, this.config.speed);
}
```

---

## 📐 PHẦN 9: AUTOPLAY

### 9.1 Autoplay Logic

```javascript
startAutoplay() {
  if (!this.config.autoplay || this.autoplayTimer) return;
  
  this.autoplayTimer = setInterval(() => {
    this.slideNext(this.config.speed);
  }, this.config.autoplayDelay || 4000);
}

stopAutoplay() {
  if (this.autoplayTimer) {
    clearInterval(this.autoplayTimer);
    this.autoplayTimer = null;
  }
}

// Dừng autoplay khi hover
this.el.addEventListener('mouseenter', () => this.stopAutoplay());
this.el.addEventListener('mouseleave', () => this.startAutoplay());
```

---

## 📐 PHẦN 10: GẮN TẤT CẢ LẠI - INIT FUNCTION

```javascript
class SxSlider {
  constructor(options = {}) {
    this.config = {
      perView: 1,
      gap: 0,
      speed: 400,
      loop: false,
      autoplay: false,
      autoplayDelay: 4000,
      start: 0,
      direction: 'horizontal',
      centered: false,
      ...options,
    };
    
    this.state = {
      activeIndex: this.config.start,
      translate: 0,
      isAnimating: false,
      touchData: {},
      slides: [],
      slidesGrid: [],
      snapGrid: [],
    };
    
    this.listeners = {};
    this.init();
  }

  init() {
    // 1️⃣ Lấy elements
    this.el = document.querySelector('[sx-slider-container]');
    this.trackEl = this.el.querySelector('sx-slider-track');
    this.state.slides = Array.from(this.trackEl.querySelectorAll('sx-slider-slide'));
    
    // 2️⃣ Tính toán grid
    this.calculateGrid();
    
    // 3️⃣ Gắn event listeners
    this.attachTouchEvents();
    this.attachResizeObserver();
    
    // 4️⃣ Render components
    this.renderPagination();
    this.renderProgress();
    this.attachNavigationButtons();
    
    // 5️⃣ Cập nhật UI ban đầu
    this.setTranslate(0);
    this.updatePaginationDots(this.config.start);
    this.updateProgressBar();
    
    // 6️⃣ Bắt đầu autoplay
    if (this.config.autoplay) {
      this.startAutoplay();
    }
  }

  // ========== TOUCH EVENTS ==========
  attachTouchEvents() {
    this.trackEl.addEventListener('touchstart', (e) => this.onTouchStart(e));
    this.trackEl.addEventListener('touchmove', (e) => this.onTouchMove(e));
    this.trackEl.addEventListener('touchend', (e) => this.onTouchEnd(e));
    
    this.trackEl.addEventListener('pointerdown', (e) => this.onTouchStart(e));
    this.trackEl.addEventListener('pointermove', (e) => this.onTouchMove(e));
    this.trackEl.addEventListener('pointerup', (e) => this.onTouchEnd(e));
  }

  attachResizeObserver() {
    const observer = new ResizeObserver(() => {
      this.updateBreakpoints();
    });
    observer.observe(this.el);
  }

  attachNavigationButtons() {
    const prevBtn = this.el.querySelector('sx-slider-prev');
    const nextBtn = this.el.querySelector('sx-slider-next');
    
    if (prevBtn) prevBtn.addEventListener('click', () => this.slidePrev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.slideNext());
  }

  // ========== CORE FUNCTIONS ==========
  setTranslate(translate) { /* ... */ }
  setTransition(duration) { /* ... */ }
  slideTo(index, speed) { /* ... */ }
  slideNext(speed) { /* ... */ }
  slidePrev(speed) { /* ... */ }
  calculateGrid() { /* ... */ }
  updateBreakpoints() { /* ... */ }

  // ========== EVENT HANDLERS ==========
  onTouchStart(event) { /* ... */ }
  onTouchMove(event) { /* ... */ }
  onTouchEnd(event) { /* ... */ }

  // ========== UI UPDATE ==========
  renderPagination() { /* ... */ }
  renderProgress() { /* ... */ }
  updatePaginationDots(index) { /* ... */ }
  updateProgressBar() { /* ... */ }

  // ========== EVENT EMITTER ==========
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}
```

---

## 📐 PHẦN 11: CSS CẦN THIẾT

```css
/* Base */
sx-slider {
  display: block;
  position: relative;
  overflow: hidden;
}

sx-slider-track {
  display: flex;
  transition: transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  /* Hoặc scroll-behavior: smooth; nếu dùng cssMode */
}

sx-slider-slide {
  flex-shrink: 0;
  width: 100%;
}

/* Navigation */
sx-slider-prev,
sx-slider-next {
  cursor: pointer;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
}

sx-slider-prev { left: 10px; }
sx-slider-next { right: 10px; }

/* Pagination */
sx-slider-pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.sx-slider-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  cursor: pointer;
  transition: background 200ms;
}

.sx-slider-dot[active] {
  background: rgba(0, 0, 0, 0.8);
}

/* Progress */
sx-slider-progress {
  margin-top: 20px;
}

.sx-slider-progress-track {
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  cursor: pointer;
}

.sx-slider-progress-fill {
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 2px;
  transition: width 200ms;
}
```

---

## 📐 PHẦN 12: BẢNG KIỂM TRA (CHECKLIST)

```
✅ Core Engine:
  ✓ State management (activeIndex, translate, isAnimating)
  ✓ setTranslate() - cập nhật CSS transform
  ✓ setTransition() - thêm animation duration
  ✓ slideTo() - quy trình chuyển slide hoàn chỉnh

✅ Touch Events:
  ✓ onTouchStart - ghi lại điểm bắt đầu
  ✓ onTouchMove - cập nhật realtime theo ngón tay
  ✓ onTouchEnd - quyết định slide kế tiếp

✅ Grid Calculation:
  ✓ calculateGrid() - tính vị trí slides
  ✓ snapGrid - điểm dừng
  ✓ minTranslate / maxTranslate - giới hạn

✅ Navigation:
  ✓ slideNext()
  ✓ slidePrev()
  ✓ Xử lý loop/rewind

✅ Responsive:
  ✓ Breakpoints parsing
  ✓ updateBreakpoints()
  ✓ ResizeObserver

✅ Components:
  ✓ Pagination dots
  ✓ Progress bar (draggable)
  ✓ Next/Prev buttons
  ✓ Thumbnail gallery (nếu cần)

✅ Features:
  ✓ Autoplay
  ✓ Direction (horizontal/vertical)
  ✓ Centered slides
  ✓ Effect (slide, fade)
  ✓ Auto-height
```

---

## 📐 PHẦN 13: PERFORMANCE TIPS

### ⚡ Tối Ưu Hóa

1. **GPU Acceleration**
   - Dùng `translate3d()` thay vì `translate()`
   - Dùng `transform` thay vì `left/top`

2. **Debounce Resize**
   ```javascript
   let resizeTimer;
   window.addEventListener('resize', () => {
     clearTimeout(resizeTimer);
     resizeTimer = setTimeout(() => this.updateBreakpoints(), 200);
   });
   ```

3. **requestAnimationFrame cho Touch**
   ```javascript
   onTouchMove(event) {
     requestAnimationFrame(() => {
       const newTranslate = this.state.touchData.startTranslate + diffX;
       this.setTranslate(newTranslate);
     });
   }
   ```

4. **Lazy Load Images**
   - Chỉ load ảnh cho slide hiện tại + 1 slide trước/sau

5. **Virtual Slides** (nếu 1000+ slides)
   - Chỉ render DOM cần thiết
   - Reuse DOM nodes khi scroll

---

## 📐 PHẦN 14: VÍ DỤ MÃ ĐẦY ĐỦ - sx-slider.js

```javascript
class SxSlider {
  constructor(selector, options = {}) {
    this.el = document.querySelector(selector);
    if (!this.el) throw new Error(`Element ${selector} not found`);
    
    this.defaults = {
      perView: 1,
      gap: 0,
      speed: 400,
      loop: false,
      autoplay: false,
      autoplayDelay: 4000,
      rewind: false,
      start: 0,
      direction: 'horizontal',
      centered: false,
      centeredBounds: false,
      centerIfShort: false,
      grabCursor: false,
      dragDisable: false,
      draggable: true,
      verticalScroll: false,
      snap: false,
      effect: 'slide',
      breakpoints: undefined,
    };
    
    this.config = { ...this.defaults, ...options };
    this.state = {
      activeIndex: this.config.start,
      translate: 0,
      isAnimating: false,
      isTouching: false,
      touchData: {
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        startTime: 0,
        startTranslate: 0,
        isMoved: false,
      },
      slides: [],
      slidesGrid: [],
      snapGrid: [],
    };
    
    this.listeners = {};
    this.autoplayTimer = null;
    
    this.init();
  }

  init() {
    // Get DOM elements
    this.trackEl = this.el.querySelector('sx-slider-track');
    this.state.slides = Array.from(this.trackEl.querySelectorAll('sx-slider-slide'));
    
    if (this.state.slides.length === 0) {
      console.error('No slides found');
      return;
    }
    
    // Calculate grid
    this.calculateGrid();
    
    // Attach events
    this.attachTouchEvents();
    this.attachResizeObserver();
    this.attachNavigationButtons();
    
    // Render UI
    this.renderPagination();
    this.renderProgress();
    
    // Initial state
    this.setTranslate(0);
    this.updatePaginationDots(this.config.start);
    this.updateProgressBar();
    
    // Autoplay
    if (this.config.autoplay) {
      this.startAutoplay();
    }
    
    this.emit('init');
  }

  calculateGrid() {
    const { perView, gap } = this.config;
    const isH = this.config.direction === 'horizontal';
    const viewportSize = isH ? this.trackEl.clientWidth : this.trackEl.clientHeight;
    const slideSize = (viewportSize - gap * (perView - 1)) / perView;
    
    this.state.slidesGrid = [];
    this.state.snapGrid = [];
    
    let position = 0;
    
    this.state.slides.forEach((slide, i) => {
      this.state.slidesGrid[i] = position;
      
      if (this.config.centered) {
        this.state.snapGrid[i] = position - (viewportSize - slideSize) / 2;
      } else {
        this.state.snapGrid[i] = position;
      }
      
      if (isH) {
        slide.style.width = `${slideSize}px`;
      } else {
        slide.style.height = `${slideSize}px`;
      }
      
      position += slideSize + gap;
    });
  }

  setTranslate(translate) {
    this.state.translate = translate;
    
    const x = this.config.direction === 'horizontal' ? translate : 0;
    const y = this.config.direction === 'vertical' ? translate : 0;
    
    this.trackEl.style.transform = `translate3d(${x}px, ${y}px, 0px)`;
    
    this.emit('setTranslate', translate);
  }

  setTransition(duration) {
    this.trackEl.style.transitionDuration = `${duration}ms`;
    this.emit('setTransition', duration);
  }

  slideTo(index, speed = this.config.speed) {
    if (this.state.isAnimating) return;
    
    // Clamp index
    index = Math.max(0, Math.min(index, this.state.slides.length - 1));
    
    if (index === this.state.activeIndex) return;
    
    this.emit('beforeSlideChange', { index });
    
    const targetTranslate = -this.state.snapGrid[index];
    
    this.state.isAnimating = true;
    this.setTransition(speed);
    this.setTranslate(targetTranslate);
    
    this.state.activeIndex = index;
    this.updatePaginationDots(index);
    this.updateProgressBar();
    
    setTimeout(() => {
      this.state.isAnimating = false;
      this.setTransition(0);
      this.emit('afterSlideChange', { index });
    }, speed);
  }

  slideNext(speed) {
    const nextIndex = this.state.activeIndex + 1;
    
    if (nextIndex >= this.state.slides.length) {
      if (this.config.loop || this.config.rewind) {
        this.slideTo(0, speed);
      }
    } else {
      this.slideTo(nextIndex, speed);
    }
  }

  slidePrev(speed) {
    const prevIndex = this.state.activeIndex - 1;
    
    if (prevIndex < 0) {
      if (this.config.loop || this.config.rewind) {
        this.slideTo(this.state.slides.length - 1, speed);
      }
    } else {
      this.slideTo(prevIndex, speed);
    }
  }

  attachTouchEvents() {
    const events = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
    
    events.forEach(eventType => {
      this.trackEl.addEventListener(
        eventType,
        (e) => this.onTouchEvent(e),
        false
      );
    });
  }

  onTouchEvent(event) {
    const type = event.type;
    
    if (type === 'touchstart') {
      this.onTouchStart(event);
    } else if (type === 'touchmove') {
      this.onTouchMove(event);
    } else if (type === 'touchend' || type === 'touchcancel') {
      this.onTouchEnd(event);
    }
  }

  onTouchStart(event) {
    if (this.state.isAnimating) return;
    
    const touch = event.touches[0];
    
    this.state.touchData = {
      startX: touch.pageX,
      startY: touch.pageY,
      currentX: touch.pageX,
      currentY: touch.pageY,
      startTime: Date.now(),
      startTranslate: this.state.translate,
      isMoved: false,
    };
    
    this.state.isTouching = true;
    
    if (this.config.grabCursor) {
      this.trackEl.style.cursor = 'grabbing';
    }
    
    this.stopAutoplay();
    this.emit('touchStart');
  }

  onTouchMove(event) {
    if (!this.state.isTouching || this.state.isAnimating) return;
    
    const touch = event.touches[0];
    const diffX = touch.pageX - this.state.touchData.startX;
    const diffY = touch.pageY - this.state.touchData.startY;
    
    // Threshold check
    if (Math.abs(diffX) < 5 && Math.abs(diffY) < 5) return;
    
    this.state.touchData.currentX = touch.pageX;
    this.state.touchData.currentY = touch.pageY;
    this.state.touchData.isMoved = true;
    
    const newTranslate = this.state.touchData.startTranslate + diffX;
    this.setTranslate(newTranslate);
    
    // Prevent default scroll
    event.preventDefault();
    
    this.emit('touchMove', { diff: diffX });
  }

  onTouchEnd(event) {
    if (!this.state.isTouching) return;
    
    const { touchData } = this.state;
    const diffX = touchData.currentX - touchData.startX;
    const timeDiff = Date.now() - touchData.startTime;
    const velocity = Math.abs(diffX / timeDiff);
    
    this.state.isTouching = false;
    
    if (this.config.grabCursor) {
      this.trackEl.style.cursor = 'grab';
    }
    
    if (!touchData.isMoved) {
      this.startAutoplay();
      return;
    }
    
    let nextIndex = this.state.activeIndex;
    
    // Velocity check
    if (velocity > 0.1) {
      nextIndex = diffX > 0 ? this.state.activeIndex - 1 : this.state.activeIndex + 1;
    } 
    // Distance check
    else if (Math.abs(diffX) > this.trackEl.clientWidth * 0.25) {
      nextIndex = diffX > 0 ? this.state.activeIndex - 1 : this.state.activeIndex + 1;
    }
    
    nextIndex = Math.max(0, Math.min(nextIndex, this.state.slides.length - 1));
    
    this.slideTo(nextIndex, this.config.speed);
    this.startAutoplay();
    
    this.emit('touchEnd');
  }

  attachResizeObserver() {
    const observer = new ResizeObserver(() => {
      this.updateBreakpoints();
    });
    observer.observe(this.el);
  }

  updateBreakpoints() {
    const { breakpoints } = this.config;
    if (!breakpoints) return;
    
    const windowWidth = window.innerWidth;
    const sortedBps = Object.keys(breakpoints)
      .map(Number)
      .sort((a, b) => b - a);
    
    for (let bp of sortedBps) {
      if (windowWidth >= bp) {
        const settings = breakpoints[bp];
        Object.assign(this.config, settings);
        
        this.calculateGrid();
        this.setTranslate(-this.state.snapGrid[this.state.activeIndex]);
        
        break;
      }
    }
  }

  attachNavigationButtons() {
    this.el.querySelectorAll('sx-slider-prev').forEach(btn => {
      btn.addEventListener('click', () => this.slidePrev());
    });
    
    this.el.querySelectorAll('sx-slider-next').forEach(btn => {
      btn.addEventListener('click', () => this.slideNext());
    });
  }

  renderPagination() {
    const paginationEl = this.el.querySelector('sx-slider-pagination');
    if (!paginationEl) return;
    
    this.state.slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'sx-slider-dot';
      dot.setAttribute('data-index', i);
      if (i === this.state.activeIndex) dot.setAttribute('active', '');
      
      dot.addEventListener('click', () => this.slideTo(i));
      paginationEl.appendChild(dot);
    });
  }

  updatePaginationDots(index) {
    this.el.querySelectorAll('.sx-slider-dot').forEach((dot, i) => {
      if (i === index) {
        dot.setAttribute('active', '');
      } else {
        dot.removeAttribute('active');
      }
    });
  }

  renderProgress() {
    const progressEl = this.el.querySelector('sx-slider-progress');
    if (!progressEl) return;
    
    const track = document.createElement('div');
    track.className = 'sx-slider-progress-track';
    
    const fill = document.createElement('div');
    fill.className = 'sx-slider-progress-fill';
    
    track.appendChild(fill);
    progressEl.appendChild(track);
    
    track.addEventListener('click', (e) => this.onProgressClick(e));
  }

  onProgressClick(event) {
    const track = event.currentTarget;
    const rect = track.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const index = Math.round(percent * (this.state.slides.length - 1));
    
    this.slideTo(index);
  }

  updateProgressBar() {
    const fill = this.el.querySelector('.sx-slider-progress-fill');
    if (!fill) return;
    
    const percent = this.state.activeIndex / (this.state.slides.length - 1);
    fill.style.width = `${percent * 100}%`;
  }

  startAutoplay() {
    if (!this.config.autoplay || this.autoplayTimer) return;
    
    this.autoplayTimer = setInterval(() => {
      this.slideNext();
    }, this.config.autoplayDelay);
  }

  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  // Event emitter
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  destroy() {
    this.stopAutoplay();
    this.trackEl.style.transform = '';
    this.trackEl.style.transitionDuration = '';
    this.listeners = {};
  }
}

// Usage:
// const slider = new SxSlider('sx-slider', {
//   perView: 1,
//   gap: 10,
//   speed: 400,
//   autoplay: true,
//   breakpoints: {
//     360: { perView: 2 },
//     768: { perView: 3 },
//   }
// });
```

---

## 📐 PHẦN 15: HTML USAGE EXAMPLE

```html
<sx-slider name="gallery" per-view="1" gap="10" speed="400">
  <sx-slider-track>
    <sx-slider-slide>
      <img src="slide1.jpg" alt="">
    </sx-slider-slide>
    <sx-slider-slide>
      <img src="slide2.jpg" alt="">
    </sx-slider-slide>
    <sx-slider-slide>
      <img src="slide3.jpg" alt="">
    </sx-slider-slide>
  </sx-slider-track>
  
  <sx-slider-prev>← Prev</sx-slider-prev>
  <sx-slider-next>Next →</sx-slider-next>
  
  <sx-slider-pagination></sx-slider-pagination>
  <sx-slider-progress></sx-slider-progress>
</sx-slider>

<script>
  // Init slider
  const slider = new SxSlider('sx-slider', {
    perView: 1,
    gap: 10,
    speed: 400,
    autoplay: true,
    autoplayDelay: 5000,
    breakpoints: {
      360: { perView: 2, gap: 20 },
      768: { perView: 3, gap: 30 },
      1080: { perView: 4, gap: 40 },
    }
  });
  
  // Listen to events
  slider.on('beforeSlideChange', ({ index }) => {
    console.log('Changing to slide', index);
  });
  
  slider.on('afterSlideChange', ({ index }) => {
    console.log('Changed to slide', index);
  });
</script>
```

---

## 🎯 TÓM TẮT - CÔNG THỨC sx-slider

```
1. INIT
   ├─ Lấy DOM elements (track, slides)
   ├─ Tính toán grid (slidesGrid, snapGrid)
   └─ Gắn event listeners

2. TOUCH FLOW
   ├─ Start: Lưu điểm bắt đầu
   ├─ Move: Cập nhật realtime (translate + diff)
   └─ End: Quyết định slide kế tiếp (velocity & distance)

3. SLIDE ANIMATION
   ├─ Tính target position từ snapGrid
   ├─ Set transition duration
   ├─ Set translate (CSS transform)
   └─ Cập nhật UI (dots, progress)

4. RESPONSIVE
   ├─ Detect window resize
   ├─ Tìm breakpoint phù hợp
   ├─ Cập nhật config
   └─ Recalculate grid

5. COMPONENTS
   ├─ Pagination dots (click to jump)
   ├─ Progress bar (click & drag)
   ├─ Navigation buttons (next/prev)
   └─ Autoplay (interval loop)
```

---

**Bây giờ bạn có toàn bộ blueprint để xây dựng sx-slider! 🚀**

Hãy bắt đầu từ phần "PHẦN 14" với code mẫu, sau đó từng bước thêm các features khác.
