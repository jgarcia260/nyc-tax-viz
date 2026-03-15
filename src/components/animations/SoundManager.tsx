'use client';

import { useEffect, useRef } from 'react';

/**
 * Sound effects for construction animations
 * Uses Web Audio API for realistic construction sounds
 */

type SoundType = 
  | 'construction' 
  | 'complete' 
  | 'crane' 
  | 'train' 
  | 'sparkle'
  | 'crowd'
  | 'nature';

class SoundEngine {
  private context: AudioContext | null = null;
  private enabled: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  enable() {
    this.enabled = true;
    this.context?.resume();
  }

  disable() {
    this.enabled = false;
  }

  play(type: SoundType, volume: number = 0.3) {
    if (!this.enabled || !this.context) return;

    const ctx = this.context;
    const now = ctx.currentTime;

    switch (type) {
      case 'construction':
        // Low rumble for building construction
        this.playRumble(now, volume, 1.5);
        break;

      case 'complete':
        // Success chime
        this.playChime(now, volume);
        break;

      case 'crane':
        // Mechanical crane sounds
        this.playCrane(now, volume);
        break;

      case 'train':
        // Train movement whoosh
        this.playWhoosh(now, volume, 2);
        break;

      case 'sparkle':
        // Sparkle/magic sound
        this.playSparkle(now, volume);
        break;

      case 'crowd':
        // Ambient crowd noise
        this.playCrowd(now, volume);
        break;

      case 'nature':
        // Birds/nature sounds
        this.playNature(now, volume);
        break;
    }
  }

  private playRumble(startTime: number, volume: number, duration: number) {
    const ctx = this.context!;
    
    // Brown noise for rumble
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 100;

    const gain = ctx.createGain();
    gain.gain.value = volume * 0.5;
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(startTime);
  }

  private playChime(startTime: number, volume: number) {
    const ctx = this.context!;
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (major chord)

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.value = freq;
      osc.type = 'sine';

      gain.gain.value = volume * 0.3;
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);

      osc.connect(gain).connect(ctx.destination);
      osc.start(startTime + i * 0.1);
      osc.stop(startTime + 1);
    });
  }

  private playCrane(startTime: number, volume: number) {
    const ctx = this.context!;
    
    // Metallic clanking
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.frequency.value = 80 + Math.random() * 20;
    osc.type = 'square';
    
    filter.type = 'bandpass';
    filter.frequency.value = 200;

    gain.gain.value = volume * 0.4;
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.3);
  }

  private playWhoosh(startTime: number, volume: number, duration: number) {
    const ctx = this.context!;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.value = 80;
    osc.frequency.exponentialRampToValueAtTime(200, startTime + duration);

    filter.type = 'highpass';
    filter.frequency.value = 100;

    gain.gain.value = volume * 0.3;
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private playSparkle(startTime: number, volume: number) {
    const ctx = this.context!;
    
    // High-pitched bell-like sound
    [1, 1.5, 2, 2.5].forEach((mult, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.value = 2000 * mult;
      osc.type = 'sine';

      gain.gain.value = volume * 0.15;
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      osc.connect(gain).connect(ctx.destination);
      osc.start(startTime + i * 0.02);
      osc.stop(startTime + 0.4);
    });
  }

  private playCrowd(startTime: number, volume: number) {
    const ctx = this.context!;
    
    // White noise filtered for voices
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 2;

    const gain = ctx.createGain();
    gain.gain.value = volume * 0.2;

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(startTime);
  }

  private playNature(startTime: number, volume: number) {
    const ctx = this.context!;
    
    // Bird chirps (random high notes)
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.value = 2000 + Math.random() * 2000;
      osc.type = 'sine';

      gain.gain.value = volume * 0.2;
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1 + i * 0.15);

      osc.connect(gain).connect(ctx.destination);
      osc.start(startTime + i * 0.15);
      osc.stop(startTime + 0.2 + i * 0.15);
    }
  }
}

let globalSoundEngine: SoundEngine | null = null;

export function useSoundEffects() {
  const engineRef = useRef<SoundEngine | null>(null);

  useEffect(() => {
    if (!globalSoundEngine) {
      globalSoundEngine = new SoundEngine();
    }
    engineRef.current = globalSoundEngine;
  }, []);

  return {
    playSound: (type: SoundType, volume?: number) => {
      engineRef.current?.play(type, volume);
    },
    enableSound: () => engineRef.current?.enable(),
    disableSound: () => engineRef.current?.disable()
  };
}

/**
 * Sound effects toggle component
 */
export function SoundToggle({ className }: { className?: string }) {
  const { enableSound, disableSound } = useSoundEffects();
  const [enabled, setEnabled] = React.useState(false);

  const toggle = () => {
    if (enabled) {
      disableSound();
    } else {
      enableSound();
    }
    setEnabled(!enabled);
  };

  return (
    <button
      onClick={toggle}
      className={className}
      title={enabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {enabled ? '🔊' : '🔇'}
    </button>
  );
}

import React from 'react';
