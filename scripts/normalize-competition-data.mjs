import fs from "node:fs";

const dataPath = new URL("../public/data/competition.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const universityExperimentalSchoolNames = new Map([
  ["國立嘉義大學附設實驗國小", "國立嘉義大學附設實驗小學"],
  ["國立嘉義大學附設實驗國民小學", "國立嘉義大學附設實驗小學"],
  ["國立嘉義大學附設實驗小學", "國立嘉義大學附設實驗小學"],
  ["國立東華大學附設實驗國小", "國立東華大學附設實驗小學"],
  ["國立東華大學附設實驗國民小學", "國立東華大學附設實驗小學"],
  ["國立東華大學附設實驗小學", "國立東華大學附設實驗小學"],
  ["國立臺北教育大學附設實驗國小", "國立臺北教育大學附設實驗小學"],
  ["國立臺北教育大學附設實驗國民小學", "國立臺北教育大學附設實驗小學"],
  ["國立臺北教育大學附設實驗小學", "國立臺北教育大學附設實驗小學"],
  ["國立臺南大學附設實驗國小", "國立臺南大學附設實驗小學"],
  ["國立臺南大學附設實驗國民小學", "國立臺南大學附設實驗小學"],
  ["國立臺南大學附設實驗小學", "國立臺南大學附設實驗小學"],
  ["臺北市立大學附設實驗國小", "臺北市立大學附設實驗小學"],
  ["臺北市立大學附設實驗國民小學", "臺北市立大學附設實驗小學"],
  ["臺北市立大學附設實驗小學", "臺北市立大學附設實驗小學"],
]);
const universityAffiliatedPattern = /大學.*(?:附設|附屬)/;
const districtPrefixes = [
  "中山區", "屏東市", "芳苑鄉", "三峽區", "三重區", "中和區", "新店區", "板橋區",
  "竹北市", "復興區", "北區", "北屯區", "南屯區", "外埔區", "東區", "西區",
  "霧峰區", "北投區", "萬華區", "中西區", "永康區", "斗南鎮", "前鎮區", "左營區",
  "鳳山區", "金城鎮", "南港區", "大安區", "松山區", "二林鎮",
];

const schoolKeyAliases = new Map([
  ["嘉義縣|嘉義縣和睦國小", "嘉義縣|和睦國小"],
  ["嘉義縣|嘉義縣和順國小", "嘉義縣|和順國小"],
  ["嘉義縣|嘉義縣義竹國小", "嘉義縣|義竹國小"],
  ["屏東縣|屏東縣立復興國小", "屏東縣|復興國小"],
  ["彰化縣|彰化縣二林鎮廣興國小", "彰化縣|廣興國小"],
  ["臺北市|臺北市南港區舊莊國小", "臺北市|舊莊國小"],
  ["高雄市|左營區新民國小", "高雄市|新民國小"],
  ["高雄市|左營區勝利國小", "高雄市|勝利國小"],
  ["雲林縣|斗南鎮斗南國小", "雲林縣|斗南國小"],
  ["金門縣|金城鎮中正國小", "金門縣|中正國小"],
  ["臺北市|萬華區福星國小", "臺北市|福星國小"],
  ["臺北市|臺北市松山區民權國小", "臺北市|民權國小"],
  ["臺北市|臺北市東門國小", "臺北市|東門國小"],
  ["臺北市|北投區明德國小", "臺北市|明德國小"],
  ["臺北市|臺北市大安區仁愛國小", "臺北市|仁愛國小"],
  ["臺中市|東區樂業國小", "臺中市|樂業國小"],
  ["臺中市|北屯區東光國小", "臺中市|東光國小"],
  ["臺中市|南屯區文山國小", "臺中市|文山國小"],
  ["臺中市|北區太平國小", "臺中市|太平國小"],
  ["新北市|三重區碧華國小", "新北市|碧華國小"],
  ["新北市|三重區忠義國小", "新北市|忠義國小"],
  ["新北市|新北市三重區五華國小", "新北市|五華國小"],
  ["新北市|板橋區中山國小", "新北市|中山國小"],
  ["屏東縣|屏東市民生國小", "屏東縣|民生國小"],
  ["基隆市|中山區中華國小", "基隆市|中華國小"],
]);

