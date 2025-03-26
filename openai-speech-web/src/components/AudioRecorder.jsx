import React, { useState, useRef, useEffect } from 'react';
import { transcribeAudio } from '../api/openai';

const AudioRecorder = ({ onTranscriptionComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const requestMicrophoneAccess = async () => {
    try {
      // 检查 MediaDevices API 是否可用
      if (!navigator.mediaDevices) {
        throw new Error('浏览器不支持 MediaDevices API，请使用最新版本的 Chrome、Firefox 或 Safari。');
      }

      console.log('请求麦克风权限...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false 
      });
      
      return stream;
    } catch (err) {
      console.error('麦克风访问错误:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('麦克风访问被拒绝，请在浏览器设置中允许访问麦克风。');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('未找到麦克风设备，请检查设备连接。');
      } else if (err.name === 'NotSupportedError') {
        throw new Error('浏览器不支持录音功能，请使用最新版本的 Chrome、Firefox 或 Safari。');
      } else if (err.name === 'SecurityError') {
        throw new Error('由于安全限制，无法访问麦克风。请确保您使用的是 HTTPS 或 localhost 环境。');
      } else {
        throw new Error(`无法访问麦克风：${err.message || '未知错误'}`);
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await requestMicrophoneAccess();

      if (!stream) {
        throw new Error('获取音频流失败');
      }

      // 检查 MediaRecorder API 是否可用
      if (typeof MediaRecorder === 'undefined') {
        throw new Error('您的浏览器不支持 MediaRecorder API，请使用最新版本的浏览器。');
      }

      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onerror = (event) => {
        console.error('录音错误:', event.error);
        setError('录音过程中发生错误，请重试。');
        stopRecording();
      };

      // onstop 事件处理函数放在这里
      mediaRecorder.current.onstop = () => {
        if (audioChunks.current.length > 0) {
          const blob = new Blob(audioChunks.current, { type: 'audio/wav' });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          setAudioBlob(blob);
        } else {
          setError('录音数据为空，请重试。');
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      console.error('启动录音失败:', err);
      setError(err.message || '无法访问麦克风，请检查浏览器权限设置。');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setAudioBlob(null);
      audioChunks.current = [];
      setError('');
    }
  };

  const handleTranscription = async () => {
    if (!audioBlob) {
      setError('没有可用的录音数据');
      return;
    }

    try {
      setIsProcessing(true);
      const result = await transcribeAudio(audioBlob);
      onTranscriptionComplete(result);
      setError('');
    } catch (err) {
      console.error('转录错误:', err);
      setError('转录失败，请重试。');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="audio-recorder">
      <button
        className={`record-button ${isRecording ? 'recording' : ''}`}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        aria-label={isRecording ? '停止录音' : '开始录音'}
        title={isRecording ? '停止录音' : '开始录音'}
      >
        <span className="record-icon"></span>
      </button>
      <div className="recording-status">
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
      {audioUrl && (
        <div className="audio-preview">
          <audio controls src={audioUrl}></audio>
          <div className="audio-actions">
            <button 
              className="button delete-button"
              onClick={deleteRecording}
              aria-label="删除录音"
              title="删除录音"
            >
              删除录音
            </button>
            <button 
              className="button transcribe-button"
              onClick={handleTranscription}
              disabled={isProcessing}
              aria-label="开始转录"
              title="开始转录"
            >
              开始转录
            </button>
          </div>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default AudioRecorder;