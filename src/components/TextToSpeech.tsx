import { useState, useEffect } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';

interface TextToSpeechProps {
    text: string;
    onClose: () => void;
}

export const TextToSpeech = ({ text, onClose }: TextToSpeechProps) => {
    const [rate, setRate] = useState(1);
    const [voiceIndex, setVoiceIndex] = useState<number | null>(null);

    const { speak, cancel, speaking, supported, voices, pause } = useSpeechSynthesis();

    // Filter for English voices by default if available, or just use the first one
    const availableVoices = voices || [];

    useEffect(() => {
        if (availableVoices.length > 0 && voiceIndex === null) {
            setVoiceIndex(0);
        }
    }, [availableVoices, voiceIndex]);

    const handlePlay = () => {
        if (speaking) {
           
        }

        speak({
            text,
            voice: availableVoices[voiceIndex || 0],
            rate,
            pitch: 1,
        });
    };

    const handlePause = () => {
        pause();
    };



    const handleStop = () => {
        cancel();
    };

    if (!supported) {
        return (
            <div className="fixed bottom-4 right-4 bg-red-100 text-red-800 p-4 rounded-xl shadow-lg border border-red-200 z-50">
                Text-to-speech is not supported in your browser.
                <button onClick={onClose} className="ml-4 font-bold">Close</button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-200 z-50 w-80 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    Text to Speech
                </h3>
                <button onClick={() => { cancel(); onClose(); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex justify-center gap-4">
                    {!speaking ? (
                        <button
                            onClick={handlePlay}
                            className="w-12 h-12 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105"
                            title="Play"
                        >
                            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        </button>
                    ) : (
                        <>
                            {/* Note: react-speech-kit pause/resume might vary by browser support, but we'll include them */}
                            <button
                                onClick={handlePause}
                                className="w-12 h-12 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg shadow-amber-500/30 transition-all transform hover:scale-105"
                                title="Pause"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button
                                onClick={handleStop}
                                className="w-12 h-12 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-500/30 transition-all transform hover:scale-105"
                                title="Stop"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Voice</label>
                    <select
                        value={voiceIndex || 0}
                        onChange={(e) => setVoiceIndex(parseInt(e.target.value))}
                        className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {availableVoices.map((voice: any, index: number) => (
                            <option key={voice.name} value={index}>
                                {voice.name} ({voice.lang})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Speed</label>
                        <span className="text-xs font-bold text-slate-700">{rate}x</span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
            </div>
        </div>
    );
};
