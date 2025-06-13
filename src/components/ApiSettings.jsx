import React, { useState, useEffect } from 'react';
import { validateApiKey } from '../api/openai';

const ApiSettings = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleApiKeyChange = async (e) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    setValidationError('');
    
    if (newApiKey) {
      setIsValidating(true);
      try {
        const result = await validateApiKey(newApiKey);
        if (result.valid) {
          localStorage.setItem('openai_api_key', newApiKey);
          onApiKeyChange(newApiKey);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        } else {
          setValidationError('API 密钥无效，请检查后重试');
        }
      } catch (err) {
        setValidationError('验证 API 密钥时出错，请稍后重试');
      } finally {
        setIsValidating(false);
      }
    } else {
      localStorage.removeItem('openai_api_key');
      onApiKeyChange('');
    }
  };

  const clearApiKey = () => {
    setApiKey('');
    localStorage.removeItem('openai_api_key');
    onApiKeyChange('');
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="settings-page">
      <div className="settings-section">
        <div className="api-key-info">
          <h2>关于 API 密钥</h2>
          <p>
            需要设置 OpenAI API 密钥才能使用语音转换功能。您可以在
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="link"
            >
              OpenAI 平台
            </a>
            获取您的 API 密钥。
          </p>
          <div className="info-box">
            <p>
              <strong>注意事项：</strong>
              <ul>
                <li>API 密钥将安全地存储在您的浏览器本地存储中</li>
                <li>请勿与他人分享您的 API 密钥</li>
                <li>建议定期更换 API 密钥以确保安全</li>
              </ul>
            </p>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="apiKey">API 密钥</label>
          <div className="api-key-input-group">
            <input
              type={isVisible ? 'text' : 'password'}
              id="apiKey"
              className={`text-input ${validationError ? 'error' : ''}`}
              value={apiKey}
              onChange={handleApiKeyChange}
              placeholder="输入您的 OpenAI API 密钥"
            />
            <button
              className="icon-button"
              onClick={toggleVisibility}
              type="button"
              aria-label={isVisible ? '隐藏密钥' : '显示密钥'}
            >
              {isVisible ? '👁️' : '👁️‍🗨️'}
            </button>
            {apiKey && (
              <button
                className="icon-button clear"
                onClick={clearApiKey}
                type="button"
                aria-label="清除密钥"
              >
                ❌
              </button>
            )}
          </div>
          {isValidating && (
            <div className="validation-status">
              <div className="loading-spinner small" />
              正在验证 API 密钥...
            </div>
          )}
          {validationError && (
            <div className="error-message">
              {validationError}
            </div>
          )}
          {showSuccess && (
            <div className="success-message">
              ✓ API 密钥已更新并验证通过
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;