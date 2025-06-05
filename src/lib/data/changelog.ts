import { ChangelogEntry } from '../types'

export const changelogData: ChangelogEntry[] = [
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
]
