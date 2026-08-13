/**
 * Import the 2026-08-13 provisional 115-school-year county-partnership list.
 *
 * Source workbook is retained at data/source/2026-08-13_115學年度游於智學校名單.xlsx.
 * The workbook's Q/R labels are presentation columns only; every listed school
 * is one 115-school-year 游於智 county-partnership participation record.
 */
import fs from "node:fs";
import zlib from "node:zlib";

const workbookPath = new URL("../data/source/2026-08-13_115學年度游於智學校名單.xlsx", import.meta.url);
const participationPath = new URL("../public/data/participation.json", import.meta.url);
const YEAR = 115;
const PROGRAM = "縣市合作";
const SOURCE = "基金會提供115學年度暫定名單（2026-08-13）";

const cities = ["臺北市", "新北市", "桃園市", "臺中市", "臺南市", "高雄市", "基隆市", "新竹市", "嘉義市", "彰化縣", "雲林縣", "新竹縣", "苗栗縣", "花蓮縣", "屏東縣", "南投縣", "宜蘭縣", "臺東縣", "嘉義縣"];
const shortSchoolOverrides = new Map([
  ["彰化縣|草港國小", { district: "鹿港鎮" }],
  ["彰化縣|大榮國小", { district: "和美鎮" }],
  ["彰化縣|好修國小", { district: "埔鹽鄉" }],
  ["彰化縣|和美高中國中部", { district: "和美鎮", division: "國中部", type: "國中", coverage: "國中", school: "和美高中" }],
  ["雲林縣|宜梧國中", { district: "口湖鄉", division: "國中", type: "國中", coverage: "國中" }],
  ["雲林縣|正心高中附設國中部", { district: "斗六市", division: "國中部", type: "國中", coverage: "國中", school: "正心高中" }],
  ["雲林縣|樟湖生態國中小", { district: "古坑鄉", division: "國中小合設", type: "國小", coverage: "國小", school: "樟湖生態國民中小學" }],
  ["雲林縣|豐安國小", { district: "麥寮鄉" }],
  ["雲林縣|廉使國小", { district: "虎尾鎮" }],
  ["雲林縣|石榴國小", { district: "斗六市" }],
  ["雲林縣|建華國小", { district: "斗六市" }],
  ["新北市|光仁高級中學國中部", { district: "板橋區", division: "國中部", type: "國中", coverage: "國中", school: "光仁高中" }],
  ["|國立臺東大學附設實驗國民小學", { city: "臺東縣", district: "臺東市", division: "國小", type: "國小", coverage: "國小", school: "國立臺東大學附設實驗小學" }],
  ["|二信學校財團法人基隆市二信高級中學國中部", { city: "基隆市", district: "信義區", division: "國中部", type: "國中", coverage: "國中", school: "二信高中" }],
  ["臺中市|臺中市立大道國民中學", { district: "西屯區", division: "國中", type: "國中", coverage: "國中", school: "大道國中" }],
  ["桃園市|桃園市立平興國民中學", { district: "平鎮區", division: "國中", type: "國中", coverage: "國中", school: "平興國中" }],
  ["臺北市|臺北市國語實驗國民小學", { district: "中正區", division: "國小", type: "國小", coverage: "國小", school: "國語實小" }],
  ["新竹市|新竹市立育賢國民中學", { district: "東區", division: "國中", type: "國中", coverage: "國中", school: "育賢國中" }],
  ["高雄市|高雄市立五福國民中學", { district: "苓雅區", division: "國中", type: "國中", coverage: "國中", school: "五福國中" }],
  ["臺中市|臺中市立大業國民中學", { district: "南屯區", division: "國中", type: "國中", coverage: "國中", school: "大業國中" }],
  ["高雄市|高雄市立大義國民中學", { district: "左營區", division: "國中", type: "國中", coverage: "國中", school: "大義國中" }],
  ["屏東縣|屏東縣立滿州國民中學", { district: "滿州鄉", division: "國中", type: "國中", coverage: "國中", school: "滿州國中" }],
  ["臺南市|臺南市立南化國民中學", { district: "南化區", division: "國中", type: "國中", coverage: "國中", school: "南化國中" }],
  ["南投縣|南投縣立延和國民中學", { district: "南投市", division: "國中", type: "國中", coverage: "國中", school: "延和國中" }],
  ["嘉義縣|嘉義縣立民和國民中學", { district: "番路鄉", division: "國中", type: "國中", coverage: "國中", school: "民和國中" }],
  ["桃園市|桃園市立東興國民中學", { district: "中壢區", division: "國中", type: "國中", coverage: "國中", school: "東興國中" }],
]);

