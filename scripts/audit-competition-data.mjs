import fs from "node:fs";

const data = JSON.parse(
  fs.readFileSync(new URL("../public/data/competition.json", import.meta.url), "utf8"),
);

const failures = [];
const expectedUniversityNames = new Set([
  "國立嘉義大學附設實驗小學",
  "國立東華大學附設實驗小學",
  "國立臺北教育大學附設實驗小學",
  "國立臺南大學附設實驗小學",
  "臺北市立大學附設實驗小學",
]);

const duplicateRecords = new Map();
for (const row of data.records) {
  const recordKey = `${row.editionNo}|${row.schoolKey}`;
  duplicateRecords.set(recordKey, (duplicateRecords.get(recordKey) ?? 0) + 1);

  if (/大學.*附設實驗國小/.test(row.school)) {
    failures.push(`大學附設學校仍顯示為「附設實驗國小」：${row.school}`);
  }
  if (row.school.includes("國民小學")) {
    failures.push(`一般國民小學尚未縮寫為「國小」：${row.school}`);
  }
}

for (const [recordKey, count] of duplicateRecords) {
  if (count > 1) failures.push(`同屆同校重複 ${count} 筆：${recordKey}`);
}

const presentUniversityNames = new Set(
  data.records
    .map((row) => row.school)
    .filter((school) => expectedUniversityNames.has(school)),
);
for (const school of expectedUniversityNames) {
  if (!presentUniversityNames.has(school)) failures.push(`缺少大學附設學校：${school}`);
}

const profileCount = new Set(data.records.map((row) => row.schoolKey)).size;
if (profileCount !== data.schools.length) {
  failures.push(`學校索引不一致：records=${profileCount}、schools=${data.schools.length}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `資料檢查通過：${data.schools.length} 所學校、${data.records.length} 校次、${new Set(data.records.map((row) => row.county)).size} 個參與地區。`,
);
