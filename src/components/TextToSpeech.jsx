import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech } from '../api/openai';

const VOICES = [
  { id: 'alloy', name: 'Alloy', description: '平衡且清晰的声音' },
  { id: 'echo', name: 'Echo', description: '深沉有力的声音' },
  { id: 'fable', name: 'Fable', description: '温暖舒适的声音' },
  { id: 'onyx', name: 'Onyx', description: '庄重稳重的声音' },
  { id: 'nova', name: 'Nova', description: '专业优雅的声音' },
  { id: 'shimmer', name: 'Shimmer', description: '活力清新的声音' },
  { id: 'coral', name: 'Coral', description: '温和自然的声音' },
  { id: 'ballad', name: 'Ballad', description: '抒情柔和的声音' },
  { id: 'ash', name: 'Ash', description: '清亮年轻的声音' },
  { id: 'sage', name: 'Sage', description: '睿智沉稳的声音' }
];

const INSTRUCTION_PRESETS = [
  { id: 'cheerful', text: '用欢快积极的语气说话' },
  { id: 'professional', text: '用专业正式的语气说话' },
  { id: 'calm', text: '用平静舒缓的语气说话' },
  { id: 'excited', text: '用兴奋热情的语气说话' },
  { id: 'friendly', text: '用友好亲切的语气说话' },
  { id: 'serious', text: '用严肃认真的语气说话' },
  { id: 'whisper', text: '用低声细语的方式说话' },
  { id: 'slow', text: '稍微放慢语速' },
  { id: 'fast', text: '稍微加快语速' }
];

const TTS_MODELS = [
  { 
    id: 'tts-1', 
    name: 'tts-1',
    description: '低延迟，适合实时应用，音质一般'
  },
  { 
    id: 'tts-1-hd', 
    name: 'tts-1-hd',
    description: '高质量音频输出，音质最好'
  },
  { 
    id: 'gpt-4o-mini-tts', 
    name: 'gpt-4o-mini-tts',
    description: '最新模型，支持更多语音控制和情感表达'
  }
];

const AUDIO_FORMATS = [
  { id: 'mp3', name: 'MP3', description: '通用格式，适用于大多数场景' },
  { id: 'opus', name: 'Opus', description: '低延迟，适合网络传输' },
  { id: 'aac', name: 'AAC', description: '适合移动设备和视频平台' },
  { id: 'flac', name: 'FLAC', description: '无损压缩，音质最好' },
  { id: 'wav', name: 'WAV', description: '无压缩原始音频' },
  { id: 'pcm', name: 'PCM', description: '24kHz 16位原始采样' }
];

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [selectedModel, setSelectedModel] = useState('tts-1-hd');
  const [selectedFormat, setSelectedFormat] = useState('mp3');
  const [instruction, setInstruction] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');
  const audioRef = useRef(null);
  const [showInstructionInput, setShowInstructionInput] = useState(false);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('请输入要转换的文字');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');
      const finalInstruction = instruction === 'custom' ? customInstruction : 
                             instruction ? INSTRUCTION_PRESETS.find(p => p.id === instruction)?.text : '';
      
      const audioBlob = await generateSpeech(
        text,
        selectedVoice,
        selectedModel,
        finalInstruction,
        selectedFormat
      );
      const url = URL.createObjectURL(audioBlob);
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      setAudioUrl(url);
      
      // 自动播放生成的音频
      if (audioRef.current) {
        await audioRef.current.play();
      }
    } catch (err) {
      setError('生成语音失败，请重试');
      console.error('语音生成错误:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInstructionChange = (value) => {
    setInstruction(value);
    if (value !== 'custom') {
      setCustomInstruction('');
    }
    setShowInstructionInput(value === 'custom');
  };

  return (
    <div className="text-to-speech">
      <div className="voice-options">
        {VOICES.map((voice) => (
          <div
            key={voice.id}
            className={`voice-option ${selectedVoice === voice.id ? 'selected' : ''}`}
            onClick={() => setSelectedVoice(voice.id)}
          >
            <h3>{voice.name}</h3>
            <p>{voice.description}</p>
          </div>
        ))}
      </div>

      <div className="form-group mt-6">
        <label htmlFor="instruction">语音指令</label>
        <select
          id="instruction"
          className="select-input"
          value={instruction}
          onChange={(e) => handleInstructionChange(e.target.value)}
        >
          <option value="">默认语气</option>
          {INSTRUCTION_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.text}
            </option>
          ))}
          <option value="custom">自定义指令</option>
        </select>

        {showInstructionInput && (
          <div className="form-group mt-4">
            <textarea
              className="text-input"
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="输入自定义语音指令，例如：用温柔的语气缓慢地说话..."
              rows={2}
            />
          </div>
        )}
      </div>

      <div className="form-group mt-6">
        <label htmlFor="text">要转换的文字</label>
        <textarea
          id="text"
          className="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入要转换成语音的文字..."
          rows={4}
        />
      </div>

      <div className="button-group mb-6">
        <button
          className={`button ${isGenerating ? 'loading' : ''}`}
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim()}
        >
          {isGenerating ? (
            <>
              <div className="loading-spinner" />
              生成中...
            </>
          ) : (
            '生成语音'
          )}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {audioUrl && (
        <div className="custom-audio-player mb-6">
          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            className="audio-element"
          />
          <a 
            href={audioUrl} 
            download={`generated_speech.${selectedFormat}`}
            className="button download-button mt-4"
          >
            下载音频 (.{selectedFormat})
          </a>
        </div>
      )}

      <div className="advanced-options">
        <details>
          <summary className="text-lg font-medium mb-4">高级选项</summary>
          
          <div className="model-selection mb-4">
            <label className="block text-sm font-medium mb-2">TTS 模型</label>
            <div className="grid grid-cols-3 gap-2">
              {TTS_MODELS.map((model) => (
                <div
                  key={model.id}
                  className={`model-option-compact ${selectedModel === model.id ? 'selected' : ''}`}
                  onClick={() => setSelectedModel(model.id)}
                  title={model.description}
                >
                  <h3>{model.name}</h3>
                </div>
              ))}
            </div>
          </div>

          <div className="format-selection">
            <label className="block text-sm font-medium mb-2">音频格式</label>
            <div className="grid grid-cols-3 gap-2">
              {AUDIO_FORMATS.map((format) => (
                <div
                  key={format.id}
                  className={`format-option-compact ${selectedFormat === format.id ? 'selected' : ''}`}
                  onClick={() => setSelectedFormat(format.id)}
                  title={format.description}
                >
                  <h3>{format.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default TextToSpeech;