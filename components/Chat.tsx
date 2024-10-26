'use client';
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';
import Loader from '@/components/Loader'

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export default function Chat() {
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    fetchModels();
    
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
    } catch {
      setError('Failed to fetch Ollama models. Please ensure Ollama is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedModel || !message.trim()) return;
  
    const userMessage: Message = { role: 'user', content: message };
    const assistantMessage: Message = { 
      role: 'assistant', 
      content: '', 
      isStreaming: true 
    };
    
    setMessages(prev => [...prev, userMessage, assistantMessage]);
  
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: message,
          stream: true,
        }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          try {
            const data = JSON.parse(line);
            fullResponse += data.response;
            
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                lastMessage.content = fullResponse;
              }
              return newMessages;
            });
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }

      // Mark streaming as complete
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.isStreaming = false;
        }
        return newMessages;
      });

    } catch (err) {
      setError('Failed to get response from Ollama');
      setMessages(prev => prev.slice(0, -1));
    }
  };

  if (loading) {
    return (
      <div>
        <Loader isDarkMode={isDarkMode} />
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'}`}>
        <div className={`w-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} py-4 px-4 shadow-md flex justify-center items-center`}>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mr-4`}>
            Ollama Chat
        </h1>
        <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${
            isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-800'
            }`}
        >
            {isDarkMode ? <Sun size={26} /> : <Moon size={26} />}
        </button>
        </div>

      <div className="container mx-auto p-4 max-w-4xl">
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
          <label htmlFor="model" className={`block text-md font-medium mb-2 ${
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