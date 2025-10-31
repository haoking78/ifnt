IFNT v6.2.7-fix-cache — Patch Package
========================================

這個修補包只包含 **service-worker.js**，專門解決：
- 頁面/按鈕沒反應（吃到舊版快取）
- 部分瀏覽器無法即時載入最新 JS/CSS

安裝步驟（GitHub 上傳覆蓋即可）
--------------------------------
1) 下載並解壓縮本檔案：IFNT_v6.2.7_fix_cache.zip
2) 進入你的 repo（例如 haoking78/ifnt），把 **service-worker.js** 直接上傳覆蓋。
3) 等 GitHub Pages 部署完成（右上角 Deployments 出現 Success）。
4) 在手機與電腦 **強制重新整理** 一次：
   - Windows：Ctrl + F5
   - macOS：Cmd + Shift + R
   - iPhone Safari：在網址列輸入頁面 → 長按重新整理圖示 → 選「沒有內容阻擋器重新載入」
5) 之後就不需要再清快取了，新的 SW 會自動確保載入最新檔案。

這版 service-worker.js 會：
- 對 **/ifnt/index.html、/ifnt/app.js、/ifnt/styles.css** 使用「network-first + no-store」策略，確保每次都是最新版本
- 自動清除舊版快取（以 ifnt-cache- 前綴區分版本）
- 啟動時立刻接管（skipWaiting / clients.claim）

版本號：20251031-4
