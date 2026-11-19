/* =========================================================================
 * 사주결 · app.js — 화면 조립과 상호작용 (전부 무료 버전)
 * ========================================================================= */
(function () {
  'use strict';

  var C = window.SajuCore;
  var R = window.SajuReading;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var state = { calendar: 'solar', gender: 'female', chart: null };

  /* ------------------------------------------------------------ 폼 구성 */
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /* 받침에 따라 조사를 고릅니다. (예: 을+이, 무+가) */
  function josa(word, withFinal, withoutFinal) {
    var w = String(word);
    var c = w.charCodeAt(w.length - 1);
    if (c < 0xAC00 || c > 0xD7A3) return withoutFinal;
    return (c - 0xAC00) % 28 === 0 ? withoutFinal : withFinal;
  }

  function daysInMonth(y, m) {
    if (!y || !m) return 31;
    return new Date(y, m, 0).getDate();
  }

  function isRealDate(y, m, d) {
    var dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  }

  function fillSelect(sel, items, placeholder) {
    var html = '';
    if (placeholder) html += '<option value="">' + placeholder + '</option>';
    items.forEach(function (it) {
      html += '<option value="' + it.value + '"' + (it.selected ? ' selected' : '') + '>' + it.label + '</option>';
    });
    sel.innerHTML = html;
  }

  function initForm() {
    var years = [];
    for (var y = 2025; y >= 1920; y--) years.push({ value: y, label: y + '년' });
    fillSelect($('#f-year'), years, '연도');

    var months = [];
    for (var m = 1; m <= 12; m++) months.push({ value: m, label: m + '월' });
    fillSelect($('#f-month'), months, '월');

    fillDays();

    var hours = [{ value: '', label: '시간 모름' }];
    for (var h = 0; h < 24; h++) {
      var branch = C.BRANCHES[Math.floor(((h + 1) % 24) / 2)];
      hours.push({ value: h, label: pad2(h) + '시 (' + branch + '시)' });
    }
    fillSelect($('#f-hour'), hours);

    $('#f-month').addEventListener('change', fillDays);
    $('#f-year').addEventListener('change', fillDays);

    // 양력 / 음력
    $('#seg-calendar').addEventListener('click', function (e) {
      var btn = e.target.closest('.seg-btn');
      if (!btn) return;
      setSeg('#seg-calendar', btn);
      state.calendar = btn.dataset.value;
      $('#leap-wrap').hidden = state.calendar !== 'lunar';
      fillDays();
    });

    // 성별
    $('#seg-gender').addEventListener('click', function (e) {
      var btn = e.target.closest('.seg-btn');
      if (!btn) return;
      setSeg('#seg-gender', btn);
      state.gender = btn.dataset.value;
    });

    $('#saju-form').addEventListener('submit', onSubmit);
  }

  function setSeg(sel, btn) {
    $$(sel + ' .seg-btn').forEach(function (b) {
      var on = b === btn;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }

  function fillDays() {
    var isLunar = state.calendar === 'lunar';
    var max = isLunar ? 30 : daysInMonth(+$('#f-year').value, +$('#f-month').value);
    var cur = $('#f-day').value;
    var days = [];
    for (var d = 1; d <= max; d++) days.push({ value: d, label: d + '일' });
    fillSelect($('#f-day'), days, '일');
    if (cur && +cur <= max) $('#f-day').value = cur;
  }

  /* ------------------------------------------------------------ 제출 */
  function showError(msg) {
    var el = $('#form-error');
    el.textContent = msg;
    el.hidden = false;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function onSubmit(e) {
    e.preventDefault();
    var err = $('#form-error');
    err.hidden = true;

    var year = +$('#f-year').value;
    var month = +$('#f-month').value;
    var day = +$('#f-day').value;
    if (!year || !month || !day) return showError('생년월일을 모두 선택해 주세요.');
    if (state.calendar === 'solar' && !isRealDate(year, month, day)) {
      return showError('달력에 없는 날짜입니다. 생년월일을 다시 확인해 주세요.');
    }

    var hourVal = $('#f-hour').value;
    var input = {
      name: $('#f-name').value,
      gender: state.gender,
      calendar: state.calendar,
      leap: $('#f-leap').checked,
      year: year, month: month, day: day,
      hour: hourVal === '' ? null : +hourVal,
      minute: 0
    };

    var chart;
    try {
      chart = C.compute(input);
    } catch (ex) {
      return showError(ex.message || '생년월일을 확인해 주세요.');
    }

    state.chart = chart;
    render(chart);

    var result = $('#result');
    result.hidden = false;
    result.classList.remove('is-in');
    void result.offsetWidth;
    result.classList.add('is-in');
    setTimeout(function () {
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  /* ------------------------------------------------------------ 렌더 */
  var WEEK = ['일', '월', '화', '수', '목', '금', '토'];

  function fmtDate(y, m, d) {
    var dt = new Date(y, m - 1, d);
    return y + '년 ' + m + '월 ' + d + '일 (' + WEEK[dt.getDay()] + ')';
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function render(chart) {
    var name = chart.input.name;
    var today = C.today();
    var tp = C.pillarOfDate(today.y, today.m, today.d);
    var fortune = R.todayFortune(chart, tp);
    var profile = R.stemProfile(chart.dayMaster);
    var balance = R.elementBalance(chart.elements);

    $('#result-date').textContent = today.y + '.' + pad2(today.m) + '.' + pad2(today.d) + ' 오늘의 명식';
    $('#result-title').textContent = name ? name + '님의 사주' : '사주명식';

    var sub = [];
    sub.push('<strong>' + fmtDate(chart.solar.y, chart.solar.m, chart.solar.d) + '</strong>');
    sub.push(chart.hourKnown ? pad2(chart.input.hour) + '시' : '시간 모름');
    sub.push(chart.input.gender === 'male' ? '남성' : chart.input.gender === 'female' ? '여성' : '');
    sub.push(chart.input.calendar === 'lunar' ? '음력 ' + (chart.input.leap ? '윤' : '') + chart.input.month + '월 ' + chart.input.day + '일' : '양력');
    $('#result-sub').innerHTML = sub.filter(Boolean).join(' · ');

    /* 요약 */
    $('#master-hanja').textContent = C.STEMS_HANJA[chart.dayMaster];
    $('#master-name').textContent = C.STEMS[chart.dayMaster] + C.ELEMENTS[chart.dayMasterElem] +
      ' · ' + profile.title;
    $('#master-img').textContent = profile.image;
    $('#summary-headline').textContent = fortune.headline;
    $('#summary-text').textContent = fortune.summary;

    $('#gauge-num').textContent = fortune.score;
    var circle = $('#gauge-fg');
    circle.style.strokeDashoffset = 326.7;
    setTimeout(function () {
      circle.style.strokeDashoffset = (326.7 * (1 - fortune.score / 100)).toFixed(1);
    }, 240);

    var meta = [];
    meta.push(chart.zodiac + '띠');
    if (chart.lunar) meta.push('음력 ' + chart.lunar.m + '월 ' + chart.lunar.d + '일' + (chart.lunar.leap ? ' (윤달)' : ''));
    meta.push('일주 ' + chart.dayPillar.stemKo + chart.dayPillar.branchKo);
    meta.push('오행 ' + balance.strongest.ko + ' ' + balance.strongest.count + '개');
    if (balance.missing.length) meta.push(balance.missing.map(function (m) { return m.ko; }).join('·') + ' 없음');
    $('#summary-meta').innerHTML = meta.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');

    renderPillars(chart);
    renderElements(balance);
    renderNature(profile, chart);
    renderFortune(fortune, tp);
    renderDomains(chart);
    renderYears(chart);
  }

  function renderPillars(chart) {
    var html = chart.pillars.map(function (p) {
      return '' +
        '<div class="pillar' + (p.isMe ? ' is-me' : '') + '">' +
          (p.isMe ? '<span class="me-badge">나</span>' : '') +
          '<span class="p-label">' + p.label + '</span>' +
          '<span class="p-god">' + p.stemGod + '</span>' +
          '<div class="p-glyph"><b class="e' + p.stemElem + '">' + p.stemKo + '</b><i>' + p.stemHanja + '</i></div>' +
          '<div class="p-glyph"><b class="e' + p.branchElem + '">' + p.branchKo + '</b><i>' + p.branchHanja + '</i></div>' +
          '<span class="p-elem">' + C.ELEMENTS[p.stemElem] + ' · ' + C.ELEMENTS[p.branchElem] + (p.branchGod ? ' · ' + p.branchGod : '') + '</span>' +
        '</div>';
    });
    if (!chart.hourKnown) {
      html.push('<div class="pillar is-empty"><span class="p-label">시주</span><span class="p-god">—</span>' +
        '<div class="p-glyph"><b style="color:#B4AA9A">?</b><i>모름</i></div>' +
        '<div class="p-glyph"><b style="color:#B4AA9A">·</b><i>·</i></div>' +
        '<span class="p-elem">시간 미입력</span></div>');
    }
    $('#pillars').innerHTML = html.join('');
    $('#pillar-note').textContent = '자시(23시) 기준 · 절입 시각 반영';
    $('#pillar-caption').textContent = '일주 ' + chart.dayPillar.stemKo + chart.dayPillar.branchKo + '의 ' +
      C.STEMS[chart.dayMaster] + josa(C.STEMS[chart.dayMaster], '이', '가') +
      ' 나의 중심(일간)입니다. 같은 글자라도 계절과 짝에 따라 다르게 쓰입니다.';
  }

  function renderElements(balance) {
    var html = balance.rows.map(function (r) {
      var label = { '과다': '강함', '적정': '고름', '부족': '약함', '없음': '없음' }[r.state];
      return '' +
        '<div class="el-row">' +
          '<span class="el-name e' + r.elem + '">' + r.hanja + '<small>' + r.ko + '</small></span>' +
          '<span class="el-track"><span class="el-fill" data-w="' + (r.count === 0 ? 0 : Math.max(8, r.pct)) + '" style="background:linear-gradient(90deg,' + r.color + 'aa,' + r.color + ')"></span></span>' +
          '<span class="el-count"><b>' + r.count + '</b> · ' + label + '</span>' +
        '</div>';
    });
    $('#elements').innerHTML = html.join('');
    $('#element-note').textContent = '여덟 글자 기준';
    $('#element-summary').textContent = balance.summary;
    setTimeout(function () {
      $$('.el-fill').forEach(function (el) { el.style.width = el.dataset.w + '%'; });
    }, 120);
  }

  function renderNature(profile, chart) {
    $('#nature-keyword').textContent = profile.keywords.join(' · ');
    $('#nature-lead').innerHTML = C.STEMS_HANJA[chart.dayMaster] + ' ' + C.STEMS[chart.dayMaster] +
      ' — <em>' + esc(profile.image) + '</em>';
    $('#nature-body').textContent = profile.essence;
    $('#nature-strength').textContent = profile.strength;
    $('#nature-caution').textContent = profile.caution;
    $('#nature-fit').innerHTML = '<b>어울리는 자리</b> · ' + esc(profile.fit);
  }

  function renderFortune(fortune, tp) {
    var rows = [
      { key: 'money', name: '재물운', hanja: '財' },
      { key: 'love', name: '인연운', hanja: '緣' },
      { key: 'health', name: '건강운', hanja: '身' }
    ];
    $('#today-ganji').textContent = tp.ganjiText.replace('일 (', ' (');
    $('#fortune-list').innerHTML = rows.map(function (row) {
      var d = fortune.domains[row.key];
      return '' +
        '<div class="fortune-item">' +
          '<div class="f-head">' +
            '<span class="f-name">' + row.name + '<span>' + row.hanja + '</span></span>' +
            '<span class="f-score">' + d.score + '점</span>' +
          '</div>' +
          '<p class="f-text">' + esc(d.text) + '</p>' +
        '</div>';
    }).join('');
  }

  /* ------------------------------------------------------------ 무료 심층 풀이 */
  function domainCard(d) {
    return '' +
      '<article class="card domain-card">' +
        '<div class="card-head row">' +
          '<div><span class="mini-label">' + d.hanja + '</span><h3>' + d.name + '</h3></div>' +
          '<span class="note">' + esc(d.note) + '</span>' +
        '</div>' +
        '<p class="domain-lead">' + esc(d.lead) + '</p>' +
        '<div class="domain-body">' +
          d.paras.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
        '</div>' +
      '</article>';
  }

  function renderDomains(chart) {
    var counts = R.tenGodCounts(chart);
    var strength = R.strengthOf(chart, counts);
    var list = [
      R.moneyReading(chart, counts, strength),
      R.careerReading(chart, counts, strength),
      R.loveReading(chart, counts, strength),
      R.healthReading(chart, counts, strength)
    ];
    $('#domains').innerHTML = list.map(domainCard).join('');
  }

  /* ------------------------------------------------------------ 신년운세 */
  function monthCell(m) {
    var dots = '';
    for (var i = 1; i <= 3; i++) dots += '<i' + (i <= m.level ? ' class="on"' : '') + '></i>';
    return '' +
      '<div class="month-cell lv' + m.level + '">' +
        '<div class="m-top">' +
          '<span class="m-name">' + m.label + '</span>' +
          '<span class="m-ganji">' + m.hanja + ' <em>' + m.ganji + '</em></span>' +
          '<span class="m-dots" aria-label="기운 ' + m.level + '단계">' + dots + '</span>' +
        '</div>' +
        '<p class="m-text">' + esc(m.text) + '</p>' +
      '</div>';
  }

  function yearCard(yr, collapsed) {
    if (!yr) return '';
    var months = yr.months.map(monthCell).join('');
    var monthBlock = collapsed
      ? '<details class="month-more"><summary>' + yr.year + '년 월별 흐름 펼쳐 보기</summary><div class="month-grid">' + months + '</div></details>'
      : '<div class="month-block"><div class="month-head"><span class="mini-label">月別</span><h4>월별 흐름</h4><span class="note">점 세 개가 기운의 세기</span></div><div class="month-grid">' + months + '</div></div>';

    var sections = yr.sections.map(function (s) {
      return '' +
        '<section class="year-sec">' +
          '<div class="year-sec-head"><span class="sec-hanja">' + s.hanja + '</span><h4>' + s.title + '</h4></div>' +
          s.paras.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
        '</section>';
    }).join('');

    return '' +
      '<article class="card year-card">' +
        '<div class="card-head row">' +
          '<div><span class="mini-label">' + yr.hanja + ' · ' + yr.year + '</span><h3>' + yr.label + ' 신년운세</h3></div>' +
          '<span class="note">' + yr.god + '의 해</span>' +
        '</div>' +
        '<p class="year-headline">' + esc(yr.headline) + '</p>' +
        '<p class="year-theme">' + esc(yr.theme) + '</p>' +
        '<div class="kw-row">' + yr.keywords.map(function (k) { return '<span class="kw">' + esc(k) + '</span>'; }).join('') + '</div>' +
        '<div class="year-sections">' + sections + '</div>' +
        monthBlock +
        '<p class="card-foot">흐름이 무거운 달은 ' + (yr.risky.length ? yr.risky.slice(0, 3).join('·') : '없음') +
        ', 힘이 실리는 달은 ' + (yr.good.length ? yr.good.slice(0, 3).join('·') : '고르게 이어짐') + '입니다.</p>' +
      '</article>';
  }

  function renderYears(chart) {
    var host = $('#years');
    host.innerHTML = yearCard(R.yearReading(chart, 2026), false) + yearCard(R.yearReading(chart, 2027), true);
  }

  /* ------------------------------------------------------------ 광고 슬롯 */
  /* 실제 광고 코드가 들어온 뒤, 결과를 다시 그릴 때 슬롯을 다시 채웁니다. */
  function refreshAds() {
    var slots = $$('.ad-slot ins.adsbygoogle');
    if (!slots.length) return;
    slots.forEach(function () {
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { /* 광고 미설정 */ }
    });
  }

  initForm();
  refreshAds();
})();
