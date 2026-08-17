/**
 * captions-service.js — Sprint 4: Browser-based live captions via SpeechRecognition API
 * Opt-in only — user must click CC button. Gracefully degrades if unsupported.
 * NEW file — nothing imports it until LiveWatchPage wires up the CC button.
 */

export class CaptionsService {
  constructor(onCaption) {
    this.onCaption    = onCaption;  // callback: (text: string) => void
    this.recognition  = null;
    this.isRunning    = false;
  }

  start() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.onCaption({ error: 'not_supported', text: '' });
      return false;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous     = true;
      this.recognition.interimResults = true;
      this.recognition.lang           = 'en-US';

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript   = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        this.onCaption({
          text:    finalTranscript || interimTranscript,
          isFinal: Boolean(finalTranscript),
          error:   null,
        });
      };

      this.recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
          this.onCaption({ error: event.error, text: '' });
        }
      };

      this.recognition.onend = () => {
        // Auto-restart if still running (browser sometimes stops it)
        if (this.isRunning) {
          try { this.recognition.start(); } catch { /* ignore */ }
        }
      };

      this.recognition.start();
      this.isRunning = true;
      return true;
    } catch (err) {
      this.onCaption({ error: 'start_failed', text: '' });
      return false;
    }
  }

  stop() {
    this.isRunning = false;
    if (this.recognition) {
      try { this.recognition.stop(); } catch { /* ignore */ }
      this.recognition = null;
    }
  }
}

export default CaptionsService;