function normalizeSchoolDisplay(row) {
  let name = row.schoolKey.split("|").slice(1).join("|") || row.school;

  if (name === "立桃子腳國中小") name = "桃子腳國民中小學";
  name = name.replaceAll("國中小", "國民中小學");
  const universityExperimentalName = universityExperimentalSchoolNames.get(name);
  if (universityExperimentalName) return universityExperimentalName;

  if (row.schoolKey === "臺南市|臺南市永康區博愛國民小學") return "永康區博愛國小";
  if (row.schoolKey === "臺南市|臺南市東區博愛國民小學") return "東區博愛國小";
  if (row.schoolKey === "臺南市|東區勝利國小") return "東區勝利國小";
  if (row.schoolKey === "臺南市|永康區勝利國小") return "永康區勝利國小";

  if (!universityAffiliatedPattern.test(name) && name.startsWith(row.county)) {
    name = name.slice(row.county.length);
    name = name.replace(/^立(?=\S)/, "");
  }

  if (!universityAffiliatedPattern.test(name)) {
    const districtPrefix = districtPrefixes.find((prefix) => name.startsWith(prefix));
    if (districtPrefix) name = name.slice(districtPrefix.length);
  }

  // Only the formal term 國民小學 is abbreviated. Existing 小學／小學部 names
  // remain unchanged, and university experimental schools are handled above.
  return name.replaceAll("國民小學", "國小");
}

for (const row of data.records) {
  if (row.school === "越南胡志明市臺灣學校" || row.originalSchool === "胡志明市台灣學校") {
    row.county = "海外－越南";
    row.school = "越南胡志明市臺灣學校";
    row.schoolKey = "海外－越南|越南胡志明市臺灣學校";
  }

  if (row.county === "海外-馬來西亞" || row.county === "海外－馬來西亞") {
    row.county = "海外－馬來西亞";
    row.schoolKey = "海外－馬來西亞|吉隆坡臺灣學校";
  }

  row.schoolKey = schoolKeyAliases.get(row.schoolKey) ?? row.schoolKey;
}

const dedupedRecords = new Map();
for (const row of data.records) {
  const recordKey = `${row.editionNo}|${row.schoolKey}`;
  const current = dedupedRecords.get(recordKey);
  if (!current) {
    dedupedRecords.set(recordKey, row);
    continue;
  }
  current.award = current.award || row.award;
}
data.records = [...dedupedRecords.values()];

for (const row of data.records) {
  if (row.county !== "臺南市") continue;

  if (row.schoolKey === "臺南市|博愛國小") {
    row.school = "臺南市永康區博愛國民小學";
    row.schoolKey = "臺南市|臺南市永康區博愛國民小學";
  }

  if (row.schoolKey === "臺南市|東區博愛國小") {
    row.school = "臺南市東區博愛國民小學";
    row.schoolKey = "臺南市|臺南市東區博愛國民小學";
  }
}

const canonicalNames = new Map();
for (const row of data.records) {
  const current = canonicalNames.get(row.schoolKey) ?? "";
  if (row.school.length > current.length) canonicalNames.set(row.schoolKey, row.school);
}
for (const row of data.records) {
  row.school = normalizeSchoolDisplay({ ...row, school: canonicalNames.get(row.schoolKey) });
}

const schoolProfiles = new Map();
for (const row of data.records) {
  const profile = schoolProfiles.get(row.schoolKey) ?? {
    schoolKey: row.schoolKey,
    county: row.county,
    school: row.school,
    editions: [],
    awardEditions: [],
  };
  if (!profile.editions.includes(row.editionNo)) profile.editions.push(row.editionNo);
  if (row.award && !profile.awardEditions.includes(row.editionNo)) profile.awardEditions.push(row.editionNo);
  schoolProfiles.set(row.schoolKey, profile);
}

data.schools = [...schoolProfiles.values()]
  .map((profile) => ({
    ...profile,
    editions: profile.editions.sort((a, b) => a - b),
    awardEditions: profile.awardEditions.sort((a, b) => a - b),
  }))
  .sort((a, b) => `${a.county}|${a.school}`.localeCompare(`${b.county}|${b.school}`, "zh-TW"));

data.editions = [...new Set(data.records.map((row) => row.editionNo))]
  .sort((a, b) => a - b)
  .map((editionNo) => {
    const rows = data.records.filter((row) => row.editionNo === editionNo);
    return {
      editionNo,
      edition: rows[0].edition,
      schoolRecords: rows.length,
      schools: new Set(rows.map((row) => row.schoolKey)).size,
      counties: new Set(rows.map((row) => row.county)).size,
      awardSchools: new Set(rows.filter((row) => row.award).map((row) => row.schoolKey)).size,
    };
  });

data.meta.note = "同屆同校已合併；跨屆以校名鍵統一計算；臺南市東區與永康區博愛國小分開統計；越南胡志明市臺灣學校統一列為海外－越南；不分學校類型；原始資料未提供隊伍名稱或編號。";

fs.writeFileSync(dataPath, `${JSON.stringify(data)}\n`);
