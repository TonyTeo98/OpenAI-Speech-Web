import React, { useState, useRef } from 'react';
import { transcribeAudio } from '../api/openai';

const UploadAudio = ({ onTranscriptionComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await processAudioFile(file);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await processAudioFile(file);
    }
  };

  const processAudioFile = async (file) => {
    if (!file.type.startsWith('audio/')) {
      setError('请上传音频文件');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      const result = await transcribeAudio(file);
      onTranscriptionComplete(result);
    } catch (err) {
      setError('文件处理失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className={`upload-zone ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="audio/*"
        style={{ display: 'none' }}
      />
      <div className="upload-content">
        <div className="upload-icon">
          {isProcessing ? (
            <div className="loading-spinner" />
          ) : (
            <span>📁</span>
          )}
        </div>
        <div className="upload-text">
          {isProcessing ? (
            '正在处理音频...'
          ) : (
            <>
              <p className="primary-text">点击或拖放音频文件到这里</p>
              <p className="secondary-text">支持 MP3, WAV, M4A 等格式</p>
            </>
          )}
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default UploadAudio;