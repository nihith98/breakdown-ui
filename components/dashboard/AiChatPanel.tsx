'use client';

import { useState, useRef, useEffect } from 'react';
import styles from '@/app/(dashboard)/dashboard.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCall?: {
    name: string;
  };
}

export function AiChatPanel() {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I can help you understand your balances and settlement suggestions across your groups and families.',
      toolCall: undefined,
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (prompt?: string) => {
    const text = prompt || draft;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setDraft('');

    // Simulate assistant response with tool call
    setTimeout(() => {
      const toolMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Based on your recent transactions, you have a balance of -$42.50 across 2 groups.',
        toolCall: {
          name: 'settlement_engine.balances()',
        },
      };
      setMessages((prev) => [...prev, toolMessage]);
    }, 500);
  };

  const quickPrompts = [
    'What do I owe?',
    'Settlement suggestions',
  ];

  return (
    <div className={styles.aiPanel}>
      {/* Header */}
      <div className={styles.aiHeader}>
        <div className={styles.aiIcon}>
          <SparklesIcon />
        </div>
        <div className={styles.aiTitle}>AI Chat</div>
        <div className={styles.aiStatus}>
          <span className={styles.aiStatusDot} />
          reads your data · tool use only
        </div>
      </div>

      {/* Messages */}
      <div className={styles.aiMessages}>
        {messages.map((msg) => (
          <div key={msg.id} className={styles.aiMessage}>
            <div className={styles.aiMessageRole}>{msg.role}</div>
            {msg.toolCall && (
              <div className={styles.aiToolChip}>
                <span className={styles.aiToolDot} />
                queried{' '}
                <span className={styles.aiToolName}>{msg.toolCall.name}</span>
              </div>
            )}
            <div className={msg.role === 'user' ? styles.aiUserBubble : styles.aiAssistantBubble}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className={styles.aiComposer}>
        <div className={styles.aiQuickPrompts}>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              className={styles.aiPromptChip}
              onClick={() => handleSendMessage(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className={styles.aiInputRow}>
          <textarea
            className={styles.aiInput}
            placeholder="Type something here..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            rows={2}
          />
          <button
            className={styles.aiSendBtn}
            onClick={() => handleSendMessage()}
            aria-label="send message"
          >
            <SendIcon />
          </button>
        </div>

        <div className={styles.aiHint}>
          // answers grounded in tool calls
        </div>
      </div>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
      <path d="M12 3v6m0 6v6M3 12h6m6 0h6" />
      <path d="M5 5l4.24 4.24M14.76 14.76L19 19M5 19l4.24-4.24M14.76 5.24L19 5" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}
