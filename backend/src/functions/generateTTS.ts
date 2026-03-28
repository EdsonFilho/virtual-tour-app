import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import { getStepById } from '../db/cosmosClient'
import { blobExists, uploadBuffer, buildCdnUrl } from '../storage/blobClient'

app.http('generateTTS', {
  methods: ['POST'],
  route: 'audio/tts',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
    const body = await req.json() as { stepId?: string; lang?: string }
    const { stepId, lang } = body

    if (!stepId || !lang) {
      return { status: 400, jsonBody: { error: 'stepId and lang are required' } }
    }

    const SUPPORTED_LANGS = ['en', 'pt', 'es', 'uk']
    if (!SUPPORTED_LANGS.includes(lang)) {
      return { status: 400, jsonBody: { error: 'Unsupported language' } }
    }

    const blobPath = `${lang}/audio/${stepId}.mp3`

    // Return cached URL if it already exists
    if (await blobExists(blobPath)) {
      return { status: 200, jsonBody: { audioUrl: buildCdnUrl(blobPath) } }
    }

    // Load step to get text
    const step = await getStepById(stepId)
    if (!step) {
      return { status: 404, jsonBody: { error: 'Step not found' } }
    }

    const content = step.content?.[lang] ?? step.content?.[Object.keys(step.content ?? {})[0]]
    if (!content?.description) {
      return { status: 400, jsonBody: { error: 'No text content available for TTS' } }
    }

    // Generate audio via Azure Cognitive Services
    const audioBuffer = await synthesizeSpeech(content.description, lang)

    const cdnUrl = await uploadBuffer(blobPath, audioBuffer, 'audio/mpeg')

    return { status: 200, jsonBody: { audioUrl: cdnUrl } }
  },
})

const VOICE_MAP: Record<string, string> = {
  en: 'en-US-JennyNeural',
  pt: 'pt-BR-FranciscaNeural',
  es: 'es-ES-ElviraNeural',
  uk: 'uk-UA-PolinaNeural',
}

function synthesizeSpeech(text: string, lang: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.SPEECH_KEY!,
      process.env.SPEECH_REGION!,
    )
    speechConfig.speechSynthesisVoiceName = VOICE_MAP[lang] ?? VOICE_MAP['en']
    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig)

    synthesizer.speakTextAsync(
      text,
      (result) => {
        synthesizer.close()
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve(Buffer.from(result.audioData))
        } else {
          reject(new Error(`TTS failed: ${result.errorDetails}`))
        }
      },
      (err) => {
        synthesizer.close()
        reject(err)
      },
    )
  })
}
