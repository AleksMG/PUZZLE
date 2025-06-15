// ======================
// THE LABYRINTH'S CONFIG
// ======================
const CONFIG = {
    levels: [
        {
            answer: "echo",
            screamer: "https://i.imgur.com/JX7fZ7a.jpg",
            timeLimit: 60,
            hint: "It repeats what you say"
        },
        {
            answer: "footsteps",
            screamer: "https://i.imgur.com/9VQzv7T.jpg",
            timeLimit: 45,
            hint: "They're created when you walk"
        },
        {
            answer: "breath",
            screamer: "https://i.imgur.com/L4dZQ6E.jpg",
            timeLimit: 30,
            hint: "It's essential for life"
        },
        {
            answer: "map",
            screamer: "https://i.imgur.com/3tQYV9x.jpg",
            timeLimit: 25,
            hint: "Used for navigation"
        },
        {
            answer: "river",
            screamer: "https://i.imgur.com/5z8mC9w.jpg",
            timeLimit: 20,
            hint: "Flows towards the sea"
        },
        {
            answer: "fish",
            screamer: "https://i.imgur.com/2cZzL3f.jpg",
            timeLimit: 15,
            hint: "Lives in water"
        },
        {
            answer: "left elbow",
            screamer: "https://i.imgur.com/8k7rR9d.jpg",
            timeLimit: 10,
            hint: "It's part of your body"
        }
    ],
    finalMessages: [
        "Your screams will echo in the void forever.",
        "We've peeled back your eyelids so you'll never stop seeing.",
        "The Labyrinth always hungers for more souls.",
        "You were never really alone in this room.",
        "Check your reflection in the monitor... if you dare."
    ],
    whisperPhrases: [
        "Turn around...",
        "We're right behind you...",
        "The walls have eyes...",
        "Time is running out...",
        "No one can hear you scream...",
        "Your fear tastes delicious...",
        "Let us in..."
    ]
};

// ======================
// INITIALIZATION
// ======================
let currentLevel = 0;
let timer;
let timeLeft;
let eyes = [];
let corruptionLevel = 0;
let isPunishmentActive = false;

// DOM Elements
const levelContainer = document.getElementById("level-container");
const levels = document.querySelectorAll(".level");
const answerInput = document.getElementById("answer-input");
const submitBtn = document.getElementById("submit-btn");
const punishmentDiv = document.getElementById("punishment");
const rewardDiv = document.getElementById("reward");
const finalMessage = document.getElementById("final-message");
const screamerImg = document.getElementById("screamer");
const timerDisplay = document.getElementById("timer");
const hintBtn = document.getElementById("hint-btn");
const customCursor = document.getElementById("custom-cursor");
const eyesContainer = document.getElementById("eyes");
const corruptionOverlay = document.getElementById("corruption-overlay");

// Audio Elements
const ambientSound = document.getElementById("ambient-sound");
const screamSound = document.getElementById("scream-sound");
const whisperSound = document.getElementById("whisper-sound");
const heartbeatSound = document.getElementById("heartbeat-sound");
const clockSound = document.getElementById("clock-sound");

// Initialize audio
function initAudio() {
    ambientSound.src = "https://assets.mixkit.co/sfx/preview/mixkit-ominous-drone-227.mp3";
    ambientSound.volume = 0.3;
    ambientSound.loop = true;
    
    screamSound.src = "https://soundbible.com/mp3/Woman%20Scream-SoundBible.com-1136428198.mp3";
    
    whisperSound.src = "https://assets.mixkit.co/sfx/preview/mixkit-creepy-whisper-583.mp3";
    whisperSound.volume = 0.5;
    
    heartbeatSound.src = "https://assets.mixkit.co/sfx/preview/mixkit-fast-heartbeat-757.mp3";
    heartbeatSound.volume = 0;
    
    clockSound.src = "https://assets.mixkit.co/sfx/preview/mixkit-clock-ticking-1045.mp3";
    clockSound.volume = 0.2;
    
    // Start ambient sounds
    ambientSound.play().catch(e => console.log("Audio play failed:", e));
    clockSound.play().catch(e => console.log("Audio play failed:", e));
}

