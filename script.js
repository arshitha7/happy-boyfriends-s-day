/**
 * ROMANTIC SHORT FILM — BOYFRIEND'S DAY (OCTOBER 3, 2026)
 * Vanilla JavaScript • Modular Scene Controller & Ambient FX
 */

(function () {
  'use strict';

  /* ==========================================================================
     STORY CONFIGURATION & DIALOGUE
     ========================================================================== */

  // Exact dialogue specified by the user (no hyphens, only commas)
  const dialogueList = [
    "You know what…",
    "You’re the most wonderful and lovely person I’ve ever known.",
    "You always give me the best of everything, your love, your care, and your time.",
    "All I want is to keep smiling with you… and I want to be the reason behind your smile too.",
    "I’d be the happiest if I could spend my life beside you, holding your hand through everything.",
    "I want to show you every single day what it truly feels like to be loved.",
    "I want to build a little world with you, one filled with nothing but love, happiness, and all the best things you deserve.",
    "So…"
  ];

  // Escaping NO button text variants
  const noButtonTexts = [
    "No",
    "Are you sure?",
    "Really?",
    "Think again 😭",
    "Nice try",
    "Absolutely not 😭",
    "You can't escape this",
    "Just say YES ♡"
  ];

  const playfulMessages = [
    "",
    "Wait, look where you're clicking... 👀",
    "Why are you trying to say no? 😭",
    "You know the answer.",
    "There's only one right choice here ♡",
    "Just say yes already ♡"
  ];

  /* ==========================================================================
     DOM ELEMENTS
     ========================================================================== */

  const scenes = [
    document.getElementById('scene-1'), // 0: Park wide
    document.getElementById('scene-2'), // 1: Boyfriend waiting
    document.getElementById('scene-3'), // 2: Girlfriend walking with roses
    document.getElementById('scene-4'), // 3: Surprising him with roses
    document.getElementById('scene-5'), // 4: Holding hands on bench
    document.getElementById('scene-6')  // 5: Pull-back sunset ending
  ];

  const titleCard = document.getElementById('title-card');
  const btnStartFilm = document.getElementById('btn-start-film');
  const scenePill = document.getElementById('scene-pill');
  const scenePillText = document.getElementById('scene-pill-text');

  const dialogueContainer = document.getElementById('dialogue-container');
  const dialogueText = document.getElementById('dialogue-text');
  const dialogueCounter = document.getElementById('dialogue-counter');
  const btnContinueDialogue = document.getElementById('btn-continue-dialogue');

  const handGlow = document.getElementById('hand-glow');

  const questionModal = document.getElementById('question-modal');
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const playfulMessage = document.getElementById('playful-message');

  const vowsContainer = document.getElementById('vows-container');
  const endScreen = document.getElementById('end-screen');
  const btnReplay = document.getElementById('btn-replay');

  const btnMusic = document.getElementById('btn-music');
  const musicIcon = document.getElementById('music-icon');

  /* ==========================================================================
     STATE MANAGEMENT
     ========================================================================== */

  let currentDialogueIndex = 0;
  let noAttempts = 0;
  let isStoryRunning = false;
  let musicPlaying = false;
  let storyTimeout = null;

  /* ==========================================================================
     WEB AUDIO API — PROCEDURAL ROMANTIC SOUNDTRACK
     (Zero external files, 100% offline, soothing harp & piano chimes)
     ========================================================================== */

  class RomanticSoundtrack {
    constructor() {
      this.ctx = null;
      this.gainNode = null;
      this.isPlaying = false;
      this.timer = null;

      // Ethereal Pentatonic / Warm Romantic Chords (Frequencies in Hz)
      this.notes = [
        261.63, // C4
        293.66, // D4
        329.63, // E4
        392.00, // G4
        440.00, // A4
        523.25, // C5
        587.33, // D5
        659.25  // E5
      ];
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(0.18, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playPluck(freq, delay = 0, duration = 2.4) {
      if (!this.ctx || !this.isPlaying) return;
      const startTime = this.ctx.currentTime + delay;

      const osc = this.ctx.createOscillator();
      const oscSub = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      oscSub.type = 'triangle';

      osc.frequency.setValueAtTime(freq, startTime);
      oscSub.frequency.setValueAtTime(freq / 2, startTime);

      // Soft gentle envelope
      noteGain.gain.setValueAtTime(0.001, startTime);
      noteGain.gain.linearRampToValueAtTime(0.25, startTime + 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(noteGain);
      oscSub.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start(startTime);
      oscSub.start(startTime);
      osc.stop(startTime + duration);
      oscSub.stop(startTime + duration);
    }

    start() {
      this.init();
      this.isPlaying = true;
      this.scheduleLoop();
    }

    scheduleLoop() {
      if (!this.isPlaying) return;

      // Romantic arpeggio sequence
      const chordPatterns = [
        [0, 2, 4, 5], // C - E - G - C
        [4, 3, 2, 0], // A - G - E - C
        [1, 3, 4, 6], // D - G - A - D
        [0, 2, 3, 7]  // C - E - G - E5
      ];

      const pattern = chordPatterns[Math.floor(Math.random() * chordPatterns.length)];
      pattern.forEach((noteIdx, i) => {
        this.playPluck(this.notes[noteIdx], i * 0.45, 2.6);
      });

      this.timer = setTimeout(() => {
        this.scheduleLoop();
      }, 2600);
    }

    stop() {
      this.isPlaying = false;
      if (this.timer) clearTimeout(this.timer);
    }

    toggle() {
      if (this.isPlaying) {
        this.stop();
        return false;
      } else {
        this.start();
        return true;
      }
    }
  }

  const audioEngine = new RomanticSoundtrack();

  /* ==========================================================================
     YOUTUBE BACKGROUND MUSIC: "Just the Way You Are" (Bruno Mars)
     https://youtu.be/LjhCEhWiKXk with offline procedural fallback
     ========================================================================== */

  let ytPlayer = null;
  let ytReady = false;
  let isSongActive = false;

  window.onYouTubeIframeAPIReady = function () {
    try {
      ytPlayer = new YT.Player('youtube-player', {
        height: '200',
        width: '200',
        videoId: 'LjhCEhWiKXk',
        playerVars: {
          autoplay: 0,
          controls: 0,
          loop: 1,
          playlist: 'LjhCEhWiKXk',
          enablejsapi: 1,
          playsinline: 1
        },
        events: {
          onReady: function () {
            ytReady = true;
          },
          onStateChange: function (event) {
            if (window.YT && event.data === YT.PlayerState.PLAYING) {
              updateMusicUI(true);
            } else if (window.YT && (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED)) {
              updateMusicUI(false);
            }
          }
        }
      });
    } catch (e) {
      console.warn("YouTube Player initialization:", e);
    }
  };

  const localAudio = document.getElementById('local-audio');
  if (localAudio) {
    localAudio.addEventListener('play', () => updateMusicUI(true));
    localAudio.addEventListener('pause', () => updateMusicUI(false));
    localAudio.addEventListener('ended', () => updateMusicUI(false));
  }

  function playRomanticSong() {
    isSongActive = true;

    // 1. Try local audio file first (assets/song.mp3, assets/music.mp3, etc.)
    if (localAudio) {
      localAudio.volume = 0.85;
      const playPromise = localAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          updateMusicUI(true);
          return;
        }).catch(() => {
          // If local audio file is not found, fallback to YouTube or procedural
          tryYouTubeOrFallback();
        });
        return;
      }
    }
    tryYouTubeOrFallback();
  }

  function tryYouTubeOrFallback() {
    if (ytReady && ytPlayer && typeof ytPlayer.playVideo === 'function') {
      try {
        ytPlayer.playVideo();
        updateMusicUI(true);
        return;
      } catch (err) {
        console.warn("YouTube play attempt, using procedural fallback:", err);
      }
    }
    // Fallback to soothing procedural Web Audio soundtrack
    audioEngine.start();
    updateMusicUI(true);
  }

  function pauseRomanticSong() {
    isSongActive = false;
    if (localAudio && !localAudio.paused) {
      try { localAudio.pause(); } catch (e) { }
    }
    if (ytReady && ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
      try {
        ytPlayer.pauseVideo();
      } catch (err) { }
    }
    audioEngine.stop();
    updateMusicUI(false);
  }

  function toggleRomanticSong() {
    if (isSongActive) {
      pauseRomanticSong();
    } else {
      playRomanticSong();
    }
  }

  function updateMusicUI(isPlaying) {
    isSongActive = isPlaying;
    const audioControls = document.getElementById('btn-music');
    const musicIcon = document.getElementById('music-icon');
    if (isPlaying) {
      if (audioControls) audioControls.classList.add('playing');
      if (musicIcon) musicIcon.textContent = '🔊';
    } else {
      if (audioControls) audioControls.classList.remove('playing');
      if (musicIcon) musicIcon.textContent = '🔈';
    }
  }


  class AmbientParticleCanvas {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.petals = [];
      this.width = 0;
      this.height = 0;
      this.isCelebration = false;

      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.initParticles();
      this.animate();
    }

    resize() {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
    }

    initParticles() {
      this.particles = [];
      this.petals = [];

      // Golden ambient dust motes
      for (let i = 0; i < 45; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 2 + 0.8,
          alpha: Math.random() * 0.7 + 0.2,
          speedY: -(Math.random() * 0.35 + 0.1),
          speedX: (Math.random() - 0.5) * 0.25,
          pulse: Math.random() * Math.PI
        });
      }

      // Gentle floating rose petals
      for (let i = 0; i < 18; i++) {
        this.petals.push(this.createPetal(true));
      }
    }

    createPetal(randomY = false) {
      return {
        x: Math.random() * this.width,
        y: randomY ? Math.random() * this.height : -30,
        size: Math.random() * 8 + 8,
        speedY: Math.random() * 0.8 + 0.6,
        speedX: Math.sin(Math.random() * Math.PI * 2) * 0.6 + 0.4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1.5,
        tilt: Math.random() * Math.PI,
        tiltSpeed: Math.random() * 0.03 + 0.01,
        color: Math.random() > 0.4 ? 'rgba(230, 75, 95, 0.75)' : 'rgba(255, 140, 160, 0.65)'
      };
    }

    triggerCelebration() {
      this.isCelebration = true;
      // Add extra petals and golden sparkles
      for (let i = 0; i < 35; i++) {
        this.petals.push(this.createPetal(false));
      }
    }

    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // 1. Draw Golden Dust Particles
      this.particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulse += 0.025;

        if (p.y < -10) p.y = this.height + 10;
        if (p.x < -10) p.x = this.width + 10;
        if (p.x > this.width + 10) p.x = -10;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 220, 130, ${currentAlpha})`;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = 'rgba(255, 200, 80, 0.7)';
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      });

      // 2. Draw Drifting Rose Petals with 3D tilt
      this.petals.forEach((petal, idx) => {
        petal.y += petal.speedY * (this.isCelebration ? 1.25 : 1);
        petal.x += petal.speedX + Math.sin(petal.tilt) * 0.5;
        petal.rotation += petal.rotationSpeed;
        petal.tilt += petal.tiltSpeed;

        if (petal.y > this.height + 40 || petal.x > this.width + 40) {
          this.petals[idx] = this.createPetal(false);
        }

        this.ctx.save();
        this.ctx.translate(petal.x, petal.y);
        this.ctx.rotate((petal.rotation * Math.PI) / 180);
        this.ctx.scale(1, Math.sin(petal.tilt));

        // Draw organic petal shape
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.bezierCurveTo(
          -petal.size / 2, -petal.size / 2,
          -petal.size / 2, petal.size / 2,
          0, petal.size
        );
        this.ctx.bezierCurveTo(
          petal.size / 2, petal.size / 2,
          petal.size / 2, -petal.size / 2,
          0, 0
        );
        this.ctx.fillStyle = petal.color;
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = 'rgba(180, 40, 60, 0.3)';
        this.ctx.fill();
        this.ctx.restore();
      });

      requestAnimationFrame(() => this.animate());
    }
  }

  const particleCanvas = new AmbientParticleCanvas('fx-canvas');

  /* ==========================================================================
     SCENE TIMELINE & SEQUENCER
     ========================================================================== */

  /**
   * Smoothly transitions to scene at index (0-5)
   */
  function showScene(index) {
    scenes.forEach((scene, i) => {
      if (i === index) {
        scene.classList.add('active');
      } else {
        scene.classList.remove('active');
      }
    });
  }

  /**
   * Displays small scene notification pill
   */
  function showNotificationPill(text, duration = 3400) {
    scenePillText.textContent = text;
    scenePill.classList.remove('hidden');
    if (duration > 0) {
      setTimeout(() => {
        scenePill.classList.add('hidden');
      }, duration);
    }
  }

  function hideNotificationPill() {
    scenePill.classList.add('hidden');
  }

  /**
   * Main story controller
   */
  function startStory() {
    isStoryRunning = true;
    titleCard.classList.add('hidden');

    // Start Bruno Mars - Just the Way You Are (or procedural fallback)
    playRomanticSong();

    // SCENE 1: Peaceful park wide shot at golden hour (already active)
    showScene(0);

    // After 3.5s -> Transition to SCENE 2: Boyfriend waiting on bench
    storyTimeout = setTimeout(() => {
      showScene(1); // scene_2_waiting.jpg

      // Let him wait quietly, looking around
      setTimeout(() => {
        showNotificationPill("Someone is coming...", 3500);
      }, 2000);

      // SCENE 3: Girlfriend walking toward bench on park path
      storyTimeout = setTimeout(() => {
        walkToBench();
      }, 5500);

    }, 3800);
  }

  /**
   * Scene 3: Girlfriend walking on path with roses hidden behind back
   */
  function walkToBench() {
    showScene(2); // scene_3_walking.jpg
    showNotificationPill("Secretly holding a surprise behind her back... ♡", 4200);

    // Walk toward him, camera dollies closer
    storyTimeout = setTimeout(() => {
      sitBesideHim();
    }, 6200);
  }

  /**
   * Scene 4: Reaches bench and surprises him with roses
   */
  function sitBesideHim() {
    showScene(3); // scene_4_roses.jpg
    showNotificationPill("for you ♡", 3800);

    storyTimeout = setTimeout(() => {
      startDialogueFlow();
    }, 4200);
  }

  /**
   * Scene 5: Begins intimate dialogue on bench
   */
  function startDialogueFlow() {
    hideNotificationPill();
    currentDialogueIndex = 0;
    showDialogue(0);
  }

  /**
   * Updates dialogue bubble with smooth fade
   */
  function showDialogue(index) {
    if (index >= dialogueList.length) {
      // Completed all dialogue -> pause, then ask the question!
      dialogueContainer.classList.add('hidden');
      setTimeout(() => {
        askTheQuestion();
      }, 1200);
      return;
    }

    currentDialogueIndex = index;
    dialogueCounter.textContent = `♡ 0${index + 1} / 0${dialogueList.length}`;

    // Fade out text briefly
    dialogueText.style.opacity = '0';

    setTimeout(() => {
      dialogueText.textContent = `"${dialogueList[index]}"`;
      dialogueText.style.opacity = '1';
      dialogueContainer.classList.remove('hidden');

      // HAND-HOLDING MOMENT: Check if this is the romantic hand-holding line!
      // "I’d be the happiest if I could spend my life beside you, holding your hand through everything."
      if (index === 4) {
        holdHands();
      }
    }, 280);
  }

  function nextDialogue() {
    showDialogue(currentDialogueIndex + 1);
  }

  /**
   * Hand-holding special event
   */
  function holdHands() {
    // Switch to intimate hand-holding keyframe
    showScene(4); // scene_5_hands.jpg

    // Activate glowing heart over their hands
    handGlow.classList.remove('hidden');

    // Chime extra high pluck for emotional accent
    audioEngine.playPluck(659.25, 0.1, 3.5);
    audioEngine.playPluck(523.25, 0.3, 3.5);
  }

  /**
   * Scene 6: The Question Card
   */
  function askTheQuestion() {
    handGlow.classList.add('hidden');
    questionModal.classList.remove('hidden');
    resetNoButton();
  }

  /* ==========================================================================
     PLAYFUL ESCAPING NO BUTTON LOGIC
     ========================================================================== */

  function resetNoButton() {
    noAttempts = 0;
    btnNo.classList.remove('escaped');
    btnNo.style.position = '';
    btnNo.style.left = '';
    btnNo.style.top = '';
    btnNo.textContent = "NO";
    playfulMessage.textContent = "";
  }

  function moveNoButton(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    noAttempts++;

    // Safe viewport boundaries taking button size into account
    const btnRect = btnNo.getBoundingClientRect();
    const btnWidth = btnRect.width || 120;
    const btnHeight = btnRect.height || 50;

    // Keep within safe visible margins (prevent going off screen or under letterbox)
    const marginX = 24;
    const marginY = 60; // safe clearance from top & bottom letterbox bars

    const maxLeft = window.innerWidth - btnWidth - marginX;
    const minLeft = marginX;
    const maxTop = window.innerHeight - btnHeight - marginY;
    const minTop = marginY;

    // Generate random coordinates inside safe boundaries
    const safeLeft = Math.floor(Math.random() * (maxLeft - minLeft + 1)) + minLeft;
    const safeTop = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;

    btnNo.classList.add('escaped');
    btnNo.style.left = `${safeLeft}px`;
    btnNo.style.top = `${safeTop}px`;

    // Cycle playful texts
    const textIndex = noAttempts % noButtonTexts.length;
    btnNo.textContent = noButtonTexts[textIndex];

    // Show playful hints
    const msgIndex = Math.min(noAttempts, playfulMessages.length - 1);
    if (playfulMessages[msgIndex]) {
      playfulMessage.style.opacity = '0';
      setTimeout(() => {
        playfulMessage.textContent = playfulMessages[msgIndex];
        playfulMessage.style.opacity = '1';
      }, 150);
    }

    // Play a gentle playful chime
    audioEngine.playPluck(587.33, 0, 0.4);
  }

  /**
   * He clicks YES!
   */
  function handleYes() {
    questionModal.classList.add('hidden');

    // Trigger soft romantic celebration on canvas
    particleCanvas.triggerCelebration();

    // Play celebratory romantic chord progression
    audioEngine.playPluck(523.25, 0, 4.0); // C5
    audioEngine.playPluck(659.25, 0.15, 4.0); // E5
    audioEngine.playPluck(783.99, 0.3, 4.0); // G5

    // Return to park scene with them sitting together holding hands with roses
    showScene(4); // scene_5_hands.jpg
    showNotificationPill("She smiled. He smiled. ♡", 3200);

    // Slowly transition to the wide sunset ending under the great tree
    setTimeout(() => {
      showEnding();
    }, 3600);
  }

  /**
   * Final cinematic vows & pull-back ending animation
   */
  function showEnding() {
    showScene(5); // scene_6_ending.jpg
    vowsContainer.classList.remove('hidden');

    const lines = [
      document.getElementById('vow-line-1'),
      document.getElementById('vow-line-2'),
      document.getElementById('vow-line-3'),
      document.getElementById('vow-line-4'),
      document.getElementById('vow-line-5')
    ];
    const vowMeta = document.querySelector('.vow-meta');

    // Reveal vows sequentially with emotional pacing
    lines.forEach((line, index) => {
      setTimeout(() => {
        line.classList.add('visible');
        audioEngine.playPluck(440 + index * 40, 0, 2.5);
      }, 1400 * (index + 1));
    });

    setTimeout(() => {
      if (vowMeta) vowMeta.classList.add('visible');
    }, 1400 * (lines.length + 1));

    // After letting the vows breathe, fade to warm cream "THE END" screen
    setTimeout(() => {
      endScreen.classList.add('visible');
    }, 1400 * (lines.length + 1) + 7000);
  }

  /**
   * Replay story from start
   */
  function replayStory() {
    endScreen.classList.remove('visible');
    vowsContainer.classList.add('hidden');
    document.querySelectorAll('.vow-line').forEach(el => el.classList.remove('visible'));
    const vowMeta = document.querySelector('.vow-meta');
    if (vowMeta) vowMeta.classList.remove('visible');
    resetNoButton();
    startStory();
  }

  /* ==========================================================================
     EVENT LISTENERS
     ========================================================================== */

  // Start story
  btnStartFilm.addEventListener('click', startStory);

  // Dialogue advance
  btnContinueDialogue.addEventListener('click', (e) => {
    e.stopPropagation();
    nextDialogue();
  });

  // Tap screen to advance dialogue if visible
  document.getElementById('cinema-stage').addEventListener('click', (e) => {
    if (!dialogueContainer.classList.contains('hidden') && !e.target.closest('#btn-music')) {
      nextDialogue();
    }
  });

  // Escaping NO button (Pointer / Touch / Mouseover)
  btnNo.addEventListener('mouseenter', moveNoButton);
  btnNo.addEventListener('pointerenter', moveNoButton);
  btnNo.addEventListener('touchstart', moveNoButton, { passive: false });
  btnNo.addEventListener('click', moveNoButton);

  // YES button
  btnYes.addEventListener('click', handleYes);

  // Replay
  btnReplay.addEventListener('click', replayStory);

  // Sound Toggle: Play/Pause Bruno Mars song
  btnMusic.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleRomanticSong();
  });

  // Interactive romantic sparkle burst on click/tap
  document.addEventListener('pointerdown', (e) => {
    // Avoid double triggering if clicking buttons directly
    if (!e.target.closest('#btn-start-film') && !e.target.closest('#btn-yes') && !e.target.closest('#btn-no')) {
      createSparkle(e.clientX, e.clientY);
    }
  });

  const sparkleEmojis = ['💖', '💕', '✨', '🌸', '🌹', '♡', '💗'];
  function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'click-heart-sparkle';
    sparkle.textContent = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    document.body.appendChild(sparkle);
    setTimeout(() => {
      sparkle.remove();
    }, 1200);
  }

})();
