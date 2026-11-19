/* =========================================================================
 * 사주결 · salary-calc.js — 2027 연봉 실수령액 계산기
 * 의존성 없음. 모든 계산은 브라우저 안에서만 이루어집니다.
 *
 * 기준 (2027년)
 *  - 국민연금 10% (근로자 5%)            · 2025년 국민연금법 개정 부칙
 *  - 건강보험 7.19% 동결 (근로자 3.595%) · 2026.9.8 건강보험정책심의위원회
 *  - 장기요양 건강보험료의 13.90%        · 2026.10.30 장기요양위원회
 *  - 고용보험 실업급여 1.8% (근로자 0.9%) · 정부 인상안(각 1%)은 미확정
 *  - 국민연금 기준소득월액 41만 ~ 659만 원 (2026.7~2027.6 적용)
 * ========================================================================= */
(function () {
  'use strict';

  var RATE = {
    pension: 0.05,
    health: 0.03595,
    ltcOfHealth: 0.1390,     // 장기요양보험료 = 건강보험료 × 13.90%
    employment: 0.009,
    employer: {
      pension: 0.05,
      health: 0.03595,
      ltcOfHealth: 0.1390,
      employment: 0.009,
      stable: 0.0025,        // 고용안정·직업능력개발 (150인 미만)
      industrial: 0.0147     // 산재보험 업종 평균
    },
    pensionMin: 410000,
    pensionMax: 6590000,
    mealFreeMax: 200000
  };

  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };
  var won = function (n) { return Math.round(n).toLocaleString('ko-KR'); };
  var round10 = function (n) { return Math.floor(n / 10) * 10; };
  var round1000down = function (n) { return Math.floor(n / 1000) * 1000; };

  /* ------------------------------------------------------------ 세금 계산 */

  // 근로소득공제 (총급여 기준, 한도 2,000만 원)
  function earnedIncomeDeduction(gross) {
    var d;
    if (gross <= 5000000) d = gross * 0.7;
    else if (gross <= 15000000) d = 3500000 + (gross - 5000000) * 0.4;
    else if (gross <= 45000000) d = 7500000 + (gross - 15000000) * 0.15;
    else if (gross <= 100000000) d = 12000000 + (gross - 45000000) * 0.05;
    else d = 14750000 + (gross - 100000000) * 0.02;
    return Math.min(d, 20000000);
  }

  // 기본세율 (2023년 이후 과세표준 구간)
  function progressiveTax(base) {
    if (base <= 14000000) return base * 0.06;
    if (base <= 50000000) return 840000 + (base - 14000000) * 0.15;
    if (base <= 88000000) return 6240000 + (base - 50000000) * 0.24;
    if (base <= 150000000) return 15360000 + (base - 88000000) * 0.35;
    if (base <= 300000000) return 37060000 + (base - 150000000) * 0.38;
    if (base <= 500000000) return 94060000 + (base - 300000000) * 0.4;
    if (base <= 1000000000) return 174060000 + (base - 500000000) * 0.42;
    return 254060000 + (base - 1000000000) * 0.45;
  }

  // 근로소득세액공제 (산출세액 기준, 총급여별 한도)
  function wageIncomeTaxCredit(computed, gross) {
    var credit = computed <= 1300000
      ? computed * 0.55
      : 715000 + (computed - 1300000) * 0.3;
    var cap;
    if (gross <= 33000000) cap = 740000;
    else if (gross <= 70000000) cap = Math.max(500000, 660000 - (gross - 33000000) * 0.005);
    else if (gross <= 120000000) cap = Math.max(200000, 500000 - (gross - 70000000) * 0.005);
    else cap = Math.max(0, 200000 - (gross - 120000000) * 0.005);
    return Math.min(credit, cap);
  }

  /* ------------------------------------------------------------ 한 사람 계산 */

  /**
   * @param {number} monthlyGross 세전 월 급여(원)
   * @param {number} mealFree     비과세 식대(원, 월)
   * @param {number} dependents   부양가족 수(본인 포함)
   */
  function compute(monthlyGross, mealFree, dependents) {
    var gross = Math.max(0, monthlyGross || 0);
    var free = Math.min(Math.max(0, mealFree || 0), RATE.mealFreeMax, gross);
    var taxable = Math.max(0, gross - free);

    // 국민연금: 기준소득월액 상·하한 적용
    var pensionBase = Math.min(Math.max(taxable, RATE.pensionMin), RATE.pensionMax);
    if (taxable <= 0) pensionBase = 0;

    var pension = round10(pensionBase * RATE.pension);
    var health = round10(taxable * RATE.health);
    var ltc = round10(taxable * RATE.health * RATE.ltcOfHealth);
    var employment = round10(taxable * RATE.employment);
    var insuranceTotal = pension + health + ltc + employment;

    // 소득세 (연간 기준 → 12로 나눔)
    var annualGross = taxable * 12;                       // 비과세 제외 총급여
    var earned = Math.max(0, annualGross - earnedIncomeDeduction(annualGross));
    var personalDeduction = 1500000 * Math.max(1, dependents);
    var taxBaseRaw = Math.max(0, earned - personalDeduction - pension * 12 - (health + ltc) * 12);
    var taxBase = round1000down(taxBaseRaw);
    var computedTax = progressiveTax(taxBase);
    var credit = wageIncomeTaxCredit(computedTax, annualGross);
    var incomeTaxAnnual = Math.max(0, Math.round(computedTax - credit));
    var localTaxAnnual = Math.round(incomeTaxAnnual * 0.1);

    var incomeTax = round10(incomeTaxAnnual / 12);
    var localTax = round10(localTaxAnnual / 12);

    var deductionTotal = insuranceTotal + incomeTax + localTax;
    var net = Math.round((gross - deductionTotal) / 10) * 10;

    return {
      gross: gross, free: free, taxable: taxable,
      pension: pension, health: health, ltc: ltc, employment: employment,
      insuranceTotal: insuranceTotal,
      taxBase: taxBase, computedTax: computedTax, credit: credit,
      incomeTaxAnnual: incomeTaxAnnual, localTaxAnnual: localTaxAnnual,
      incomeTax: incomeTax, localTax: localTax,
      deductionTotal: deductionTotal, net: net,
      deductionRate: gross > 0 ? deductionTotal / gross : 0,
      employer: employerCost(taxable, pensionBase)
    };
  }

  function employerCost(taxable, pensionBase) {
    var e = RATE.employer;
    var pension = round10(pensionBase * e.pension);
    var health = round10(taxable * e.health);
    var ltc = round10(taxable * e.health * e.ltcOfHealth);
    var employment = round10(taxable * (e.employment + e.stable));
    var industrial = round10(taxable * e.industrial);
    return {
      pension: pension, health: health, ltc: ltc,
      employment: employment, industrial: industrial,
      total: pension + health + ltc + employment + industrial
    };
  }

  /* ------------------------------------------------------------ 화면 */

  var state = { payType: 'annual', amount: 4000 };

  var ANNUAL_CHIPS = [3000, 3500, 4000, 5000, 6000, 8000, 10000];
  var MONTHLY_CHIPS = [250, 300, 350, 400, 500, 600];

  function currentInputs() {
    var amount = parseFloat($('#pay-amount').value);
    if (!isFinite(amount) || amount < 0) amount = 0;
    var mealFree = (+$('#meal-free').value || 0) * 10000;
    var dependents = +$('#dependents').value || 1;
    var monthlyGross = state.payType === 'annual' ? (amount * 10000) / 12 : amount * 10000;
    return { amount: amount, monthlyGross: monthlyGross, mealFree: mealFree, dependents: dependents };
  }

  function renderChips() {
    var list = state.payType === 'annual' ? ANNUAL_CHIPS : MONTHLY_CHIPS;
    var cur = parseFloat($('#pay-amount').value);
    $('#amount-chips').innerHTML = list.map(function (v) {
      return '<button type="button" class="chip' + (Math.abs(cur - v) < 0.05 ? ' is-on' : '') +
        '" data-value="' + v + '">' + won(v) + '만</button>';
    }).join('');
  }

  function render() {
    var inp = currentInputs();
    var r = compute(inp.monthlyGross, inp.mealFree, inp.dependents);

    $('#net-monthly').innerHTML = won(r.net) + '<small>원</small>';
    $('#net-yearly').textContent = won(r.net * 12) + '원';
    $('#net-deduction').textContent = won(r.deductionTotal) + '원';
    $('#net-rate').textContent = (r.deductionRate * 100).toFixed(1) + '%';
    $('#base-note').textContent = '과세 보수 ' + won(r.taxable) + '원';

    $('#net-note').textContent = '월 급여 ' + won(r.gross) + '원 = 과세 ' + won(r.taxable) +
      '원 + 비과세 ' + won(r.free) + '원 · 2027년 요율 기준';

    var rows = [
      ['국민연금', '5%', r.pension],
      ['건강보험', '3.595%', r.health],
      ['장기요양보험', '건보료의 13.90%', r.ltc],
      ['고용보험', '0.9%', r.employment],
      ['소득세', '연간 기준 ÷ 12', r.incomeTax],
      ['지방소득세', '소득세의 10%', r.localTax]
    ];
    var html = rows.map(function (row) {
      return '<tr><td>' + row[0] + '</td>' +
        '<td><span class="rate">' + row[1] + '</span></td><td>' + won(row[2]) + '원</td></tr>';
    }).join('');
    html += '<tr class="sum"><td>공제 합계</td><td></td><td>' + won(r.deductionTotal) + '원</td></tr>';
    $('#ded-body').innerHTML = html;

    var emp = r.employer;
    var empRows = [
      ['국민연금', '5%', emp.pension],
      ['건강보험', '3.595%', emp.health],
      ['장기요양보험', '건보료의 13.90%', emp.ltc],
      ['고용보험', '0.9% + 고용안정 0.25%', emp.employment],
      ['산재보험', '업종 평균 1.47%', emp.industrial]
    ];
    $('#employer-body').innerHTML = empRows.map(function (row) {
      return '<tr><td>' + row[0] + '</td>' +
        '<td><span class="rate">' + row[1] + '</span></td><td>' + won(row[2]) + '원</td></tr>';
    }).join('') + '<tr class="sum"><td>사업주 부담 합계</td><td></td><td>' + won(emp.total) + '원</td></tr>';

    // 금액 힌트
    var monthly = inp.monthlyGross;
    if (state.payType === 'annual') {
      $('#amount-hint').textContent = '월 급여 환산: ' + won(monthly) + '원 · 연 실수령 ' + won(r.net * 12) + '원';
    } else {
      $('#amount-hint').textContent = '연봉 환산: ' + won(monthly * 12) + '원 · 연 실수령 ' + won(r.net * 12) + '원';
    }

    renderSalaryTable(state.payType === 'annual' ? inp.amount : inp.amount * 12);
    renderChips();
  }

  /* 연봉별 표 */
  var TABLE_ANNUALS = [2400, 3000, 3500, 4000, 4500, 5000, 6000, 8000, 10000];

  function renderSalaryTable(currentAnnual) {
    var html = TABLE_ANNUALS.map(function (annual) {
      var gross = (annual * 10000) / 12;
      var r = compute(gross, 200000, 1);
      var isNow = currentAnnual > 0 && Math.abs(currentAnnual - annual) < 50;
      return '<tr class="' + (isNow ? 'is-now' : '') + '">' +
        '<td>' + won(annual) + '만</td>' +
        '<td>' + won(gross) + '원</td>' +
        '<td>' + won(r.insuranceTotal) + '원</td>' +
        '<td>' + won(r.incomeTax + r.localTax) + '원</td>' +
        '<td><strong>' + won(r.net) + '원</strong></td>' +
        '</tr>';
    }).join('');
    $('#salary-table-body').innerHTML = html;
  }

  /* ------------------------------------------------------------ 이벤트 */

  function setPayType(type) {
    if (state.payType === type) return;
    var cur = parseFloat($('#pay-amount').value) || 0;
    if (type === 'monthly') {
      $('#pay-amount').value = Math.round((cur / 12) * 10) / 10;
      $('#amount-label').textContent = '세전 월급';
    } else {
      $('#pay-amount').value = Math.round(cur * 12);
      $('#amount-label').textContent = '세전 연봉';
    }
    state.payType = type;
    $$('#seg-paytype .seg-btn').forEach(function (b) {
      var on = b.dataset.value === type;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    render();
  }

  function init() {
    $('#seg-paytype').addEventListener('click', function (e) {
      var btn = e.target.closest('.seg-btn');
      if (btn) setPayType(btn.dataset.value);
    });

    $('#pay-amount').addEventListener('input', render);
    $('#meal-free').addEventListener('change', render);
    $('#dependents').addEventListener('change', render);

    $('#amount-chips').addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      $('#pay-amount').value = chip.dataset.value;
      render();
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
