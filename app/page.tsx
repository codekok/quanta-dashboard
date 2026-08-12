"use client";

import { useEffect, useMemo, useState } from "react";
import Taiwan from "@svg-maps/taiwan";
import Image from "next/image";
import {
  ArrowDown,
  BookOpenCheck,
  ChevronDown,
  MapPinned,
  RefreshCcw,
  Search,
  Sparkles,
  UsersRound,
  Wrench,
} from "lucide-react";

type RecordRow = {
  year: number;
  city: string;
  district: string;
  originalName: string;
  school: string;
  division: string;
  program: string;
  status: string;
  coverage: string;
  identity: string;
  type: string;
  key: string;
};

type Denominator = {
  縣市: string;
  覆蓋率分類: "國小" | "國中";
  分母校數: number;
  資料學年度: string;
};

type MapMode = "units" | "elementary" | "junior";
type CompetitionRecord = { edition: string; editionNo: number; county: string; school: string; originalSchool: string; schoolKey: string; award: boolean };
type CompetitionData = { records: CompetitionRecord[]; editions: { editionNo: number; edition: string; schoolRecords: number; schools: number; counties: number; awardSchools: number }[]; schools: { county: string; school: string; editions: number[]; awardEditions: number[] }[]; meta: { note: string; updated: string } };
type CompetitionSchool = { schoolKey: string; county: string; school: string; editions: number[]; awardEditions: number[] };

const cityByMapId: Record<string, string> = {
  "changhua-county": "彰化縣",
  "chiayi-city": "嘉義市",
  "chiayi-county": "嘉義縣",
  "hualien-county": "花蓮縣",
  "hsinchu-city": "新竹市",
  "hsinchu-county": "新竹縣",
  "kaohsiung-city": "高雄市",
  "keelung-city": "基隆市",
  "kinmen-county": "金門縣",
  "lienchiang-county": "連江縣",
  "miaoli-county": "苗栗縣",
  "nantou-county": "南投縣",
  "new-taipei-city": "新北市",
  "penghu-county": "澎湖縣",
  "pingtung-county": "屏東縣",
  "taichung-city": "臺中市",
  "tainan-city": "臺南市",
  "taipei-city": "臺北市",
  "taitung-county": "臺東縣",
  "taoyuan-city": "桃園市",
  "yilan-county": "宜蘭縣",
  "yunlin-county": "雲林縣",
};

const years = [107, 108, 109, 110, 111, 112, 113, 114];
const types = ["國小", "國中", "其他高中", "實驗教育機構"];
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const uniqueUnits = (rows: RecordRow[]) =>
  new Set(rows.map((row) => `${row.city}|${row.school}`));

const formatNumber = (value: number) => value.toLocaleString("zh-TW");
const formatPercent = (value: number) => `${value.toFixed(1)}%`;

function AppSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="filter-field">
      <span>{label}</span>
      <span className="select-wrap">
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {children}
        </select>
        <ChevronDown size={16} aria-hidden="true" />
      </span>
    </label>
  );
}

function MetricCard({ value, label, note }: { value: number; label: string; note: string }) {
  return (
    <article className="metric-card">
      <strong>{formatNumber(value)}</strong>
      <span>{label}</span>
      <small>{note}</small>
    </article>
  );
}

