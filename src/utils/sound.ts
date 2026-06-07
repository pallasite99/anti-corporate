/**
 * Browser-native synthetic audio tone generator using the Web Audio API. Requires absolutely zero dependencies.
 * Respects iframe permission rules: catches any contextual initialization blockages safely.
 */

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  } catch {
    return null;
  }
}

export function playSound(type: 'beep' | 'bzzt' | 'coin' | 'horn' | 'success' | 'foreclosure') {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  switch (type) {
    case 'foreclosure':
      // Tragic descending flatline corporate funeral sound
      {
        const now = ctx.currentTime;
        osc.type = 'sawtooth';
        
        // Satirical descending notes (C4, A3, F3, C3)
        osc.frequency.setValueAtTime(261.63, now); // C4
        osc.frequency.setValueAtTime(220.00, now + 0.18); // A3
        osc.frequency.setValueAtTime(174.61, now + 0.36); // F3
        osc.frequency.setValueAtTime(130.81, now + 0.54); // C3
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        
        // Deep low buzz / dial-up corporate foreclosure drone overlay
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(65.41, now + 0.54); // Deep low buzz (C2)
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.setValueAtTime(0.16, now + 0.54);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        
        osc.start(now);
        osc2.start(now + 0.54);
        
        osc.stop(now + 1.2);
        osc2.stop(now + 1.2);
      }
      break;

    case 'coin':
      // Success coins / Salary Relieved
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
      break;

    case 'bzzt':
      // Debt penalty / Transaction Declined
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.setValueAtTime(110, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
      break;

    case 'success':
      // Escape corporate sandbox / Game Won
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
      break;

    case 'horn':
      // Sent to PIP
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
      break;

    case 'beep':
    default:
      // Simple dice roll step / general tick
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
      break;
  }
}
