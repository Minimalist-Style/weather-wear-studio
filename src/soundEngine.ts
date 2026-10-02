class SoundEngine {
  private hoverAudio: HTMLAudioElement | null = null;
  private clickAudio: HTMLAudioElement | null = null;
  private saveAudio: HTMLAudioElement | null = null;
  private windAudio: HTMLAudioElement | null = null;
  private voices: Record<string, HTMLAudioElement> = {};
  private currentVoice: HTMLAudioElement | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.hoverAudio = new Audio('/sounds/ui-hover.mp3');
      // Using hover audio as fallback for click if click is missing
      this.clickAudio = new Audio('/sounds/ui-hover.mp3'); 
      this.saveAudio = new Audio('/sounds/ui-save.mp3');
      this.windAudio = new Audio('/sounds/ambient-wind.mp3');

      // Set volumes
      if (this.hoverAudio) this.hoverAudio.volume = 0.15;
      if (this.clickAudio) this.clickAudio.volume = 0.20;
      if (this.saveAudio) this.saveAudio.volume = 0.25;
      if (this.windAudio) {
        this.windAudio.volume = 0.10;
        this.windAudio.loop = false; // Do not loop
      }

      // Preload voices
      const voiceIds = ['sun', 'rain', 'wind', 'frost'];
      voiceIds.forEach(id => {
        const audio = new Audio(`/sounds/${id}.mp3`);
        audio.volume = 0.8; // Voice should be loud and clear
        this.voices[id] = audio;
      });
    }
  }

  private hasPlayedWind = false;

  playHover() {
    if (this.isMuted || !this.hoverAudio) return;
    this.hoverAudio.currentTime = 0;
    this.hoverAudio.play().catch(e => console.log('Audio play prevented:', e));
  }

  playClick() {
    if (this.isMuted || !this.clickAudio) return;
    this.clickAudio.currentTime = 0;
    this.clickAudio.play().catch(e => console.log('Audio play prevented:', e));
    
    // Start wind ambient on first interaction if not playing
    if (this.windAudio && !this.hasPlayedWind && !this.isMuted) {
      this.hasPlayedWind = true;
      this.startWind();
    }
  }

  playSave() {
    if (this.isMuted || !this.saveAudio) return;
    this.saveAudio.currentTime = 0;
    this.saveAudio.play().catch(e => console.log('Audio play prevented:', e));
  }

  startWind() {
    if (this.isMuted || !this.windAudio) return;
    this.windAudio.play().catch(e => console.log('Audio play prevented:', e));
  }

  stopWind() {
    if (!this.windAudio) return;
    this.windAudio.pause();
  }

  playVoice(id: string, onStart?: () => void, onEnd?: () => void) {
    if (this.isMuted) return;
    
    // Stop any currently playing voice
    if (this.currentVoice) {
      this.currentVoice.pause();
      this.currentVoice.currentTime = 0;
    }

    const voice = this.voices[id];
    if (!voice) return;

    this.currentVoice = voice;
    this.currentVoice.currentTime = 0;
    
    this.currentVoice.onended = () => {
      if (onEnd) onEnd();
      this.currentVoice = null;
    };

    this.currentVoice.play()
      .then(() => {
        if (onStart) onStart();
      })
      .catch(e => {
        console.log('Voice play prevented:', e);
        if (onEnd) onEnd(); // trigger end if failed so animation stops
      });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopWind();
    } else {
      this.startWind();
    }
    return this.isMuted;
  }
}

export const soundEngine = new SoundEngine();
