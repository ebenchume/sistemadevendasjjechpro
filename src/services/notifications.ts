/**
 * Notification Service handling Web Push / Notification API,
 * audio chime synthesis, and event dispatching.
 */

import { AppNotification } from '../types';

let audioContext: AudioContext | null = null;

export function playNotificationSound(type: 'success' | 'alert' | 'sync' = 'success') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioContext) {
      audioContext = new AudioCtx();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    if (type === 'sync') {
      // Pleasant double-tone sync chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'alert') {
      // Soft security chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(783.99, now); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.1); // C6
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else {
      // Default subtle blip
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.15); // B5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (err) {
    // Audio context may be restricted before user gesture
  }
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

export function sendPushNotification(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/icon.svg',
        ...options,
      });
    } catch {
      // In some mobile browsers, serviceWorker.showNotification is required
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            icon: '/pwa-192x192.png',
            ...options,
          });
        });
      }
    }
  }
}

export function createNotification(
  title: string,
  message: string,
  type: AppNotification['type'] = 'info',
  sound = true
): AppNotification {
  if (sound) {
    playNotificationSound(type === 'sync' ? 'sync' : type === 'security' ? 'alert' : 'success');
  }

  sendPushNotification(title, {
    body: message,
    tag: type,
  });

  return {
    id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    title,
    message,
    timestamp: new Date().toISOString(),
    type,
    read: false,
  };
}
