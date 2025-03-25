import axios from 'axios';

const getApiKey = () => {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
        throw new Error('需要 API Key，请在设置中配置您的 OpenAI API Key');
    }
    return apiKey;
};

const BASE_URL = 'https://api.openai.com/v1/audio';

export const transcribeAudio = async (audioFile) => {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');

    try {
        const response = await axios.post(`${BASE_URL}/transcriptions`, formData, {
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

export const generateSpeech = async (text, voice = 'alloy', model = 'tts-1-hd', instructions = '', format = 'mp3') => {
    try {
        const response = await axios.post(`${BASE_URL}/speech`, {
            model: model,
            input: text,
            voice: voice,
            response_format: format,
            ...(instructions ? { instructions } : {})
        }, {
            headers: {
                'Authorization': `Bearer ${getApiKey()}`,
                'Content-Type': 'application/json',
            },
            responseType: 'blob'
        });
        
        // 根据不同格式设置正确的 MIME type
        const mimeTypes = {
            'mp3': 'audio/mpeg',
            'opus': 'audio/ogg',
            'aac': 'audio/aac',
            'flac': 'audio/flac',
            'wav': 'audio/wav',
            'pcm': 'audio/wav'  // PCM 用 wav mime type
        };
        
        return new Blob([response.data], { type: mimeTypes[format] });
    } catch (error) {
        console.error('语音生成失败:', error);
        if (error.response) {
            console.error('错误详情:', error.response.data);
            if (error.response.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const errorData = JSON.parse(text);
                    throw new Error(errorData.error?.message || '语音生成失败');
                } catch (e) {
                    throw new Error('语音生成失败，请检查输入参数');
                }
            }
        }
        throw error;
    }
};

export const validateApiKey = async (apiKey) => {
    try {
        const response = await axios.get('https://api.openai.com/v1/models', {
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