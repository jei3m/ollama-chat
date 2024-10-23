"use client"
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Sun, Moon } from 'lucide-react';

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
                  code({ node, className, children, ...props }: any) {
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
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
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
          isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-t'
        } p-4 shadow-lg`}
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

export default function Home() {
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    fetchModels();
    // Check for user's preferred color scheme
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const fetchModels = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      const data = await response.json();
      const modelNames = data.models.map((model: { name: string }) => model.name);
      setModels(modelNames);
      if (modelNames.length > 0) {
        setSelectedModel(modelNames[0]);
      }
      setError('');
    } catch (err) {
      setError('Failed to fetch Ollama models. Please ensure Ollama is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedModel || !message.trim()) return;

    const newMessage: Message = { role: 'user', content: message };
    setMessages(prev => [...prev, newMessage]);

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: message,
          stream: false,
        }),
      });

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError('Failed to get response from Ollama');
    }
  };

  if (loading) {
    return (
      <div className={`container mx-auto p-4 ${isDarkMode ? 'bg-gray-900 text-gray-100' : ''}`}>
        <div className="text-center">Loading models...</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white'}`}>
      {/* New Header */}
      <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} py-4 px-4 shadow-md`}>
        <h1 className="text-center text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
          Ollama Chat
        </h1>
      </div>

      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${
              isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {error && (
          <div className={`${
            isDarkMode 
              ? 'bg-red-900 border-red-700 text-red-200' 
              : 'bg-red-100 border-red-400 text-red-700'
          } px-4 py-3 rounded mb-4 border`}>
            {error}
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="model" className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-200' : ''
          }`}>
            Select Model:
          </label>
          <select
            id="model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className={`w-full p-2 border rounded-md ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-gray-100' 
                : 'bg-white border-gray-200'
            }`}
          >
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`flex-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="container mx-auto max-w-4xl h-full">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isModelSelected={!!selectedModel}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
}