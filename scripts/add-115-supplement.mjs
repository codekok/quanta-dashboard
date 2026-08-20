import fs from "node:fs";

const dataPath = new URL("../public/data/participation.json", import.meta.url);
const removals = [
  { city: "雲林縣", school: "三和國小" },
  { city: "臺南市", school: "紀安國小" },
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
const strategySchools = new Set([
  "宜蘭縣|成功國小",
  "宜蘭縣|同樂國小",
  "宜蘭縣|南屏國小",
  "宜蘭縣|文化國中",
]);
const countyPartnershipSchools = new Set([
  "彰化縣|大村國小", "彰化縣|村上國小", "彰化縣|文祥國小", "彰化縣|新生國小", "彰化縣|南興國小", "彰化縣|興華國小", "彰化縣|文開國小", "彰化縣|福德國小", "彰化縣|花壇國小", "彰化縣|陝西國小", "彰化縣|建新國小", "彰化縣|饒明國小", "彰化縣|草港國小", "彰化縣|線西國小", "彰化縣|平和國小", "彰化縣|和仁國小", "彰化縣|新庄國小", "彰化縣|大園國小", "彰化縣|湖北國小", "彰化縣|湖東國小", "彰化縣|育新國小", "彰化縣|埔心國小", "彰化縣|日新國小", "彰化縣|石牌國小", "彰化縣|大興國小", "彰化縣|二林國小", "彰化縣|鹿東國小", "彰化縣|大榮國小", "彰化縣|舊社國小", "彰化縣|明禮國小", "彰化縣|員林國小", "彰化縣|媽厝國小", "彰化縣|鳳霞國小", "彰化縣|員東國小", "彰化縣|美豐國小", "彰化縣|土庫國小", "彰化縣|螺陽國小", "彰化縣|舊館國小", "彰化縣|萬興國小", "彰化縣|竹塘國小", "彰化縣|好修國小", "彰化縣|永興國小", "彰化縣|溪湖國中", "彰化縣|和美高中國中部",
  "雲林縣|宜梧國中", "雲林縣|林內國小", "雲林縣|正心高中附設國中部", "雲林縣|樟湖生態國中小", "雲林縣|建華國小", "雲林縣|鎮西國小", "雲林縣|豐安國小", "雲林縣|廉使國小", "雲林縣|石榴國小",
  "新北市|光仁高級中學國中部", "新北市|莒光國小", "新北市|後埔國小", "新北市|中山國小", "新北市|板橋國小", "新北市|新莊國小", "新北市|中港國小", "新北市|麗林國小", "新北市|五華國小", "新北市|正義國小", "新北市|明志國小", "新北市|同榮國小", "新北市|光復國小", "新北市|德音國小", "新北市|更寮國小",
]);
const rows = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const retained = rows.filter((row) => {
  const remove = row.year === year && removals.some((item) => row.city === item.city && row.school === item.school);
  const replace = additions.some((item) => row.year === year && row.city === item.city && row.school === item.school);
  return !remove && !replace;
});
let merged = [...retained, ...additions.map((item) => ({
  year, program: item.program ?? defaultProgram, key: `${item.city}｜${item.school}｜${year}｜${item.program ?? defaultProgram}`,
  source: "基金會提供115學年度暫定名單（2026-08-13）", provisional: true, ...item,
}))].sort((a, b) => `${a.year}|${a.city}|${a.district}|${a.school}|${a.program}`.localeCompare(`${b.year}|${b.city}|${b.district}|${b.school}|${b.program}`, "zh-TW"));
merged = merged.map((row) => {
  if (row.year !== year) return row;
  const sourceName = row.originalName || row.school;
  const identity = `${row.city}|${sourceName}`;
  const program = strategySchools.has(identity)
    ? "策略聯盟"
    : countyPartnershipSchools.has(identity)
      ? "縣市合作"
      : "全國甄選";
  return { ...row, program, key: `${row.city}｜${row.school}｜${year}｜${program}` };
});
fs.writeFileSync(dataPath, `${JSON.stringify(merged, null, 2)}\n`);
console.log(`115 學年度補充完成：新增或更新 ${additions.length} 筆；資料總計 ${merged.length} 筆。`);
