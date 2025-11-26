import React, { useState, useEffect, useRef } from 'react';
import { validateApiKey } from '../api/openai';

const ApiSettings = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiBase, setApiBase] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const validationRequestRef = useRef(0);
  const debounceTimer = useRef(null);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    const savedBase = localStorage.getItem('openai_api_base');
    if (savedBase) {
      setApiBase(savedBase);
    }
  }, []);

  const triggerValidation = (key, base) => {
    validationRequestRef.current += 1;
    const requestId = validationRequestRef.current;
    setIsValidating(true);
    validateApiKey(key, base)
      .then((result) => {
        if (requestId !== validationRequestRef.current) return;
        if (result.valid) {
          localStorage.setItem('openai_api_key', key);
          onApiKeyChange(key);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        } else {
          setValidationError('API 密钥无效，请检查后重试');
        }
      })
      .catch(() => {
        if (requestId === validationRequestRef.current) {
          setValidationError('验证 API 密钥时出错，请稍后再试');
        }
      })
      .finally(() => {
        if (requestId === validationRequestRef.current) {
          setIsValidating(false);
        }
      });
  };

  const handleApiKeyChange = (e) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    setValidationError('');
    setShowSuccess(false);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!newApiKey) {
      localStorage.removeItem('openai_api_key');
      onApiKeyChange('');
      setIsValidating(false);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      triggerValidation(newApiKey, apiBase);
    }, 500);
  };

  const handleApiBaseChange = (e) => {
    const newBase = e.target.value;
    setApiBase(newBase);
    localStorage.setItem('openai_api_base', newBase);
    // 如果已有 key，则重新验证使用新的 base
    if (apiKey) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        triggerValidation(apiKey, newBase);
      }, 500);
    }
  };

  const clearApiKey = () => {
    setApiKey('');
    localStorage.removeItem('openai_api_key');
    onApiKeyChange('');
  };

  const clearApiBase = () => {
    setApiBase('');
    localStorage.removeItem('openai_api_base');
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="settings-page">
      <div className="settings-section">
        <div className="api-key-info">
          <h2>关于 API 访问</h2>
          <p>
            需要设置 OpenAI API 密钥才能使用语音转换功能。默认直连官方域名，如需使用反代，可在下方填写自定义 Base 地址（无需添加 /audio）。
          </p>
          <div className="info-box">
            <p>
              <strong>注意事项：</strong>
            </p>
            <ul>
              <li>API 密钥仅保存在浏览器本地存储。</li>
              <li>请勿与他人分享您的 API 密钥。</li>
              <li>自定义 Base 必须允许跨域访问并透传所需接口。</li>
            </ul>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="apiBase">API 基础地址（可选）</label>
          <div className="api-key-input-group">
            <input
              type="text"
              id="apiBase"
              className="text-input"
              value={apiBase}
              onChange={handleApiBaseChange}
              placeholder="例如：https://api.openai.com 或 https://your-proxy.com"
            />
            {apiBase && (
              <button
                className="icon-button clear"
                onClick={clearApiBase}
                type="button"
                aria-label="清除自定义 Base"
              >
                ?
              </button>
            )}
          </div>
          <div className="muted small">默认会自动补上 /v1，音频接口会使用 /v1/audio/...</div>
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
              {isVisible ? '??' : '???'}
            </button>
            {apiKey && (
              <button
                className="icon-button clear"
                onClick={clearApiKey}
                type="button"
                aria-label="清除密钥"
              >
                ?
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
              ? API 密钥已更新并验证通过
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;
