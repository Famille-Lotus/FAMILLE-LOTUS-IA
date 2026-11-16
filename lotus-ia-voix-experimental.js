/* LOTUS IA — module vocal expérimental, copie séparée.
 * Ne s'active que si intégré explicitement à une page de test.
 * Usage: LotusVoiceExperimental.startManual(), .startHandsFree(), .stop(), .speak(text).
 * La reconnaissance dépend de SpeechRecognition/WebKitSpeechRecognition et des permissions Safari.
 */
(function (root) {
  'use strict';
  const SpeechRecognition = root.SpeechRecognition || root.webkitSpeechRecognition;
  let recognizer = null;
  let mode = 'off';
  let speaking = false;
  let currentUtterance = null;
  let speechGeneration = 0;
  const listeners = new Set();
  function emit(type, detail) { for (const fn of listeners) { try { fn({type, detail}); } catch (_) {} } }
  function normalize(text) { return String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function wake(text) { return /(?:^| )lotus ia(?: |$)/.test(normalize(text)); }
  function stopRecognition() { const r = recognizer; recognizer = null; if (r) { r.onend = r.onresult = r.onerror = null; try { r.abort(); } catch (_) {} } }
  function start(kind) {
    if (!SpeechRecognition) { emit('unsupported', 'Reconnaissance vocale non disponible dans ce navigateur'); return false; }
    stopRecognition();
    mode = kind;
    const r = new SpeechRecognition();
    recognizer = r;
    r.lang = 'fr-BE';
    r.interimResults = false;
    r.continuous = kind === 'handsfree';
    r.maxAlternatives = 1;
    r.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (!event.results[i].isFinal) continue;
        const transcript = event.results[i][0].transcript.trim();
        if (kind === 'handsfree') {
          if (wake(transcript)) emit('command', transcript.replace(/.*?lotus[\s.,-]*ia/i, '').trim());
          else emit('heard', transcript);
        } else emit('command', transcript);
      }
    };
    r.onerror = (event) => {
      emit('error', event.error || 'Erreur du microphone');
      if (['not-allowed','service-not-allowed','audio-capture'].includes(event.error)) mode = 'off';
    };
    r.onend = () => {
      if (recognizer !== r) return;
      recognizer = null;
      emit('ended', mode);
      // Ne pas relancer automatiquement : Safari peut exiger une nouvelle action utilisateur.
      if (mode === 'handsfree') emit('restart-required', 'Touchez à nouveau pour reprendre l’écoute');
    };
    try { r.start(); emit('listening', kind); return true; }
    catch (err) { recognizer = null; mode = 'off'; emit('error', err.message); return false; }
  }
  function speak(text) {
    if (!root.speechSynthesis || !root.SpeechSynthesisUtterance) { emit('unsupported', 'Lecture vocale indisponible'); return false; }
    const content = String(text || '').trim();
    if (!content) return false;
    stopRecognition();
    const token = ++speechGeneration;
    speaking = false;
    root.speechSynthesis.cancel();
    const u = new root.SpeechSynthesisUtterance(content);
    currentUtterance = u;
    u.lang = 'fr-BE'; u.rate = 0.95;
    const voices = root.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.toLowerCase() === 'fr-be') || voices.find(v => v.lang.toLowerCase().startsWith('fr-'));
    if (preferred) { u.voice = preferred; u.lang = preferred.lang; }
    u.onstart = () => { if(token !== speechGeneration)return; speaking = true; emit('speaking', content); };
    u.onend = () => { if(token !== speechGeneration)return; currentUtterance=null; speaking = false; emit('spoken', content); };
    u.onerror = e => { if(token !== speechGeneration)return; currentUtterance=null; speaking = false; emit('error', e.error || 'Erreur de lecture vocale'); };
    root.speechSynthesis.speak(u);
    return true;
  }
  root.LotusVoiceExperimental = Object.freeze({
    supported: Boolean(SpeechRecognition),
    startManual: () => start('manual'),
    startHandsFree: () => start('handsfree'),
    stop: () => { mode = 'off'; speechGeneration++; currentUtterance=null; speaking=false; stopRecognition(); if (root.speechSynthesis) root.speechSynthesis.cancel(); emit('stopped', null); },
    speak,
    on: fn => { if (typeof fn !== 'function') throw new TypeError('Écouteur requis'); listeners.add(fn); return () => listeners.delete(fn); },
    getStatus: () => ({mode, listening: Boolean(recognizer), speaking})
  });
})(window);
