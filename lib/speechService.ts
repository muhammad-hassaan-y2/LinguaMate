import { SpeechClient } from '@google-cloud/speech';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { v4 as uuidv4 } from 'uuid';

// Initialize the clients
const speechClient = new SpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const ttsClient = new TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export const convertSpeechToText = async (audioContent: Buffer): Promise<string> => {
  try {
    const [response] = await speechClient.recognize({
      audio: {
        content: audioContent.toString('base64'),
      },
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        model: 'default',
        useEnhanced: true,
      },
    });

    return response.results
      ?.map(result => result.alternatives?.[0]?.transcript)
      .join(' ') || '';
  } catch (error) {
    console.error('Error in speech-to-text:', error);
    throw error;
  }
};

export const convertTextToSpeech = async (text: string): Promise<Buffer> => {
  try {
    const [response] = await ttsClient.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Neural2-D',
        ssmlGender: 'NEUTRAL',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: 0,
        speakingRate: 1,
      },
    });

    return response.audioContent as Buffer;
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    throw error;
  }
};