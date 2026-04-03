// speech.js — Web Speech API engine
const Speech = (() => {
  let voices = [];
  let voicesLoaded = false;

  function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    voicesLoaded = voices.length > 0;
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    // Retry after short delay for browsers that are slow to populate
    setTimeout(loadVoices, 500);
  }

  function getBestVoice(langCode) {
    if (!voicesLoaded) loadVoices();
    const langPrefix = langCode.split('-')[0].toLowerCase();

    // Try exact match first
    const exact = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
    if (exact) return exact;

    // Try a natural/native voice for that language
    const native = voices.find(v =>
      v.lang.toLowerCase().startsWith(langPrefix) && !v.localService === false
    );
    if (native) return native;

    // Try any voice that starts with the language prefix
    const partial = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
    if (partial) return partial;

    return null;
  }

  function speak(text, langCode, rate = 0.82) {
    if (!window.speechSynthesis) {
      alert('Sorry, your browser does not support text-to-speech. Try Chrome or Edge for the best experience.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const voice = getBestVoice(langCode);
    if (voice) utterance.voice = voice;

    // Chrome bug fix: speech sometimes stops mid-sentence on long text
    // Keep alive with a periodic ping
    const keepAlive = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        clearInterval(keepAlive);
      }
    }, 10000);

    utterance.onend = () => clearInterval(keepAlive);
    utterance.onerror = () => clearInterval(keepAlive);

    window.speechSynthesis.speak(utterance);
  }

  function stop() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  function isSupported() {
    return !!window.speechSynthesis;
  }

  return { speak, stop, isSupported, getBestVoice };
})();
