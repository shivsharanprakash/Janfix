"use client";

import { useEffect, useRef, useState } from 'react';

export default function VoiceInput({ onResult, disabled }) {
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState('en-IN');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
  }, [lang]);

  function start() {
    if (!recognitionRef.current) return;
    setListening(true);
    let finalText = '';
    recognitionRef.current.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += transcript + ' ';
      }
      if (finalText) onResult && onResult(finalText.trim());
    };
    recognitionRef.current.onend = () => setListening(false);
    recognitionRef.current.start();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="border rounded px-2 py-2"
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        disabled={listening}
        aria-label="Language"
      >
        <option value="en-IN">English (India)</option>
        <option value="hi-IN">Hindi</option>
        <option value="bn-IN">Bengali</option>
        <option value="te-IN">Telugu</option>
        <option value="ta-IN">Tamil</option>
        <option value="mr-IN">Marathi</option>
        <option value="gu-IN">Gujarati</option>
        <option value="kn-IN">Kannada</option>
        <option value="ml-IN">Malayalam</option>
        <option value="pa-IN">Punjabi</option>
        <option value="or-IN">Odia</option>
        <option value="as-IN">Assamese</option>
        <option value="ur-IN">Urdu</option>
      </select>
      <button type="button" onClick={start} disabled={disabled || listening} className="px-3 py-2 rounded bg-emerald-600 text-white disabled:opacity-50">
        {listening ? 'Listening…' : 'Voice to Text'}
      </button>
    </div>
  );
}



