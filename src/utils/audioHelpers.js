// This file contains utility functions related to audio processing, such as converting audio formats or handling audio playback.

export const convertAudioFormat = (audioBlob, targetFormat) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContext.decodeAudioData(reader.result, (buffer) => {
                const offlineContext = new OfflineAudioContext(1, buffer.length, audioContext.sampleRate);
                const source = offlineContext.createBufferSource();
                source.buffer = buffer;
                source.connect(offlineContext.destination);
                source.start(0);
                offlineContext.startRendering().then((renderedBuffer) => {
                    const wavBlob = bufferToWave(renderedBuffer, renderedBuffer.length);
                    resolve(new Blob([wavBlob], { type: targetFormat }));
                }).catch(reject);
            }, reject);
        };
        reader.readAsArrayBuffer(audioBlob);
    });
};

const bufferToWave = (abuffer, len) => {
    const numOfChannels = abuffer.numberOfChannels;
    const length = len * numOfChannels * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let offset = 0;

    for (let i = 0; i < numOfChannels; i++) {
        channels.push(new Float32Array(abuffer.getChannelData(i)));
    }

    writeString(view, 0, 'RIFF');
    view.setUint32(4, length - 8, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, abuffer.sampleRate, true);
    view.setUint32(28, abuffer.sampleRate * 2, true);
    view.setUint16(32, numOfChannels * 2, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length - offset - 44, true);

    for (let i = 0; i < len; i++) {
        for (let channel = 0; channel < numOfChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, channels[channel][i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
    }
    return buffer;
};

const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
};