# Cursor Changelog API

Cursor 공식 changelog를 파싱하고 다국어 번역을 제공하는 Next.js API 프로젝트입니다.

## 🌟 주요 기능

- **📝 Changelog 파싱**: Cursor 공식 사이트에서 changelog 데이터 자동 추출
- **🌐 다국어 번역**: OpenAI를 활용한 한국어, 일본어, 중국어, 스페인어 번역 지원
- **⚡ 스마트 캐싱**: 메모리 캐시 + 번역 캐시로 성능 최적화
- **🚀 REST API**: 간단한 쿼리 파라미터로 데이터 조회

## 📡 API 사용법

### 기본 사용

```bash
# 원본 영어 데이터
GET /api/changelog

# 한국어 번역
GET /api/changelog?lang=ko

# 일본어 번역 (최신 5개만)
GET /api/changelog?lang=ja&limit=5

# 특정 버전 조회
GET /api/changelog?version=1.0&lang=ko
```

### 지원하는 언어

- `ko`: 한국어
- `ja`: 일본어
- `zh`: 중국어
- `es`: 스페인어

### 쿼리 파라미터

| 파라미터  | 설명                 | 예시                   |
| --------- | -------------------- | ---------------------- |
| `lang`    | 번역 언어 코드       | `ko`, `ja`, `zh`, `es` |
| `limit`   | 최대 항목 수 (1-100) | `10`                   |
| `version` | 특정 버전 필터링     | `1.0`                  |

### 응답 형식

```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "abc123def456",
        "version": "1.0",
        "date": "2024-01-15",
        "title": "BugBot, Background Agent access to everyone",
        "content": "번역된 내용...",
        "images": [...],
        "videos": [...],
        "sections": [...]
      }
    ],
    "metadata": {
      "language": "ko",
      "total": 10,
      "originalTotal": 50,
      "generatedAt": "2024-01-15T10:30:00.000Z",
      "cacheAge": 1234567
    }
  }
}
```

## ⚙️ 환경 설정

번역 기능을 사용하려면 OpenAI API 키가 필요합니다.

```bash
# .env.local 파일 생성
echo "OPENAI_API_KEY=your-openai-api-key-here" > .env.local
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
