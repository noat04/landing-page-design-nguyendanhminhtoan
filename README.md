# iPhone 18 Pro Concept Landing Page

Landing page giới thiệu sản phẩm công nghệ theo phong cách premium, hiện đại và giàu trải nghiệm. Dự án được xây dựng với React + Vite, tập trung vào bố cục responsive, tối ưu hiệu năng, SEO technical, form đăng ký có thể gửi dữ liệu ra ngoài, dark mode, animation theo hành vi cuộn trang, chatbot tư vấn và một luồng thương mại điện tử mini.

> Sản phẩm demo: iPhone 18 Pro concept - một landing page kể chuyện cho thiết bị thông minh cao cấp.

## Công nghệ sử dụng

- React 19, Vite 8
- CSS thuần theo component, responsive layout, CSS variables cho dark/light theme
- GSAP + ScrollTrigger cho scroll animation và parallax nhẹ
- `react-lite-youtube-embed` để nhúng video tối ưu
- REST API-ready qua `VITE_API_BASE_URL`
- Google Apps Script / Webhook-ready cho form đăng ký nhận tin

## Tính năng chính

- Hero section có ảnh sản phẩm tối ưu WebP, CTA đặt trước và CTA xem video.
- Section video sản phẩm được lazy-load để giảm tải ban đầu.
- Section tính năng nổi bật, thông số kỹ thuật và câu chuyện thiết kế.
- Form đăng ký nhận tin có validate tên/email, trạng thái loading/success/error và gửi dữ liệu ra Google Sheet hoặc webhook.
- Theo dõi hành vi người dùng: click CTA, submit form và mốc scroll 25%, 50%, 75%; hiển thị toast realtime.
- Dark mode / light mode bằng CSS variables.
- Responsive cho desktop, tablet và mobile.
- SEO technical: title, meta description, Open Graph, Twitter card, favicon, theme color.
- Mini commerce: đăng nhập/đăng ký, danh sách sản phẩm, tìm kiếm/sắp xếp, chi tiết sản phẩm, yêu thích, giỏ hàng, cập nhật số lượng.
- Chatbot ở góc màn hình, sẵn sàng kết nối API `/api/chatbot/message`.

## Đáp ứng yêu cầu đề bài

| Yêu cầu | Cách triển khai trong dự án |
| --- | --- |
| Hero Section | `src/components/Hero.jsx` với ảnh sản phẩm, thông điệp chính và CTA |
| Tính năng nổi bật | `src/components/Features.jsx`, dữ liệu từ `src/data/landingData.js` |
| Thông số kỹ thuật | `src/components/Specs.jsx` |
| Form đăng ký nhận tin | `src/components/Signup.jsx`, xử lý validate và submit trong `src/App.jsx` |
| Responsive | CSS trong `index.html`, `src/styles/*.css`, breakpoint cho mobile/tablet |
| Performance | Lazy-load section bằng `IntersectionObserver`, dynamic import component, WebP image, preload hero image, lite YouTube embed |
| SEO | Meta tags trong `index.html` gồm Title, Description, Open Graph, Twitter Card |
| Dữ liệu bên ngoài | Google Sheet hoặc webhook qua biến môi trường |
| Dark Mode | Toggle theme trong `Header.jsx`, gắn `data-theme` lên `documentElement` |
| Scroll animation / Parallax | GSAP + ScrollTrigger được import khi người dùng tương tác |
| Scrollytelling | `Story.jsx` với card tương tác và hiệu ứng reveal |
| Mini e-commerce | Các trang `ProductsPage`, `ProductDetailPage`, `FavoritesPage`, `CartPage`, `AuthPage` |
| Chatbot | `ChatbotWidget.jsx`, gọi backend endpoint `/api/chatbot/message` |

## Cấu trúc thư mục

```text
src/
  components/        UI sections, commerce pages, chatbot, toast
  data/              Landing page content
  lib/               API helper, auth token, format price
  styles/            CSS theo từng nhóm giao diện
  App.jsx            Điều hướng view, theme, tracking, newsletter submit
public/
  fonts/             Font local dùng font-display: swap
  iphone.webp        Ảnh hero tối ưu
  favicon.svg
index.html           SEO meta, preload asset, critical CSS
```

## Cài đặt và chạy local

Yêu cầu: Node.js 20+.

```bash
npm install
npm run dev
```

Ứng dụng mặc định chạy tại:

```text
http://localhost:3000
```

Build production:

```bash
npm run build
npm run preview
```

Kiểm tra lint:

```bash
npm run lint
```

## Biến môi trường

Tạo file `.env` ở thư mục gốc nếu cần kết nối dữ liệu thật:

```bash
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
VITE_WEBHOOK_URL=https://your-webhook-url.com
```

Ghi chú:

- `VITE_API_BASE_URL`: backend REST API cho auth, products, favorites, cart và chatbot.
- `VITE_GOOGLE_SHEETS_WEB_APP_URL`: ưu tiên dùng cho newsletter form nếu được cấu hình.
- `VITE_WEBHOOK_URL`: fallback webhook nếu không dùng Google Sheet.
- Nếu không cấu hình Google Sheet hoặc webhook, form vẫn validate và hiển thị trạng thái demo thành công.

## Kết nối Google Sheet cho form đăng ký

Tạo Google Sheet với các cột:

```text
Submitted At | Name | Email | Source | Page URL | User Agent
```

Trong `Extensions > Apps Script`, thêm script:

```js
const SHEET_NAME = 'Sheet1'

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  const data = JSON.parse(e.postData.contents || '{}')

  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.name || '',
    data.email || '',
    data.source || '',
    data.pageUrl || '',
    data.userAgent || '',
  ])

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON)
}
```

Deploy Apps Script dưới dạng `Web app`:

- Execute as: `Me`
- Who has access: `Anyone`

Sau đó copy Web App URL vào `VITE_GOOGLE_SHEETS_WEB_APP_URL` và restart Vite.

## Backend API kỳ vọng

Frontend đã sẵn sàng gọi các endpoint sau:

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/products
GET    /api/products/:id
GET    /api/favorites
POST   /api/favorites/:productId
DELETE /api/favorites/:productId
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:productId
DELETE /api/cart/items/:productId
DELETE /api/cart
POST   /api/chatbot/message
```

Khi chạy local, Vite proxy `/api` sang `http://localhost:4000` theo cấu hình trong `vite.config.js`.

## Tối ưu hiệu năng

- Hero image dùng WebP, có fallback PNG, kích thước cố định và `fetchPriority="high"`.
- Preload ảnh hero trong `index.html`.
- Lazy-load các section bên dưới fold bằng `IntersectionObserver`.
- Dynamic import cho Features, Specs, Story, Signup, Footer, ProductFilm.
- GSAP/ScrollTrigger chỉ được tải sau tương tác đầu tiên của người dùng.
- Video YouTube dùng lite embed thay vì iframe nặng ngay từ đầu.
- Font local dùng `font-display: swap`.

## Triển khai

Dự án phù hợp deploy lên Vercel, Netlify hoặc Cloudflare Pages.

Thiết lập build:

```text
Build command: npm run build
Output directory: dist
```

Khi deploy production, thêm các biến môi trường cần thiết trong dashboard của nền tảng deploy.

## Ghi chú khi chấm bài

- Landing page vẫn hoạt động độc lập khi chưa có backend.
- Các chức năng commerce và chatbot cần backend tương thích với các endpoint ở trên.
- Form newsletter có thể gửi Google Sheet hoặc webhook thật nếu cấu hình biến môi trường.
- Dự án đã có sẵn `npm run build` để kiểm tra production bundle trước khi deploy.
