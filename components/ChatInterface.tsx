"use client";

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { ReactNode } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isModelSelected: boolean;
  isDarkMode: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages = [], 
  onSendMessage, 
  isModelSelected,
  isDarkMode 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isModelSelected || isLoading) return;

    setIsLoading(true);
    try {
      await onSendMessage(newMessage);
      setNewMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-16">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-100 border-gray-700' 
                    : 'bg-gray-200 border border-gray-200'
              }`}
            >
              <ReactMarkdown
                className={`prose ${
                  message.role === 'user' 
                    ? 'text-white' 
                    : isDarkMode 
                      ? 'text-gray-100' 
                      : 'text-gray-800'
                } max-w-none`}
                components={{
                  code: ({ className, children }: { className?: string; children?: ReactNode }) => {
                    if (!children) return null; // Return null if children is undefined
                
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <SyntaxHighlighter
                        style={atomDark}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>

      <form 
        onSubmit={handleSubmit} 
        className={`fixed bottom-0 left-0 right-0 ${
          isDarkMode ? 'bg-gray-900' : 'bg-white border-t'
        } p-3 shadow-lg`}
      >
        <div className="container mx-auto max-w-4xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                isModelSelected
                  ? 'Type your message...'
                  : 'Please select a model first'
              }
              disabled={!isModelSelected || isLoading}
              className={`flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-100' 
                  : 'bg-white border-gray-200'
              }`}
            />
            <button
              type="submit"
              disabled={!isModelSelected || isLoading || !newMessage.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;