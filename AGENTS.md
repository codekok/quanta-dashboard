# 廣達游於智教育影響力地圖：Codex 專案規則

本檔適用於整個 repository。Codex 每次修改網站前，都必須先讀取本檔與 `docs/` 下的資料規則。

## 專案目標

- 維護「廣達游於智教育影響力地圖」網站。
- 保留廣達《游於智》計畫與廣達游智盃兩套資料的既有統計口徑。
- 每次更新都先完成資料檢查與預覽，取得使用者明確同意後才發布。

## 必讀檔案

1. `docs/SCHOOL_NAME_RULES.md`
2. `docs/DATA_UPDATE_SOP.md`
3. `public/data/competition.json`
4. `public/data/participation.json`
5. `public/data/denominators.json`

## 不可違反的規則

- 不可直接覆蓋或刪除歷史資料；新資料應合併進既有紀錄。
- 同一屆、同一學校只保留一筆；跨屆紀錄以穩定的 `schoolKey` 串接。
- 顯示名稱與 `schoolKey` 是不同用途；不得只因縮寫不同就任意改動識別鍵。
- 大學附設實驗學校顯示為「附設實驗小學」。
- 只有「國民小學」縮寫為「國小」；原名為「小學」「小學部」者保持原樣。
- 「國中小」統一顯示為「國民中小學」。
- 一般校名不加縣市；大學附設學校保留完整正式名稱。
- 臺南市東區／永康區的博愛國小與勝利國小必須保留行政區，避免同名誤合併。
- 越南胡志明市臺灣學校歸類為「海外－越南」，不得列入彰化縣。
- 不得讀取與本次更新無關的附件。

## 每次更新流程

1. 先說明將更新哪些資料、哪些內容不會動。
2. 比對新舊資料，列出新增、修正、合併、疑似重複與無法判斷項目。
3. 有同名不同校、跨縣市或正式校名不明時，停止並請使用者確認，不得自行猜測。
4. 依 `docs/DATA_UPDATE_SOP.md` 更新資料與網站。
5. 執行：

   ```bash
   npm run data:normalize
   npm run data:audit
   npm run lint
   ```

6. 檢查桌機與手機版，至少測試篩選、搜尋、分頁、學校跨屆紀錄與地圖點選。
7. 回報統計變化及原因，先提供可檢查版本。
8. 只有收到「同意發布」後才可發布。

## 正式網站與 GitHub Pages

- GitHub Pages 正式網址：`https://codekok.github.io/quanta-dashboard/`。
- GitHub Pages 目前由 `main` 分支根目錄提供；根目錄 `index.html` 必須是完整靜態網站，不得改回轉址頁。
- 原始碼或資料更新並獲得發布同意後，執行 `npm run build:pages`，再將 `out/` 內的靜態成果同步至 repository 根目錄。
- 必須保留根目錄 `.nojekyll`，並確認所有資源使用 `/quanta-dashboard/` 子路徑。
- GitHub Actions 會在原始碼提交後自動重建並提交 GitHub Pages 靜態成果；若自動流程失敗，不得宣稱網站已更新。
- `codingkok.chatgpt.site` 版本可作為預覽或備援，但不得作為 GitHub Pages 網址的轉址目標。

## 完成條件

- 資料檢查與 Lint 通過。
- 統計總數、地區數與校次變化均有合理解釋。
- 校名規則抽查通過，搜尋結果未拆分同校或誤合併不同校。
- 桌機與手機主要功能可正常使用。
- GitHub Pages 靜態建置通過，且正式網址不再轉址。
- 已留下本次更新摘要，並等待或取得發布授權。