function readZipEntry(zip, name) {
  const signature = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
  let offset = 0;
  while (offset < zip.length) {
    const index = zip.indexOf(signature, offset);
    if (index < 0) break;
    const flags = zip.readUInt16LE(index + 6);
    const method = zip.readUInt16LE(index + 8);
    const compressedSize = zip.readUInt32LE(index + 18);
    const nameLength = zip.readUInt16LE(index + 26);
    const extraLength = zip.readUInt16LE(index + 28);
    const entryName = zip.subarray(index + 30, index + 30 + nameLength).toString("utf8");
    const start = index + 30 + nameLength + extraLength;
    if (entryName === name) {
      const content = zip.subarray(start, start + compressedSize);
      if (flags & 0x08) throw new Error(`Unsupported data descriptor in ${name}`);
      return method === 0 ? content : zlib.inflateRawSync(content);
    }
    offset = start + compressedSize;
  }
  throw new Error(`Workbook entry not found: ${name}`);
}

function decodeXml(value) {
  return value.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&#39;", "'");
}

function readWorkbookRecords() {
  const zip = fs.readFileSync(workbookPath);
  const stringsXml = readZipEntry(zip, "xl/sharedStrings.xml").toString("utf8");
  const strings = [...stringsXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map(([, item]) => decodeXml([...item.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(([, text]) => text).join("")));
  const sheetXml = readZipEntry(zip, "xl/worksheets/sheet1.xml").toString("utf8");
  const rows = new Map();
  for (const [, rowNumber, cells] of sheetXml.matchAll(/<row r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    const values = {};
    for (const [, reference, attributes, raw] of cells.matchAll(/<c r="([A-Z]+)\d+"([^>]*)>(?:<v>([^<]*)<\/v>)?<\/c>/g)) {
      values[reference] = /\bt="s"/.test(attributes) ? strings[Number(raw)] : raw ?? "";
    }
    rows.set(Number(rowNumber), values);
  }
  const records = [];
  const add = (city, originalName) => {
    if (originalName) records.push({ city, originalName: originalName.trim() });
  };
  for (let row = 2; row <= 45; row += 1) {
    const values = rows.get(row) ?? {};
    add(values.B, values.C); // 彰化縣縣市合作
    add(values.F, values.G); // 雲林縣（普及欄，方案由使用者確認為縣市合作）
    add(values.I, values.J); // 雲林縣（精進欄，方案由使用者確認為縣市合作）
    add(values.M, values.O); // 新北市縣市合作
    add("", values.Q); // 全國甄選 Q/R 是版面欄，不代表游智盃或方案
    add("", values.R);
  }
  return records;
}

function cityFromName(name) {
  return cities.find((city) => name.startsWith(city)) ?? "";
}

function displayName(name) {
  let value = name.replaceAll("台", "臺").trim();
  const city = cityFromName(value);
  if (city) value = value.slice(city.length);
  value = value.replace(/^(?:[\u4e00-\u9fff]{1,5}(?:區|鄉|鎮|市))/, "");
  value = value.replace(/^立(?=\S)/, "");
  value = value.replaceAll("國民中小學", "國民中小學").replaceAll("國民小學", "國小");
  if (value.includes("高中") && value.endsWith("國中部")) value = value.replace(/附設?國中部$/, "");
  return value;
}

function matchingName(name) {
  return displayName(name)
    .replaceAll("縣立", "")
    .replaceAll("市立", "")
    .replaceAll("私立", "")
    .replaceAll("高級中學", "高中")
    .replaceAll("附設", "")
    .replaceAll("國民中小學", "國中小");
}

function districtFromName(name, city) {
  if (!city || !name.startsWith(city)) return "";
  const match = name.slice(city.length).match(/^([\u4e00-\u9fff]{1,5}(?:區|鄉|鎮|市))/);
  return match?.[1] ?? "";
}

function inferredProfile(name) {
  if (name.includes("國中小")) return { division: "國中小合設", type: "國小", coverage: "國小" };
  if (name.includes("國中")) return { division: name.includes("國中部") ? "國中部" : "國中", type: "國中", coverage: "國中" };
  return { division: "國小", type: "國小", coverage: "國小" };
}

const existing = JSON.parse(fs.readFileSync(participationPath, "utf8"));
const existingByName = new Map();
for (const row of existing) {
  for (const name of [row.school, row.originalName]) {
    const key = `${row.city}|${matchingName(name)}`;
    if (!existingByName.has(key)) existingByName.set(key, row);
  }
}

const newRows = new Map();
const unresolvedDistricts = [];
for (const sourceRow of readWorkbookRecords()) {
  const sourceCity = sourceRow.city?.replaceAll("台", "臺") || cityFromName(sourceRow.originalName);
  const override = shortSchoolOverrides.get(`${sourceCity}|${sourceRow.originalName}`) ?? shortSchoolOverrides.get(`|${sourceRow.originalName}`) ?? {};
  const city = override.city ?? sourceCity;
  if (!city) throw new Error(`Cannot determine city: ${sourceRow.originalName}`);
  const historical = existingByName.get(`${city}|${matchingName(sourceRow.originalName)}`);
  const profile = { ...inferredProfile(sourceRow.originalName), ...override };
  const school = override.school ?? historical?.school ?? displayName(sourceRow.originalName);
  const district = override.district ?? historical?.district ?? districtFromName(sourceRow.originalName, city);
  if (!district) {
    unresolvedDistricts.push(`${city}／${sourceRow.originalName}`);
    continue;
  }
  const key = historical?.key?.replace(/｜\d+｜[^｜]+$/, `｜${YEAR}｜${PROGRAM}`) ?? `${city}｜${school}｜${YEAR}｜${PROGRAM}`;
  const row = {
    year: YEAR,
    city,
    district,
    originalName: sourceRow.originalName,
    school,
    division: profile.division,
    program: PROGRAM,
    status: "現存",
    coverage: profile.coverage,
    identity: "正式學校",
    type: profile.type,
    key,
    source: SOURCE,
    provisional: true,
  };
  const dedupeKey = `${row.city}|${row.school}|${row.year}|${row.program}`;
  if (!newRows.has(dedupeKey)) newRows.set(dedupeKey, row);
}

if (unresolvedDistricts.length) {
  throw new Error(`Cannot determine districts:\n${unresolvedDistricts.join("\n")}`);
}

const retained = existing.filter((row) => row.year !== YEAR || row.program !== PROGRAM);
const merged = [...retained, ...newRows.values()]
  .sort((a, b) => `${a.year}|${a.city}|${a.district}|${a.school}|${a.program}`.localeCompare(`${b.year}|${b.city}|${b.district}|${b.school}|${b.program}`, "zh-TW"));
fs.writeFileSync(participationPath, `${JSON.stringify(merged, null, 2)}\n`);
console.log(`115學年度縣市合作匯入完成：${newRows.size} 校次；資料總計 ${merged.length} 筆。`);
