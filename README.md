# 廣達游於智教育影響力地圖

本專案維護「廣達游於智教育影響力地圖」，整合：

- 廣達《游於智》計畫 107—114 學年度參與資料
- 廣達游智盃第 1—7 屆學校參與及獲獎歷程
- 縣市影響力、學校搜尋、篩選、分頁與跨屆紀錄

正式網站：<https://quanta-ai-impact-map.codingkok.chatgpt.site>

## 交給 Codex 更新

Codex 開始工作前必須先讀取：

1. `AGENTS.md`
2. `docs/SCHOOL_NAME_RULES.md`
3. `docs/DATA_UPDATE_SOP.md`

可直接使用 `docs/CODEX_UPDATE_PROMPT.md` 中的固定指令。更新原則是先比對資料、回報異常及統計變化、完成測試版，收到使用者明確回覆「同意發布」後才能發布正式網站。

## 主要資料

- `public/data/participation.json`：廣達《游於智》計畫
- `public/data/competition.json`：廣達游智盃
- `public/data/denominators.json`：各縣市學校數與覆蓋率分母

## 本地檢查

需求：Node.js 22.13 以上。

```bash
npm ci
npm run data:normalize
npm run data:audit
npm run lint
npm test
```

## 網站架構

- `app/`：頁面與樣式
- `public/data/`：網站資料
- `scripts/`：校名正規化、資料稽核及建置腳本
- `docs/`：校名規則、更新 SOP 與 Codex 固定指令
- `.openai/hosting.json`：既有網站的發布識別設定，請勿另建新網站或任意更換

## 目前封版統計

- 廣達游智盃：623 所不重複參與學校
- 廣達游智盃：1,208 筆學校參與校次
- 廣達游智盃：24 個參與地區

上述數字是目前資料的驗收基準；日後加入新資料時，必須說明變化原因，不可為維持舊數字而刪除有效紀錄。