// ======================
// GAME FUNCTIONS
// ======================
function startGame() {
    initAudio();
    createEyes(5);
    updateCursor();
    showLevel(0);
    
    // Event listeners
    document.addEventListener("mousemove", updateCursor);
    document.addEventListener("keydown", handleKeyPress);
    submitBtn.addEventListener("click", checkAnswer);
    hintBtn.addEventListener("click", giveHint);
    document.getElementById("enter-btn").addEventListener("click", () => showLevel(1));
    
    // Start random whispers
    setInterval(playRandomWhisper, 15000);
    
    // Start corruption effects
    setInterval(addCorruption, 5000);
}

function showLevel(levelNum) {
    currentLevel = levelNum;
    
    // Hide all levels
    levels.forEach(level => level.classList.remove("active-level"));
    
    if (levelNum >= levels.length - 2) { // -2 because last two are punishment/reward
        if (levelNum === levels.length - 2) {
            // Punishment
            punishmentDiv.classList.add("active-level");
        } else {
            // Reward
            rewardDiv.classList.add("active-level");
        }
    } else {
        // Show current level
        levels[levelNum].classList.add("active-level");
        
        // Reset input
        answerInput.value = "";
        answerInput.focus();
        
        // Start timer
        startTimer(CONFIG.levels[levelNum]?.timeLimit || 60);
        
        // Increase heartbeat based on level
        heartbeatSound.volume = Math.min(0.5, levelNum * 0.1);
    }
}

