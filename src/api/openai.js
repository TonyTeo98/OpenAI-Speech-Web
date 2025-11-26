import axios from 'axios';

const DEFAULT_BASE = 'https://api.openai.com';

const normalizeRoot = (inputBase) => {
    const base = (inputBase || DEFAULT_BASE).replace(/\/+$/, '');
    return base.endsWith('/v1') ? base : `${base}/v1`;
};

const getApiRoot = () => {
    const savedBase = localStorage.getItem('openai_api_base');
    return normalizeRoot(savedBase);
};

const getApiKey = () => {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
        throw new Error('需要 API Key，请在设置中配置您的 OpenAI API Key');
    }
    return apiKey;
};

const getAudioBase = () => `${getApiRoot()}/audio`;

export const transcribeAudio = async (audioFile) => {
    const formData = new FormData();
    const fileName = audioFile instanceof File ? audioFile.name : 'recording.webm';
    formData.append('file', audioFile, fileName);
    formData.append('model', 'whisper-1');

    try {
        const response = await axios.post(`${getAudioBase()}/transcriptions`, formData, {
            headers: {
                'Authorization': `Bearer ${getApiKey()}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.text;
    } catch (error) {
        console.error('转录失败:', error);
        throw error;
    }
};

export const generateSpeech = async (text, voice = 'alloy', model = 'tts-1-hd', format = 'mp3', speed = 1) => {
    try {
        const response = await axios.post(`${getAudioBase()}/speech`, {
            model,
            input: text,
            voice,
            response_format: format,
            speed
        }, {
            headers: {
                'Authorization': `Bearer ${getApiKey()}`,
                'Content-Type': 'application/json',
            },
            responseType: 'blob'
        });
        
        const mimeTypes = {
            'mp3': 'audio/mpeg',
            'opus': 'audio/ogg',
            'aac': 'audio/aac',
            'flac': 'audio/flac',
            'wav': 'audio/wav',
            'pcm': 'audio/wav'
        };
        
        return new Blob([response.data], { type: mimeTypes[format] });
    } catch (error) {
        console.error('语音生成失败:', error);
        if (error.response && error.response.data instanceof Blob) {
            try {
                const textData = await error.response.data.text();
                const errorData = JSON.parse(textData);
                throw new Error(errorData.error?.message || '语音生成失败');
            } catch (e) {
                throw new Error('语音生成失败，请检查输入参数');
            }
        }
        throw error;
    }
};

export const validateApiKey = async (apiKey, baseOverride) => {
    const root = normalizeRoot(baseOverride || localStorage.getItem('openai_api_base'));
    try {
        const response = await axios.get(`${root}/models`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        });
        return { valid: true, models: response.data.data };
    } catch (error) {
        console.error('API Key 验证失败:', error);
        return { valid: false, error: error.message };
    }
};