function CompetitionPage({ data }: { data: CompetitionData | null }) {
  const [edition, setEdition] = useState("全部");
  const [county, setCounty] = useState("全部");
  const [query, setQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [schoolPage, setSchoolPage] = useState(1);
  const records = useMemo(() => data?.records ?? [], [data]);
  const schoolProfiles = useMemo(() => {
    const profiles = new Map<string, CompetitionSchool>();
    records.forEach((row) => {
      const existing = profiles.get(row.schoolKey);
      if (!existing) {
        profiles.set(row.schoolKey, {
          schoolKey: row.schoolKey,
          county: row.county,
          school: row.school,
          editions: [row.editionNo],
          awardEditions: row.award ? [row.editionNo] : [],
        });
        return;
      }
      if (row.school.length > existing.school.length) existing.school = row.school;
      if (!existing.editions.includes(row.editionNo)) existing.editions.push(row.editionNo);
      if (row.award && !existing.awardEditions.includes(row.editionNo)) existing.awardEditions.push(row.editionNo);
    });
    return [...profiles.values()].map((profile) => ({
      ...profile,
      editions: profile.editions.sort((a, b) => a - b),
      awardEditions: profile.awardEditions.sort((a, b) => a - b),
    }));
  }, [records]);
  const filtered = records.filter((row) => {
    const q = query.trim().toLocaleLowerCase();
    return (edition === "全部" || row.editionNo === Number(edition)) && (county === "全部" || row.county === county) && (!q || `${row.county} ${row.school} ${row.originalSchool}`.toLocaleLowerCase().includes(q));
  });
  const filteredSchoolKeys = new Set(filtered.map((row) => row.schoolKey));
  const schools = schoolProfiles
    .filter((school) => filteredSchoolKeys.has(school.schoolKey))
    .sort((a, b) =>
      Number(b.awardEditions.length > 0) - Number(a.awardEditions.length > 0) ||
      b.awardEditions.length - a.awardEditions.length ||
      b.editions.length - a.editions.length ||
      a.county.localeCompare(b.county, "zh-TW") ||
      a.school.localeCompare(b.school, "zh-TW"),
    );
  const counties = [...new Set(records.map((r) => r.county))].sort((a, b) => a.localeCompare(b, "zh-TW"));
  const selected = schoolProfiles.find((school) => school.schoolKey === selectedSchool);
  const topCounties = Object.entries(filtered.reduce<Record<string, number>>((acc, row) => { acc[row.county] = (acc[row.county] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const totalSchools = schoolProfiles.length;
  const competitionPageSize = 24;
  const competitionPageCount = Math.max(1, Math.ceil(schools.length / competitionPageSize));
  const currentSchoolPage = Math.min(schoolPage, competitionPageCount);
  const visibleCompetitionSchools = schools.slice(
    (currentSchoolPage - 1) * competitionPageSize,
    currentSchoolPage * competitionPageSize,
  );
  const competitionPageNumbers = Array.from({ length: competitionPageCount }, (_, index) => index + 1)
    .filter((pageNumber) =>
      pageNumber === 1 ||
      pageNumber === competitionPageCount ||
      Math.abs(pageNumber - currentSchoolPage) <= 2,
    );

  return <main className="competition-page">
    <section className="competition-hero"><div><p className="eyebrow"><Sparkles size={20} /> 廣達游智盃 · 參與足跡</p><h1>每一次參加，<br /><em>都是一次把想法做出來的挑戰。</em></h1></div><div className="competition-hero-card"><span>COMPETITION JOURNEY</span><strong>1—7 <b>屆</b></strong><small>游智盃參與紀錄</small></div></section>
    <section className="competition-content"><div className="section-heading split-heading"><div><p className="section-kicker">QUANTA CREATIVE PROGRAMMING CUP</p><h2>看見學校持續參與的足跡</h2></div></div>
      <div className="metrics-section competition-metrics"><MetricCard value={data?.editions.length ?? 0} label="辦理屆次" note="目前整理至第七屆" /><MetricCard value={totalSchools} label="不重複參與學校" note="跨屆只計一次" /><MetricCard value={records.length} label="學校參與校次" note="一校一屆一筆" /><MetricCard value={new Set(records.map((r) => r.county)).size} label="參與地區" note="含臺灣縣市與海外地區" /></div>
      <div className="competition-filters"><label><span>屆次</span><select value={edition} onChange={(e) => { setEdition(e.target.value); setSchoolPage(1); }}><option>全部</option>{data?.editions.map((e) => <option key={e.editionNo} value={e.editionNo}>{e.edition}</option>)}</select></label><label><span>地區</span><select value={county} onChange={(e) => { setCounty(e.target.value); setSchoolPage(1); }}><option>全部</option>{counties.map((c) => <option key={c}>{c}</option>)}</select></label><label className="competition-search"><span>搜尋學校</span><span><Search size={17} /><input value={query} onChange={(e) => { setQuery(e.target.value); setSchoolPage(1); }} placeholder="輸入完整或部分校名" /></span></label><button onClick={() => { setEdition("全部"); setCounty("全部"); setQuery(""); setSchoolPage(1); }}>重設</button></div>
      {query && <div className="competition-search-results"><strong>搜尋結果</strong><span>找到 {schools.length} 所學校</span>{schools.slice(0, 8).map((s) => <button key={s.schoolKey} onClick={() => setSelectedSchool(s.schoolKey)}>{s.county} · {s.school}<small>查看歷屆參與</small></button>)}</div>}
      <div className="competition-grid"><article className="data-card"><div className="card-heading"><div><small>歷屆參與趨勢</small><h3>每一屆都有新的加入，也有持續回來的學校</h3></div></div><div className="edition-grid">{data?.editions.map((e) => <button key={e.editionNo} className={edition === String(e.editionNo) ? "active" : ""} onClick={() => { setEdition(String(e.editionNo)); setSchoolPage(1); }}><b>{e.edition}</b><strong>{e.schools}</strong><span>參與學校</span><small>{e.counties} 個地區</small></button>)}</div></article><article className="data-card"><div className="card-heading"><div><small>地區參與比較</small><h3>參與校次 Top 8</h3></div></div><div className="ranking-list">{topCounties.map(([name, count], i) => <button key={name} onClick={() => { setCounty(name); setSchoolPage(1); }}><em>{String(i + 1).padStart(2, "0")}</em><span>{name}</span><i><b style={{ width: `${(count / (topCounties[0]?.[1] || 1)) * 100}%` }} /></i><strong>{count}</strong></button>)}</div></article></div>
      <article className="data-card competition-school-card"><div className="card-heading"><div><small>學校參與歷程</small><h3>{filtered.length} 筆參與紀錄 · {schools.length} 所學校</h3></div><p className="data-note">獲獎學校優先顯示；點選可查看跨屆參與</p></div><div className="competition-school-list">{visibleCompetitionSchools.map((s) => <button key={s.schoolKey} className={selectedSchool === s.schoolKey ? "active" : ""} onClick={() => setSelectedSchool(s.schoolKey)}><span>{s.county}{s.awardEditions.length > 0 && <b className="award-badge">獲獎學校</b>}</span><strong>{s.school}</strong><small>{s.editions.length} 屆參與 · {s.editions.map((n) => `第${n}屆`).join("、")}</small></button>)}</div>{!visibleCompetitionSchools.length && <p className="empty-state">沒有符合目前條件的學校。</p>}<div className="competition-pagination" aria-label="學校參與歷程分頁"><button disabled={currentSchoolPage === 1} onClick={() => setSchoolPage(currentSchoolPage - 1)}>上一頁</button><div>{competitionPageNumbers.map((pageNumber, index) => <span key={pageNumber}>{index > 0 && pageNumber - competitionPageNumbers[index - 1] > 1 && <i>…</i>}<button className={pageNumber === currentSchoolPage ? "active" : ""} aria-current={pageNumber === currentSchoolPage ? "page" : undefined} onClick={() => setSchoolPage(pageNumber)}>{pageNumber}</button></span>)}</div><button disabled={currentSchoolPage === competitionPageCount} onClick={() => setSchoolPage(currentSchoolPage + 1)}>下一頁</button><small>第 {currentSchoolPage}／{competitionPageCount} 頁</small></div>{selected && <div className="selected-school"><span>{selected.county}</span><h3>{selected.school}</h3><p>累計參與 {selected.editions.length} 屆{selected.awardEditions.length ? ` · 得獎紀錄 ${selected.awardEditions.length} 屆` : ""}</p><div>{selected.editions.map((n) => <b key={n} className={selected.awardEditions.includes(n) ? "award" : ""}>第{n}屆{selected.awardEditions.includes(n) ? " · 得獎學校" : ""}</b>)}</div></div>}</article>
      <p className="competition-footnote">資料更新：{data?.meta.updated}。{data?.meta.note}</p>
    </section>
  </main>;
}

export default function Home() {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [view, setView] = useState<"plan" | "competition">("plan");
  const [denominators, setDenominators] = useState<Denominator[]>([]);
  const [year, setYear] = useState("全部");
  const [city, setCity] = useState("全部");
  const [program, setProgram] = useState("全部");
  const [type, setType] = useState("全部");
  const [query, setQuery] = useState("");
  const [mapMode, setMapMode] = useState<MapMode>("units");
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([
      fetch(`${basePath}/data/participation.json`).then((response) => response.json()),
      fetch(`${basePath}/data/denominators.json`).then((response) => response.json()),
    ]).then(([records, denominatorRows]) => {
      setRows(records);
      setDenominators(denominatorRows);
    });
  }, []);
  useEffect(() => { fetch(`${basePath}/data/competition.json`).then((response) => response.json()).then(setCompetition); }, []);

  const cities = useMemo(
    () => [...new Set(rows.map((row) => row.city))].sort((a, b) => a.localeCompare(b, "zh-TW")),
    [rows],
  );
  const programs = useMemo(
    () => [...new Set(rows.map((row) => row.program))].sort((a, b) => a.localeCompare(b, "zh-TW")),
    [rows],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (year !== "全部" && row.year !== Number(year)) return false;
      if (city !== "全部" && row.city !== city) return false;
      if (program !== "全部" && row.program !== program) return false;
      if (type !== "全部" && row.type !== type) return false;
      if (
        normalized &&
        !`${row.originalName} ${row.school} ${row.city} ${row.district}`.toLowerCase().includes(normalized)
      )
        return false;
      return true;
    });
  }, [rows, year, city, program, type, query]);

  const filteredUnits = useMemo(() => uniqueUnits(filtered), [filtered]);
  const filteredCities = useMemo(() => new Set(filtered.map((row) => row.city)), [filtered]);
  const filteredYears = useMemo(() => new Set(filtered.map((row) => row.year)), [filtered]);

  const trend = useMemo(
    () =>
      years.map((itemYear) => {
        const yearRows = filtered.filter((row) => row.year === itemYear);
        return { year: itemYear, records: yearRows.length, units: uniqueUnits(yearRows).size };
      }),
    [filtered],
  );
  const maxTrend = Math.max(1, ...trend.map((item) => item.records));

  const cityStats = useMemo(() => {
    const stats: Record<
      string,
      { records: number; units: number; elementary: number; junior: number; elementaryDen: number; juniorDen: number }
    > = {};
    Object.values(cityByMapId).forEach((cityName) => {
      const cityRows = filtered.filter((row) => row.city === cityName);
      stats[cityName] = {
        records: cityRows.length,
        units: uniqueUnits(cityRows).size,
        elementary: uniqueUnits(cityRows.filter((row) => row.coverage === "國小")).size,
        junior: uniqueUnits(cityRows.filter((row) => row.coverage === "國中")).size,
        elementaryDen:
          Number(denominators.find((item) => item.縣市 === cityName && item.覆蓋率分類 === "國小")?.分母校數) || 0,
        juniorDen:
          Number(denominators.find((item) => item.縣市 === cityName && item.覆蓋率分類 === "國中")?.分母校數) || 0,
      };
    });
    return stats;
  }, [filtered, denominators]);

  const selectedCity = city === "全部" ? "彰化縣" : city;
  const selectedStats = cityStats[selectedCity] || {
    records: 0,
    units: 0,
    elementary: 0,
    junior: 0,
    elementaryDen: 0,
    juniorDen: 0,
  };

  const mapValue = (cityName: string) => {
    const stat = cityStats[cityName];
    if (!stat) return 0;
    if (mapMode === "elementary") return stat.elementaryDen ? (stat.elementary / stat.elementaryDen) * 100 : 0;
    if (mapMode === "junior") return stat.juniorDen ? (stat.junior / stat.juniorDen) * 100 : 0;
    return stat.units;
  };
  const maxMapValue = Math.max(1, ...Object.values(cityByMapId).map(mapValue));
  const mapFill = (cityName: string) => {
    const ratio = mapValue(cityName) / maxMapValue;
    if (mapValue(cityName) === 0) return "#e8eee9";
    if (ratio > 0.7) return "#0a766e";
    if (ratio > 0.42) return "#2f9d87";
    if (ratio > 0.18) return "#7bc6a9";
    return "#bce2cf";
  };

  const topCities = useMemo(
    () =>
      Object.entries(cityStats)
        .sort((a, b) => b[1].units - a[1].units)
        .slice(0, 8),
    [cityStats],
  );
  const maxCityUnits = Math.max(1, ...topCities.map(([, stat]) => stat.units));

  const schoolGroups = useMemo(() => {
    const grouped = new Map<string, { key: string; city: string; district: string; school: string; type: string; status: string; rows: RecordRow[] }>();
    filtered.forEach((row) => {
      const key = `${row.city}|${row.school}`;
      const existing = grouped.get(key);
      if (existing) existing.rows.push(row);
      else grouped.set(key, { key, city: row.city, district: row.district, school: row.school, type: row.type, status: row.status, rows: [row] });
    });
    return [...grouped.values()].sort((a, b) => a.city.localeCompare(b.city, "zh-TW") || a.school.localeCompare(b.school, "zh-TW"));
  }, [filtered]);
  const pageSize = 12;
  const pageCount = Math.max(1, Math.ceil(schoolGroups.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleSchools = schoolGroups.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetFilters = () => {
    setYear("全部");
    setCity("全部");
    setProgram("全部");
    setType("全部");
    setQuery("");
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="回到頁首">
          <Image src={`${basePath}/logo.png`} alt="廣達文教基金會" width={184} height={70} priority unoptimized />
          <span>廣達游於智教育影響力地圖</span>
        </a>
        <nav aria-label="主要導覽">
          <button className={view === "plan" ? "active-view" : ""} onClick={() => setView("plan")}>廣達《游於智》計畫</button>
          <button className={view === "competition" ? "active-view" : ""} onClick={() => setView("competition")}>廣達游智盃</button>
          {view === "plan" && <>
          <a href="#impact">成果足跡</a>
          <a href="#schools">參與學校</a>
          <a href="#about">計畫理念</a>
          </>}
        </nav>
      </header>
      {view === "competition" ? <CompetitionPage data={competition} /> : <>

      <section className="hero" id="top">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={16} /> 讓科技學習走進每一間教室</p>
          <h1>用科技打開想像，<br />讓每個孩子都能創造未來。</h1>
          <p className="hero-lead">廣達《游於智》計畫從教師增能、程式與機電整合課程，到縣市合作與教具推廣，陪伴孩子從生活問題出發，動手實作、測試與修正。</p>
          <a className="primary-button" href="#impact">探索成果足跡 <ArrowDown size={18} /></a>
        </div>
        <div className="hero-panel" aria-label="計畫推動期間">
          <span>IMPACT SINCE 2018</span>
          <strong className="impact-period"><b>2018—2025</b><em>107—114 學年度</em></strong>
          <p>全台科技教育行動</p>
          <div className="circuit-lines" aria-hidden="true"><i /><i /><i /></div>
        </div>
      </section>

      <section className="metrics-section" aria-label="計畫核心成果">
        <MetricCard value={rows.length || 903} label="累計參與校次" note="跨學年度與方案的參與紀錄" />
        <MetricCard value={rows.length ? uniqueUnits(rows).size : 438} label="參與學校／單位" note="包含正式學校與實驗教育機構" />
        <MetricCard value={rows.length ? new Set(rows.map((row) => row.city)).size : 20} label="參與縣市" note="足跡持續擴展至全台" />
        <MetricCard value={8} label="推動學年度" note="107 至 114 學年度" />
      </section>

      <section className="story-section" id="about">
        <div className="section-heading narrow-heading">
          <p className="story-kicker">不只是學會寫程式</p>
          <h2>讓孩子在真實問題裡，長出解決問題的能力</h2>
          <p>從教師開始扎根，讓科技課程成為孩子可以反覆嘗試、合作與創造的學習現場。</p>
        </div>
        <div className="story-grid">
          <article><span><UsersRound /></span><small>01</small><h3>教師增能</h3><p>透過研習、共備與教學社群，支持非資訊背景教師把課程安心帶回教室。</p></article>
          <article><span><Wrench /></span><small>02</small><h3>動手實作</h3><p>結合程式、感測器與機電整合，讓抽象概念轉化為看得見、能運作的作品。</p></article>
          <article><span><BookOpenCheck /></span><small>03</small><h3>在地深耕</h3><p>透過縣市合作、教具漂移與種子教師，把科技教育帶進偏鄉與非山非市校園。</p></article>
        </div>
      </section>

      <section className="impact-section" id="impact">
        <div className="section-heading split-heading">
          <div><p className="section-kicker">DATA EXPLORER</p><h2>看見八年累積的教育足跡</h2></div>
          <p>使用篩選器，探索不同學年度、縣市與方案的參與成果。</p>
        </div>

        <div className="filter-panel">
          <AppSelect label="學年度" value={year} onChange={setYear}><option>全部</option>{years.map((item) => <option key={item}>{item}</option>)}</AppSelect>
          <AppSelect label="縣市" value={city} onChange={setCity}><option>全部</option>{cities.map((item) => <option key={item}>{item}</option>)}</AppSelect>
          <AppSelect label="方案" value={program} onChange={setProgram}><option>全部</option>{programs.map((item) => <option key={item}>{item}</option>)}</AppSelect>
          <AppSelect label="單位類型" value={type} onChange={setType}><option>全部</option>{types.map((item) => <option key={item}>{item}</option>)}</AppSelect>
          <label className="filter-field search-field"><span>搜尋學校／單位</span><span><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="輸入校名" /></span></label>
          <button className="reset-button" onClick={resetFilters}><RefreshCcw size={16} />重設</button>
        </div>

        {query.trim() && <div className="plan-search-results" aria-live="polite">
          <div><strong>搜尋結果</strong><span>找到 {schoolGroups.length} 所學校／單位</span></div>
          <div className="plan-search-result-list">
            {schoolGroups.slice(0, 8).map((group) => <a key={group.key} href="#schools">
              <span>{group.city}{group.district ? ` · ${group.district}` : ""}</span>
              <strong>{group.school}</strong>
              <small>{[...new Set(group.rows.map((row) => row.year))].sort().join("、")} 學年度</small>
            </a>)}
          </div>
          {schoolGroups.length > 8 && <small>先顯示前 8 所；完整結果請見下方學校參與歷程。</small>}
          {!schoolGroups.length && <p>沒有符合目前條件的學校或單位。</p>}
        </div>}

        <div className="live-summary" aria-live="polite">
          <span>目前篩選結果</span>
          <strong>{formatNumber(filtered.length)}</strong> 校次
          <i />
          <strong>{formatNumber(filteredUnits.size)}</strong> 學校／單位
          <i />
          <strong>{formatNumber(filteredCities.size)}</strong> 縣市
          <i />
          <strong>{formatNumber(filteredYears.size)}</strong> 學年度
        </div>

        <div className="analytics-grid">
          <article className="data-card trend-card">
            <div className="card-heading"><div><small>歷年推廣趨勢</small><h3>參與規模逐年累積</h3></div><div className="legend"><span><i className="records-dot" />校次</span><span><i className="units-dot" />單位</span></div></div>
            <div className="trend-chart" role="img" aria-label="107 至 114 學年度校次與參與單位趨勢">
              {trend.map((item) => (
                <div className="trend-column" key={item.year} title={`${item.year}學年度：${item.records}校次、${item.units}單位`}>
                  <div className="bar-pair"><i className="records-bar" style={{ height: `${(item.records / maxTrend) * 100}%` }} /><i className="units-bar" style={{ height: `${(item.units / maxTrend) * 100}%` }} /></div>
                  <b>{item.records || "—"}</b><span>{item.year}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="data-card ranking-card">
            <div className="card-heading"><div><small>縣市參與比較</small><h3>參與學校／單位 Top 8</h3></div></div>
            <div className="ranking-list">
              {topCities.map(([cityName, stat], index) => (
                <button key={cityName} onClick={() => setCity(cityName)} className={city === cityName ? "active" : ""}>
                  <em>{String(index + 1).padStart(2, "0")}</em><span>{cityName}</span><i><b style={{ width: `${(stat.units / maxCityUnits) * 100}%` }} /></i><strong>{stat.units}</strong>
                </button>
              ))}
            </div>
          </article>
        </div>

        <div className="map-grid">
          <article className="data-card map-card">
            <div className="card-heading map-heading">
              <div><small>縣市影響力地圖</small><h3>全台參與足跡</h3></div>
              <div className="segmented" aria-label="地圖顯示指標">
                <button className={mapMode === "units" ? "active" : ""} onClick={() => setMapMode("units")}>參與單位</button>
                <button className={mapMode === "elementary" ? "active" : ""} onClick={() => setMapMode("elementary")}>國小觸及率</button>
                <button className={mapMode === "junior" ? "active" : ""} onClick={() => setMapMode("junior")}>國中觸及率</button>
              </div>
            </div>
            <div className="map-content">
              <svg viewBox={Taiwan.viewBox} className="taiwan-map" role="img" aria-label="臺灣縣市參與分布圖">
                {Taiwan.locations.map((location: { id: string; path: string }) => {
                  const cityName = cityByMapId[location.id];
                  const value = mapValue(cityName);
                  const display = mapMode === "units" ? `${value} 個參與單位` : `${formatPercent(value)} 累計觸及率`;
                  return <path key={location.id} d={location.path} fill={mapFill(cityName)} className={city === cityName ? "selected" : ""} tabIndex={0} role="button" aria-label={`${cityName}：${display}`} onClick={() => setCity(cityName)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setCity(cityName); }} />;
                })}
              </svg>
              <div className="map-legend"><span>較低</span><i /><i /><i /><i /><span>較高</span></div>
              <div className="island-shortcuts" aria-label="離島快速選擇">
                <span>離島快速選擇</span>
                {(["連江縣", "金門縣", "澎湖縣"] as const).map((island) => (
                  <button key={island} className={city === island ? "active" : ""} onClick={() => setCity(island)}>{island}</button>
                ))}
              </div>
            </div>
          </article>

          <aside className="city-panel">
            <p><MapPinned size={17} /> 縣市摘要</p>
            <h3>{selectedCity}</h3>
            {city === "全部" && <small className="sample-note">點選地圖查看縣市；目前示範彰化縣</small>}
            <div className="city-big-number"><strong>{selectedStats.units}</strong><span>參與學校／單位</span></div>
            <dl><div><dt>累計校次</dt><dd>{selectedStats.records}</dd></div><div><dt>國小累計觸及率</dt><dd>{selectedStats.elementaryDen ? formatPercent((selectedStats.elementary / selectedStats.elementaryDen) * 100) : "—"}<small>{selectedStats.elementary}／{selectedStats.elementaryDen || "—"} 所</small></dd></div><div><dt>國中累計觸及率</dt><dd>{selectedStats.juniorDen ? formatPercent((selectedStats.junior / selectedStats.juniorDen) * 100) : "—"}<small>{selectedStats.junior}／{selectedStats.juniorDen || "—"} 所</small></dd></div></dl>
            <p className="method-note">分母採教育部 115 學年度學校名錄；國小與國中分開計算。</p>
          </aside>
        </div>
      </section>

      <section className="schools-section" id="schools">
        <div className="section-heading split-heading"><div><p className="section-kicker">SCHOOL JOURNEY</p><h2>每一所學校，都是影響力的一段歷程</h2></div><p>同一學校跨年度參與會整合成一列；展開即可查看方案與年度紀錄。</p></div>
        <div className="school-list" aria-label="參與學校與單位清單">
          <div className="school-list-head"><span>縣市／行政區</span><span>學校／單位</span><span>類型</span><span>參與歷程</span><span>狀態</span></div>
          {visibleSchools.map((group) => (
            <details key={group.key}>
              <summary><span>{group.city}<small>{group.district || "行政區待確認"}</small></span><strong>{group.school}</strong><span><i className={`type-badge type-${group.type}`}>{group.type}</i></span><span>{[...new Set(group.rows.map((row) => row.year))].sort().join("、")}<small>{group.rows.length} 次參與</small></span><span><i className="status-badge">{group.status}</i><ChevronDown size={17} /></span></summary>
              <div className="journey-row">{group.rows.sort((a, b) => a.year - b.year).map((row) => <span key={row.key}><b>{row.year}學年度</b>{row.program}{row.division && <small>{row.division}</small>}</span>)}</div>
            </details>
          ))}
          {!visibleSchools.length && <p className="empty-state">沒有符合目前條件的學校或單位。</p>}
        </div>
        <div className="pagination"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>上一頁</button><span>第 {currentPage}／{pageCount} 頁 · 共 {schoolGroups.length} 個單位</span><button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>下一頁</button></div>
      </section>

      <section className="closing-section">
        <p>科技教育的價值，不只在做出一件作品，<br />而是讓孩子相信：<strong>我能觀察、我能嘗試、我能把想法實現。</strong></p>
      </section>

      <footer><div><Image src={`${basePath}/logo.png`} alt="廣達文教基金會" width={192} height={76} unoptimized /><span>廣達游於智教育影響力地圖</span></div><p>資料期間：107–114 學年度 · 測試版資料更新：2026.08</p><small>本網站統計以《游於智》歷年參與紀錄為基礎；國小與國中覆蓋率依正式學校名錄分開計算。</small></footer>
    </>}
    </main>
  );
}
