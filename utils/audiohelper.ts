export const convertAudioToWav = async (audioBlob: Blob): Promise<Blob> => {
    const audioContext = new AudioContext();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
    const wavBuffer = audioBufferToWav(audioBuffer);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  };
  
  export const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
  
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;
  
    const bufferLength = buffer.length;
    const byteRate = sampleRate * blockAlign;
    const dataSize = bufferLength * blockAlign;
  
    const headerSize = 44;
    const wavBuffer = new ArrayBuffer(headerSize + dataSize);
    const view = new DataView(wavBuffer);
  
    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
  
    // Write audio data
    const offset = 44;
    const channelData = new Float32Array(buffer.length);
    
    for (let channel = 0; channel < numberOfChannels; channel++) {
      buffer.copyFromChannel(channelData, channel, 0);
      let pos = offset;
      for (let i = 0; i < channelData.length; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        pos += bytesPerSample;
      }
    }
  
    return wavBuffer;
  };
  
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };