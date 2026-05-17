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
python3 scripts/fetch_ai_news.py --limit 5 > /tmp/ai-news.json
python3 scripts/ingest_learning.py --from-json /tmp/ai-news.json
```

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

`run_ai_news_ingest.sh`는 AI 뉴스 수집, ingest, 테스트, private repo push 후 `deploy_pages.sh`를 호출해 GitHub Pages 배포 repo까지 자동 갱신합니다.
