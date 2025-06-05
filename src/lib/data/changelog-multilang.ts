import { MultiLanguageChangelogData } from '../types'

export const multiLanguageChangelogData: MultiLanguageChangelogData = {
  ko: [
    {
      id: '1.0',
      version: '1.0',
      date: '2025년 6월 4일',
      title:
        'BugBot, 모든 사용자에게 백그라운드 에이전트 접근 권한 및 원클릭 MCP 설치',
      content: `
Cursor 1.0이 출시되었습니다!

이번 릴리스에서는 코드 리뷰를 위한 BugBot, 메모리 기능의 첫 번째 모습, 원클릭 MCP 설정, Jupyter 지원, 그리고 백그라운드 에이전트의 일반 출시를 제공합니다.

### BugBot을 통한 자동 코드 리뷰

BugBot은 자동으로 PR을 검토하고 잠재적인 버그와 문제점을 찾아냅니다.

문제가 발견되면 BugBot이 GitHub의 PR에 코멘트를 남깁니다. "_**Cursor에서 수정**_"을 클릭하면 문제를 해결하기 위한 미리 채워진 프롬프트와 함께 에디터로 돌아갑니다.

### 모든 사용자를 위한 백그라운드 에이전트

몇 주 전 얼리 액세스로 원격 코딩 에이전트인 백그라운드 에이전트를 출시한 이후 초기 반응이 긍정적이었습니다.

이제 모든 사용자에게 백그라운드 에이전트를 확장하게 되어 기쁩니다! 채팅에서 클라우드 아이콘을 클릭하거나 프라이버시 모드가 비활성화된 경우 \`Cmd/Ctrl+E\`를 눌러 바로 사용할 수 있습니다.

### Jupyter 노트북의 에이전트

이제 Cursor가 Jupyter 노트북에서 변경사항을 구현할 수 있습니다!

에이전트는 이제 Jupyter 내에서 여러 셀을 직접 생성하고 편집하며, 이는 연구 및 데이터 사이언스 작업에 상당한 개선을 제공합니다. 시작 시에는 Sonnet 모델에서만 지원됩니다.

### 메모리

메모리를 통해 Cursor는 대화에서 사실을 기억하고 향후에 참조할 수 있습니다. 메모리는 개별 수준에서 프로젝트별로 저장되며 설정에서 관리할 수 있습니다.

메모리를 베타 기능으로 출시합니다. 시작하려면 설정 → 규칙에서 활성화하세요.
      `,
      video: 'https://example.com/video1.mp4',
      category: 'feature',
      highlights: [
        'BugBot을 통한 자동 코드 리뷰',
        '모든 사용자를 위한 백그라운드 에이전트',
        'Jupyter 노트북의 에이전트',
        '메모리 기능',
      ],
    },
    {
      id: '0.50',
      version: '0.50',
      date: '2025년 5월 15일',
      title: '간소화된 가격 정책, 백그라운드 에이전트 및 새로워진 인라인 편집',
      content: `
통합 요청 기반 가격 정책, 모든 최고 모델을 위한 Max 모드, 병렬 작업 실행을 위한 백그라운드 에이전트를 소개합니다. 또한 \`@folders\` 지원으로 개선된 컨텍스트 관리, 새로운 옵션으로 새로워진 인라인 편집, 더 빠른 파일 편집, 다중 루트 워크스페이스 지원, 내보내기 및 복제를 포함한 향상된 채팅 기능을 제공합니다.

### 더 간단하고 통합된 가격 정책

여러분의 피드백을 듣고 혼란을 줄이기 위해 통합 가격 모델을 출시합니다. 작동 방식은 다음과 같습니다:

* 모든 모델 사용이 이제 요청 기반 가격으로 통합됩니다
* Max 모드는 이제 토큰 기반 가격을 사용합니다 (모델 API 가격과 유사한 방식)
* 간단하게 유지하기 위해 프리미엄 도구 호출 및 긴 컨텍스트 모드가 제거됩니다

### 모든 최고 모델을 위한 Max 모드

Max 모드는 이제 더 간단한 토큰 기반 가격 모델과 함께 Cursor의 모든 최첨단 모델에서 사용할 수 있습니다. 가장 필요할 때 완전한 제어권을 제공하도록 설계되었습니다.

### 새로운 Tab 모델

이제 여러 파일에 걸친 변경사항을 제안할 수 있는 새로운 Tab 모델을 훈련했습니다. 이 모델은 특히 리팩터링, 편집 체인, 다중 파일 변경, 관련 코드 간 이동에서 뛰어납니다.

### 에이전트로 긴 파일의 빠른 편집

에이전트에 파일의 코드를 검색하고 교체하는 새로운 도구를 추가하여 긴 파일에 대해 훨씬 더 효율적으로 만들었습니다.
      `,
      image: 'https://example.com/image1.jpg',
      category: 'improvement',
      highlights: [
        '간소화된 가격 모델',
        '모든 모델을 위한 Max 모드',
        '새로운 Tab 모델',
        '긴 파일의 빠른 편집',
      ],
    },
    {
      id: '0.49',
      version: '0.49',
      date: '2025년 4월 15일',
      title: '규칙 생성, 개선된 에이전트 터미널 및 MCP 이미지',
      content: `
### 자동화되고 개선된 규칙

이제 \`/Generate Cursor Rules\` 명령을 사용하여 대화에서 직접 규칙을 생성할 수 있습니다. 이는 나중에 재사용하기 위해 대화의 기존 컨텍스트를 캡처하려고 할 때 유용합니다.

### 더 접근하기 쉬운 히스토리

채팅 히스토리가 명령 팔레트로 이동했습니다. 채팅의 "히스토리 표시 버튼"과 \`채팅 히스토리 표시\` 명령을 통해 액세스할 수 있습니다.

### 리뷰를 더 쉽게

에이전트가 생성한 코드를 검토하는 것이 각 대화 끝에 내장된 diff 뷰로 더 쉬워졌습니다. 에이전트의 메시지 후 채팅 하단에서 \`변경사항 검토\` 버튼을 찾을 수 있습니다.

### MCP의 이미지

이제 MCP 서버에서 컨텍스트의 일부로 이미지를 전달할 수 있습니다. 이는 스크린샷, UI 목업 또는 다이어그램이 질문이나 프롬프트에 필수적인 컨텍스트를 추가할 때 도움이 됩니다.

### 전역 무시 파일

이제 사용자 수준 설정을 통해 모든 프로젝트에 적용되는 전역 무시 패턴을 정의할 수 있습니다.
      `,
      category: 'feature',
      highlights: [
        '자동화된 규칙 생성',
        '접근하기 쉬운 채팅 히스토리',
        '내장된 diff 뷰',
        'MCP의 이미지 지원',
      ],
    },
    {
      id: '0.48',
      version: '0.48.x',
      date: '2025년 3월 23일',
      title: '채팅 탭, 사용자 정의 모드 및 더 빠른 인덱싱',
      content: `
이번 릴리스는 병렬 대화를 위한 채팅 탭, 사용자 정의 모드가 있는 재설계된 모드 시스템, 비용 가시성, 인덱싱 성능 및 MCP 안정성 개선을 소개합니다.

### 내장 모드 및 사용자 정의 모드 (베타)

Agent 및 Ask 모드는 Cursor의 내장 모드이며, 이제 사용자 정의 모드를 추가할 수 있는 옵션이 있습니다. 또한 "Edit"을 "Manual"로 이름을 바꿔 그 동작을 더 잘 반영합니다.

**사용자 정의 모드** (베타)를 사용하면 워크플로에 맞는 도구와 프롬프트로 새로운 모드를 구성할 수 있습니다.

### 채팅 탭

채팅에서 새 탭을 만들어 (⌘T) 여러 대화를 병렬로 진행하세요. Option을 누른 상태에서 + 버튼을 클릭하여 새 탭을 만들 수도 있습니다.

### 더 빠른 인덱싱

팀 내 유사한 코드베이스의 인덱싱 성능을 크게 개선하여 대규모 저장소의 후속 복사본에 대한 초기 인덱싱 시간을 크게 단축했습니다.

### 사운드 알림 (베타)

이제 Cursor는 채팅이 검토 준비가 되면 사운드를 재생할 수 있습니다. 설정 → 기능 → 채팅 → 완료 시 사운드 재생에서 이 기능을 활성화하세요.
      `,
      video: 'https://example.com/video2.mp4',
      category: 'improvement',
      highlights: [
        '병렬 대화를 위한 채팅 탭',
        '사용자 정의 모드 시스템',
        '더 빠른 인덱싱 성능',
        '사운드 알림',
      ],
    },
  ],
  en: [
    {
      id: '1.0',
      version: '1.0',
      date: 'June 4, 2025',
      title:
        'BugBot, Background Agent access to everyone and one-click MCP install',
      content: `
Cursor 1.0 is here!

This release brings BugBot for code review, a first look at memories, one-click MCP setup, Jupyter support, and general availability of Background Agent.

### Automatic code review with BugBot

BugBot automatically reviews your PRs and catches potential bugs and issues.

When an issue is found, BugBot leaves a comment on your PRs in GitHub. You can click "_**Fix in Cursor**_" to move back to the editor with a pre-filled prompt to fix the issue.

### Background Agent for everyone

Since we released Background Agent, our remote coding agent, in early access a few weeks ago, early signals have been positive.

We're now excited to expand Background Agent to all users! You can start using it right away by clicking the cloud icon in chat or hitting \`Cmd/Ctrl+E\` if you have privacy mode disabled.

### Agent in Jupyter Notebooks

Cursor can now implement changes in Jupyter Notebooks!

Agent will now create and edit multiple cells directly inside of Jupyter, a significant improvement for research and data science tasks. Only supported with Sonnet models to start.

### Memories

With Memories, Cursor can remember facts from conversations and reference them in the future. Memories are stored per project on an individual level, and can be managed from Settings.

We're rolling out Memories as a beta feature. To get started, enable from Settings → Rules.
      `,
      video: 'https://example.com/video1.mp4',
      category: 'feature',
      highlights: [
        'Automatic code review with BugBot',
        'Background Agent for everyone',
        'Agent in Jupyter Notebooks',
        'Memories feature',
      ],
    },
    {
      id: '0.50',
      version: '0.50',
      date: 'May 15, 2025',
      title: 'Simplified Pricing, Background Agent and Refreshed Inline Edit',
      content: `
Introducing unified request-based pricing, Max Mode for all top models, and Background Agent for parallel task execution. Plus, improved context management with \`@folders\` support, refreshed Inline Edit with new options, faster file edits, multi-root workspace support, and enhanced chat features including export and duplication.

### Simpler, unified pricing

We've heard your feedback and are rolling out a unified pricing model to make it less confusing. Here's how it works:

* All model usage is now unified into request-based pricing
* Max mode now uses token-based pricing (similar to how models API pricing works)
* Premium tool calls and long context mode are removed to keep it simple

### Max Mode for all top models

Max Mode is now available for all state-of-the-art models in Cursor, with a simpler token-based pricing model. It's designed to give you full control when you need it most.

### New Tab model

We've trained a new Tab model that now can suggest changes across multiple files. The model excels particularly at refactors, edit chains, multi file changes, and jumping between related code.

### Fast edits for long files with Agent

We've added a new tool to the agent that will search & replace code in files, making it much more efficient for long files.
      `,
      image: 'https://example.com/image1.jpg',
      category: 'improvement',
      highlights: [
        'Simplified pricing model',
        'Max Mode for all models',
        'New Tab model',
        'Fast edits for long files',
      ],
    },
    {
      id: '0.49',
      version: '0.49',
      date: 'April 15, 2025',
      title: 'Rules generation, improved agent terminal and MCP images',
      content: `
### Automated and improved rules

You can now generate rules directly from a conversation using the \`/Generate Cursor Rules\` command. This is useful when you want to capture the existing context of a conversation to reuse later.

### More accessible history

Chat history has moved into the command palette. You can access it from the "Show history button" in Chat as well as through the \`Show Chat History\` command

### Making reviews easier

Reviewing agent generated code is now easier with a built-in diff view at the end of each conversation. You'll find the \`Review changes\` button at the bottom of chat after a message from the agent.

### Images in MCP

You can now pass images as part of the context in MCP servers. This helps when screenshots, UI mocks, or diagrams add essential context to a question or prompt.

### Global ignore files

You can now define global ignore patterns that apply across all projects via your user-level settings.
      `,
      category: 'feature',
      highlights: [
        'Automated rules generation',
        'Accessible chat history',
        'Built-in diff view',
        'Images in MCP support',
      ],
    },
    {
      id: '0.48',
      version: '0.48.x',
      date: 'March 23, 2025',
      title: 'Chat tabs, Custom modes & Faster indexing',
      content: `
This release introduces chat tabs for parallel conversations, a redesigned modes system with custom modes, and improvements to cost visibility, indexing performance, and MCP reliability.

### Built-in modes & custom modes (beta)

Agent and Ask modes are the built-in modes in Cursor, now with the option to add custom modes. We've also renamed "Edit" to "Manual" to better reflect its behavior.

**Custom modes** (beta) allow you to compose new modes with tools and prompts that fit your workflow.

### Chat tabs

Create new tabs (⌘T) in chat to have multiple conversations in parallel. You can also hold Option and click the + button to create a new tab.

### Faster indexing

We've made significant improvements to indexing performance of similar codebases within a team, greatly reducing the initial indexing time for subsequent copies of large repositories.

### Sound notification (beta)

Cursor can now play a sound when a chat is ready for review. Enable this feature from Settings → Features → Chat → Play sound on finish.
      `,
      video: 'https://example.com/video2.mp4',
      category: 'improvement',
      highlights: [
        'Chat tabs for parallel conversations',
        'Custom modes system',
        'Faster indexing performance',
        'Sound notifications',
      ],
    },
  ],
  ja: [
    {
      id: '1.0',
      version: '1.0',
      date: '2025年6月4日',
      title:
        'BugBot、全ユーザーへのBackground Agentアクセス、ワンクリックMCPインストール',
      content: `
Cursor 1.0がリリースされました！

このリリースでは、コードレビュー用のBugBot、メモリ機能の初期機能、ワンクリックMCPセットアップ、Jupyterサポート、Background Agentの一般提供を提供します。

### BugBotによる自動コードレビュー

BugBotは自動的にPRをレビューし、潜在的なバグや問題を検出します。

問題が見つかると、BugBotはGitHubのPRにコメントを残します。"_**Cursorで修正**_"をクリックすると、問題を修正するための事前入力されたプロンプトと共にエディターに戻ります。

### 全ユーザー向けBackground Agent

数週間前にリモートコーディングエージェントであるBackground Agentを早期アクセスでリリースして以来、初期の反応は良好でした。

すべてのユーザーにBackground Agentを拡張できることを嬉しく思います！チャットでクラウドアイコンをクリックするか、プライバシーモードが無効になっている場合は\`Cmd/Ctrl+E\`を押してすぐに使用を開始できます。

### Jupyter NotebookのAgent

CursorがJupyter Notebookで変更を実装できるようになりました！

AgentはJupyter内で複数のセルを直接作成および編集するようになり、研究やデータサイエンスタスクの大幅な改善となります。開始時にはSonnetモデルでのみサポートされます。

### メモリ

メモリを使用すると、Cursorは会話から事実を記憶し、将来それらを参照できます。メモリは個別レベルでプロジェクトごとに保存され、設定から管理できます。

メモリをベータ機能として展開します。開始するには、設定 → ルールから有効にしてください。
      `,
      video: 'https://example.com/video1.mp4',
      category: 'feature',
      highlights: [
        'BugBotによる自動コードレビュー',
        '全ユーザー向けBackground Agent',
        'Jupyter NotebookのAgent',
        'メモリ機能',
      ],
    },
    {
      id: '0.50',
      version: '0.50',
      date: '2025年5月15日',
      title:
        '簡素化された価格体系、Background Agent、リニューアルされたインライン編集',
      content: `
統一されたリクエストベースの価格体系、すべてのトップモデル向けのMaxモード、並行タスク実行のためのBackground Agentを紹介します。

### よりシンプルで統一された価格体系

皆様のフィードバックをお聞きし、混乱を減らすために統一価格モデルを展開します。仕組みは以下の通りです：

* すべてのモデル使用がリクエストベースの価格体系に統一されました
* Maxモードはトークンベースの価格体系を使用します
* シンプルに保つため、プレミアムツール呼び出しと長いコンテキストモードが削除されます

### すべてのトップモデル向けのMaxモード

Maxモードは、よりシンプルなトークンベースの価格モデルとともに、Cursorのすべての最先端モデルで利用できるようになりました。

### 新しいTabモデル

複数ファイルにわたる変更を提案できる新しいTabモデルをトレーニングしました。このモデルは特にリファクタリング、編集チェーン、マルチファイル変更に優れています。
      `,
      image: 'https://example.com/image1.jpg',
      category: 'improvement',
      highlights: [
        '簡素化された価格モデル',
        'すべてのモデル向けのMaxモード',
        '新しいTabモデル',
        '高速ファイル編集',
      ],
    },
  ],
  zh: [
    {
      id: '1.0',
      version: '1.0',
      date: '2025年6月4日',
      title: 'BugBot、后台代理向所有人开放访问以及一键式MCP安装',
      content: `
Cursor 1.0来了！

此版本带来了用于代码审查的BugBot、记忆功能的初体验、一键式MCP设置、Jupyter支持以及后台代理的正式发布。

### 使用BugBot进行自动代码审查

BugBot会自动审查您的PR并捕获潜在的错误和问题。

当发现问题时，BugBot会在GitHub的PR上留下评论。您可以点击"_**在Cursor中修复**_"返回编辑器，并获得预填充的提示来修复问题。

### 面向所有人的后台代理

自从我们几周前以早期访问形式发布了远程编码代理后台代理以来，早期信号一直很积极。

我们现在很兴奋地将后台代理扩展到所有用户！如果您禁用了隐私模式，您可以通过点击聊天中的云图标或按\`Cmd/Ctrl+E\`立即开始使用它。

### Jupyter Notebook中的代理

Cursor现在可以在Jupyter Notebook中实施更改！

代理现在将直接在Jupyter内创建和编辑多个单元格，这对研究和数据科学任务是一个重大改进。开始时仅支持Sonnet模型。

### 记忆

通过记忆，Cursor可以记住对话中的事实并在将来引用它们。记忆按项目在个人级别存储，可以从设置中管理。

我们正在将记忆作为测试功能推出。要开始使用，请从设置 → 规则中启用。
      `,
      video: 'https://example.com/video1.mp4',
      category: 'feature',
      highlights: [
        'BugBot自动代码审查',
        '面向所有人的后台代理',
        'Jupyter Notebook中的代理',
        '记忆功能',
      ],
    },
    {
      id: '0.50',
      version: '0.50',
      date: '2025年5月15日',
      title: '简化定价、后台代理和刷新的内联编辑',
      content: `
引入统一的基于请求的定价、所有顶级模型的Max模式以及用于并行任务执行的后台代理。此外，还有通过\`@folders\`支持改进的上下文管理、带有新选项的刷新内联编辑、更快的文件编辑、多根工作区支持以及包括导出和复制在内的增强聊天功能。

### 更简单、统一的定价

我们听取了您的反馈，正在推出统一定价模型以减少混乱。工作原理如下：

* 所有模型使用现在都统一为基于请求的定价
* Max模式现在使用基于令牌的定价（类似于模型API定价的工作方式）
* 为保持简单，移除了高级工具调用和长上下文模式

### 所有顶级模型的Max模式

Max模式现在可用于Cursor中的所有最先进模型，采用更简单的基于令牌的定价模型。它旨在在您最需要时为您提供完全控制。

### 新的Tab模型

我们训练了一个新的Tab模型，现在可以建议跨多个文件的更改。该模型在重构、编辑链、多文件更改和相关代码间跳转方面表现出色。

### 使用代理快速编辑长文件

我们为代理添加了一个新工具，可以搜索和替换文件中的代码，使其对长文件更加高效。
      `,
      image: 'https://example.com/image1.jpg',
      category: 'improvement',
      highlights: [
        '简化的定价模型',
        '所有模型的Max模式',
        '新的Tab模型',
        '长文件的快速编辑',
      ],
    },
  ],
}
