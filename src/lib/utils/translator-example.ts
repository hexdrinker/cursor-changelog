import {
  translateChanges,
  translateObject,
  type SupportedLanguage,
} from './translator'

// 사용 예시 1: 간단한 객체 번역
export async function basicTranslationExample() {
  const previousData = {
    title: 'Hello World',
    description: 'This is a sample application',
    version: '1.0.0',
  }

  const currentData = {
    title: 'Welcome to Our App',
    description: 'This is an amazing new application with great features',
    version: '1.0.0',
    newFeature: 'AI-powered translation support',
  }

  try {
    const result = await translateObject(previousData, currentData)
    console.log('번역 결과:', JSON.stringify(result, null, 2))
    return result
  } catch (error) {
    console.error('번역 실패:', error)
    throw error
  }
}

// 사용 예시 2: 복잡한 중첩 객체 번역
export async function complexTranslationExample() {
  const previousData = {
    app: {
      name: 'Old App Name',
      settings: {
        theme: 'dark',
        language: 'en',
      },
    },
    features: ['login', 'dashboard'],
  }

  const currentData = {
    app: {
      name: 'Revolutionary New App',
      settings: {
        theme: 'dark',
        language: 'ko',
        notifications: 'enabled',
      },
      metadata: {
        author: 'Development Team',
        category: 'Productivity',
      },
    },
    features: ['login', 'dashboard', 'ai-translation', 'real-time-sync'],
    changelog: [
      'Added AI translation feature',
      'Improved user interface',
      'Fixed critical bugs',
    ],
  }

  try {
    const result = await translateChanges({
      previousData,
      currentData,
    })

    console.log('복잡한 객체 번역 결과:', JSON.stringify(result, null, 2))
    return result
  } catch (error) {
    console.error('복잡한 번역 실패:', error)
    throw error
  }
}

// 사용 예시 3: 특정 언어만 번역
export async function selectiveLanguageExample() {
  const currentData = {
    announcement: 'We are excited to announce our new product launch!',
    details: 'Join us for an amazing experience with cutting-edge technology.',
  }

  const targetLanguages: SupportedLanguage[] = ['ko', 'ja'] // 한국어, 일본어만

  try {
    const result = await translateChanges(
      {
        currentData,
      },
      targetLanguages
    )

    console.log('선택적 언어 번역 결과:', JSON.stringify(result, null, 2))
    return result
  } catch (error) {
    console.error('선택적 번역 실패:', error)
    throw error
  }
}

// 사용 예시 4: API 응답 데이터 번역
export async function apiResponseTranslationExample() {
  const previousApiResponse = {
    status: 'success',
    data: {
      user: {
        name: 'John Doe',
        message: 'Welcome back!',
      },
      notifications: [{ id: 1, text: 'You have a new message', type: 'info' }],
    },
  }

  const currentApiResponse = {
    status: 'success',
    data: {
      user: {
        name: 'John Doe',
        message: 'Welcome to the new experience!',
      },
      notifications: [
        { id: 1, text: 'You have 3 new messages', type: 'info' },
        {
          id: 2,
          text: 'System maintenance scheduled for tonight',
          type: 'warning',
        },
      ],
      achievements: [
        {
          id: 1,
          title: 'First Login',
          description: 'Successfully logged in for the first time',
        },
        {
          id: 2,
          title: 'Power User',
          description: 'Used the app for 30 consecutive days',
        },
      ],
    },
  }

  try {
    const result = await translateObject(
      previousApiResponse,
      currentApiResponse
    )
    console.log('API 응답 번역 결과:', JSON.stringify(result, null, 2))
    return result
  } catch (error) {
    console.error('API 응답 번역 실패:', error)
    throw error
  }
}

// 모든 예시를 실행하는 함수
export async function runAllExamples() {
  console.log('=== 번역 예시 실행 시작 ===\n')

  try {
    console.log('1. 기본 번역 예시')
    await basicTranslationExample()
    console.log('\n')

    console.log('2. 복잡한 객체 번역 예시')
    await complexTranslationExample()
    console.log('\n')

    console.log('3. 선택적 언어 번역 예시')
    await selectiveLanguageExample()
    console.log('\n')

    console.log('4. API 응답 번역 예시')
    await apiResponseTranslationExample()
    console.log('\n')

    console.log('=== 모든 예시 실행 완료 ===')
  } catch (error) {
    console.error('예시 실행 중 오류:', error)
  }
}
