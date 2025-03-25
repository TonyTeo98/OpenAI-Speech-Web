import React, { useState, useEffect } from 'react';

const TranscriptionDisplay = ({ text }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, [text]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className={`transcription-display ${isVisible ? 'visible' : ''}`}>
      <button
        className={`copy-button ${isCopied ? 'copied' : ''}`}
        onClick={handleCopy}
        aria-label="复制文本"
        data-tooltip={isCopied ? '已复制！' : '复制到剪贴板'}
      >
        <span className="button-icon">
          {isCopied ? '✓' : '📋'}
        </span>
      </button>
      <div className="transcription-text">
        {text.split('\n').map((line, i) => (
          <p key={i} className="text-line">{line}</p>
        ))}
      </div>
    </div>
  );
};

export default TranscriptionDisplay;