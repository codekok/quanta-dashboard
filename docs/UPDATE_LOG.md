# 更新紀錄

## 2026-08-13｜新增 115 學年度《游於智》縣市合作資料

## 2026-08-13｜更新網站文案與廣達游智盃顯示

- 首頁主標與計畫介紹改用使用者確認的新文案。
- 「游智盃參與紀錄」改為「廣達游智盃參與紀錄」；前台僅顯示資料更新日期 `2026-08-12`，不顯示統計規則備註。
- 游智盃資料維持 623 所學校、1,208 校次、24 個參與地區；同屆同校合併、跨屆校名鍵、臺南市同名校及海外－越南規則均維持不變。
- 完成資料稽核、Lint、TypeScript、GitHub Pages 建置與正式網址檢查；正式網址直接顯示 GitHub Pages，無轉址。
- 發布提交：[eda1043](https://github.com/codekok/quanta-dashboard/commit/eda10434abcd1c7a24bc095f7fa0dbea275cc089)；GitHub Actions 全部成功。

- 補入臺北市金華國小、民生國小、宸恩實驗教育機構、長華國際蒙特梭利實驗教育機構，嘉義市崇文國小及金門縣上岐國小共 6 筆 115 學年度紀錄。
- 匯入基金會提供的 115 學年度學校名單，保留既有 107–114 學年度歷史紀錄。
- 新增 128 校次；《游於智》資料由 903 筆增至 1,031 筆，不重複參與學校／單位由 438 增至 487，參與地區由 20 增至 21。
- 新增「縣市合作」方案；附件中同學年度、同校、同方案的重複列示已合併，未刪除歷史參與紀錄。
- 115 學年度新增紀錄包含 111 筆國小與 17 筆國中資料；國立臺東大學附設實驗國民小學歸於臺東縣。
- 完成資料稽核、Lint、TypeScript 與 GitHub Pages 靜態建置；正式網站僅呈現資料期間，未顯示附件來源或暫定資料文字。
- 發布提交：[a7c47df](https://github.com/codekok/quanta-dashboard/commit/a7c47df293f32de0da130b1a8c575098bc75dcea)；GitHub Pages 靜態產物提交：[0cddbbd](https://github.com/codekok/quanta-dashboard/commit/0cddbbd052fd6be25ea2ca9c8dd813248fd93a34)。
- GitHub Actions「pages build and deployment」、「Publish GitHub Pages」及「Validate dashboard」皆成功；已實測正式網址直接顯示、非轉址，並載入 1,031 筆資料。

## 2026-08-12｜改為真正的 GitHub Pages 網站

- 移除根目錄 `index.html` 的外部網址轉址，改為完整靜態網站。
- 正式網址維持 `https://codekok.github.io/quanta-dashboard/`。
- 新增 `/quanta-dashboard/` 子路徑相容設定，確保資料、Logo、樣式與互動程式可正常載入。
- 新增 GitHub Pages 自動建置與根目錄發布流程；之後原始碼或資料更新可由 Codex 依同一流程管理。
- 資料稽核維持：623 所學校、1,208 校次、24 個參與地區。

## 2026-08-12｜匯入新版教育影響力地圖

- 以目前已發布的「廣達游於智教育影響力地圖」取代舊版單頁網站。
- 匯入廣達《游於智》計畫與廣達游智盃資料、互動功能及響應式版面。
- 加入 `AGENTS.md`、校名規則、資料更新 SOP、Codex 固定更新指令及自動檢查流程。
- 移除舊版 `all_schools_data.csv`；新版資料與 Logo 分別位於 `public/data/` 與 `public/logo.png`。
- 廣達游智盃驗收基準：623 所學校、1,208 校次、24 個參與地區。
