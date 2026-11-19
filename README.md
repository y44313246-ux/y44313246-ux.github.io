# 사주결 (四柱結) — 전부 무료 사주·운세 사이트

생년월일시 하나로 **사주팔자·오행·성향·오늘의 운세·재물·직업·인연·건강운·2026·2027 신년운세(월별 흐름)** 를
**100% 무료**로 보여 주는 정적 사이트입니다. 결제·잠금·회원가입이 없고, 수익은 **광고(AdSense / 카카오 애드핏)** 로만 냅니다.
빌드 도구 없이 순수 HTML/CSS/JS로 동작하며, GitHub Pages에서 바로 서비스됩니다.

```
ai-saju/
├── index.html                  # 랜딩 + 입력 + 무료 결과 전체 (단일 페이지)
├── about.html                  # 소개 — 계산 방식, 용어, 한계
├── terms.html                  # 이용약관
├── privacy.html                # 개인정보 처리방침 (광고 쿠키 포함)
├── ads.txt                     # AdSense 게시자 인증 자리 (주석 안내)
├── assets/
│   ├── css/style.css           # 한지 아이보리 + 먹 + 금 톤, 모바일 퍼스트
│   └── js/
│       ├── lunar-data.js       # 음력 월력 테이블 (1920–2049)
│       ├── saju-core.js        # 만세력 엔진: 음양력·절기·사주팔자·십성·오행
│       ├── saju-reading.js     # 해석 엔진: 성향·오늘의 운세·재물/직업/인연/건강·신년운세
│       └── app.js              # 화면 조립
├── robots.txt · sitemap.xml · vercel.json · package.json
```

## 1. 로컬에서 열기

```bash
cd projects/ai-saju
python3 -m http.server 8000      # 또는  npx serve . -l 8000
# 브라우저에서 http://localhost:8000
```

`index.html`을 파일로 바로 열어도 모든 풀이가 동작합니다. 계산과 문장 생성이 전부 브라우저 안에서 이루어지기 때문입니다.
서버·API·환경변수는 필요 없습니다.

## 2. 무료로 제공하는 것

| 항목 | 내용 |
| --- | --- |
| 양력·음력·윤달 변환 | 1920–2049, 한국천문연구원 음양력 기준 테이블 |
| 사주팔자 | 연주·월주·일주·시주, 천간·지지·십성·오행 |
| 절기 계산 | 태양 황경으로 12절(節) 입절 시각 계산(±5분), 입춘·절입 기준으로 연주·월주 전환 |
| 오행 분포 | 여덟 글자 기준 막대 + 과다·부족 해설 |
| 타고난 성향 | 일간(10천간)별 성향·강점·주의점·어울리는 자리 |
| 오늘의 운세 | 오늘 일진과 내 일간·일지의 생극·합충으로 점수와 재물·인연·건강 풀이 |
| 재물운 | 재성의 개수·위치와 신강·신약으로 재물의 그릇·통로·새는 곳 |
| 직업운 | 관성·식상·인성·비겁 분포로 일하는 방식과 맞는 자리 |
| 연애·대인운 | 배우자성(남성 재성 / 여성 관성)의 위치, 일지의 충·합, 표현 방식 |
| 건강·생활운 | 오행 과다·부족을 몸의 부위와 생활 습관으로 옮긴 참고 |
| 2026 신년운세 | 병오년 총평·재물·직업·인연 + 12개월 월별 흐름 |
| 2027 신년운세 | 정미년 총평·재물·직업·인연 + 월별 흐름(접이식) |

**계산 기준**
- 시각은 한국표준시. 일주는 **자시(23:00)** 에 바뀌는 전통 기준 (`saju-core.js`의 `CONFIG.dayBoundaryHour`).
- 연주는 입춘, 월주는 절입 시각에 바뀝니다.
- 절기 시각은 Meeus 저정밀식으로 산출하므로 ±5분 오차가 있습니다. 진태양시 보정은 하지 않았습니다.

## 3. 광고 붙이는 곳 (유진 님 작업 지점)

