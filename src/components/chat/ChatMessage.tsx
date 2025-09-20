'use client'

import React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bot, User } from 'lucide-react'

interface ChatMessageProps {
  message: string
  isUser: boolean
  timestamp: Date
  imagePreviewUrl?: string
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderBasicMarkdown(md: string): string {
  // Minimal, safe-ish Markdown to HTML for headings, lists, paragraphs, and code fences.
  // 1) Escape HTML
  let text = escapeHtml(md)
  const lines = text.split(/\r?\n/)
  let html: string[] = []
  let inUL = false
  let inCode = false
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (!inCode) { html.push('<pre><code>'); inCode = true } else { html.push('</code></pre>'); inCode = false }
      continue
    }
    if (inCode) { html.push(line) ; continue }

    if (/^###\s+/.test(line)) { if (inUL) { html.push('</ul>'); inUL = false } ; html.push('<h3>' + line.replace(/^###\s+/, '') + '</h3>'); continue }
    if (/^##\s+/.test(line))  { if (inUL) { html.push('</ul>'); inUL = false } ; html.push('<h2>' + line.replace(/^##\s+/, '') + '</h2>'); continue }
    if (/^#\s+/.test(line))   { if (inUL) { html.push('</ul>'); inUL = false } ; html.push('<h1>' + line.replace(/^#\s+/, '') + '</h1>'); continue }

    if (/^\s*[-*]\s+/.test(line)) {
      if (!inUL) { html.push('<ul>'); inUL = true }
      html.push('<li>' + line.replace(/^\s*[-*]\s+/, '') + '</li>')
      continue
    }

    if (line.trim() === '') { if (inUL) { html.push('</ul>'); inUL = false }; continue }
    html.push('<p>' + line + '</p>')
  }
  if (inUL) html.push('</ul>')
  if (inCode) html.push('</code></pre>')
  return html.join('\n')
}

export function ChatMessage({ message, isUser, timestamp, imagePreviewUrl }: ChatMessageProps) {
  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <Avatar className="w-8 h-8">
        <AvatarFallback className={isUser ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={`inline-block w-fit max-w-full md:max-w-2xl lg:max-w-3xl px-4 py-3 rounded-lg shadow-sm ${
        isUser
          ? 'bg-blue-500 text-white ml-auto self-end'
          : 'bg-gray-100 text-gray-900 self-start'
      }`}>
        {imagePreviewUrl && (
          <img src={imagePreviewUrl} alt="attached" className="mb-2 rounded max-h-40" />
        )}
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message}</p>
        ) : (
          <div
            className="text-sm leading-relaxed space-y-2 [&>p]:m-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mt-1 [&>li]:mt-1 [&>h1]:text-base [&>h1]:font-semibold [&>h1]:mt-0 [&>h1]:mb-1 [&>h2]:text-base [&>h2]:font-semibold [&>h2]:mt-0 [&>h2]:mb-1 [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mt-0 [&>h3]:mb-1"
            dangerouslySetInnerHTML={{ __html: renderBasicMarkdown(message) }}
          />
        )}
        <p className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
