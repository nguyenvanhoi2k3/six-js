export type AnimationType = 'fade-up' | 'fade-down' | 'fade-in';

export class SxAnimate extends HTMLElement {
  // Tạo một Observer tĩnh (Static) dùng chung cho TẤT CẢ các thẻ sx-animate trên trang
  // Điều này giúp tiết kiệm bộ nhớ tối đa thay vì mỗi thẻ tạo 1 observer riêng lẻ
  private static _observer: IntersectionObserver | null = null;

  static get observedAttributes() {
    return ['type'];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    if (!this.hasAttribute('type')) {
      this.setAttribute('type', 'fade-up');
    }

    // Khởi tạo thực thể Observer dùng chung nếu chưa có
    if (!SxAnimate._observer) {
      SxAnimate._initObserver();
    }

    // Đưa phần tử này vào danh sách theo dõi của Observer
    SxAnimate._observer?.observe(this);
  }

  disconnectedCallback() {
    // Khi thẻ bị xóa khỏi DOM (ví dụ user chuyển trang trong Single Page App)
    // Phải bỏ theo dõi để tránh Memory Leak (rò rỉ bộ nhớ)
    SxAnimate._observer?.unobserve(this);
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'type' && oldValue !== newValue) {
      // Nếu user đổi type bằng JavaScript khi đang chạy, cập nhật lại trạng thái nếu cần
    }
  }

  // Hàm khởi tạo Intersection Observer thông minh
  private static _initObserver() {
    SxAnimate._observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Khi phần tử ló diện vào màn hình ít nhất 10% (threshold: 0.1)
          if (entry.isIntersecting) {
            const target = entry.target as SxAnimate;
            
            // Kích hoạt class CSS để chạy hiệu ứng
            target.classList.add('is-animated');

            // Bắn ra một Custom Event 'animated' để lập trình viên phía ngoài có thể lắng nghe
            target.dispatchEvent(new CustomEvent('animated', { bubbles: true }));

            // Sau khi chạy hiệu ứng xong thì dừng theo dõi phần tử này để tối ưu CPU
            SxAnimate._observer?.unobserve(target);
          }
        });
      },
      {
        root: null, // Lấy viewport của trình duyệt làm khung chuẩn
        rootMargin: '0px 0px -50px 0px', // Kích hoạt sớm hơn 50px trước khi phần tử kịp cuộn tới
        threshold: 0.1 // Thấy 10% diện tích là kích hoạt
      }
    );
  }
}

if (!customElements.get('sx-animate')) {
  customElements.define('sx-animate', SxAnimate);
}