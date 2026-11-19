/* =========================================================================
 * 사주결 · 만세력 엔진 (saju-core.js)
 * 의존성 없는 순수 JavaScript. 브라우저 안에서만 계산합니다.
 *
 *  - 양력/음력 변환 (1920–2049, 한국천문연구원 음양력 기준)
 *  - 24절기 중 12절(節)의 입절 시각을 태양 황경으로 계산 (±5분 내외)
 *  - 연주·월주·일주·시주, 십성, 오행 분포
 *
 * 기준
 *  - 시각은 한국표준시(KST, UTC+9)
 *  - 연주는 입춘, 월주는 절입 시각에 바뀝니다.
 *  - 일주는 자시(23:00)에 바뀌는 전통 기준을 따릅니다. (config.dayBoundaryHour)
 * ========================================================================= */
(function (global) {
  'use strict';

  var STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  var STEMS_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  var BRANCHES_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var ELEMENTS = ['목', '화', '토', '금', '수'];
  var ELEMENTS_HANJA = ['木', '火', '土', '金', '水'];
  var ZODIAC = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];

  // 천간 → 오행 (0목 1화 2토 3금 4수)
  var STEM_ELEM = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
  // 지지 → 오행
  var BRANCH_ELEM = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
  // 지장간 (여기·중기·정기 순, 정기를 대표로 사용)
  var BRANCH_HIDDEN = [
    [9, 9],        // 자: 계
    [5, 7, 9],     // 축: 계 신 기
    [4, 2, 0],     // 인: 무 병 갑
    [0, 1],        // 묘: 갑 을
    [1, 4, 9],     // 진: 을 무 계
    [4, 3, 2],     // 사: 무 경 병
    [2, 5, 3],     // 오: 병 기 정
    [3, 1, 5],     // 미: 정 을 기
    [4, 8, 3],     // 신: 무 임 경
    [3, 7],        // 유: 경 신
    [7, 3, 4],     // 술: 신 정 무
    [4, 0, 8]      // 해: 무 갑 임
  ];

  var CONFIG = {
    dayBoundaryHour: 23,   // 일주가 바뀌는 시각
    timezoneOffset: 9,     // KST
    minYear: 1920,
    maxYear: 2049
  };

  /* ---------------------------------------------------------------- 시간 */

  function kstEpoch(y, m, d, h, min) {
    // KST 벽시계 → UTC epoch(ms)
    return Date.UTC(y, m - 1, d, h || 0, min || 0) - CONFIG.timezoneOffset * 3600000;
  }

  function jdFromEpoch(ms) {
    return ms / 86400000 + 2440587.5;
  }

  function epochFromJd(jd) {
    return (jd - 2440587.5) * 86400000;
  }

  function jdnFromDate(y, m, d) {
    var a = Math.floor((14 - m) / 12);
    var yy = y + 4800 - a;
    var mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy +
      Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }

  function kstNow() {
    var now = new Date();
    return new Date(now.getTime() + CONFIG.timezoneOffset * 3600000);
  }

  /* ---------------------------------------------------------------- 절기 */

  // 태양의 겉보기 황경(도). Meeus 저정밀식 — 오차 수 분.
  function sunLongitude(jd) {
    var T = (jd - 2451545.0) / 36525;
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    var M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * Math.PI / 180;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
      (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
      0.000289 * Math.sin(3 * M);
    var omega = (125.04 - 1934.136 * T) * Math.PI / 180;
    var lam = L0 + C - 0.00569 - 0.00478 * Math.sin(omega);
    return ((lam % 360) + 360) % 360;
  }

  function deltaTSeconds(jd) {
    var y = 2000 + (jd - 2451545.0) / 365.2425;
    var t = y - 2000;
    if (y > 2005) return 62.92 + 0.32217 * t + 0.005589 * t * t;
    return 63.86 + 0.3345 * t - 0.060374 * t * t;
  }

  // year년의 k번째 절(節). k=0 입춘(315°), 1 경칩(345°), 2 청명(15°) …
  var TERM_NAMES = ['입춘', '경칩', '청명', '입하', '망종', '소서', '입추', '백로', '한로', '입동', '대설', '소한'];

  function termJd(year, k) {
    // 12절(節)은 황경 30° 간격입니다. 입춘 315° → 경칩 345° → 청명 15° …
    var target = (315 + 30 * k) % 360;
    // 2월 4일(입춘 무렵)을 기준으로 30.44일씩 이동한 지점에서 시작
    var base = jdFromEpoch(kstEpoch(year, 2, 4, 0, 0));
    var jd = base + k * 30.4368;
    for (var i = 0; i < 8; i++) {
      var diff = ((sunLongitude(jd) - target + 180) % 360 + 360) % 360 - 180;
      jd -= diff / 0.9856473;
    }
    return jd - deltaTSeconds(jd) / 86400;
  }

  var termCache = {};
  function termsOfYear(year) {
    if (termCache[year]) return termCache[year];
    var arr = [];
    for (var k = 0; k < 12; k++) arr.push(termJd(year, k));
    termCache[year] = arr;
    return arr;
  }

  /* ---------------------------------------------------------------- 음력 */

  function lunarInfo(year) {
    var t = global.LUNAR_TABLE || {};
    return t[year] || null;
  }

  function lunarMonths(year) {
    var info = lunarInfo(year);
    if (!info) return null;
    var leapMonth = info[0];
    var startMs = kstEpoch(year, info[1], info[2], 0, 0);
    var list = [];
    var cursor = startMs;
    var idx = 3;
    for (var m = 1; m <= 12; m++) {
      list.push({ month: m, leap: false, startMs: cursor, days: info[idx++] });
      cursor += info[idx - 1] * 86400000;
      if (leapMonth === m) {
        list.push({ month: m, leap: true, startMs: cursor, days: info[idx++] });
        cursor += info[idx - 1] * 86400000;
      }
    }
    return { months: list, yearStart: startMs, yearEnd: cursor };
  }

  function lunarToSolar(y, m, d, isLeap) {
    var info = lunarMonths(y);
    if (!info) throw new Error('지원하지 않는 연도입니다. (1920–2049)');
    var found = null;
    for (var i = 0; i < info.months.length; i++) {
      var mo = info.months[i];
      if (mo.month === m && mo.leap === !!isLeap) { found = mo; break; }
    }
    if (!found) throw new Error('해당 음력 달이 없습니다.');
    if (d < 1 || d > found.days) throw new Error('해당 음력 달은 ' + found.days + '일까지 있습니다.');
    var ms = found.startMs + (d - 1) * 86400000;
    var dt = new Date(ms + CONFIG.timezoneOffset * 3600000);
    return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
  }

  function solarToLunar(y, m, d) {
    var ms = kstEpoch(y, m, d, 0, 0);
    for (var yy = y; yy >= y - 1; yy--) {
      var info = lunarMonths(yy);
      if (!info) continue;
      if (ms >= info.yearStart && ms < info.yearEnd) {
        for (var i = info.months.length - 1; i >= 0; i--) {
          var mo = info.months[i];
          if (ms >= mo.startMs) {
            return {
              y: yy, m: mo.month, leap: mo.leap,
              d: Math.round((ms - mo.startMs) / 86400000) + 1,
              days: mo.days
            };
          }
        }
      }
    }
    return null;
  }

  /* ---------------------------------------------------------------- 간지 */

  function ganji(stemIdx, branchIdx) {
    return {
      stem: stemIdx, branch: branchIdx,
      stemKo: STEMS[stemIdx], stemHanja: STEMS_HANJA[stemIdx],
      branchKo: BRANCHES[branchIdx], branchHanja: BRANCHES_HANJA[branchIdx],
      stemElem: STEM_ELEM[stemIdx], branchElem: BRANCH_ELEM[branchIdx]
    };
  }

  function tenGodName(dayStem, targetStem) {
    var me = STEM_ELEM[dayStem];
    var tg = STEM_ELEM[targetStem];
    var same = (dayStem % 2) === (targetStem % 2);
    if (me === tg) return same ? '비견' : '겁재';
    if ((me + 1) % 5 === tg) return same ? '식신' : '상관';       // 내가 생함
    if ((tg + 1) % 5 === me) return same ? '편인' : '정인';       // 나를 생함
    if ((me + 2) % 5 === tg) return same ? '편재' : '정재';       // 내가 극함
    return same ? '편관' : '정관';                                // 나를 극함
  }

  function dayPillarIndex(jdn) {
    return ((jdn + 49) % 60 + 60) % 60;
  }

  function yearGanjiForYear(year) {
    var idx = ((year - 1984) % 60 + 60) % 60; // 1984 = 갑자년
    return ganji(idx % 10, idx % 12);
  }

  /* ---------------------------------------------------------------- 계산 */

  /**
   * @param {object} input
   *   { year, month, day, hour(0-23|null), minute, gender('male'|'female'|''),
   *     calendar('solar'|'lunar'), leap(boolean), name }
   */
  function compute(input) {
    var y = +input.year, m = +input.month, d = +input.day;
    var hour = (input.hour === null || input.hour === undefined || input.hour === '') ? null : +input.hour;
    var minute = input.minute ? +input.minute : 0;

    if (!lunarInfo(y) && input.calendar === 'lunar') {
      throw new Error('음력 변환은 1920년부터 2049년까지 지원합니다.');
    }

    var solar = input.calendar === 'lunar'
      ? lunarToSolar(y, m, d, !!input.leap)
      : { y: y, m: m, d: d };

    var lunar = solarToLunar(solar.y, solar.m, solar.d);

    // 일주 기준 날짜 (자시)
    var jdnBase = jdnFromDate(solar.y, solar.m, solar.d);
    var dayJdn = jdnBase;
    if (hour !== null && hour >= CONFIG.dayBoundaryHour) dayJdn += 1;

    // 연주: 입춘 전이면 전년
    var birthJd = jdFromEpoch(kstEpoch(solar.y, solar.m, solar.d, hour === null ? 12 : hour, minute));
    var ipchun = termsOfYear(solar.y)[0];
    var sajuYear = birthJd < ipchun ? solar.y - 1 : solar.y;
    var yearPillar = yearGanjiForYear(sajuYear);

    // 월주: 가장 최근에 지난 절(節)
    var monthBranch = null;
    var termsThis = termsOfYear(solar.y);
    var termsPrev = termsOfYear(solar.y - 1);
    var bestJd = -Infinity, bestK = null;
    var candidates = [];
    for (var k = 0; k < 12; k++) {
      candidates.push({ jd: termsPrev[k], k: k, year: solar.y - 1 });
      candidates.push({ jd: termsThis[k], k: k, year: solar.y });
    }
    candidates.sort(function (a, b) { return a.jd - b.jd; });
    for (var i = 0; i < candidates.length; i++) {
      if (candidates[i].jd <= birthJd + 1e-9 && candidates[i].jd > bestJd) {
        bestJd = candidates[i].jd; bestK = candidates[i].k;
      }
    }
    if (bestK === null) bestK = 0;
    monthBranch = (2 + bestK) % 12; // 입춘 → 인월
    var mIdx = ((monthBranch - 2) + 12) % 12; // 인=0 … 축=11
    var monthStem = (2 * yearPillar.stem + 2 + mIdx) % 10;
    var monthPillar = ganji(monthStem, monthBranch);

    // 일주
    var dIdx = dayPillarIndex(dayJdn);
    var dayPillar = ganji(dIdx % 10, dIdx % 12);

    // 시주
    var hourPillar = null;
    if (hour !== null) {
      var hBranch = Math.floor(((hour + 1) % 24) / 2);
      var hStem = ((dayPillar.stem % 5) * 2 + hBranch) % 10;
      hourPillar = ganji(hStem, hBranch);
    }

    var dayMaster = dayPillar.stem;

    var pillars = [];
    function pushPillar(key, label, p, isMe) {
      if (!p) return;
      var hidden = BRANCH_HIDDEN[p.branch];
      pillars.push({
        key: key, label: label, isMe: !!isMe,
        stem: p.stem, branch: p.branch,
        stemKo: p.stemKo, branchKo: p.branchKo,
        stemHanja: p.stemHanja, branchHanja: p.branchHanja,
        stemElem: p.stemElem, branchElem: p.branchElem,
        stemGod: key === 'day' ? '일간' : tenGodName(dayMaster, p.stem),
        branchGod: tenGodName(dayMaster, hidden[hidden.length - 1]),
        hidden: hidden.map(function (s) { return STEMS[s]; })
      });
    }
    pushPillar('year', '년주', yearPillar);
    pushPillar('month', '월주', monthPillar);
    pushPillar('day', '일주', dayPillar, true);
    pushPillar('hour', '시주', hourPillar);

    // 오행 분포 (여덟 글자 기준)
    var counts = [0, 0, 0, 0, 0];
    pillars.forEach(function (p) {
      counts[p.stemElem] += 1;
      counts[p.branchElem] += 1;
    });

    return {
      input: {
        name: (input.name || '').trim(), gender: input.gender || '',
        calendar: input.calendar || 'solar', leap: !!input.leap,
        year: y, month: m, day: d, hour: hour, minute: minute
      },
      solar: { y: solar.y, m: solar.m, d: solar.d },
      lunar: lunar,
      pillars: pillars,
      hourKnown: hour !== null,
      dayMaster: dayMaster,
      dayMasterElem: STEM_ELEM[dayMaster],
      elements: counts,
      zodiac: ZODIAC[yearPillar.branch],
      sajuYear: sajuYear,
      // 아래 값은 화면·해석에서 편하게 쓰기 위한 파생 값
      yearPillar: yearPillar,
      monthPillar: monthPillar,
      dayPillar: dayPillar,
      hourPillar: hourPillar
    };
  }

  /* 오늘(또는 특정 날짜)의 일진 */
  function pillarOfDate(y, m, d, hour) {
    var hourKnown = (hour !== undefined && hour !== null);
    var jdn = jdnFromDate(y, m, d);
    if (hourKnown && hour >= CONFIG.dayBoundaryHour) jdn += 1;
    var idx = dayPillarIndex(jdn);
    var p = ganji(idx % 10, idx % 12);
    var ipchun = termsOfYear(y)[0];
    var jd = jdFromEpoch(kstEpoch(y, m, d, hourKnown ? hour : 12, 0));
    var sy = jd < ipchun ? y - 1 : y;
    var yp = yearGanjiForYear(sy);
    var thisT = termsOfYear(y), prevT = termsOfYear(y - 1);
    var bk = 0, bestJd = -Infinity;
    for (var k = 0; k < 12; k++) {
      if (prevT[k] <= jd && prevT[k] > bestJd) { bestJd = prevT[k]; bk = k; }
      if (thisT[k] <= jd && thisT[k] > bestJd) { bestJd = thisT[k]; bk = k; }
    }
    var br = (2 + bk) % 12;
    var mi = (br - 2 + 12) % 12;
    return {
      solar: { y: y, m: m, d: d },
      year: yp,
      month: ganji((2 * yp.stem + 2 + mi) % 10, br),
      day: p,
      ganjiText: p.stemHanja + p.branchHanja + '일 (' + p.stemKo + p.branchKo + '일)'
    };
  }

  function today() {
    var n = kstNow();
    return {
      y: n.getUTCFullYear(), m: n.getUTCMonth() + 1, d: n.getUTCDate(),
      hour: n.getUTCHours(), minute: n.getUTCMinutes()
    };
  }

  global.SajuCore = {
    CONFIG: CONFIG,
    STEMS: STEMS, STEMS_HANJA: STEMS_HANJA,
    BRANCHES: BRANCHES, BRANCHES_HANJA: BRANCHES_HANJA,
    ELEMENTS: ELEMENTS, ELEMENTS_HANJA: ELEMENTS_HANJA,
    STEM_ELEM: STEM_ELEM, BRANCH_ELEM: BRANCH_ELEM, BRANCH_HIDDEN: BRANCH_HIDDEN,
    compute: compute,
    pillarOfDate: pillarOfDate,
    today: today,
    solarToLunar: solarToLunar,
    lunarToSolar: lunarToSolar,
    termJd: termJd,
    termsOfYear: termsOfYear,
    TERM_NAMES: TERM_NAMES,
    tenGodName: tenGodName,
    jdnFromDate: jdnFromDate
  };
})(window);
