# Cursor Changelog 자동 동기화 API

이 문서는 `/api/sync` 엔드포인트를 사용하여 Cursor changelog를 자동으로 크롤링하고 번역하는 방법을 설명합니다.

## 🚀 기능 개요

- **자동 크롤링**: Cursor 공식 changelog 페이지에서 최신 데이터 수집
- **다국어 번역**: OpenAI GPT-4o-mini를 사용한 고품질 번역 (한국어, 일본어, 중국어, 스페인어)
- **스마트 캐싱**: 중복 번역 방지 및 성능 최적화
- **변경 감지**: 새로운 항목과 업데이트된 항목 자동 감지
- **배치 처리**: API 요청 제한을 고려한 효율적인 배치 번역
- **외부 트리거**: cron 서비스를 통한 주기적 자동 실행

## 🔧 환경 설정

### 1. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```bash
# OpenAI API Key (필수)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Sync API 인증 토큰 (선택사항, 프로덕션에서 권장)
SYNC_TOKEN=your-secure-sync-token-here
```

### 2. OpenAI API 키 발급

1. [OpenAI Platform](https://platform.openai.com/api-keys)에서 API 키 생성
2. 충분한 크레딧이 있는지 확인 (번역에는 GPT-4o-mini 사용)

## 📡 API 엔드포인트

### GET /api/sync - 동기화 상태 조회

현재 동기화 상태와 통계를 확인합니다.

```bash
curl -X GET "http://localhost:3001/api/sync" \
  -H "Authorization: Bearer your-sync-token-here"
```

**응답 예시:**

```json
{
  "lastSync": "2024-12-06T10:30:00.000Z",
  "timeSinceLastSync": 1800,
  "nextRecommendedSync": "2024-12-06T11:30:00.000Z",
  "totalEntries": 25,
  "translatedEntries": 15,
  "supportedLanguages": ["ko", "ja", "zh", "es"],
  "status": "ready"
}
```

### POST /api/sync - 동기화 실행

changelog 크롤링과 번역을 수행합니다.

```bash
curl -X POST "http://localhost:3001/api/sync" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-sync-token-here" \
  -d '{
    "languages": ["ko", "ja"],
    "force": false
  }'
```

**요청 파라미터:**

- `languages` (선택): 번역할 언어 배열 (기본값: ["ko", "ja", "zh", "es"])
- `force` (선택): 최근 동기화 무시하고 강제 실행 (기본값: false)

**응답 예시:**

```json
{
  "success": true,
  "timestamp": "2024-12-06T11:00:00.000Z",
  "newEntries": 3,
  "updatedEntries": 1,
  "totalEntries": 28,
  "translatedLanguages": ["ko", "ja"],
  "duration": 45000
}
```

## 🔒 보안 설정

### 인증 토큰 사용

프로덕션 환경에서는 `SYNC_TOKEN` 환경변수를 설정하여 API를 보호하세요:

```bash
# .env.local
SYNC_TOKEN=your-very-secure-random-token-123456
```

모든 API 요청에는 Authorization 헤더가 필요합니다:

```bash
Authorization: Bearer your-very-secure-random-token-123456
```

### 토큰 생성 방법

안전한 토큰을 생성하려면:

```bash
# Linux/macOS
openssl rand -hex 32

# 또는 온라인 도구 사용
# https://www.uuidgenerator.net/
```

## ⏰ 외부 Cron 서비스 설정

### 1. GitHub Actions (무료)

`.github/workflows/sync-changelog.yml`:

```yaml
name: Sync Cursor Changelog

on:
  schedule:
    # 매시간 정각에 실행
    - cron: '0 * * * *'
  workflow_dispatch: # 수동 실행 허용

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Sync
        run: |
          curl -X POST "${{ secrets.APP_URL }}/api/sync" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.SYNC_TOKEN }}" \
            -d '{"languages": ["ko", "ja", "zh", "es"]}'
```

**GitHub Secrets 설정:**

- `APP_URL`: 배포된 앱 URL (예: `https://your-app.vercel.app`)
- `SYNC_TOKEN`: API 인증 토큰

### 2. Vercel Cron Jobs (권장)

`vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/sync",
      "schedule": "0 * * * *"
    }
  ]
}
```

### 3. 외부 Cron 서비스

#### EasyCron

1. [EasyCron](https://www.easycron.com/) 가입
2. 새 Cron Job 생성:
   - **URL**: `https://your-app.vercel.app/api/sync`
   - **Method**: POST
   - **Schedule**: `0 * * * *` (매시간)
   - **Headers**:
     ```
     Content-Type: application/json
     Authorization: Bearer your-sync-token-here
     ```
   - **Body**: `{"languages": ["ko", "ja", "zh", "es"]}`

#### Upstash Cron

1. [Upstash](https://upstash.com/) 가입 후 QStash 사용
2. Cron Job 생성:
   ```bash
   curl -X POST "https://qstash.upstash.io/v2/schedules" \
     -H "Authorization: Bearer YOUR_QSTASH_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "destination": "https://your-app.vercel.app/api/sync",
       "cron": "0 * * * *",
       "body": "{\"languages\": [\"ko\", \"ja\", \"zh\", \"es\"]}",
       "headers": {
         "Content-Type": "application/json",
         "Authorization": "Bearer your-sync-token-here"
       }
     }'
   ```

## 🔍 모니터링 및 로그

### 로그 확인

Vercel에서 함수 로그 확인:

```bash
vercel logs --follow
```

### 실패 알림 설정

동기화 실패 시 알림을 받으려면:

1. **Slack Webhook**: `performSync` 함수에 Slack 알림 추가
2. **이메일 알림**: 외부 서비스와 연동
3. **Discord Webhook**: 개발팀 알림용

예시 (Slack 알림):

```typescript
// 동기화 실패 시
if (!result.success) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 Changelog 동기화 실패: ${result.errors?.join(', ')}`,
    }),
  })
}
```

## 🛠️ 문제 해결

### 일반적인 오류

1. **401 Unauthorized**

   - `SYNC_TOKEN` 환경변수 확인
   - Authorization 헤더 형식 확인

2. **429 Too Many Requests**

   - 10분 이내 재시도 제한
   - `force: true` 옵션 사용

3. **번역 실패**

   - OpenAI API 키 및 크레딧 확인
   - 네트워크 연결 상태 확인

4. **크롤링 실패**
   - Cursor 웹사이트 접근성 확인
   - User-Agent 헤더 확인

### 성능 최적화

1. **캐시 디렉토리**: `./cache/sync` 폴더 생성 권한 확인
2. **배치 크기**: API 제한에 따라 `BATCH_SIZE` 조정
3. **요청 간격**: `setTimeout` 값 조정

## 📊 사용 통계

동기화 API는 다음 통계를 제공합니다:

- 새로운 항목 수
- 업데이트된 항목 수
- 번역된 언어
- 소요 시간
- 오류 정보

이 정보를 활용하여 시스템 성능을 모니터링하고 최적화할 수 있습니다.

## 🤝 지원

문제가 발생하면 다음을 확인하세요:

1. 환경변수 설정
2. API 키 유효성
3. 네트워크 연결
4. 로그 메시지

추가 도움이 필요하면 이슈를 생성해 주세요.
