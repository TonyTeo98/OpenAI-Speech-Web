import React, { useState, useEffect } from 'react';
import AudioRecorder from './components/AudioRecorder';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import UploadAudio from './components/UploadAudio';
import TextToSpeech from './components/TextToSpeech';
import ApiSettings from './components/ApiSettings';
import './styles/main.css';

const App = () => {
  const [transcription, setTranscription] = useState('');
  const [activeTab, setActiveTab] = useState('stt');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeySet, setApiKeySet] = useState(false);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setApiKeySet(true);
    }
  }, []);

  const handleTranscription = (result) => {
    setTranscription(result);
  };

  const handleApiKeyChange = (newApiKey) => {
    setApiKey(newApiKey);
    setApiKeySet(!!newApiKey);
    setShowSettings(false); // 保存后自动返回主页面
  };

  if (showSettings) {
    return (
      <div className="app-container">
        <div className="background-gradient" />
        <div className="container">
          <div className="settings-header">
            <h1>API 设置</h1>
            <button 
              className="back-button"
              onClick={() => setShowSettings(false)}
              aria-label="返回主页"
            >
              ← 返回
            </button>
          </div>
          <ApiSettings onApiKeyChange={handleApiKeyChange} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="background-gradient" />
      <div className="container">
        <div className="main-header">
          <h1>OpenAI Speech Tools</h1>
          <button 
            className="settings-button"
            onClick={() => setShowSettings(true)}
            aria-label="打开设置"
          >
            ⚙️ 设置
          </button>
        </div>
        
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'stt' ? 'active' : ''}`}
            onClick={() => setActiveTab('stt')}
          >
            <span className="tab-icon">🎤</span>
            Speech to Text
          </button>
          <button 
            className={`tab-button ${activeTab === 'tts' ? 'active' : ''}`}
            onClick={() => setActiveTab('tts')}
          >
            <span className="tab-icon">🔊</span>
            Text to Speech
          </button>
        </div>

        <div className="feature-container">
          {activeTab === 'stt' && (
            <>
              <div className="card">
                <AudioRecorder onTranscriptionComplete={handleTranscription} />
              </div>
              <div className="card mt-6">
                <UploadAudio onTranscriptionComplete={handleTranscription} />
              </div>
              {transcription && (
                <div className="card mt-6">
                  <TranscriptionDisplay text={transcription} />
                </div>
              )}
            </>
          )}
          
          {activeTab === 'tts' && (
            <div className="card">
              <TextToSpeech />
            </div>
          )}
        </div>

        {!apiKeySet && (
          <div className="api-key-warning">
            <span className="warning-icon">⚠️</span>
            请先设置 API 密钥以使用语音功能
            <button 
              className="text-button"
              onClick={() => setShowSettings(true)}
            >
              前往设置
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;