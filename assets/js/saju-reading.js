/* =========================================================================
 * 사주결 · 해석 엔진 (saju-reading.js)
 * 계산된 명식을 사람의 말로 옮깁니다. 모든 문장은 규칙 기반으로 생성됩니다.
 * ========================================================================= */
(function (global) {
  'use strict';

  var C = global.SajuCore;

  /* ------------------------------------------------------------ 천간 성향 */
  var STEM_PROFILE = [
    { // 0 갑
      image: '하늘로 곧게 뻗는 큰 나무',
      title: '곧은 기둥',
      keywords: ['시작', '소신', '성장'],
      essence: '한 번 방향을 정하면 뿌리부터 끝까지 곧게 자라는 사람입니다. 판을 여는 자리, 처음 시작하는 일에서 힘이 나고, 원칙과 명분을 중요하게 여깁니다. 누군가에게 기대기보다 스스로 서려는 마음이 커서 겉은 담담해도 속은 단단합니다.',
      strength: '추진력과 소신이 분명해, 남들이 망설이는 자리에서 먼저 문을 엽니다.',
      caution: '곧게만 가려다 꺾이기 쉽습니다. 때로는 한 발 물러나 흐름에 몸을 맡기는 지혜가 필요합니다.',
      fit: '기획·창업, 교육, 사람을 세우는 일'
    },
    { // 1 을
      image: '담장을 타고 오르는 덩굴',
      title: '휘어지는 지혜',
      keywords: ['적응', '감각', '끈기'],
      essence: '어디에 놓여도 환경에 맞춰 길을 찾아내는 사람입니다. 부드러워 보이지만 포기하지 않는 끈질김이 있고, 사람 사이의 미묘한 감정을 잘 읽습니다. 정면으로 밀기보다 돌아가는 길에서 더 강해집니다.',
      strength: '분위기를 읽는 감각이 좋아, 어려운 자리에서도 관계를 살려 냅니다.',
      caution: '눈치를 보다 속마음을 삼킬 때가 있습니다. 원하는 것을 조금 더 분명히 말해도 괜찮습니다.',
      fit: '디자인, 영업, 사람과 사람을 잇는 일'
    },
    { // 2 병
      image: '한낮에 높이 뜬 해',
      title: '환한 기세',
      keywords: ['열정', '표현', '리더십'],
      essence: '숨기는 것 없이 환하게 드러내는 사람입니다. 감정도 의욕도 크게 표현하고, 그 자리에 있는 것만으로 분위기를 밝힙니다. 앞장서서 사람을 모으고 판을 키우는 재주가 있습니다.',
      strength: '표현이 시원시원해 사람들이 내 편이 되기 쉽습니다.',
      caution: '기세가 오르면 한 번에 다 써버리기 쉽고, 말이 앞서 상처를 줄 수 있습니다. 속도를 조절하면 오래 갑니다.',
      fit: '방송·콘텐츠, 마케팅, 무대 위의 일'
    },
    { // 3 정
      image: '어둠을 밝히는 촛불',
      title: '조용한 열',
      keywords: ['집중', '섬세', '통찰'],
      essence: '조용하지만 마음속에 식지 않는 열이 있는 사람입니다. 겉으로 크게 드러내지 않으면서도 한곳에 깊이 집중하고, 사람과 사람 사이의 온도를 섬세하게 살핍니다. 작은 것에서 의미를 찾는 눈이 있습니다.',
      strength: '한 가지를 파고드는 집중력이 남다르고, 사람의 마음을 정확히 짚어냅니다.',
      caution: '혼자 삭히는 일이 많습니다. 온도가 떨어지기 전에 밖으로 꺼내 놓는 연습이 필요합니다.',
      fit: '연구·분석, 상담, 손끝의 기술'
    },
    { // 4 무
      image: '흔들리지 않는 산',
      title: '묵직한 중심',
      keywords: ['안정', '신뢰', '포용'],
      essence: '쉽게 동요하지 않고 사람을 품는 사람입니다. 말보다 행동으로 신뢰를 쌓고, 맡은 자리를 지키는 책임감이 큽니다. 급하게 몰아붙이기보다 흐름을 기다릴 줄 아는 여유가 있습니다.',
      strength: '어려운 때일수록 중심을 잡아 주어, 사람들이 자연스럽게 기대게 됩니다.',
      caution: '무게를 지키다 변화의 때를 놓칠 수 있습니다. 지금 옮겨야 할 짐과 내려놓을 짐을 구분해 보세요.',
      fit: '관리·운영, 부동산, 조직을 지키는 일'
    },
    { // 5 기
      image: '곡식을 기르는 밭',
      title: '살리는 손길',
      keywords: ['실무', '배려', '조율'],
      essence: '사람을 살리는 재주가 있는 현실가입니다. 겉은 조용해도 속으로 필요한 것을 정확히 계산하고, 상대가 무엇을 원하는지 빨리 알아챕니다. 돌보고 챙기는 손길이 자연스러워 주변에 사람이 끊이지 않습니다.',
      strength: '실제로 굴러가게 만드는 힘이 있습니다. 계획을 현실로 옮기는 데 강합니다.',
      caution: '남의 몫까지 떠안고 혼자 지치기 쉽습니다. 도움을 청하는 것도 능력입니다.',
      fit: '경영지원, 기획·조정, 돌봄과 교육'
    },
    { // 6 경
      image: '불로 다듬지 않은 원석',
      title: '단호한 칼날',
      keywords: ['결단', '추진', '의리'],
      essence: '결단이 빠르고 앞뒤가 분명한 사람입니다. 옳고 그름을 가리는 감각이 날카롭고, 한번 마음먹으면 밀고 나가는 힘이 있습니다. 사람을 가리지 않고 솔직하게 말해, 싫어도 믿을 수 있는 사람이 됩니다.',
      strength: '복잡한 상황을 한 번에 정리하는 결단력이 있습니다.',
      caution: '칼날이 앞서면 관계에 흠이 남습니다. 같은 말도 각을 세우지 않고 건네는 연습이 약이 됩니다.',
      fit: '영업·협상, 개발, 판을 정리하는 일'
    },
    { // 7 신
      image: '정교하게 세공된 보석',
      title: '높은 기준',
      keywords: ['완성도', '안목', '집요함'],
      essence: '기준이 높고 손끝이 정교한 사람입니다. 겉으로는 담담해 보여도 자기 일에 대한 자부심이 강하고, 어설픈 것을 견디지 못합니다. 감각이 좋아 무엇이 좋은 것인지 빠르게 알아봅니다.',
      strength: '디테일에서 차이를 만듭니다. 마무리가 깔끔해 결과물이 오래 남습니다.',
      caution: '스스로에게도 남에게도 엄격해 마음이 상하기 쉽습니다. 90%도 충분히 훌륭하다는 것을 기억하세요.',
      fit: '디자인, 브랜딩, 정밀한 전문직'
    },
    { // 8 임
      image: '큰 바다로 흐르는 강',
      title: '큰 그릇',
      keywords: ['지혜', '포용', '확장'],
      essence: '그릇이 크고 흐름을 읽는 사람입니다. 작은 일에 매이기보다 큰 그림을 그리고, 여러 사람의 이야기를 담아낼 수 있습니다. 움직임이 자연스러워 어디에 놓여도 길을 찾습니다.',
      strength: '사람과 정보를 모아 크게 굴리는 힘이 있습니다.',
      caution: '흐름을 따르다 방향을 잃을 수 있습니다. 지금 내가 어디로 가는지 한 번씩 확인해 보세요.',
      fit: '사업·전략, 무역·유통, 사람을 잇는 일'
    },
    { // 9 계
      image: '조용히 스며드는 이슬비',
      title: '섬세한 촉',
      keywords: ['직관', '감수성', '스며듦'],
      essence: '섬세하고 직관이 밝은 사람입니다. 말하지 않아도 분위기로 많은 것을 읽고, 작은 변화를 먼저 알아챕니다. 겉은 부드러워도 속은 생각이 많고 깊어, 조용히 오래 곁을 지키는 사람입니다.',
      strength: '상대의 감정을 미리 알아채는 촉이 있어, 위로가 필요한 자리에 정확히 나타납니다.',
      caution: '생각이 많아 스스로를 소모하기 쉽습니다. 느낌을 짧게라도 기록해 두면 마음이 가벼워집니다.',
      fit: '글쓰기, 상담·심리, 감각을 다루는 일'
    }
  ];

  /* ------------------------------------------------------------ 오행 해석 */
  var ELEMENT_META = [
    { ko: '목', hanja: '木', color: '#3E7C59', key: '성장과 시작',
      excess: '새로 시작하려는 마음이 앞서 계획이 여러 갈래로 벌어지기 쉽습니다. 하나를 끝까지 붙드는 힘이 관건입니다.',
      lack: '새로운 일을 여는 힘이 약해질 수 있습니다. 아침에 몸을 깨우는 산책이나 초록을 곁에 두는 습관이 보충이 됩니다.' },
    { ko: '화', hanja: '火', color: '#B4453A', key: '열정과 표현',
      excess: '감정의 온도가 높아지고 말과 행동이 빨라집니다. 열이 오를수록 한 박자 쉬어 가는 것이 오래 갑니다.',
      lack: '속에 있는 것을 밖으로 꺼내는 일이 버거울 수 있습니다. 좋아하는 것을 소리 내어 말하는 연습이 약이 됩니다.' },
    { ko: '토', hanja: '土', color: '#A98045', key: '중심과 신뢰',
      excess: '책임을 지려는 마음이 커져 짐이 무거워집니다. 모든 것을 다 떠안지 않아도 괜찮습니다.',
      lack: '중심이 흔들려 결정을 미루기 쉽습니다. 생활의 리듬을 일정하게 만드는 것만으로도 크게 달라집니다.' },
    { ko: '금', hanja: '金', color: '#8A8A8A', key: '결단과 완성',
      excess: '기준이 날카로워지고 잘라내는 힘이 강해집니다. 정리와 결단에는 좋지만, 사람에게는 조금 부드러워도 됩니다.',
      lack: '마무리와 결단이 늦어질 수 있습니다. 작은 일부터 "정하면 지킨다"를 반복해 보세요.' },
    { ko: '수', hanja: '水', color: '#2F5D7C', key: '지혜와 흐름',
      excess: '생각이 많아지고 감정이 깊어집니다. 머릿속을 종이에 옮겨 두면 훨씬 가벼워집니다.',
      lack: '쉬어 가는 힘이 부족해 소모가 쌓입니다. 물을 자주 마시고, 혼자 조용한 시간을 짧게라도 확보하세요.' }
  ];

  /* ------------------------------------------------------------ 유틸 */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }
  function pick(arr, seed) { return arr[seed % arr.length]; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function stemProfile(stem) { return STEM_PROFILE[stem]; }

  /* 받침 유무에 따라 조사를 고릅니다. (예: 토+를, 금+을) */
  function josa(word, withFinal, withoutFinal) {
    var w = String(word);
    var c = w.charCodeAt(w.length - 1);
    if (c < 0xAC00 || c > 0xD7A3) return withoutFinal;
    return (c - 0xAC00) % 28 === 0 ? withoutFinal : withFinal;
  }

  function elementBalance(counts) {
    var total = counts.reduce(function (a, b) { return a + b; }, 0) || 1;
    var rows = counts.map(function (n, i) {
      var pct = Math.round((n / total) * 100);
      var state;
      if (n === 0) state = '없음';
      else if (n >= 3) state = '과다';
      else if (n === 2) state = '적정';
      else state = '부족';
      return { elem: i, ko: ELEMENT_META[i].ko, hanja: ELEMENT_META[i].hanja,
        color: ELEMENT_META[i].color, count: n, pct: pct, state: state };
    });
    var missing = rows.filter(function (r) { return r.count === 0; });
    var strongest = rows.slice().sort(function (a, b) { return b.count - a.count; })[0];
    var summary;
    if (!missing.length) {
      summary = '다섯 기운이 모두 있습니다. 어느 하나에 치우치지 않아 상황에 따라 유연하게 힘을 쓸 수 있는 명식입니다.';
    } else if (missing.length === 1) {
      summary = missing[0].ko + '의 기운이 비어 있습니다. ' + ELEMENT_META[missing[0].elem].lack;
    } else {
      summary = missing.map(function (r) { return r.ko; }).join('·') + '의 기운이 비어 있습니다. 비어 있는 자리는 약점이라기보다, 의식해서 채워 갈 때 인생이 넓어지는 지점입니다.';
    }
    return { rows: rows, missing: missing, strongest: strongest, summary: summary };
  }

  /* ------------------------------------------------------------ 오늘의 운세 */
  var YUKHAP = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
  var SAMHAP = [[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]];
  var HYEONG = [[2, 5, 8], [1, 10, 7], [0, 3]];
  var HAE = [[0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]];
  var WONJIN = [[0, 7], [1, 6], [2, 9], [3, 8], [4, 11], [5, 10]];

  function hasPair(list, a, b) {
    return list.some(function (g) {
      return g.indexOf(a) !== -1 && g.indexOf(b) !== -1 && a !== b;
    });
  }

  function branchRelation(a, b) {
    if (a === b) return { type: 'self', label: '같은 기운' };
    if (hasPair(YUKHAP, a, b)) return { type: 'yukhap', label: '육합' };
    if (hasPair(SAMHAP, a, b)) return { type: 'samhap', label: '삼합' };
    if (Math.abs(a - b) === 6) return { type: 'chung', label: '충' };
    if (hasPair(HYEONG, a, b)) return { type: 'hyeong', label: '형' };
    if (hasPair(WONJIN, a, b)) return { type: 'wonjin', label: '원진' };
    if (hasPair(HAE, a, b)) return { type: 'hae', label: '해' };
    return { type: 'none', label: '무관' };
  }

  function stemRelation(me, tg) {
    if (me === tg) return '비화';
    if ((me + 1) % 5 === tg) return '아생';
    if ((tg + 1) % 5 === me) return '생아';
    if ((me + 2) % 5 === tg) return '아극';
    return '극아';
  }

  var STEM_REL_TEXT = {
    비화: '나와 같은 기운이 하루를 덮습니다. 내 색이 진해지는 만큼 고집도 세지기 쉬우니, 양보할 곳을 미리 정해 두면 편안합니다.',
    아생: '내 기운이 밖으로 흘러나가는 날입니다. 표현하고 베풀수록 인연이 남지만, 다 쏟고 나면 저녁이 비어 버리니 힘을 아껴 쓰세요.',
    생아: '나를 채워 주는 기운이 들어옵니다. 도움을 청하기 좋은 날이고, 미뤄 둔 부탁이 있다면 오늘이 적기입니다.',
    아극: '내가 다루고 거두는 기운이 들어옵니다. 성과를 챙기고 정리하기에 좋지만, 사람까지 재단하는 눈이 되지 않도록 하세요.',
    극아: '나를 눌러 다스리는 기운이 작동합니다. 압박이 느껴져도 규칙을 지키면 오히려 인정받는 하루가 됩니다.'
  };

  var BRANCH_REL_TEXT = {
    self: '일지가 같은 기운을 만나 익숙한 리듬이 이어집니다. 편하지만 고집이 세지기 쉬운 날입니다.',
    yukhap: '일지가 합을 이루어 사람과 일이 부드럽게 붙습니다. 미뤄 둔 연락을 꺼내기 좋습니다.',
    samhap: '세 기운이 모이는 삼합 — 여럿이 힘을 합치는 일에 운이 실립니다.',
    chung: '일지가 충을 이뤄 흔들림이 있습니다. 큰 결정은 하루쯤 미루는 편이 낫습니다.',
    hyeong: '형(刑)의 기운이 있어 말과 서류를 한 번 더 확인하게 됩니다. 서두르면 틈이 생깁니다.',
    wonjin: '원진의 기운 — 괜히 서운한 마음이 올라올 수 있습니다. 감정은 하루 뒤에 꺼내 보세요.',
    hae: '해(害)의 기운이 있어 도우려던 일이 오히려 짐이 될 수 있습니다. 선을 지키는 것이 배려입니다.',
    none: '특별한 마찰 없이 평소 리듬대로 흘러가는 날입니다.'
  };

  var MONEY_TEXT = {
    high: ['재물의 문이 열려 있는 날입니다. 들어오는 돈을 확인하고, 미뤄 둔 수금이나 정산을 오늘 처리해 보세요.',
      '돈이 도는 결이 좋습니다. 다만 벌기만 하고 새는 곳을 모르면 남지 않으니, 나가는 돈도 함께 살펴보세요.'],
    mid: ['큰 변화보다 지키는 쪽이 유리합니다. 지출은 한 번 더 따져 보고, 작은 이득은 그냥 흘려보내지 마세요.',
      '무난한 하루입니다. 새로 벌이기보다 이미 가진 것을 정리하면 숫자가 조금 더 좋아집니다.'],
    low: ['지갑이 열리기 쉬운 날입니다. 충동구매와 즉석 제안은 하루만 미뤄 두세요.',
      '재물의 결이 고르지 않습니다. 누구를 위해 쓰는 돈인지 한 번 물어보고 결정하면 후회가 적습니다.']
  };

  var LOVE_TEXT = {
    high: ['말이 잘 통하는 날입니다. 전하고 싶었던 마음이 있다면 오늘 꺼내 보세요.',
      '사람의 온도가 올라갑니다. 함께하는 자리에서 예상보다 좋은 인연을 만날 수 있습니다.'],
    mid: ['평소처럼 곁을 지키는 것이 가장 좋습니다. 상대의 말을 끝까지 듣는 것만으로 관계가 깊어집니다.',
      '오해가 생겨도 바로 풀 수 있는 날입니다. 다만 짧은 메시지보다는 목소리가 낫습니다.'],
    low: ['감정이 앞서기 쉬운 날입니다. 하고 싶은 말이 있으면 하루 묵혔다가 꺼내 보세요.',
      '상대의 사정을 헤아릴 여유가 필요한 하루입니다. 지금은 조용히 곁에 있는 것이 답입니다.']
  };

  var HEALTH_TEXT = {
    high: ['기운이 도는 하루입니다. 미뤄 둔 운동을 시작하기 좋고, 몸을 쓰면 오히려 머리가 맑아집니다.',
      '몸의 리듬이 좋습니다. 조금 무리해도 회복이 빠른 날이니 그 기운을 하나 남겨 두세요.'],
    mid: ['무난하지만 자세와 수면이 관건입니다. 늦은 시간의 야식과 화면은 줄이는 것이 좋습니다.',
      '컨디션은 평소와 비슷합니다. 물을 조금 더 마시고, 오래 앉아 있었다면 일어나 걸어 보세요.'],
    low: ['몸이 보내는 작은 신호를 놓치지 마세요. 무리한 일정보다 일찍 쉬는 쪽이 이득입니다.',
      '기운이 얕은 하루입니다. 커피로 버티기보다 짧은 낮잠이나 산책으로 채우는 편이 낫습니다.']
  };

  function band(score) { return score >= 74 ? 'high' : score >= 56 ? 'mid' : 'low'; }

  function todayFortune(chart, tp) {
    var meElem = chart.dayMasterElem;
    var tgElem = C.STEM_ELEM[tp.day.stem];
    var rel = stemRelation(meElem, tgElem);
    var brel = branchRelation(chart.dayPillar.branch, tp.day.branch);
    var seed = hash('' + chart.dayMaster + tp.day.stem + tp.day.branch + (chart.dayPillar.branch));

    var base = { '비화': 68, '아생': 71, '생아': 80, '아극': 77, '극아': 60 }[rel];
    var branchAdj = { self: 0, yukhap: 10, samhap: 8, chung: -15, hyeong: -8, wonjin: -4, hae: -6, none: 2 }[brel.type];
    var score = clamp(base + branchAdj + (seed % 7) - 3, 38, 96);

    var god = C.tenGodName(chart.dayMaster, tp.day.stem);
    var moneyMod = 0, loveMod = 0, healthMod = 0;
    if (god === '편재' || god === '정재') { moneyMod = 12; loveMod = -2; }
    if (god === '식신' || god === '상관') { moneyMod = 4; loveMod = 6; healthMod = 2; }
    if (god === '편관' || god === '정관') { loveMod = -4; healthMod = -6; moneyMod = 6; }
    if (god === '편인' || god === '정인') { healthMod = 8; loveMod = 4; moneyMod = -6; }
    if (god === '비견' || god === '겁재') { moneyMod = -8; loveMod = 2; }

    var money = clamp(score + moneyMod + (seed % 5) - 2, 30, 97);
    var love = clamp(score + loveMod + ((seed >> 3) % 5) - 2, 30, 97);
    var health = clamp(score + healthMod + ((seed >> 6) % 5) - 2, 30, 97);

    var headline;
    if (score >= 86) headline = '기운이 크게 실리는 하루';
    else if (score >= 74) headline = '부드럽게 풀리는 하루';
    else if (score >= 62) headline = '평소의 리듬이면 충분한 하루';
    else if (score >= 50) headline = '한 걸음 천천히 가는 하루';
    else headline = '잠시 쉬어가도 좋은 하루';

    var summary = STEM_REL_TEXT[rel] + ' ' + BRANCH_REL_TEXT[brel.type];

    return {
      date: tp.solar,
      ganji: tp.ganjiText,
      dayStem: tp.day,
      stemRelation: rel,
      branchRelation: brel,
      tenGod: god,
      score: score,
      headline: headline,
      summary: summary,
      domains: {
        money: { score: money, text: pick(MONEY_TEXT[band(money)], seed) },
        love: { score: love, text: pick(LOVE_TEXT[band(love)], seed >> 2) },
        health: { score: health, text: pick(HEALTH_TEXT[band(health)], seed >> 4) }
      }
    };
  }

  /* ------------------------------------------------------------ 십성 · 강약 */
  var GODS = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];

  /* 일간을 뺀 일곱 글자(천간 + 지지 정기)의 십성 분포 */
  function tenGodCounts(chart) {
    var counts = {};
    GODS.forEach(function (g) { counts[g] = 0; });
    chart.pillars.forEach(function (p) {
      if (p.key !== 'day') counts[C.tenGodName(chart.dayMaster, p.stem)] += 1;
      var main = p.hidden[p.hidden.length - 1];
      counts[C.tenGodName(chart.dayMaster, C.STEMS.indexOf(main))] += 1;
    });
    return counts;
  }

  /* 신강·중화·신약 — 비겁·인성이 나를 돕는 힘, 식상·재성·관성이 쓰이는 힘 */
  function strengthOf(chart, counts) {
    var support = counts['비견'] + counts['겁재'] + counts['편인'] + counts['정인'];
    var drain = counts['식신'] + counts['상관'] + counts['편재'] + counts['정재'] + counts['편관'] + counts['정관'];
    var total = support + drain || 1;
    var myCount = chart.elements[chart.dayMasterElem];
    var bonus = myCount >= 3 ? 0.12 : myCount === 0 ? -0.1 : 0;
    var ratio = support / total;
    var score = Math.round(clamp(ratio + bonus, 0, 1) * 100);
    var label, phrase;
    if (score >= 62) { label = '신강'; phrase = '기운이 여유로운 편'; }
    else if (score >= 44) { label = '중화'; phrase = '기운이 고른 편'; }
    else { label = '신약'; phrase = '기운을 아껴 쓰는 편'; }
    return { score: score, label: label, phrase: phrase, support: support, drain: drain };
  }

  /* ------------------------------------------------------------ 재물운 */
  function moneyReading(chart, counts, strength) {
    var jae = counts['편재'] + counts['정재'];
    var pyeon = counts['편재'];
    var sik = counts['식신'] + counts['상관'];
    var bi = counts['비견'] + counts['겁재'];
    var inn = counts['편인'] + counts['정인'];
    var profile = STEM_PROFILE[chart.dayMaster];
    var paras = [];
    var lead, note;

    if (jae >= 3) {
      lead = '재성(財星)이 ' + jae + '개. 재물을 알아보는 눈과 다루는 손이 함께 있는 명식입니다.';
      note = '재물의 그릇 · 넉넉한 편';
      if (strength.label === '신강') {
        paras.push('기운이 받쳐 주는 만큼 벌어들인 것을 지키는 힘도 있습니다. 다만 재성이 많으면 일이 벌어지는 속도도 빨라지니, 들어오는 통로를 두세 개로 좁혀 둘 때 실제로 남는 돈이 늘어납니다.');
      } else {
        paras.push('재성이 많은데 나의 기운은 그만큼 두텁지 않습니다. 돈이 오가는 일은 잦지만 손에 남는 몫이 줄기 쉬우니, 버는 일보다 남기는 구조를 먼저 만드는 것이 이 명식의 숙제입니다.');
      }
    } else if (jae === 2) {
      lead = '재성(財星)이 두 개. 벌이와 관리가 균형을 이룬 명식입니다.';
      note = '재물의 그릇 · 고른 편';
      paras.push('큰 욕심을 부리지 않아도 생활의 바탕이 흔들리지 않는 구조입니다. 다만 두 개가 서로 다른 자리에 있으면 마음이 두 갈래로 나뉘기 쉬우니, 한쪽을 정리하고 하나에 집중할 때 숫자가 확실히 올라갑니다.');
    } else if (jae === 1) {
      lead = '재성(財星)이 하나. 재물의 통로가 한 줄로 정리된 명식입니다.';
      note = '재물의 그릇 · 한 길';
      paras.push('여러 곳에서 조금씩 벌기보다 한 가지 일을 깊게 파는 쪽이 맞습니다. 그 한 곳이 자리를 잡으면 흔들리지 않는 대신, 그 길이 막혔을 때를 대비해 두 번째 통로를 준비해 두면 좋습니다.');
    } else {
      lead = '재성이 겉으로 드러나지 않은 명식입니다.';
      note = '재물의 그릇 · 일에서 따라오는 쪽';
      paras.push('돈을 직접 좇기보다 잘하는 일을 깊게 파는 쪽에서 재물이 뒤따라오는 구조입니다. 시세를 따라 옮겨 다니기보다, 시간이 쌓일수록 값이 오르는 기술과 신뢰를 쌓는 편이 유리합니다.');
    }

    if (sik >= 2) {
      paras.push('식상(食傷)이 ' + sik + '개로 표현하고 만들어 내는 힘이 있습니다. 내가 만들거나 다루는 것을 값으로 바꾸는 일 — 콘텐츠, 기술, 손끝의 서비스 — 에서 돈이 붙습니다.');
    } else if (inn >= 2) {
      paras.push('인성(印星)이 ' + inn + '개로 배움과 자격의 힘이 있습니다. 공부와 자격이 곧 수입의 근거가 되는 구조라, 교육에 쓴 돈은 아깝지 않게 돌아옵니다.');
    } else if (pyeon >= 1) {
      paras.push('편재가 자리해 사람과 판을 통해 들어오는 돈이 있습니다. 영업·중개·유통처럼 사람 사이를 잇는 일에서 재물의 문이 열립니다.');
    } else {
      paras.push('수입의 근거는 결국 ' + profile.fit + ' 쪽에 있습니다. 그 자리에서 쌓은 평판이 곧 다음 계약이 됩니다.');
    }

    if (bi >= 3) {
      paras.push('다만 비겁(比劫)이 ' + bi + '개로 두터워, 사람과 함께 쓰는 돈이 많습니다. 동업·보증·지인 대여는 금액과 기한을 정해 두지 않으면 그대로 새어 나갑니다.');
    } else if (pyeon >= 2) {
      paras.push('편재가 겹치면 큰돈이 드나드는 일이 생깁니다. 들어올 때보다 나갈 때의 기준을 먼저 정해 두세요.');
    } else {
      paras.push('돈이 새는 자리는 대개 습관입니다. 금액이 큰 결정 앞에서 하루만 묵히는 규칙 하나로 충분합니다.');
    }

    return { key: 'money', name: '재물운', hanja: '財', note: note, lead: lead, paras: paras };
  }

  /* ------------------------------------------------------------ 직업운 */
  function careerReading(chart, counts, strength) {
    var gwan = counts['편관'] + counts['정관'];
    var sik = counts['식신'] + counts['상관'];
    var inn = counts['편인'] + counts['정인'];
    var bi = counts['비견'] + counts['겁재'];
    var profile = STEM_PROFILE[chart.dayMaster];
    var paras = [];
    var lead, note;

    if (gwan >= 2 && inn >= 2) {
      lead = '관성(官星)과 인성(印星)이 함께 있는, 조직 안에서 신뢰로 서는 명식입니다.';
      note = '일하는 방식 · 조직형';
      paras.push('맡은 자리를 오래 지키며 신뢰를 쌓는 쪽이 잘 맞습니다. 자격과 직급, 절차가 분명한 곳에서 실력이 인정받고, 반대로 규칙이 자주 바뀌는 곳에서는 힘을 쓰기 어렵습니다.');
      paras.push('승진과 이동은 윗사람의 평가가 결정합니다. 일의 결과를 문서와 숫자로 남겨 두는 습관이 그 평가를 앞당깁니다.');
    } else if (sik >= 2 && gwan <= 1) {
      lead = '식상(食傷)이 앞선, 내 이름으로 만드는 명식입니다.';
      note = '일하는 방식 · 전문가·창작형';
      paras.push('정해진 틀 안에서 반복하는 일보다, 내가 만들고 기획해 결과를 내는 일에서 힘이 납니다. 조직에 있더라도 “내가 만든 것”이 남는 자리를 골라야 오래 갑니다.');
      paras.push('다만 식상이 강하면 말과 추진이 앞서 윗사람과 부딪히기 쉽습니다. 보고는 결론부터, 제안은 대안과 함께 꺼내는 것만으로도 평가가 달라집니다.');
    } else if (bi >= 3) {
      lead = '비겁(比劫)이 두터운, 여럿과 함께 판을 키우는 명식입니다.';
      note = '일하는 방식 · 동료·협업형';
      paras.push('혼자 잘하기보다 사람을 모아 함께 굴러가게 하는 힘이 있습니다. 다만 역할과 몫이 흐리면 관계가 상하기 쉬우니, 시작할 때 나누는 방식을 정해 두세요.');
      paras.push('동업이나 팀 프로젝트에서 성과가 나는 자리라면, “내가 책임지는 부분”을 분명히 해 두는 것이 오래 가는 비결입니다.');
    } else if (inn >= 2) {
      lead = '인성(印星)이 깊은, 전문성과 자격으로 서는 명식입니다.';
      note = '일하는 방식 · 전문직·연구형';
      paras.push('배우고 정리해 남에게 설명하는 일에 강합니다. 자격·연구·교육·기획처럼 시간이 쌓일수록 값이 오르는 분야가 잘 맞습니다.');
      paras.push('반대로 손에 잡히는 성과가 늦게 보이는 것이 약점입니다. 배운 것을 작게라도 결과물로 꺼내 보여 주는 습관이 필요합니다.');
    } else {
      lead = '조직과 자유 사이에서 균형을 잡는 명식입니다.';
      note = '일하는 방식 · 균형형';
      paras.push('한 곳에 오래 매이기보다 상황에 맞춰 역할을 바꾸는 쪽이 편합니다. 다만 바꾸는 일이 잦으면 경력이 얇아 보이니, 두세 가지 안에서 순환하는 편이 좋습니다.');
      paras.push('지금 하는 일이 맞는지 판단이 서지 않는다면 “3년 뒤 어떤 사람이 되어 있을지”를 기준으로 보세요. 연봉보다 그 답이 오래 갑니다.');
    }

    paras.push('타고난 결로 보면 ' + profile.fit + ' 쪽이 편합니다. ' + profile.image + '의 기질이 그 자리에서 가장 자연스럽게 쓰입니다.');

    return { key: 'career', name: '직업운', hanja: '官', note: note, lead: lead, paras: paras };
  }

  /* ------------------------------------------------------------ 연애·대인운 */
  function loveReading(chart, counts, strength) {
    var isMale = chart.input.gender === 'male';
    var starGods = isMale ? ['편재', '정재'] : ['편관', '정관'];
    var starLabel = isMale ? '재성' : '관성';
    var hits = [];
    chart.pillars.forEach(function (p) {
      if (starGods.indexOf(p.stemGod) !== -1) hits.push(p.label + ' 천간');
      if (starGods.indexOf(p.branchGod) !== -1) hits.push(p.label + ' 지지');
    });

    var sik = counts['식신'] + counts['상관'];
    var bi = counts['비견'] + counts['겁재'];
    var inn = counts['편인'] + counts['정인'];
    var paras = [];
    var lead, note;

    var dayBranch = chart.dayPillar.branch;
    var clash = chart.pillars.filter(function (p) {
      return p.key !== 'day' && Math.abs(p.branch - dayBranch) === 6;
    }).map(function (p) { return p.label; });

    if (hits.indexOf('일주 지지') !== -1) {
      lead = '배우자 자리(일지)에 인연의 별이 앉아 있습니다. 가까운 사람과 인연이 깊어지는 명식입니다.';
      note = '인연의 별 · 배우자 자리';
    } else if (hits.length === 0) {
      lead = '인연의 별이 겉으로 드러나지 않은 명식입니다. 스스로 찾기보다 하는 일과 취미를 통해 만나는 쪽이 맞습니다.';
      note = '인연의 별 · 일과 취미에서';
    } else {
      lead = '인연의 별(' + starLabel + ')이 ' + hits.length + '곳(' + hits.join(', ') + ')에 자리합니다.';
      note = '인연의 별 · ' + hits.length + '곳';
    }

    if (clash.length) {
      paras.push('다만 일지가 ' + clash.join('·') + '의 충을 받고 있습니다. 가까워지는 만큼 흔들림도 함께 오는 구조라, 관계가 흔들릴 때 결론을 서두르지 않는 것이 중요합니다.');
    } else {
      paras.push('일지가 흔들리지 않아 한 번 맺은 인연을 오래 가져가는 편입니다. 대신 마음이 식은 것도 말해 주지 않으면 상대는 모릅니다. 짧게라도 자주 표현하세요.');
    }

    if (sik >= 2) {
      paras.push('식상이 ' + sik + '개로 표현이 자연스러워 처음 만난 사람과도 금방 가까워집니다. 다만 말이 앞서 상대의 속도를 놓치지 않도록 한 박자 쉬어 가세요.');
    } else if (bi >= 3) {
      paras.push('비겁이 ' + bi + '개로 사람은 많지만 깊어지기까지 시간이 걸립니다. 여럿보다 한 사람에게 시간을 몰아 쓰는 편이 관계를 남깁니다.');
    } else if (inn >= 2) {
      paras.push('인성이 ' + inn + '개로 낯가림이 있는 대신, 한 번 마음을 열면 오래 곁을 지킵니다. 그 진심이 전해지도록 조금만 더 먼저 말을 건네 보세요.');
    } else {
      paras.push('관계의 온도가 고른 편입니다. 특별한 날보다 평소의 작은 연락이 이 명식의 인연을 지켜 줍니다.');
    }

    paras.push(isMale
      ? '이성에게 다가갈 때는 잘 보이려는 말보다, 함께 무언가를 해 보자는 제안이 잘 통합니다.'
      : '마음을 정하기까지 시간이 필요한 편이니, 상대의 속도에 맞춰 가다 보면 오래 가는 인연이 됩니다.');

    return { key: 'love', name: '연애·대인운', hanja: '緣', note: note, lead: lead, paras: paras };
  }

  /* ------------------------------------------------------------ 건강·생활운 */
  var ELEMENT_CARE = [
    { ko: '목', part: '간과 눈, 힘줄', habit: '스트레칭과 눈의 휴식' },
    { ko: '화', part: '심장과 혈관, 얼굴', habit: '늦은 밤의 화면과 카페인 줄이기' },
    { ko: '토', part: '위와 장, 소화', habit: '정해진 시간의 식사' },
    { ko: '금', part: '폐와 기관지, 피부', habit: '깊은 호흡과 물 마시기' },
    { ko: '수', part: '신장과 방광, 허리', habit: '수면 시간을 일정하게 지키기' }
  ];

  function healthReading(chart, counts, strength) {
    var balance = elementBalance(chart.elements);
    var strongest = balance.strongest;
    var paras = [];
    var lead = '오행의 분포로 보는 몸과 생활의 리듬입니다.';
    var note = '생활의 리듬 · ' + strength.phrase;

    if (strongest.count >= 3) {
      paras.push(strongest.ko + '의 기운이 ' + strongest.count + '개로 두텁습니다. 전통 명리에서는 ' + strongest.ko + josa(strongest.ko, '을', '를') + ' ' + ELEMENT_CARE[strongest.elem].part + '에 대응해 봅니다. ' + ELEMENT_META[strongest.elem].excess + ' ' + ELEMENT_CARE[strongest.elem].habit + '가 이 기운을 다스리는 방법입니다.');
    } else {
      paras.push('다섯 기운이 고르게 놓여 있습니다. 어느 하나가 유난히 치우치지 않아, 몸의 리듬도 생활 습관을 따라가는 편입니다. 무리한 보충보다 규칙적인 시간이 이 명식에 가장 잘 맞습니다.');
    }

    if (balance.missing.length) {
      paras.push(balance.missing.map(function (m) { return m.ko; }).join('·') + '의 기운이 비어 있습니다. ' + ELEMENT_META[balance.missing[0].elem].lack);
    } else {
      paras.push('비어 있는 오행은 없습니다. 대신 가장 약한 ' + balance.rows.slice().sort(function (a, b) { return a.count - b.count; })[0].ko + '의 기운을 의식해 채워 주면 균형이 오래 유지됩니다.');
    }

    paras.push(strength.label === '신약'
      ? '기운이 얕게 쓰이는 편이라 회복이 먼저입니다. 잠을 줄여서 버티는 방식은 오래가지 않으니, 자는 시간을 늘리는 쪽으로 일정을 고쳐 보세요.'
      : strength.label === '신강'
        ? '기운이 넘치는 편이라 몸을 쓰지 않으면 오히려 잠이 얕아집니다. 걷기나 근력 운동으로 기운을 밖으로 내보내면 마음도 함께 가벼워집니다.'
        : '기운이 고른 편입니다. 지금의 수면과 식사 시간을 지키는 것만으로도 컨디션이 크게 흔들리지 않습니다.');

    paras.push('이 내용은 전통 명리를 생활 습관에 옮긴 참고일 뿐, 진단이 아닙니다. 몸에 이상이 느껴지면 병원을 먼저 찾으세요.');

    return { key: 'health', name: '건강·생활운', hanja: '身', note: note, lead: lead, paras: paras };
  }

  /* ------------------------------------------------------------ 신년운세 */
  var YEAR_INFO = {
    2026: { stem: 2, branch: 6, name: '병오', hanja: '丙午', animal: '말' },
    2027: { stem: 3, branch: 7, name: '정미', hanja: '丁未', animal: '양' }
  };

  /* 해의 천간이 내 일간과 맺는 관계 */
  var YEAR_REL_TEXT = {
    비화: '나와 같은 기운이 한 해를 덮습니다. 내 색이 진해지는 만큼 고집도 함께 세지니, 결정을 내리기 전에 다른 사람의 속도를 한 번 살펴보면 흐름이 부드러워집니다.',
    아생: '내 기운이 밖으로 흘러나가는 해입니다. 만들고 표현하는 일이 성과로 이어지지만, 쏟아 내는 만큼 체력의 총량을 계산해 두어야 합니다.',
    생아: '나를 채워 주는 기운이 들어오는 해입니다. 도움을 청하기 좋고, 귀인과 후원을 만나기 좋은 흐름입니다. 배움에 쓴 시간이 오래 남습니다.',
    아극: '내가 거두고 정리하는 해입니다. 성과와 재물을 챙기기에 좋지만, 사람까지 숫자로 재지 않도록 주의하세요.',
    극아: '나를 눌러 다스리는 기운이 강한 해입니다. 압박이 크지만 그만큼 단단해집니다. 규칙과 절차를 지키는 것이 방패가 됩니다.'
  };

  /* 해의 지지가 내 일지와 맺는 관계 */
  var YEAR_BRANCH_TEXT = {
    self: '일지가 같은 기운을 만나 익숙한 흐름이 이어집니다. 편안한 대신 매너리즘에 빠지지 않도록 새로운 자극을 하나쯤 만들어 두세요.',
    yukhap: '일지가 합을 이루니 인연과 협력의 문이 열립니다. 미뤄 둔 연락과 제안을 꺼내기 좋은 해입니다.',
    samhap: '삼합이 성립해 여럿이 함께하는 일에 힘이 실립니다. 혼자 하던 일을 사람에게 나눠 보세요.',
    chung: '일지가 충을 맞아 이동과 변화가 많은 해입니다. 이사·이직·관계의 재편이 겹칠 수 있으니 큰 결정은 서두르지 마세요.',
    hyeong: '형(刑)의 기운이 있어 말과 계약에서 세심함이 필요합니다. 구두 약속은 문서로 남기세요.',
    wonjin: '원진의 기운 — 가까운 사이에서 서운함이 쌓이기 쉽습니다. 마음을 자주 꺼내 놓는 것만으로 절반은 풀립니다.',
    hae: '해(害)의 기운이 있어 도움과 방해가 교차합니다. 선을 분명히 하는 것이 오히려 관계를 지킵니다.',
    none: '지지의 마찰은 크지 않아 흐름을 타기 좋은 해입니다. 벌여 둔 일을 밀어붙이기 좋습니다.'
  };

  /* 해의 천간이 내게 들어오는 십성 — 그해의 주제 */
  var YEAR_GOD = {
    비견: {
      kw: '자립·동료', theme: '내 몫을 스스로 세우는 해', headline: '내 힘으로 서는 해',
      money: '돈은 혼자 벌어 혼자 쓰는 구조가 잘 맞는 해입니다. 함께 쓰는 지출은 비율을 정해 두면 다툼이 줄어듭니다.',
      work: '내 이름을 걸고 하는 일, 동료와 나란히 서는 자리에서 힘이 납니다. 승진보다 실력의 깊이를 쌓는 쪽이 오래 남습니다.',
      love: '가까운 사이라도 경쟁심이 올라오기 쉽습니다. 잘한 일은 서로에게 소리 내어 말해 주세요.'
    },
    겁재: {
      kw: '경쟁·분배', theme: '나눠야 커지는 해', headline: '사람과 나누는 해',
      money: '들어오는 돈보다 나가는 돈이 눈에 띄는 해입니다. 보증·대여·충동 지출을 한 줄로 정리하면 그만큼 남습니다.',
      work: '경쟁이 붙는 자리에서 오히려 힘이 나는 해입니다. 성과를 나누는 방식을 먼저 정하면 경쟁이 추진력이 됩니다.',
      love: '새 인연보다 곁에 있는 사람과의 관계를 정리하는 해입니다. 비교하는 마음만 내려놓으면 훨씬 편안해집니다.'
    },
    식신: {
      kw: '표현·안정', theme: '만든 것이 쌓이는 해', headline: '천천히 쌓이는 해',
      money: '꾸준히 만들고 쌓아 올린 것이 값이 되는 해입니다. 큰 한 방보다 매달 남는 구조가 유리합니다.',
      work: '실력이 드러나고 평가가 따라오는 해입니다. 맡은 일을 끝까지 마무리하는 태도가 다음 자리를 엽니다.',
      love: '편안한 마음으로 사람을 만나기 좋은 해입니다. 좋은 것을 함께하는 자리에서 인연이 자랍니다.'
    },
    상관: {
      kw: '표현·돌파', theme: '말과 재주가 빛나는 해', headline: '내 목소리가 커지는 해',
      money: '재주를 값으로 바꾸기 좋은 해입니다. 다만 말과 계약에서 오해가 생기면 돈도 함께 새니, 조건은 문서로 남기세요.',
      work: '기존의 틀을 바꾸는 제안이 먹히는 해입니다. 다만 윗사람과의 말에서 각을 세우지 않도록 속도를 조절하세요.',
      love: '매력이 드러나 인연이 붙기 쉬운 해입니다. 다만 감정이 앞서면 관계가 빠르게 뜨거워졌다 식으니 속도를 아끼세요.'
    },
    편재: {
      kw: '활동·기회', theme: '돈과 사람이 움직이는 해', headline: '판이 넓어지는 해',
      money: '사람과 판을 통해 들어오는 돈이 있는 해입니다. 영업·중개·유통처럼 사람 사이를 잇는 일에서 기회가 옵니다.',
      work: '새로운 일을 벌이고 사람을 만나는 자리에서 성과가 납니다. 다만 벌인 일이 많아지면 하나도 깊어지지 않으니 두 개로 좁히세요.',
      love: '만남의 폭이 넓어지는 해입니다. 여러 갈래로 마음이 나뉘지 않도록, 한 사람에게 시간을 쓰는 쪽이 남습니다.'
    },
    정재: {
      kw: '안정·축적', theme: '한 길로 쌓는 해', headline: '기반이 단단해지는 해',
      money: '꾸준한 수입이 자리를 잡는 해입니다. 투자보다 적립, 새 일보다 지금 하는 일의 단가를 올리는 쪽이 유리합니다.',
      work: '맡은 자리에서 인정받고 책임이 늘어나는 해입니다. 성실함이 곧 평가가 되니 기록을 남겨 두세요.',
      love: '관계가 안정되고 다음 단계를 이야기하기 좋은 해입니다. 약속은 문서로, 마음은 말로 남기세요.'
    },
    편관: {
      kw: '압박·성장', theme: '단단해지는 해', headline: '시험을 통과하는 해',
      money: '지출이 커지고 돈의 압박이 느껴질 수 있는 해입니다. 고정비를 먼저 줄이면 생각보다 여유가 생깁니다.',
      work: '책임이 무거워지고 평가가 엄격해지는 해입니다. 어려운 일을 맡았더라도 끝까지 해내면 그해에 값이 매겨집니다.',
      love: '관계에서 긴장이 생기기 쉬운 해입니다. 상대를 고치려 하기보다 내가 지킬 선을 분명히 하세요.'
    },
    정관: {
      kw: '질서·인정', theme: '자리가 잡히는 해', headline: '인정받는 해',
      money: '안정된 수입과 함께 사회적 신뢰가 오르는 해입니다. 이름을 걸 수 있는 일에 투자하세요.',
      work: '승진·자격·계약처럼 자리가 정해지는 일이 생기는 해입니다. 절차를 지키는 사람이 결국 남습니다.',
      love: '진지한 만남, 혹은 관계의 정리가 이루어지는 해입니다. 책임을 말로만 하지 말고 행동으로 보여 주세요.'
    },
    편인: {
      kw: '배움·전환', theme: '배우고 갈아타는 해', headline: '안을 채우는 해',
      money: '큰 돈이 들어오기보다 새는 곳을 막는 해입니다. 공부와 자격에 쓴 돈은 오래 남지만, 계획 없는 지출은 줄이세요.',
      work: '새로운 분야를 배우거나 자리를 바꾸기 좋은 해입니다. 지금 하는 일의 곁가지를 익혀 두면 다음 해에 쓸 수 있습니다.',
      love: '마음이 안으로 향하는 해입니다. 혼자만의 시간을 인정해 주는 사람과의 관계가 오래 갑니다.'
    },
    정인: {
      kw: '후원·안정', theme: '도움을 받는 해', headline: '채워지는 해',
      money: '도움과 후원이 들어오는 해입니다. 부탁을 미뤄 두었다면 올해가 적기입니다.',
      work: '배움과 자격이 곧 기회가 되는 해입니다. 윗사람의 조언을 구하고 교육에 투자하세요.',
      love: '따뜻한 인연이 들어오는 해입니다. 받는 것에 익숙해지지 말고, 고마움을 말로 표현하면 관계가 깊어집니다.'
    }
  };

  /* 달마다의 천간 관계 — 두 가지 표현 중 하나를 고릅니다 */
  var MONTH_STEM_TEXT = {
    비화: [
      '내 힘이 세지는 달입니다. 밀어붙이던 일에 속도가 붙지만, 사람과 부딪히지 않도록 한 걸음만 양보하세요.',
      '내 색이 진해지는 달입니다. 결정은 빠르게 되지만 고집도 함께 세지니, 결론을 내리기 전에 한 사람의 말을 더 들어 보세요.'
    ],
    아생: [
      '무언가를 만들고 내보내는 달입니다. 결과물이 눈에 보이기 시작하니 마무리에 힘을 주세요.',
      '내 기운이 밖으로 흐르는 달입니다. 표현하고 베풀수록 인연이 남지만, 다 쏟고 나면 저녁이 비니 힘을 아껴 쓰세요.'
    ],
    생아: [
      '나를 채워 주는 기운이 들어오는 달입니다. 도움을 청하기 좋고, 미뤄 둔 부탁이 있다면 이 달이 적기입니다.',
      '후원과 배움이 들어오는 달입니다. 혼자 붙들고 있던 일을 꺼내 놓으면 생각보다 쉽게 풀립니다.'
    ],
    아극: [
      '거두고 정리하는 달입니다. 성과를 챙기고 숫자를 확인하기에 좋습니다.',
      '내가 다루고 마무리하는 달입니다. 미뤄 둔 정산과 서류를 이 달에 끝내 두세요.'
    ],
    극아: [
      '규칙과 압박이 강해지는 달입니다. 서두르지 말고 절차를 지키면 오히려 인정받습니다.',
      '나를 눌러 다스리는 기운이 드는 달입니다. 힘들어도 해야 할 일을 순서대로 하면 단단해집니다.'
    ]
  };

  var MONTH_BRANCH_TEXT = {
    self: '일지와 같은 기운이 겹쳐 익숙한 리듬이 이어집니다.',
    yukhap: '사람과 일이 부드럽게 붙는 달입니다.',
    samhap: '여럿이 힘을 합치는 일에 운이 실립니다.',
    chung: '이동과 변화가 많은 달입니다. 큰 결정은 미루는 편이 낫습니다.',
    hyeong: '말과 서류를 한 번 더 확인해야 하는 달입니다.',
    wonjin: '서운한 마음이 올라오기 쉬운 달입니다. 감정은 하루 묵혀 두세요.',
    hae: '도우려던 일이 짐이 되기 쉬운 달입니다. 선을 지키는 것이 배려입니다.',
    none: '큰 마찰 없이 흐름을 타기 좋은 달입니다.'
  };

  /* 인연 항목에서 쓰는 짧은 지지 문장 */
  var YEAR_BRANCH_LOVE = {
    self: '일지가 같은 기운을 만나 편안하지만, 익숙함이 설렘을 덮지 않도록 서로에게 새로 알려 줄 것을 하나씩 만들어 보세요.',
    yukhap: '일지가 합을 이루니 인연이 자연스럽게 이어집니다. 소개와 모임이 실제로 만남이 되는 해입니다.',
    samhap: '여럿이 어울리는 자리에서 좋은 인연이 모입니다. 함께하는 일이 곧 만남의 통로가 됩니다.',
    chung: '일지가 흔들리는 해라 감정의 기복이 큽니다. 결론을 서두르지 말고, 한 번 더 대화한 뒤 정하세요.',
    hyeong: '말이 오해로 번지기 쉬운 해입니다. 중요한 이야기는 얼굴을 보고 꺼내세요.',
    wonjin: '가까운 사이에서 서운함이 쌓이기 쉽습니다. 작은 감정도 그날 말해 두는 편이 낫습니다.',
    hae: '도우려던 마음이 오히려 부담이 되기 쉬운 해입니다. 상대가 원하는 것을 먼저 물어보세요.',
    none: '관계의 마찰이 적어 편안하게 사람을 만나기 좋은 해입니다.'
  };

  var MONTH_BRANCH_BY_MONTH = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];
  var LEVEL_BY_REL = { 비화: 2, 아생: 2, 생아: 3, 아극: 3, 극아: 1 };
  var LEVEL_ADJ = { self: 0, yukhap: 1, samhap: 1, chung: -2, hyeong: -1, wonjin: -1, hae: -1, none: 0 };

  function monthlyFlow(chart, year) {
    var info = YEAR_INFO[year];
    if (!info) return [];
    var rows = [];
    for (var m = 1; m <= 12; m++) {
      var branch = MONTH_BRANCH_BY_MONTH[m - 1];
      var mIdx = (branch - 2 + 12) % 12;
      var stem = (2 * info.stem + 2 + mIdx) % 10;
      var god = C.tenGodName(chart.dayMaster, stem);
      var rel = stemRelation(chart.dayMasterElem, C.STEM_ELEM[stem]);
      var brel = branchRelation(chart.dayPillar.branch, branch);
      var level = clamp((LEVEL_BY_REL[rel] || 2) + (LEVEL_ADJ[brel.type] || 0), 1, 3);
      var seed = hash('' + year + m + chart.dayMaster);
      rows.push({
        month: m,
        label: m + '월',
        ganji: C.STEMS[stem] + C.BRANCHES[branch],
        hanja: C.STEMS_HANJA[stem] + C.BRANCHES_HANJA[branch],
        god: god,
        level: level,
        text: pick(MONTH_STEM_TEXT[rel], seed) + ' ' + MONTH_BRANCH_TEXT[brel.type]
      });
    }
    return rows;
  }

  function yearReading(chart, year) {
    var info = YEAR_INFO[year];
    if (!info) return null;

    var rel = stemRelation(chart.dayMasterElem, C.STEM_ELEM[info.stem]);
    var brel = branchRelation(chart.dayPillar.branch, info.branch);
    var god = C.tenGodName(chart.dayMaster, info.stem);
    var g = YEAR_GOD[god];
    var counts = tenGodCounts(chart);
    var strength = strengthOf(chart, counts);
    var profile = STEM_PROFILE[chart.dayMaster];
    var months = monthlyFlow(chart, year);
    var risky = months.filter(function (m) { return m.level === 1; }).map(function (m) { return m.label; });
    var goodMonths = months.filter(function (m) { return m.level === 3; }).map(function (m) { return m.label; });

    var overview = [
      YEAR_REL_TEXT[rel],
      YEAR_BRANCH_TEXT[brel.type],
      '올해의 열쇠말은 ' + g.kw.replace(/·/g, ' · ') + '입니다. ' + g.headline + ' — ' + profile.image + '의 기질이 이 기운을 받아 쓰는 한 해입니다.'
    ];

    var money = [
      g.money,
      strength.label === '신강'
        ? '기운이 받쳐 주는 해라 벌인 만큼 지킬 힘도 있습니다. 다만 재물은 버는 재주보다 남기는 구조에서 갈리니, 수입의 일부를 먼저 떼어 두는 규칙을 두세요.'
        : strength.label === '신약'
          ? '나의 기운이 얕게 쓰이는 해입니다. 들어오는 문이 좁아 보여도 새는 곳을 막으면 남는 몫은 오히려 늘어납니다. 고정비와 습관 지출부터 정리하세요.'
          : '기운이 고른 해라 크게 흔들리지 않습니다. 지금의 저축과 지출 비율을 유지하는 것만으로도 한 해가 안정됩니다.',
      risky.length
        ? '흐름이 무거운 달은 ' + risky.slice(0, 2).join('·') + '입니다. 큰 지출과 새로운 투자는 그 달을 피해 잡으세요.'
        : '한 해 동안 크게 흔들리는 달은 없습니다. 정한 금액을 꾸준히 넣는 방식이 잘 맞습니다.'
    ];
    if (goodMonths.length) {
      money.push('반대로 ' + goodMonths.slice(0, 2).join('·') + '에는 들어오는 돈을 챙기기 좋습니다. 미뤄 둔 수금과 정산은 그 달에 처리하세요.');
    }

    var work = [
      g.work,
      '타고난 결로 보면 ' + profile.fit + ' 쪽이 편합니다. ' + profile.image + '의 기질이 가장 자연스럽게 쓰이는 자리입니다.',
      brel.type === 'chung'
        ? '일지가 충을 맞는 해라 이동의 기운이 큽니다. 옮길지 남을지 고민된다면 연봉보다 3년 뒤의 모습을 기준으로 판단하세요.'
        : brel.type === 'yukhap' || brel.type === 'samhap'
          ? '일지가 합을 이루는 해라 사람을 통해 기회가 들어옵니다. 미뤄 둔 연락과 제안을 꺼내기 좋습니다.'
          : '지금 자리에서 깊이를 더하는 쪽이 유리한 해입니다. 눈에 띄지 않아도 쌓인 것이 다음 해에 값이 됩니다.'
    ];

    var isMale = chart.input.gender === 'male';
    var starGods = isMale ? ['편재', '정재'] : ['편관', '정관'];
    var starLabel = isMale ? '재성' : '관성';
    var hits = [];
    chart.pillars.forEach(function (p) {
      if (starGods.indexOf(p.stemGod) !== -1) hits.push(p.label + ' 천간');
      if (starGods.indexOf(p.branchGod) !== -1) hits.push(p.label + ' 지지');
    });
    var love = [
      g.love,
      YEAR_BRANCH_LOVE[brel.type],
      hits.length
        ? '내 명식에는 ' + starLabel + '이 ' + hits.length + '곳(' + hits.join(', ') + ')에 있습니다. 인연이 들어오는 통로가 그만큼 있다는 뜻이라, 그 자리가 열리는 달에 움직이면 훨씬 수월합니다.'
        : '내 명식에는 ' + starLabel + '이 겉으로 드러나지 않았습니다. 스스로 찾기보다 하는 일과 취미를 통해 자연스럽게 만나는 쪽이 맞습니다.'
    ];

    return {
      year: year,
      label: year + ' ' + info.name + '년',
      ganji: info.name,
      hanja: info.hanja,
      god: god,
      keywords: g.kw.split('·'),
      theme: g.theme,
      headline: g.headline,
      summary: overview[0] + ' ' + overview[2],
      sections: [
        { key: 'overview', title: '한 해의 큰 흐름', hanja: '總評', paras: overview },
        { key: 'money', title: '재물운', hanja: '財', paras: money },
        { key: 'work', title: '직업·일', hanja: '官', paras: work },
        { key: 'love', title: '인연·관계', hanja: '緣', paras: love }
      ],
      months: months,
      risky: risky,
      good: goodMonths
    };
  }

  /* 한 줄 요약 — 미리보기·메타 설명에 사용 */
  function yearlyLine(chart, year) {
    var info = YEAR_INFO[year];
    if (!info) return '';
    var rel = stemRelation(chart.dayMasterElem, C.STEM_ELEM[info.stem]);
    var brel = branchRelation(chart.dayPillar.branch, info.branch);
    return YEAR_REL_TEXT[rel] + ' ' + YEAR_BRANCH_TEXT[brel.type];
  }

  global.SajuReading = {
    STEM_PROFILE: STEM_PROFILE,
    ELEMENT_META: ELEMENT_META,
    stemProfile: stemProfile,
    elementBalance: elementBalance,
    todayFortune: todayFortune,
    tenGodCounts: tenGodCounts,
    strengthOf: strengthOf,
    moneyReading: moneyReading,
    careerReading: careerReading,
    loveReading: loveReading,
    healthReading: healthReading,
    yearReading: yearReading,
    monthlyFlow: monthlyFlow,
    yearlyLine: yearlyLine,
    branchRelation: branchRelation
  };
})(window);
