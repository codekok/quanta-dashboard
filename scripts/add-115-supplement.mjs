import fs from "node:fs";

const dataPath = new URL("../public/data/participation.json", import.meta.url);
const removals = [
  { city: "雲林縣", school: "三和國小" },
];
const additions = [
  { city: "臺北市", district: "大安區", originalName: "金華國小", school: "市立金華國小", division: "國小", status: "現存", coverage: "國小", identity: "正式學校", type: "國小" },
  { city: "臺北市", district: "松山區", originalName: "民生國小", school: "市立民生國小", division: "國小", status: "現存", coverage: "國小", identity: "正式學校", type: "國小" },
  { city: "臺北市", district: "大安區", originalName: "宸恩實驗教育機構", school: "宸恩實驗教育機構", division: "", status: "不適用", coverage: "不納入", identity: "非學校型態實驗教育機構", type: "實驗教育機構" },
  { city: "臺北市", district: "松山區", originalName: "長華國際蒙特梭利實驗教育機構", school: "長華國際蒙特梭利實驗教育機構", division: "", status: "不適用", coverage: "不納入", identity: "非學校型態實驗教育機構", type: "實驗教育機構" },
  { city: "嘉義市", district: "東區", originalName: "崇文國小", school: "市立崇文國小", division: "國小", status: "現存", coverage: "國小", identity: "正式學校", type: "國小" },
  { city: "金門縣", district: "烈嶼鄉", originalName: "上岐國小", school: "縣立上岐國小", division: "國小", status: "現存", coverage: "國小", identity: "正式學校", type: "國小" },
  { city: "宜蘭縣", district: "羅東鎮", originalName: "成功國小", school: "縣立成功國小", division: "國小", program: "策略聯盟", status: "現存", coverage: "國小", identity: "正式學校", type: "國小" },
  { city: "宜蘭縣", district: "員山鄉", originalName: "同樂國小", school: "縣立同樂國小", division: "國小", program: "策略聯盟", status: "現存", coverage: "國小", identity: "正式學校", type: "國小" },
  { city: "宜蘭縣", district: "宜蘭市", originalName: "南屏國小", school: "縣立南屏國小", division: "國小", program: "策略聯盟", status: "現存", coverage: "國小", identity: "正式學校", type: "國小" },
  { city: "宜蘭縣", district: "蘇澳鎮", originalName: "文化國中", school: "縣立文化國中", division: "國中", program: "策略聯盟", status: "現存", coverage: "國中", identity: "正式學校", type: "國中" },
];

const year = 115;
const defaultProgram = "縣市合作";
const rows = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const retained = rows.filter((row) => {
  const remove = row.year === year && removals.some((item) => row.city === item.city && row.school === item.school);
  const replace = additions.some((item) => row.year === year && row.city === item.city && row.school === item.school);
  return !remove && !replace;
});
const merged = [...retained, ...additions.map((item) => ({
  year, program: item.program ?? defaultProgram, key: `${item.city}｜${item.school}｜${year}｜${item.program ?? defaultProgram}`,
  source: "基金會提供115學年度暫定名單（2026-08-13）", provisional: true, ...item,
}))].sort((a, b) => `${a.year}|${a.city}|${a.district}|${a.school}|${a.program}`.localeCompare(`${b.year}|${b.city}|${b.district}|${b.school}|${b.program}`, "zh-TW"));
fs.writeFileSync(dataPath, `${JSON.stringify(merged, null, 2)}\n`);
console.log(`115 學年度補充完成：新增或更新 ${additions.length} 筆；資料總計 ${merged.length} 筆。`);