광고 지면은 세 곳이며, `index.html`에서 주석으로 표시해 두었습니다.

| 슬롯 | 위치 | 마커 |
| --- | --- | --- |
| 광고 1 | 히어로 아래 · 입력 폼 위 | `AD_SLOT_TOP` (`#ad-slot-top`) |
| 광고 2 | 결과 중간 · 오늘의 운세 아래 | `AD_SLOT_MIDDLE` (`#ad-slot-middle`) |
| 광고 3 | 결과 하단 | `AD_SLOT_BOTTOM` (`#ad-slot-bottom`) |

### AdSense 순서
1. AdSense에서 사이트(`https://y44313246-ux.github.io/`)를 등록하고 승인을 받습니다.
2. `index.html`의 `<head>`에 있는 광고 스크립트 주석을 풀고 `ca-pub-...`를 본인 ID로 바꿉니다.
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000" crossorigin="anonymous"></script>
   ```
3. 광고 단위를 만들고, 각 슬롯의 `<span class="ad-copy">…</span>` 자리를 아래로 교체합니다.
   ```html
   <ins class="adsbygoogle" style="display:block"
        data-ad-client="ca-pub-0000000000000000"
        data-ad-slot="0000000000"
        data-ad-format="auto" data-full-width-responsive="true"></ins>
   <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
   ```
4. `ads.txt`의 주석을 풀고 게시자 ID를 넣습니다.
   ```
   google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
   ```

### 카카오 애드핏
1. 애드핏에서 매체 등록 후 광고 단위를 만듭니다.
2. `<head>`에 애드핏 SDK를 넣고, 슬롯마다 아래로 교체합니다.
   ```html
   <ins class="kakao_ad_area" style="display:none" data-ad-unit="DAN-xxxxxxx" data-ad-width="320" data-ad-height="100"></ins>
   <script src="//t1.daumcdn.net/kas/static/ba.min.js" async></script>
   ```
3. 애드핏만 쓸 때는 `ads.txt`가 필요 없습니다.

> 광고 코드를 넣기 전에도 슬롯은 점선 박스로 자리를 지키고 있어, 레이아웃이 흔들리지 않습니다.

### 심사에 도움이 되도록 넣어 둔 것
- 소개(`about.html`)·이용약관(`terms.html`)·개인정보 처리방침(`privacy.html`) 세 페이지와 푸터 링크
- 광고·쿠키 고지(개인정보 처리방침 2항), 풀이의 한계 고지(모든 페이지 푸터)
- `robots.txt`, `sitemap.xml`, `canonical`, 구조화 데이터(JSON-LD)
- 광고 영역에 `AD` 라벨 표시

## 4. 배포 (GitHub Pages)

- 사이트: <https://y44313246-ux.github.io/>
- 저장소: <https://github.com/y44313246-ux/ai-saju> (public)
- 게시 소스: `gh-pages` 브랜치 루트 (Deploy from a branch)

```bash
git push origin main
git push origin main:gh-pages
```
반영까지 보통 30초~2분. 저장소 → Actions → pages build and deployment 에서 상태를 볼 수 있습니다.

## 5. 알려진 한계

- 음력 변환은 1920–2049년만 지원합니다.
- 시주는 ‘시간 모름’ 선택 시 세 기둥으로 풀이합니다.
- 풀이는 규칙 기반이라 같은 사주·같은 날에는 항상 같은 문장이 나옵니다.
- 대운·세운의 세밀한 길흉, 신살, 격국 판정은 다루지 않습니다.
- 광고는 코드를 넣기 전까지 표시되지 않습니다(자리만 유지).

## 6. 오픈 전 체크리스트

- [ ] AdSense(또는 애드핏) 승인 → 광고 코드 삽입, `ads.txt` 게시자 ID 반영
- [ ] 운영자 표기: 필요하면 사업자 정보·연락처를 푸터에 추가 (현재는 GitHub 이슈로 문의)
- [ ] `og:image` 제작(1200×630)
- [ ] Search Console / 네이버 서치어드바이저에 `sitemap.xml` 제출
