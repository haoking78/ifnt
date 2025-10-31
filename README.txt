
IFNT v6.2.18（完整可部署包）

重點：
1) 已加入 cache bust（styles.css?v=2025-11-01-03 / app.js?v=2025-11-01-03）
2) service-worker 的 CACHE_NAME 也已 bump，避免吃舊快取
3) 目標進度條 + 目前累積/目標顯示
4) 達標時才觸發煙火+音效，並避免重複觸發
5) BV / IBV 依「姓名」彙總（只顯示一行），查看時用彈窗顯示明細
6) 312 名單：新增/累加後自動清空姓名與族群欄位，名單彙總按人顯示一行

部署：
- 直接把整包檔案上傳到 GitHub Pages 或任一靜態空間
- 首次開啟建議帶參數：  /index.html?v=2025-11-01-03
- 若版面被舊快取影響，更新 service-worker.js 的 CACHE_NAME 與 index.html 的版本參數即可
