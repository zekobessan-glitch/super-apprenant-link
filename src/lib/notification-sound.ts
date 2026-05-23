// Génère un petit son de notification "moderne" (deux tons courts)
// via la Web Audio API — aucun fichier audio requis.

let ctx: AudioContext | null = null;
let unlocked = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = (window.AudioContext || (window as any).webkitAudioContext) as
      | typeof AudioContext
      | undefined;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

// Les navigateurs exigent une interaction utilisateur avant de jouer du son.
// On "débloque" l'AudioContext au premier clic/touche.
export function primeNotificationSound() {
  if (unlocked || typeof window === "undefined") return;
  const unlock = () => {
    const c = getCtx();
    if (c && c.state === "suspended") c.resume().catch(() => {});
    unlocked = true;
    window.removeEventListener("click", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("touchstart", unlock);
  };
  window.addEventListener("click", unlock);
  window.addEventListener("keydown", unlock);
  window.addEventListener("touchstart", unlock);
}

export function playNotificationSound() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});

  const now = c.currentTime;
  const master = c.createGain();
  master.gain.value = 0.18;
  master.connect(c.destination);

  // Deux tons rapides : style "ping" moderne
  const tones: Array<[number, number]> = [
    [880, now],         // La5
    [1320, now + 0.09], // Mi6
  ];

  tones.forEach(([freq, start]) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(1, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
    osc.connect(gain).connect(master);
    osc.start(start);
    osc.stop(start + 0.25);
  });
}
