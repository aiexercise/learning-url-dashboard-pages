# URL Digest Dashboard

상현님 학습 전용 Hermes Agent가 Telegram/cron으로 받은 학습 URL과 AI 기사 수집 결과를 보여주는 정적 대시보드입니다.

## 빠른 실행

```bash
cd '/Users/sanghyunlee/Desktop/헤르메스에이전트/learning-url-dashboard'
python3 -m http.server 4175 --bind 127.0.0.1
```

브라우저: http://127.0.0.1:4175/index.html

## 데이터 추가

단일 URL:

```bash
python3 scripts/ingest_learning.py \
  --url 'https://example.com/article' \
  --title '제목' \
  --summary '핵심 요약' \
  --application '상현님 시스템 적용 판단' \
  --status '적용 후보' \
  --tags 'AI,기술구현'
```

JSON 배열/객체 파일:

```bash
python3 scripts/ingest_learning.py --from-json /tmp/items.json
```

AI 뉴스 수집:

```bash
python3 scripts/fetch_ai_news.py --limit 5 --lookback-hours 72 > /tmp/ai-news.json
python3 scripts/ingest_learning.py --from-json /tmp/ai-news.json
```

수집기는 검증된 RSS/Atom 화이트리스트만 사용하며 공식 변경 로그를 우선합니다. URL 추적값 제거, 72시간 신선도 필터, 관련성/클릭베이트 점수, URL·제목 중복 제거를 거친 JSON을 출력합니다. 일부 피드가 실패해도 성공한 소스는 계속 처리합니다.

소스 선정 근거와 X/Instagram/팟캐스트 운영 제한은 [`docs/ai-daily-brief-sources.md`](docs/ai-daily-brief-sources.md)를 참고하세요.

## 매일 10분 AI 브리프 정책

- 한국어 사실형 제목을 사용합니다.
- 핵심 항목은 최대 5건이며, 중요한 새 정보가 적으면 억지로 채우지 않습니다.
- 같은 사건은 공식 원문 하나로 합치고 가격·배포·독립 검증 등 새 사실이 없으면 반복하지 않습니다.
- 각 항목은 `변화 / 상현님에게 중요한 이유 / 근거·불확실성 / 원문`만 남깁니다.
- Hermes·AI agent·코딩 자동화·모델/API 변경·실제 구현을 우선하고, AI 인프라/투자는 관찰·리스크 체크로만 표현합니다.

`fetch_ai_news.py`는 stdout에 JSON만 출력합니다. 기본 정책은 최근 72시간 내 후보 중 relevance score가 높은 항목을 고르고, 공식 RSS/Atom/GitHub release 원문을 Google News discovery 결과보다 우선합니다. 출력 shape는 기존 ingest와 호환되는 `{items, errors, generatedAt}`이며 각 item에는 `sourceTier`, `relevanceScore`, `readSeconds`, `evidence`가 추가됩니다.

10분 데일리 AI 브리프 정책:

- 핵심 항목은 최대 5개입니다.
- filler 금지: 관련성 낮은 날은 5개를 채우지 않습니다.
- 같은 URL/같은 스토리 반복을 피하고, 공식 원문을 우선합니다.
- 헤드라인은 사실 기반 한국어로 재작성할 수 있지만 과장 표현은 피합니다.
- 총 읽기 예산은 약 10분이며 podcast는 주간 맥락 보강용입니다.

소스 정책 문서: [docs/ai-daily-brief-sources.md](docs/ai-daily-brief-sources.md)

## 검증

```bash
python3 -m unittest discover -s tests -v
node tests/test-app-core.mjs
node --check app-core.mjs
node --check app.js
python3 -m json.tool data/digests.json >/tmp/learning-url-dashboard-json-ok.txt
```

## Git 연동

이 폴더는 private repository remote를 연결해 사용합니다. 토큰/credential은 파일에 저장하지 않습니다.

```bash
git init
git remote add origin <private-repo-url>
git add .
git commit -m 'Initialize learning URL dashboard'
git push -u origin main
```

## 자동 배포

현재 GitHub 요금제에서는 private repo 자체의 GitHub Pages가 지원되지 않으므로, 소스 repo는 private로 유지하고 공개 배포 전용 repo에 정적 파일만 동기화합니다.

- source repo: `https://github.com/aiexercise/learning-url-dashboard` private
- deploy repo: `https://github.com/aiexercise/learning-url-dashboard-pages` public
- site: `https://aiexercise.github.io/learning-url-dashboard-pages/`

수동 배포:

```bash
./scripts/deploy_pages.sh
```

cron 배포:

```bash
./scripts/run_ai_news_ingest.sh
```

`run_ai_news_ingest.sh`는 최근 72시간 AI 뉴스 후보를 최대 5개 수집, ingest, 테스트, private repo push 후 `deploy_pages.sh`를 호출해 GitHub Pages 배포 repo까지 자동 갱신합니다.

LLM 선별 단계에서 만든 0~5건 JSON만 반영하려면 다음처럼 입력을 지정할 수 있습니다.

```bash
AI_NEWS_INPUT_JSON=/tmp/ai-daily-selected.json ./scripts/run_ai_news_ingest.sh
```
