# 상현님 AI 데일리 브리프 소스 정책

검증 기준일: 2026-08-22

목표는 AI 뉴스를 많이 모으는 것이 아니라, **Hermes/AI 에이전트·코딩 자동화·모델/API 변경·실제 구현·AI 산업/투자 관찰**에 영향을 주는 새 정보만 하루 최대 5건으로 압축하는 것입니다.

## 매일 수집하는 핵심 소스

수집 방법은 공개 RSS/Atom/GitHub release feed만 기본 허용한다. HTML scraping, 로그인 세션, 비공식 소셜 scraping은 일일 자동 수집에 넣지 않는다.

### 1차 출처 — 사실 기준

- [OpenAI News RSS](https://openai.com/news/rss.xml) — 수집 방법: RSS. 모델·API·Codex 발표. 고객 사례와 기업 홍보는 감점합니다.
- [Google DeepMind RSS](https://deepmind.google/blog/rss.xml) — 수집 방법: RSS. 프런티어 모델·에이전트·과학/로보틱스 연구. 실제 공개 코드/API가 있는 항목을 우선합니다.
- [Claude Platform Release Notes RSS](https://platform.claude.com/docs/en/release-notes/feed.xml) — 수집 방법: RSS. Claude API, tool use, MCP, 모델·가격·폐기 변경.
- [Claude Code Releases Atom](https://github.com/anthropics/claude-code/releases.atom) — 수집 방법: GitHub releases Atom. 기능·권한·hooks·subagents·MCP 변경.
- [GitHub Changelog RSS](https://github.blog/changelog/feed/) — 수집 방법: RSS. Copilot, coding agent, code review, Actions 관련 항목만 통과합니다.
- [Hugging Face Blog RSS](https://huggingface.co/blog/feed.xml) — 수집 방법: RSS. 오픈 모델·추론·agents·Transformers 변화.

### 독립 분석 — 공식 발표 검증

- [Simon Willison Atom](https://simonwillison.net/atom/everything/) — 수집 방법: Atom. 직접 테스트, 명령어, 보안·prompt injection, 코딩 에이전트 실전 경험.
- [Interconnects RSS](https://www.interconnects.ai/feed) — 수집 방법: RSS/Substack feed. 모델·오픈소스·학습/추론 경제성 및 산업 구조.
- [Latent.Space RSS](https://www.latent.space/feed) — 수집 방법: RSS/Substack feed. AI 엔지니어링, agents, eval, 인프라 심층 분석.
- [SemiAnalysis RSS](https://semianalysis.substack.com/feed) — 수집 방법: RSS/Substack feed. GPU·데이터센터·추론 원가·AI 공급망. 투자 관찰용이며 매수/매도 신호로 사용하지 않습니다.

### 발견용 보조

- Google News AI RSS — 수집 방법: Google News RSS. 누락 발견용입니다. 같은 사건의 공식 문서가 있으면 공식 URL로 승격하고, Google News 링크 자체는 대표 근거로 쓰지 않습니다.

## 팟캐스트

팟캐스트는 일일 분량을 채우는 용도가 아니라, **새 에피소드의 show notes나 transcript에 고유한 실무 정보가 있을 때만** 선택합니다.

- [Latent.Space](https://www.latent.space/feed) — 수집 방법: RSS/Substack feed. AI 엔지니어링 심층 인터뷰.
- [Practical AI](https://feeds.transistor.fm/practical-ai-machine-learning-data-science-llm) — 수집 방법: Podcast RSS. agent 구축·MLOps·인프라 실무.
- [Last Week in AI](https://lastweekin.ai/) — 수집 방법: 수동 주간 확인. 평일 1차 출처와 중복되므로 기본 일일 브리프에서는 제외합니다.

전체 에피소드를 추천하지 않고, 공식 transcript/show notes에서 확인된 핵심 구간과 타임스탬프가 있을 때만 `선택 청취`로 표시합니다.

## X 프로필

핵심 관찰 계정:

- [@simonw](https://x.com/simonw)
- [@ArtificialAnlys](https://x.com/ArtificialAnlys)
- [@OpenAI](https://x.com/OpenAI)
- [@AnthropicAI](https://x.com/AnthropicAI)
- [@GoogleDeepMind](https://x.com/GoogleDeepMind)
- [@huggingface](https://x.com/huggingface)
- [@NousResearch](https://x.com/NousResearch)

X는 비로그인 HTML 수집이 불안정하고 공식 API는 인증·비용 제약이 있습니다. 따라서 현재는 **발견용 계층**으로만 취급합니다. 가능한 대체 경로는 공식 RSS/블로그, GitHub Releases, Nous [Releases](https://nousresearch.com/releases/)와 [GitHub](https://github.com/NousResearch)입니다. X 단독 주장은 핵심 항목으로 올리지 않고 원문·논문·릴리스 노트로 확인합니다.

## Instagram 프로필

**일일 핵심 계정은 0개**입니다. Instagram은 로그인/API 제한이 있고, 공식 블로그·X·YouTube 데모를 반복하는 비율이 높아 자동 수집 대비 가치가 낮습니다.

수동 영상 확인 후보만 유지합니다.

- [@googledeepmind](https://www.instagram.com/googledeepmind/) — 로보틱스·멀티모달처럼 움직임이 정보인 데모.
- [@openai](https://www.instagram.com/openai/) — 제품 UI 데모.
- [@nvidia](https://www.instagram.com/nvidia/) — GTC·하드웨어·로봇 데모.

사용자가 특정 Instagram URL을 보내면 단발성 학습 입력으로 처리하되, 비공식 로그인 스크래퍼를 상시 파이프라인에 넣지 않습니다.

## 편집 및 중복 제거 규칙

1. 대표 근거 우선순위: `공식 changelog/논문/GitHub > 공식 뉴스룸 > 독립 검증 > 일반 기사 > 뉴스 집계 > 소셜`.
2. URL 추적 파라미터와 fragment를 제거하고, 같은 URL은 다시 요약하지 않습니다.
3. 같은 모델·제품·발표 사건은 한 항목으로 묶습니다. 가격, 공개 범위, 독립 벤치마크, 보안 대응처럼 의미 있는 새 사실이 있을 때만 후속 항목으로 인정합니다.
4. “충격·게임체인저·모든 것이 바뀐다”식 제목, 근거 없는 수치, 단순 고객 사례·파트너십·도구 목록은 감점 또는 제외합니다.
5. 하루 핵심 최대 5건, 관찰 최대 3건이며 중요한 소식이 없으면 억지로 채우지 않습니다.
6. 각 항목은 `무엇이 바뀌었나 / 왜 상현님에게 중요한가 / 근거·불확실성 / 원문`으로 씁니다.
7. 읽기 예산은 본문 기준 최대 10분입니다. 원문 링크를 여는 시간은 별도입니다.
8. 투자 내용은 매수·매도 지시가 아니라 산업 신호, 실적·밸류에이션 확인, 리스크 체크로 표현합니다.