function startTimer(seconds) {
    clearInterval(timer);
    timeLeft = seconds;
    updateTimerDisplay();
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        // Speed up clock sound when time is running out
        if (timeLeft <= 10) {
            clockSound.playbackRate = 1.5;
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            timeUp();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Visual warning when time is low
    if (timeLeft <= 10) {
        timerDisplay.style.animation = "glitch-effect 0.5s infinite";
        timerDisplay.style.color = "#f00";
    } else {
        timerDisplay.style.animation = "";
        timerDisplay.style.color = "#8a0303";
    }
}

function giveHint() {
    if (timeLeft > 15 && currentLevel < 4) {
        timeLeft -= 15;
        whisperAnswer(CONFIG.levels[currentLevel - 1]?.hint || "No hint available");
    } else if (timeLeft > 10 && currentLevel < 6) {
        timeLeft -= 10;
        whisperAnswer(CONFIG.levels[currentLevel - 1]?.hint || "No hint available");
    } else if (timeLeft > 5) {
        timeLeft -= 5;
        whisperAnswer(CONFIG.levels[currentLevel - 1]?.hint || "No hint available");
    } else {
        whisperAnswer("No time left for hints...");
    }
}

function checkAnswer() {
    if (isPunishmentActive) return;
    
    const userAnswer = answerInput.value.trim().toLowerCase();
    const correctAnswer = CONFIG.levels[currentLevel - 1]?.answer || "";
    
    if (userAnswer === correctAnswer) {
        // Correct answer
        if (currentLevel < levels.length - 2) {
            // Proceed to next level
            showLevel(currentLevel + 1);
            
            // Increase corruption
            corruptionLevel++;
            updateCorruption();
            
            // Play eerie sound
            whisperSound.src = "https://assets.mixkit.co/sfx/preview/mixkit-creepy-laugh-583.mp3";
            whisperSound.play();
        } else {
            // Final level completed
            showReward();
        }
    } else {
        // Wrong answer - punishment
        triggerPunishment();
    }
}

function triggerPunishment() {
    if (isPunishmentActive) return;
    
    isPunishmentActive = true;
    
    // Show screamer
    screamerImg.src = CONFIG.levels[currentLevel - 1]?.screamer || "https://i.imgur.com/JX7fZ7a.jpg";
    punishmentDiv.classList.remove("hidden");
    punishmentDiv.classList.add("active-level");
    
    // Play scream sound
    screamSound.currentTime = 0;
    screamSound.play();
    
    // Visual effects
    document.body.style.background = "#f00";
    const glitchInterval = setInterval(() => {
        document.body.style.background = `rgb(
            ${Math.floor(Math.random() * 255)},
            ${Math.floor(Math.random() * 255)},
            ${Math.floor(Math.random() * 255)}
        )`;
    }, 50);
    
    // Reset after 3 seconds
    setTimeout(() => {
        clearInterval(glitchInterval);
        document.body.style.background = "#000";
        punishmentDiv.classList.add("hidden");
        levels[currentLevel].classList.add("active-level");
        isPunishmentActive = false;
        
        // Lose time as penalty
        timeLeft = Math.max(5, timeLeft - 10);
        
        // Taunt player
        whisperAnswer("Wrong... try again...");
    }, 3000);
}

function timeUp() {
    // Immediate punishment for running out of time
    triggerPunishment();
    
    // Reset timer with less time
    startTimer(Math.max(10, (CONFIG.levels[currentLevel - 1]?.timeLimit || 60) / 2));
}

function showReward() {
    clearInterval(timer);
    rewardDiv.classList.remove("hidden");
    rewardDiv.classList.add("active-level");
    
    // Set random final message
    finalMessage.textContent = CONFIG.finalMessages[
        Math.floor(Math.random() * CONFIG.finalMessages.length)
    ];
    
    // Creepy voice
    const evilVoice = new SpeechSynthesisUtterance(
        "Congratulations... you've reached the center... but now you can never leave..."
    );
    evilVoice.rate = 0.7;
    evilVoice.pitch = 0.5;
    window.speechSynthesis.speak(evilVoice);
    
    // Final corruption
    startFinalCorruption();
}

// ======================
// HORROR EFFECTS
// ======================
function createEyes(count) {
    for (let i = 0; i < count; i++) {
        const eye = document.createElement("div");
        eye.className = "eye";
        eye.style.top = `${Math.random() * 100}vh`;
        eye.style.left = `${Math.random() * 100}vw`;
        
        const pupil = document.createElement("div");
        pupil.className = "pupil";
        
        eye.appendChild(pupil);
        eyesContainer.appendChild(eye);
        eyes.push({
            element: eye,
            pupil: pupil,
            x: parseFloat(eye.style.left),
            y: parseFloat(eye.style.top)
        });
    }
    
    // Make eyes follow cursor
    document.addEventListener("mousemove", (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        eyes.forEach(eye => {
            const eyeRect = eye.element.getBoundingClientRect();
            const eyeCenterX = eyeRect.left + eyeRect.width / 2;
            const eyeCenterY = eyeRect.top + eyeRect.height / 2;
            
            const angle = Math.atan2(mouseY - eyeCenterY, mouseX - eyeCenterX);
            const distance = Math.min(10, 
                Math.sqrt(
                    Math.pow(mouseX - eyeCenterX, 2) + 
                    Math.pow(mouseY - eyeCenterY, 2)
                ) / 10
            );
            
            const pupilX = Math.cos(angle) * distance;
            const pupilY = Math.sin(angle) * distance;
            
            eye.pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
        });
    });
}

function updateCursor(e) {
    if (e) {
        customCursor.style.left = `${e.clientX}px`;
        customCursor.style.top = `${e.clientY}px`;
    }
    
    // Randomly change cursor to something creepy
    if (Math.random() < 0.01) {
        customCursor.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="%23f00" d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2zm0 24c-5.5 0-10-4.5-10-10S10.5 6 16 6s10 4.5 10 10-4.5 10-10 10z"/></svg>')`;
        setTimeout(() => {
            customCursor.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="%238a0303" d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2zm0 24c-5.5 0-10-4.5-10-10S10.5 6 16 6s10 4.5 10 10-4.5 10-10 10z"/></svg>')`;
        }, 500);
    }
}

function playRandomWhisper() {
    if (isPunishmentActive) return;
    
    const phrase = CONFIG.whisperPhrases[
        Math.floor(Math.random() * CONFIG.whisperPhrases.length)
    ];
    whisperAnswer(phrase);
}

function whisperAnswer(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 0.3;
    utterance.volume = 0.7;
    
    // Create stereo effect by panning left/right
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const panner = new StereoPannerNode(audioContext, {
        pan: Math.random() * 2 - 1 // Random position between -1 (left) and 1 (right)
    });
    
    window.speechSynthesis.speak(utterance);
}

function addCorruption() {
    if (corruptionLevel <= 0) return;
    
    // Add blood drops
    if (Math.random() < corruptionLevel * 0.2) {
        const drop = document.createElement("div");
        drop.className = "blood-drop";
        drop.style.left = `${Math.random() * 100}vw`;
        corruptionOverlay.appendChild(drop);
        
        setTimeout(() => {
            drop.remove();
        }, 5000);
    }
    
    // Random glitches
    if (Math.random() < corruptionLevel * 0.1) {
        const elements = document.querySelectorAll("*");
        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        randomElement.classList.add("glitch-effect");
        
        setTimeout(() => {
            randomElement.classList.remove("glitch-effect");
        }, 500);
    }
}

function updateCorruption() {
    // Increase ambient sound volume
    ambientSound.volume = Math.min(0.7, 0.3 + corruptionLevel * 0.05);
    
    // Add more eyes at higher corruption levels
    if (corruptionLevel === 3 && eyes.length < 10) {
        createEyes(3);
    } else if (corruptionLevel === 5 && eyes.length < 15) {
        createEyes(5);
    }
}

function startFinalCorruption() {
    // Make all eyes stare directly at the viewer
    eyes.forEach(eye => {
        eye.pupil.style.transform = "translate(0, 0)";
    });
    
    // Intensify heartbeat
    heartbeatSound.volume = 0.8;
    
    // Start severe corruption
    const finalCorruption = setInterval(() => {
        // Blood rain
        for (let i = 0; i < 5; i++) {
            const drop = document.createElement("div");
            drop.className = "blood-drop";
            drop.style.left = `${Math.random() * 100}vw`;
            drop.style.animationDuration = `${2 + Math.random() * 3}s`;
            corruptionOverlay.appendChild(drop);
            
            setTimeout(() => {
                drop.remove();
            }, 5000);
        }
        
        // Screen shake
        document.body.style.transform = `translate(
            ${Math.random() * 10 - 5}px, 
            ${Math.random() * 10 - 5}px
        )`;
        
        // Random screaming
        if (Math.random() < 0.3) {
            screamSound.currentTime = 0;
            screamSound.play();
        }
    }, 500);
    
    // After 30 seconds, full screen blood
    setTimeout(() => {
        clearInterval(finalCorruption);
        corruptionOverlay.style.background = "rgba(138, 3, 3, 0.7)";
        document.body.style.transform = "translate(0, 0)";
        
        // Final whisper
        const finalWhisper = new SpeechSynthesisUtterance(
            "We are one now. The Labyrinth is your home forever."
        );
        finalWhisper.rate = 0.6;
        finalWhisper.pitch = 0.1;
        window.speechSynthesis.speak(finalWhisper);
    }, 30000);
}

function handleKeyPress(e) {
    if (e.key === "Enter") {
        checkAnswer();
    } else if (e.key === "Escape" && currentLevel === 0) {
        // Special effect for trying to escape the warning
        whisperAnswer("There is no escape");
        triggerPunishment();
    }
}

// Start the game when loaded
window.addEventListener("load", startGame);

// Polyfill for StereoPannerNode
if (window.AudioContext && !window.StereoPannerNode) {
    window.StereoPannerNode = function(context) {
        this.context = context;
        this.pan = 0;
        
        this.connect = function(destination) {
            this.destination = destination;
        };
        
        // This is a simplified version - real implementation would use Web Audio API
    };
        }
