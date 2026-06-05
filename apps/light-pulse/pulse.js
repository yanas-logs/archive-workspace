export function Pulse() {
  const pad = document.getElementById("pad-box");
  const toggleBtn = document.getElementById("toggle-sound");

  let audioCtx = null;
  let oscillator = null;
  let gainNode = null;
  let soundEnabled = false;

  function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();

    oscillator.type = "sine";
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    gainNode.gain.value = 0;
  }

  toggleBtn.addEventListener("click", async () => {
    if (!audioCtx) initAudio();

    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }

    soundEnabled = !soundEnabled;

    if (soundEnabled) {
      toggleBtn.textContent = "On";
      toggleBtn.style.backgroundColor = "green";
    } else {
      toggleBtn.textContent = "Off";
      toggleBtn.style.backgroundColor = "red";
      gainNode.gain.value = 0;
    }
  });

  pad.addEventListener("mousemove", (e) => {
    const rect = pad.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const red = Math.round((x / rect.width) * 255);
    const green = Math.round((y / rect.height) * 255);
    const blue = 150;
    pad.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;

    if (soundEnabled && audioCtx) {
      const freq = 200 + (x / rect.width) * 800;
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

      const volume = (1 - y / rect.height) * 0.5;
      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    }
  });

  return {
    start() {
      if (!audioCtx) initAudio();
    },
  };
}
