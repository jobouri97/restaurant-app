import { useCallback, useRef, useState } from "react";

const getAudioContext = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  return AudioContext ? new AudioContext() : null;
};

export const useOrderNotification = () => {
  const contextRef = useRef(null);
  const [isEnabled, setIsEnabled] = useState(false);

  const play = useCallback(() => {
    const context = contextRef.current;
    if (!context || context.state !== "running") return;

    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.32, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    gain.connect(context.destination);

    [880, 1320].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.12);
      oscillator.connect(gain);
      oscillator.start(now + index * 0.12);
      oscillator.stop(now + 0.55 + index * 0.12);
    });
  }, []);

  const enable = useCallback(async () => {
    contextRef.current ||= getAudioContext();
    const context = contextRef.current;
    if (!context) return;

    if (context.state === "suspended") await context.resume();
    setIsEnabled(context.state === "running");

    if (context.state === "running") {
      window.setTimeout(play, 0);
    }
  }, [play]);

  return { isEnabled, enable, play };
};
