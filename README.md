# EJ的研習講義 (GitHub Pages 靜態版)

專為研習課程講師量身打造的實戰講課推進系統。具備免主機伺服器、零資安維護負擔、CDN 秒開、高穩定度等特色。

---

## 🌟 系統特色與講師現場推進利器

1. **一鍵複製（Copy to Clipboard）**：每張提示詞卡片獨立配置複製按鈕，點擊即複製純文字，並提供 Toast 視覺反饋；具備 HTTPS 與 HTTP 雙重容錯機制。
2. **變數佔位符自動螢光高亮**：前端自動偵測 `【...】` 或 `[...]` 中文引導佔位符，並標記螢光底色，學員一眼即可識別需替換的變數。
3. **課堂投影專用 QR Code 彈窗**：點擊右上角「投影 QR Code」，自動調用 API 生成超大高清晰二維碼，學員手機／平板即掃即進。
4. **講師聚光燈模式（Spotlight Focus）**：點擊卡片右上角「聚焦」，畫面自動滾動並突顯該卡片，避免學員分心偷看下一題。
5. **課堂實作倒數計時器（Practice Timer）**：卡片直接附帶「5分實作／6分實作」快捷按鈕，啟動後浮動顯示倒數，時間結束時自動發出提示音與通知。
6. **即時分類過濾與全文搜尋**：支援依「常用網站、教案備課、評量命題、學生學習單、行政減負」即時過濾，並可全欄位全文搜尋。
7. **護眼投影模式（Dark / Light Mode）**：一鍵切換深色模式，在暗室或投影機幕布前不刺眼。

---

## 🚀 部署至 GitHub Pages 步驟（3分鐘完成）

### 步驟 1：建立 GitHub Repository
1. 登入您的 GitHub 帳號，點擊右上角 **New repository**。
2. Repository name 可命名為 `workshop-guide` 或 `course-guide`。
3. 設為 **Public**，點擊 **Create repository**。

### 步驟 2：上傳本專案檔案
將本資料夾內的所有檔案與資料夾上傳至該 Repository 的根目錄：
* `index.html`（前台入口首頁）
* `admin.html`（離線備課小工具）
* `css/style.css`（核心樣式）
* `js/app.js`（核心互動邏輯）
* `data/workshops.json`（研習場次與教材資料）

### 步驟 3：啟用 GitHub Pages
1. 在 GitHub Repository 頁面點擊 **Settings**（設定）。
2. 在左側選單點擊 **Pages**。
3. 在 **Build and deployment** 下方的 **Branch** 選擇 `main` 分支，資料夾選擇 `/ (root)`，點擊 **Save**。
4. 等待約 1 分鐘，GitHub 會產生專屬網址：
   `https://<您的帳號>.github.io/<repository名稱>/`

---

## 📝 平日備課與更新場次方式

本系統採用「資料與介面分離」設計，更新教材不需要寫任何程式碼：

### 方法 A：使用內建「備課小工具」（最直覺）
1. 在瀏覽器打開 `admin.html`（本機雙擊開啟即可）。
2. 在表單中輸入新的研習日期、主題、分類與提示詞。
3. 點擊「下載目前 workshops.json 檔案」。
4. 將下載的檔案覆蓋至 `data/workshops.json`，並推送到 GitHub 即可。

### 方法 B：直接編輯 `data/workshops.json`
打開 `data/workshops.json`，複製一段既有場次物件，修改裡面的 `date`、`title` 與 `resources` 提示詞內容即可。
