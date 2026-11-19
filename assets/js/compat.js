/* =========================================================================
 * 사주결 · compat.js — 무료 사주 궁합
 * saju-core.js(만세력)와 saju-reading.js(해석)를 그대로 씁니다.
 * 점수는 규칙으로만 계산하며, 같은 생년월일시에는 항상 같은 값이 나옵니다.
 *
 *  일간의 관계 30점 · 일지의 관계 25점 · 오행의 보완 25점
 *  천간의 합 10점 · 지지의 합과 충 10점
 * ========================================================================= */
(function () {
  'use strict';

  var C = window.SajuCore;
  var R = window.SajuReading;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var ELEMENTS = ['목', '화', '토', '금', '수'];
  var ELEMENTS_HANJA = ['木', '火', '土', '金', '水'];
  var STEM_HAP = { 0: 5, 5: 0, 1: 6, 6: 1, 2: 7, 7: 2, 3: 8, 8: 3, 4: 9, 9: 4 };

  var DAY_REL = {
    saeng: { score: 30, label: '상생' },
    same: { score: 22, label: '비화' },
    geuk: { score: 14, label: '상극' }
  };
  var BRANCH_SCORE = {
    yukhap: 25, samhap: 22, self: 17, none: 15,
    wonjin: 9, hae: 8, hyeong: 8, chung: 7
  };

  /* ------------------------------------------------------------ 유틸 */

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function josa(word, withFinal, withoutFinal) {
    var w = String(word);
    var c = w.charCodeAt(w.length - 1);
    if (c < 0xAC00 || c > 0xD7A3) return withoutFinal;
    return (c - 0xAC00) % 28 === 0 ? withoutFinal : withFinal;
  }

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function daysInMonth(y, m) {
    if (!y || !m) return 31;
    return new Date(y, m, 0).getDate();
  }

  function fillSelect(sel, items, placeholder) {
    var html = '';
    if (placeholder) html += '<option value="">' + placeholder + '</option>';
    items.forEach(function (it) {
      html += '<option value="' + it.value + '"' + (it.selected ? ' selected' : '') + '>' + it.label + '</option>';
    });
    sel.innerHTML = html;
  }

  function elemList(idxArr) {
    return idxArr.map(function (i) { return ELEMENTS[i] + '(' + ELEMENTS_HANJA[i] + ')'; }).join('·');
  }

  /* ------------------------------------------------------------ 폼 */

  var persons = {
    a: { calendar: 'solar', gender: 'female', chart: null },
    b: { calendar: 'solar', gender: 'male', chart: null }
  };

  function fillDays(key) {
    var p = persons[key];
    var max = p.calendar === 'lunar' ? 30 : daysInMonth(+$('#' + key + '-year').value, +$('#' + key + '-month').value);
    var cur = +$('#' + key + '-day').value;
    var days = [];
    for (var d = 1; d <= max; d++) days.push({ value: d, label: d + '일' });
    fillSelect($('#' + key + '-day'), days, '일');
    if (cur && cur <= max) $('#' + key + '-day').value = cur;
  }

  function initPerson(key, defaultYear) {
    var p = persons[key];
    var years = [];
    for (var y = 2025; y >= 1920; y--) years.push({ value: y, label: y + '년' });
    fillSelect($('#' + key + '-year'), years, '연도');
    if (defaultYear) $('#' + key + '-year').value = defaultYear;

    var months = [];
    for (var m = 1; m <= 12; m++) months.push({ value: m, label: m + '월' });
    fillSelect($('#' + key + '-month'), months, '월');

    fillDays(key);

    var hours = [{ value: '', label: '시간 모름' }];
    for (var h = 0; h < 24; h++) {
      hours.push({ value: h, label: pad2(h) + '시 (' + C.BRANCHES[Math.floor(((h + 1) % 24) / 2)] + '시)' });
    }
    fillSelect($('#' + key + '-hour'), hours);

    $('#' + key + '-year').addEventListener('change', function () { fillDays(key); });
    $('#' + key + '-month').addEventListener('change', function () { fillDays(key); });

    $('#' + key + '-calendar').addEventListener('click', function (e) {
      var btn = e.target.closest('.seg-btn');
      if (!btn) return;
      setSeg('#' + key + '-calendar', btn);
      p.calendar = btn.dataset.value;
      $('#' + key + '-leap-wrap').hidden = p.calendar !== 'lunar';
      fillDays(key);
    });

    $('#' + key + '-gender').addEventListener('click', function (e) {
      var btn = e.target.closest('.seg-btn');
      if (!btn) return;
      setSeg('#' + key + '-gender', btn);
      p.gender = btn.dataset.value;
    });
  }

  function setSeg(sel, btn) {
    $$(sel + ' .seg-btn').forEach(function (b) {
      var on = b === btn;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }

  function readPerson(key) {
    var p = persons[key];
    var year = +$('#' + key + '-year').value;
    var month = +$('#' + key + '-month').value;
    var day = +$('#' + key + '-day').value;
    if (!year || !month || !day) {
      throw new Error('두 사람의 생년월일을 모두 선택해 주세요.');
    }
    var hour = $('#' + key + '-hour').value;
    var chart = C.compute({
      year: year, month: month, day: day,
      hour: hour === '' ? null : +hour,
      calendar: p.calendar,
      leap: p.calendar === 'lunar' && $('#' + key + '-leap').checked,
      gender: p.gender,
      name: ($('#' + key + '-name').value || '').trim()
    });
    p.chart = chart;
    p.name = chart.input.name;
    return chart;
  }

  /* ------------------------------------------------------------ 점수 */

  function dayElementRelation(a, b) {
    if (a === b) return 'same';
    if ((a + 1) % 5 === b || (b + 1) % 5 === a) return 'saeng';
    return 'geuk';
  }

  // 비어 있는(count 0)·얇은(count 1) 오행
  function holeElements(counts) {
    var out = [];
    counts.forEach(function (c, i) { if (c === 0) out.push(i); });
    return out;
  }

  function thinElements(counts) {
    var out = [];
    counts.forEach(function (c, i) { if (c === 1) out.push(i); });
    return out;
  }

  // 내 오행이 상대의 빈자리를 채워 주는 정도 (빈자리 1점, 얇은 자리 0.5점)
  function fillPoints(mine, theirs) {
    var pts = 0, list = [];
    theirs.forEach(function (c, i) {
      if (c === 0 && mine[i] >= 2) { pts += 1; list.push(i); }
      else if (c === 1 && mine[i] >= 3) { pts += 0.5; list.push(i); }
    });
    return { pts: pts, list: list };
  }

  function scorePair(chartA, chartB) {
    var eA = chartA.dayMasterElem;
    var eB = chartB.dayMasterElem;
    var rel = dayElementRelation(eA, eB);
    var relScore = DAY_REL[rel].score;

    var bRel = R.branchRelation(chartA.dayPillar.branch, chartB.dayPillar.branch);
    var bScore = BRANCH_SCORE[bRel.type] !== undefined ? BRANCH_SCORE[bRel.type] : 14;

    var holeA = holeElements(chartA.elements);
    var holeB = holeElements(chartB.elements);
    var thinA = thinElements(chartA.elements);
    var thinB = thinElements(chartB.elements);

    var aFillsB = fillPoints(chartA.elements, chartB.elements);   // A가 B의 빈자리를
    var bFillsA = fillPoints(chartB.elements, chartA.elements);   // B가 A의 빈자리를
    var pairPoints = aFillsB.pts + bFillsA.pts;
    var pairCount = aFillsB.list.length + bFillsA.list.length;

    // 상대가 비어 있는 오행을 하나라도 가지고 있는지, 둘을 합쳐 다섯 기운이 모두 모이는지
    var cover = 0;
    holeA.forEach(function (i) { if (chartB.elements[i] >= 1) cover += 1; });
    holeB.forEach(function (i) { if (chartA.elements[i] >= 1) cover += 1; });
    var allPresent = [0, 1, 2, 3, 4].every(function (i) {
      return chartA.elements[i] + chartB.elements[i] > 0;
    });
    var compScore = Math.min(25, 9 + pairPoints * 4.5 + Math.min(6, cover * 3) + (allPresent ? 3 : 0));

    var hapStem = STEM_HAP[chartA.dayMaster] === chartB.dayMaster;
    var stemScore = hapStem ? 10 : (rel === 'saeng' ? 7 : rel === 'same' ? 6 : 3);

    var extra = 6;
    var extraNotes = [];
    var clashes = [];
    chartA.pillars.forEach(function (pa) {
      chartB.pillars.forEach(function (pb) {
        if (pa.key === 'day' && pb.key === 'day') return;
        var r = R.branchRelation(pa.branch, pb.branch);
        if (r.type === 'yukhap' || r.type === 'samhap') {
          extra += 0.9;
          extraNotes.push(pa.branchKo + '·' + pb.branchKo + ' ' + r.label);
        } else if (r.type === 'chung') {
          extra -= 0.9;
          clashes.push(pa.branchKo + '·' + pb.branchKo + ' 충');
        } else if (r.type === 'hyeong' || r.type === 'hae' || r.type === 'wonjin') {
          extra -= 0.45;
          clashes.push(pa.branchKo + '·' + pb.branchKo + ' ' + r.label);
        }
      });
    });
    extra = clamp(extra, 0, 10);

    var total = Math.round(relScore + bScore + compScore + stemScore + extra);
    total = clamp(total, 5, 99);

    return {
      total: total,
      rel: rel, relScore: relScore,
      branchRel: bRel, branchScore: bScore,
      holeA: holeA, holeB: holeB, thinA: thinA, thinB: thinB,
      aFillsB: aFillsB, bFillsA: bFillsA,
      pairCount: pairCount, pairPoints: pairPoints,
      compScore: Math.round(compScore * 10) / 10, hapStem: hapStem, stemScore: stemScore,
      extraScore: Math.round(extra * 10) / 10, extraNotes: extraNotes, clashes: clashes
    };
  }

  /* ------------------------------------------------------------ 해석 */

  var BAND = [
    { min: 86, title: '한 번 얽히면 오래 가는 인연',
      line: '말하지 않아도 통하는 부분이 많습니다. 서로의 결이 거의 어긋나지 않는 조합입니다.' },
    { min: 77, title: '서로의 빈 곳을 채우는 사이',
      line: '함께 있을수록 편안해집니다. 한 사람이 지칠 때 다른 사람이 그 자리를 받쳐 줍니다.' },
    { min: 68, title: '익숙해질수록 좋아지는 사이',
      line: '초반의 어색함은 시간이 풀어 줍니다. 오래 볼수록 진가가 드러나는 조합입니다.' },
    { min: 58, title: '다름을 배워 가는 사이',
      line: '생활의 규칙을 몇 가지 정해 두면 훨씬 오래 갑니다. 서로의 속도를 존중하는 것이 열쇠입니다.' },
    { min: 0, title: '온도가 다른 두 사람',
      line: '끌리는 마음과 부딪히는 지점이 함께 큽니다. 서로가 무엇을 편해하는지 알아 가는 시간이 필요합니다.' }
  ];

  function bandOf(total) {
    for (var i = 0; i < BAND.length; i++) if (total >= BAND[i].min) return BAND[i];
    return BAND[BAND.length - 1];
  }

  function tendencyOf(elem) {
    if (elem === 0 || elem === 1) return 'open';
    if (elem === 2) return 'center';
    return 'close';
  }

  function loveText(nA, nB, chartA, chartB, s) {
    var t = [];
    if (s.rel === 'saeng') {
      t.push(nA + josa(nA, '과', '와') + ' ' + nB + josa(nB, '은', '는') + ' 서로를 살리는 상생의 관계입니다. 한쪽이 일방적으로 맞춰 주는 구도가 아니라, 서로가 서로에게 힘이 되는 조합이라 처음의 편안함이 오래 갑니다.');
    } else if (s.rel === 'same') {
      t.push('두 사람의 일간이 같은 ' + ELEMENTS[chartA.dayMasterElem] + '(' + ELEMENTS_HANJA[chartA.dayMasterElem] + ') 기운입니다. 취향과 말투가 비슷해 금방 가까워지지만, 둘 다 물러서지 않아 작은 일로 팽팽해지기 쉽습니다. 누가 먼저 웃어 주는지가 이 관계의 온도를 정합니다.');
    } else {
      t.push('두 사람의 일간이 서로를 누르는 상극입니다. 첫인상은 강하게 끌리지만 가까워질수록 상대의 방식을 고치고 싶은 마음이 생깁니다. 그 마음을 이해로 바꾸면, 서로에게 없는 것을 배우는 관계가 됩니다.');
    }
    if (s.branchRel.type === 'chung') {
      t.push('일지가 충(沖)을 이뤄 감정의 진폭이 큽니다. 뜨겁게 가까워졌다가 갑자기 식는 흐름이 반복되기 쉬우니, 마음이 요동치는 순간에는 결론을 미루는 편이 좋습니다.');
    } else if (s.branchRel.type === 'yukhap') {
      t.push('일지가 육합(六合)을 이뤄 함께 있는 시간이 자연스럽게 채워집니다. 오래 만날수록 말이 줄어도 편안한 사이가 됩니다.');
    } else if (s.branchRel.type === 'samhap') {
      t.push('일지가 삼합(三合)을 이뤄 같은 방향을 볼 때 힘이 커집니다. 함께 무언가를 만들거나 계획할 때 관계가 깊어집니다.');
    } else if (s.branchRel.type === 'self') {
      t.push('일지가 같은 글자입니다. 좋아하는 것과 싫어하는 것이 겹쳐 설명이 필요 없지만, 기분이 가라앉는 날에는 둘이 함께 가라앉기 쉽습니다. 한 사람이 먼저 밖으로 나가자고 해 보세요.');
    } else if (s.branchRel.type === 'wonjin') {
      t.push('일지에 원진(怨嗔)이 있어 괜히 서운한 감정이 쌓이기 쉽습니다. 말하지 않고 넘기면 오해가 굳으니, 짧게라도 물어보는 습관이 관계를 지켜 줍니다.');
    } else if (s.branchRel.type === 'hae' || s.branchRel.type === 'hyeong') {
      t.push('일지에 ' + s.branchRel.label + '의 기운이 있습니다. 가까울수록 예의와 말투가 관계를 좌우하니, 편하다는 이유로 함부로 말하지 않는 것이 좋습니다.');
    } else {
      t.push('일지는 서로 무관해 부딪힘이 크지 않습니다. 대신 관계의 온도는 두 사람이 만드는 대화에서 나옵니다.');
    }
    return t.join(' ');
  }

  function marriageText(nA, nB, s) {
    var t = [];
    if (s.pairCount >= 2) {
      t.push('두 사람의 오행을 겹쳐 보면 서로의 빈자리를 ' + s.pairCount + '곳이나 채워 줍니다. 생활에서 한 사람이 막힐 때 다른 사람이 자연스럽게 길을 열어 주는 구조라, 함께 사는 시간이 길어질수록 안정됩니다.');
    } else if (s.pairCount === 1) {
      t.push('서로의 빈자리 하나를 정확히 채워 주는 관계입니다. 그 한 곳이 두 사람 사이에서 가장 자주 쓰이는 통로가 됩니다.');
    } else {
      t.push('서로의 빈자리를 크게 메우는 조합은 아닙니다. 대신 두 사람이 가진 기운의 온도가 비슷해, 함께 채워 가는 쪽에 가깝습니다. 취미나 생활 습관을 하나씩 같이 만들어 가면 관계가 단단해집니다.');
    }
    if (s.branchRel.type === 'chung') {
      t.push('일지의 충은 함께 사는 자리에서 생활 리듬이 어긋나기 쉽다는 뜻입니다. 수면 시간·청소·돈 쓰는 방식처럼 매일 반복되는 규칙을 초반에 정해 두면 충돌이 크게 줄어듭니다.');
    } else if (s.branchRel.type === 'yukhap' || s.branchRel.type === 'samhap') {
      t.push('일지의 합은 가정을 이루는 자리에서 힘이 됩니다. 집안일과 결정을 나눠 맡을수록 시너지가 커집니다.');
    }
    if (s.clashes.length) {
      t.push('다만 두 사람의 지지에서 ' + s.clashes.slice(0, 3).join(', ') + '이 보입니다. 사소한 서운함이 쌓이지 않도록 그때그때 말로 꺼내는 편이 낫습니다.');
    }
    return t.join(' ');
  }

  function workText(nA, nB, chartA, chartB, s) {
    var tA = tendencyOf(chartA.dayMasterElem);
    var tB = tendencyOf(chartB.dayMasterElem);
    var t = [];
    if (tA !== tB) {
      var opener = tA === 'open' || (tA === 'center' && tB === 'close') ? nA : nB;
      var closer = opener === nA ? nB : nA;
      t.push('함께 일하거나 공부할 때는 ' + opener + josa(opener, '이', '가') + ' 방향을 잡고 ' + closer + josa(closer, '이', '가') + ' 마무리하는 식으로 역할이 갈리면 잘 굴러갑니다.');
    } else {
      t.push('두 사람 모두 ' + (tA === 'center' ? '중심을 잡는' : tA === 'open' ? '시작하는' : '마무리하는') + ' 쪽에 강합니다. 같은 자리를 두고 부딪히기 쉬우니, 맡을 범위를 미리 나누는 것이 좋습니다.');
    }
    if (s.aFillsB.list.length) {
      t.push(nA + '의 ' + elemList(s.aFillsB.list) + ' 기운이 ' + nB + '에게 얇은 자리를 채워, ' + nB + josa(nB, '이', '가') + ' 막힐 때 ' + nA + josa(nA, '이', '가') + ' 판을 열어 줄 수 있습니다.');
    }
    if (s.bFillsA.list.length) {
      t.push('반대로 ' + nB + '의 ' + elemList(s.bFillsA.list) + ' 기운은 ' + nA + '에게 없는 부분이라, 결정을 정리하고 마무리하는 자리에서 ' + nB + '의 조언이 힘이 됩니다.');
    }
    if (s.hapStem) {
      t.push('일간이 천간합을 이뤄 처음 만난 순간부터 통하는 대화가 있습니다. 함께 공부를 시작하면 진도가 빨리 나가는 편입니다.');
    }
    return t.join(' ');
  }

  function cautionText(nA, nB, chartA, chartB, s) {
    var t = [];
    if (s.rel === 'geuk') {
      t.push('가장 조심할 것은 서로를 고치려는 마음입니다. 상극의 관계는 상대의 방식이 틀려 보이는 순간이 자주 오는데, 그때 ‘왜 저렇게 하지’보다 ‘저 사람은 저렇게 하는구나’를 먼저 떠올리면 크게 다투지 않습니다.');
    } else if (s.rel === 'same') {
      t.push('같은 기운끼리는 자존심이 부딪히기 쉽습니다. 둘 다 한 발씩 물러나는 규칙, 예를 들어 다툰 날에는 먼저 연락하는 사람을 정해 두는 것이 도움이 됩니다.');
    } else {
      t.push('상생의 관계에서도 지나친 기대는 부담이 됩니다. 한 사람이 계속 주는 쪽이 되지 않도록, 받는 쪽에서 먼저 고마움을 말해 주세요.');
    }
    if (s.clashes.length) {
      t.push('두 사람의 지지에서 ' + s.clashes.slice(0, 3).join(', ') + '이 겹칩니다. 말과 약속에서 오해가 생기기 쉬운 자리이니, 중요한 약속은 문자로 남겨 두세요.');
    } else {
      t.push('지지에서 크게 부딪히는 자리는 없습니다. 다만 ' + nB + '의 생활 리듬이 ' + nA + '와 다를 수 있으니, 시간 약속만 조금 여유 있게 잡으면 좋습니다.');
    }
    return t.join(' ');
  }

  function remedyText(nA, nB, chartA, chartB, s) {
    var t = [];

    [['A', nA, s.holeA], ['B', nB, s.holeB]].forEach(function (row) {
      if (row[2].length) {
        t.push(row[1] + '에게 비어 있는 ' + elemList(row[2]) + '의 기운은 ' + R.ELEMENT_META[row[2][0]].lack);
      }
    });
    if (!s.holeA.length && !s.holeB.length) {
      t.push('두 사람 모두 다섯 기운이 모두 있습니다. 무리하게 채우기보다, 함께하는 시간의 리듬을 일정하게 만드는 것이 이 관계에 가장 잘 맞습니다.');
    }
    var common = s.thinA.filter(function (i) { return s.thinB.indexOf(i) >= 0; });
    if (common.length) {
      t.push('두 사람 모두에게 얇은 ' + elemList(common) + ' 기운은 함께 채우면 좋습니다. 같은 취미나 같은 장소를 하나 정해 두고 반복하는 것만으로도 관계의 중심이 생깁니다.');
    }
    t.push('궁합은 정해진 답이 아니라, 서로를 이해하는 데 쓰는 지도입니다.');
    return t.join(' ');
  }

  /* ------------------------------------------------------------ 그리기 */

  var lastResult = null;

  function nameOf(key) {
    var n = ($('#' + key + '-name').value || '').trim();
    return n || (key === 'a' ? '나' : '상대');
  }

  function render() {
    var err = $('#compat-error');
    err.hidden = true;

    var chartA, chartB;
    try {
      chartA = readPerson('a');
      chartB = readPerson('b');
    } catch (e) {
      err.textContent = e.message || '생년월일을 확인해 주세요.';
      err.hidden = false;
      err.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    var nA = nameOf('a');
    var nB = nameOf('b');
    var s = scorePair(chartA, chartB);
    lastResult = { chartA: chartA, chartB: chartB, s: s, nA: nA, nB: nB };

    // 점수
    var band = bandOf(s.total);
    $('#score-num').textContent = s.total;
    $('#score-title').textContent = band.title;
    $('#score-line').textContent = band.line;

    var arc = $('#score-arc');
    var CIRC = 2 * Math.PI * 54;
    arc.style.strokeDasharray = CIRC;
    arc.style.strokeDashoffset = CIRC;
    setTimeout(function () {
      arc.style.strokeDashoffset = CIRC * (1 - s.total / 100);
    }, 60);

    var bars = [
      ['일간의 관계', s.relScore, 30],
      ['일지의 관계', s.branchScore, 25],
      ['오행의 보완', s.compScore, 25],
      ['천간의 합', s.stemScore, 10],
      ['지지의 합·충', s.extraScore, 10]
    ];
    $('#score-bars').innerHTML = bars.map(function (b) {
      var pct = clamp((b[1] / b[2]) * 100, 0, 100);
      return '<div class="score-bar"><span class="sb-name">' + b[0] + '</span>' +
        '<span class="sb-track"><span class="sb-fill" style="width:0"></span></span>' +
        '<span class="sb-val">' + Math.round(b[1]) + '/' + b[2] + '</span></div>';
    }).join('');
    setTimeout(function () {
      $$('#score-bars .sb-fill').forEach(function (el, i) {
        var pct = clamp((bars[i][1] / bars[i][2]) * 100, 0, 100);
        el.style.width = pct + '%';
      });
    }, 120);

    // 연결 표
    $('#relation-note').textContent = chartA.dayPillar.stemHanja + ' · ' + chartB.dayPillar.stemHanja;
    var relRows = [
      ['일간', chartA.dayPillar.stemKo + ' ' + ELEMENTS[chartA.dayMasterElem] +
        ' × ' + chartB.dayPillar.stemKo + ' ' + ELEMENTS[chartB.dayMasterElem] + ' — ' + DAY_REL[s.rel].label,
        s.relScore + ' / 30'],
      ['일지', chartA.dayPillar.branchKo + ' ' + ELEMENTS[chartA.dayPillar.branchElem] +
        ' ↔ ' + chartB.dayPillar.branchKo + ' ' + ELEMENTS[chartB.dayPillar.branchElem] + ' — ' + s.branchRel.label,
        s.branchScore + ' / 25']
    ];
    if (s.hapStem) relRows.push(['천간합', '두 사람의 일간이 합(合)을 이룹니다', s.stemScore + ' / 10']);
    if (s.extraNotes.length) relRows.push(['지지의 합', s.extraNotes.slice(0, 3).join(', '), s.extraScore + ' / 10']);
    if (s.pairCount) {
      var fillText = [];
      if (s.aFillsB.list.length) fillText.push(nA + ' → ' + nB + ' ' + elemList(s.aFillsB.list));
      if (s.bFillsA.list.length) fillText.push(nB + ' → ' + nA + ' ' + elemList(s.bFillsA.list));
      relRows.push(['오행 보완', fillText.join(' · '), s.compScore + ' / 25']);
    } else {
      relRows.push(['오행 보완', '서로의 빈자리를 크게 메우지는 않는 조합', s.compScore + ' / 25']);
    }
    $('#relation-body').innerHTML = relRows.map(function (r) {
      return '<tr><td>' + r[0] + '</td><td style="text-align:left;font-size:13.2px;color:var(--ink)">' + r[1] + '</td><td>' + r[2] + '</td></tr>';
    }).join('');

    // 두 사람 카드
    renderPerson('a', chartA, nA);
    renderPerson('b', chartB, nB);

    // 해석
    var readings = [
      { t: '연애 케미', p: loveText(nA, nB, chartA, chartB, s) },
      { t: '결혼 · 생활 케미', p: marriageText(nA, nB, s) },
      { t: '일 · 공부 케미', p: workText(nA, nB, chartA, chartB, s) },
      { t: '주의할 점', p: cautionText(nA, nB, chartA, chartB, s) },
      { t: '보완 팁', p: remedyText(nA, nB, chartA, chartB, s) }
    ];
    $('#readings').innerHTML = readings.map(function (r) {
      return '<div class="reading-card"><h4>' + r.t + '</h4><p>' + r.p + '</p></div>';
    }).join('');

    var result = $('#compat-result');
    result.hidden = false;
    result.classList.remove('is-in');
    void result.offsetWidth;
    result.classList.add('is-in');
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderPerson(key, chart, name) {
    $('#name-' + key).textContent = name;
    $('#zodiac-' + key).textContent = chart.zodiac + '띠 · ' + chart.pillars.length + '기둥';
    var profile = R.STEM_PROFILE[chart.dayMaster];
    $('#dm-' + key).textContent = chart.dayPillar.stemHanja + ' ' + chart.dayPillar.stemKo +
      ELEMENTS[chart.dayMasterElem];
    $('#dm-img-' + key).textContent = profile.image;

    $('#pillars-' + key).innerHTML = chart.pillars.map(function (p) {
      return '<div><span class="ps-label">' + p.label + '</span><span class="ps-char">' +
        p.stemHanja + p.branchHanja + '</span></div>';
    }).join('');

    $('#elems-' + key).innerHTML = chart.elements.map(function (c, i) {
      var weak = c <= 1;
      return '<div class="cm-row"><span>' + ELEMENTS[i] + '(' + ELEMENTS_HANJA[i] + ')</span>' +
        '<b style="color:' + (weak ? 'var(--ink-3)' : 'var(--ink)') + '">' + c + '</b></div>';
    }).join('');
  }

  /* ------------------------------------------------------------ 복사 */

  function copyText() {
    if (!lastResult) return '';
    var s = lastResult.s;
    var lines = [
      '[사주결 궁합] ' + lastResult.nA + ' × ' + lastResult.nB + ' — ' + s.total + '점',
      '· 일간: ' + lastResult.chartA.dayPillar.stemKo + ' ' + ELEMENTS[lastResult.chartA.dayMasterElem] +
        ' × ' + lastResult.chartB.dayPillar.stemKo + ' ' + ELEMENTS[lastResult.chartB.dayMasterElem] +
        ' (' + DAY_REL[s.rel].label + ')',
      '· 일지: ' + lastResult.chartA.dayPillar.branchKo + ' ↔ ' + lastResult.chartB.dayPillar.branchKo +
        ' (' + s.branchRel.label + ')',
      '· 오행 보완: ' + s.pairCount + '곳',
      '· ' + bandOf(s.total).title,
      'https://y44313246-ux.github.io/compat.html'
    ];
    var text = lines.join('\n');

    var btn = $('#copy-btn');
    var done = function (ok) {
      btn.textContent = ok ? '복사했습니다' : '복사에 실패했습니다';
      btn.classList.add('is-done');
      setTimeout(function () {
        btn.textContent = '결과 문장 복사';
        btn.classList.remove('is-done');
      }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(text, done); });
    } else {
      fallback(text, done);
    }
  }

  function fallback(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    done(ok);
  }

  /* ------------------------------------------------------------ 시작 */

  function init() {
    initPerson('a', 1998);
    initPerson('b', 1998);

    $('#compat-form').addEventListener('submit', function (e) {
      e.preventDefault();
      render();
    });

    $('#copy-btn').addEventListener('click', copyText);

    $('#again-btn').addEventListener('click', function () {
      $('#compat-result').hidden = true;
      $('#compat-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
      $('#a-name').focus({ preventScroll: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
