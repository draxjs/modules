import {afterEach, describe, expect, test, vi} from "vitest";
import {PromptAudioService, TTSProviderFactory} from "../src";

describe("PromptAudioService Test", () => {

    afterEach(() => {
        vi.restoreAllMocks()
    })

    test("does not generate audio when audioResponse is not requested", async () => {
        const instanceSpy = vi.spyOn(TTSProviderFactory, "instance")

        const audio = await PromptAudioService.build({
            systemPrompt: "You are an assistant.",
        }, "Hola")

        expect(audio).toBeUndefined()
        expect(instanceSpy).not.toHaveBeenCalled()
    })

    test("generates base64 prompt audio with default ElevenLabs provider", async () => {
        const textToSpeech = vi.fn(async () => ({
            audio: Buffer.from("audio-bytes"),
            contentType: "audio/mpeg",
            size: 11,
            time: 25,
            provider: "elevenlabs",
            model: "eleven_multilingual_v2",
            voiceId: "voice-1",
            outputFormat: "mp3_44100_128",
        }))
        const instanceSpy = vi.spyOn(TTSProviderFactory, "instance").mockReturnValue({
            textToSpeech,
        })

        const audio = await PromptAudioService.build({
            systemPrompt: "You are an assistant.",
            audioResponse: true,
            operationTitle: "prompt-title",
            operationGroup: "prompt-group",
            ip: "127.0.0.1",
            userAgent: "vitest",
            tenant: "tenant-1",
            user: "user-1",
        }, "Hola mundo")

        expect(instanceSpy).toHaveBeenCalledWith("ElevenLabs")
        expect(textToSpeech).toHaveBeenCalledWith({
            text: "Hola mundo",
            voiceId: undefined,
            model: undefined,
            outputFormat: undefined,
            voiceSettings: undefined,
            previousText: undefined,
            nextText: undefined,
            languageCode: undefined,
            seed: undefined,
            operationTitle: "prompt-title",
            operationGroup: "prompt-group",
            ip: "127.0.0.1",
            userAgent: "vitest",
            tenant: "tenant-1",
            user: "user-1",
        })
        expect(audio).toEqual({
            audio: Buffer.from("audio-bytes").toString("base64"),
            contentType: "audio/mpeg",
            encoding: "base64",
            meta: {
                provider: "elevenlabs",
                model: "eleven_multilingual_v2",
                voiceId: "voice-1",
                outputFormat: "mp3_44100_128",
                size: 11,
                time: 25,
            },
        })
    })

    test("supports custom TTS provider params", async () => {
        const textToSpeech = vi.fn(async () => ({
            audio: Buffer.from("custom-audio"),
            contentType: "audio/ogg",
            size: 12,
            time: 31,
            provider: "custom",
            model: "custom-model",
            voiceId: "voice-2",
        }))
        const instanceSpy = vi.spyOn(TTSProviderFactory, "instance").mockReturnValue({
            textToSpeech,
        })

        await PromptAudioService.build({
            systemPrompt: "You are an assistant.",
            audioResponse: {
                provider: "CustomTTS",
                voiceId: "voice-2",
                model: "custom-model",
                languageCode: "es",
                operationTitle: "tts-title",
            },
        }, {message: "Hola"})

        expect(instanceSpy).toHaveBeenCalledWith("CustomTTS")
        expect(textToSpeech).toHaveBeenCalledWith(expect.objectContaining({
            text: "{\"message\":\"Hola\"}",
            voiceId: "voice-2",
            model: "custom-model",
            languageCode: "es",
            operationTitle: "tts-title",
        }))
    })

})
