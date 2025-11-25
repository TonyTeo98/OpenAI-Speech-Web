import React, { useState, useRef } from 'react';
import { transcribeAudio } from '../api/openai';

const AudioRecorder = ({ onTranscriptionComplete, apiKeySet }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    if (!apiKeySet) {
      setError('请先在「设置」中配置 API 密钥');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        handleTranscription(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('无法访问麦克风，请检查浏览器权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleTranscription = async (audioBlob) => {
    try {
      setIsProcessing(true);
      const result = await transcribeAudio(audioBlob);
      onTranscriptionComplete(result);
      setError('');
    } catch (err) {
      setError('转录失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`audio-recorder ${isRecording ? 'recording' : ''}`}>
      <div className="wave-animation" />
      <button
        className={`record-button ${isRecording ? 'recording' : ''}`}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing || !apiKeySet}
        aria-label={isRecording ? '停止录音' : '开始录音'}
        title={isRecording ? '停止录音' : '开始录音'}
      >
        <span className="record-icon"></span>
      </button>
      <div className="recording-status">
        {!apiKeySet && (
          <span className="muted">请先设置 API 密钥</span>
        )}
        {isRecording && (
          <>
            <span className="pulse-dot"></span>
            正在录音...
          </>
        )}
        {isProcessing && (
          <>
            <div className="loading-spinner"></div>
            处理中...
          </>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default AudioRecorder;
