"use client";

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import ChatInterface from '../components/ChatInterface'; // Import the ChatInterface component

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

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
    } catch {
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
    } catch {
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
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'}`}>
     
      <div className={`w-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} py-4 px-4 shadow-lg`}>
        <h1 className={`text-center text-3xl ${isDarkMode ? 'text-white' : 'text-black'} font-bold bg-clip-text text-transparent`}>
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
            isDarkMode ? 'text-gray-200' : 'text-black'
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