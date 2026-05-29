export class AudioManager {
  private ctx: AudioContext | null = null;
  private ambientNode: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private isEnabled = false;

  constructor() {}

  public enable() {
    if (this.isEnabled) return;
    this.isEnabled = true;
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.startAmbient();
  }

  public disable() {
    this.isEnabled = false;
    this.stopAmbient();
  }

  private startAmbient() {
    if (!this.ctx || !this.isEnabled) return;
    if (this.ambientNode) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const filter2 = this.ctx.createBiquadFilter();
    filter2.type = 'highpass';
    filter2.frequency.value = 50;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.05;

    noiseSource.connect(filter);
    filter.connect(filter2);
    filter2.connect(gain);
    gain.connect(this.ctx.destination);

    noiseSource.start();
    this.ambientNode = noiseSource;
    this.ambientGain = gain;
  }

  private stopAmbient() {
    if (this.ambientNode && this.ambientGain) {
      if (this.ctx) {
        this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
        setTimeout(() => {
          if (this.ambientNode) {
            (this.ambientNode as AudioBufferSourceNode).stop();
            this.ambientNode.disconnect();
            this.ambientNode = null;
          }
        }, 2000);
      }
    }
  }

  public playTypingSound() {
    if (!this.ctx || !this.isEnabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 1800 + Math.random() * 400;

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  public playStarCreation(emotion: string) {
    if (!this.ctx || !this.isEnabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const baseFreq = emotion === 'sad' ? 300 : emotion === 'angry' ? 200 : emotion === 'happy' ? 600 : 400;
    
    const notes = [baseFreq, baseFreq * 1.5, baseFreq * 2];
    
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      if (idx > 0) {
        osc.frequency.linearRampToValueAtTime(freq + (Math.random() * 10 - 5), this.ctx.currentTime + 1);
      }

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2 + (idx * 0.5));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 3);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  }

  public playConnection() {
    if (!this.ctx || !this.isEnabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.03, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.1);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
}

export const audioManager = new AudioManager();
