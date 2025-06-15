// Correct answer (case-insensitive)
const CORRECT_ANSWER = "echo";
const SCREAMER_IMAGE = "https://i.imgur.com/9VQzv7T.jpg"; // Replace with a jumpscare image
const THREATS = [
    "WE ARE WATCHING YOU.",
    "YOUR SOUL IS NOW OURS.",
    "THEY ARE COMING FOR YOU.",
    "DON'T TURN AROUND.",
    "IT'S TOO LATE TO ESCAPE."
];

// DOM Elements
const riddleBox = document.getElementById("riddle-box");
const answerInput = document.getElementById("answer-input");
const submitBtn = document.getElementById("submit-btn");
const punishmentDiv = document.getElementById("punishment");
const rewardDiv = document.getElementById("reward");
const threatText = document.getElementById("threat-text");
const screamSound = document.getElementById("scream-sound");
const whisperSound = document.getElementById("whisper-sound");

// Evil effects
let glitchInterval;

// Start creepy ambiance
whisperSound.loop = true;
whisperSound.volume = 0.3;
whisperSound.play();

// Submit answer
submitBtn.addEventListener("click", checkAnswer);
answerInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkAnswer();
});

function checkAnswer() {
    const userAnswer = answerInput.value.trim().toLowerCase();
    
    if (userAnswer === CORRECT_ANSWER) {
        // Correct answer - show "reward"
        riddleBox.style.background = "#000";
        document.getElementById("riddle").classList.add("hidden");
        rewardDiv.classList.remove("hidden");
        threatText.textContent = THREATS[Math.floor(Math.random() * THREATS.length)];
        
        // Evil whisper
        const evilVoice = new SpeechSynthesisUtterance(
            "You think you've won? The game has just begun."
        );
        evilVoice.rate = 0.8;
        window.speechSynthesis.speak(evilVoice);

        // Start corrupting the page
        startCorruption();
    } else {
        // Wrong answer - PUNISHMENT
        punishmentDiv.classList.remove("hidden");
        document.getElementById("screamer").src = SCREAMER_IMAGE;
        screamSound.play();
        
        // Full-screen glitch effect
        document.body.style.background = "#f00";
        glitchInterval = setInterval(() => {
            document.body.style.background = `rgb(
                ${Math.floor(Math.random() * 255)},
                ${Math.floor(Math.random() * 255)},
                ${Math.floor(Math.random() * 255)}
            )`;
        }, 50);

        // Reset after 3 seconds of horror
        setTimeout(() => {
            punishmentDiv.classList.add("hidden");
            document.body.style.background = "#000";
            clearInterval(glitchInterval);
            answerInput.value = "";
            
            // Taunt the player
            const taunt = new SpeechSynthesisUtterance(
                "Wrong answer. Try again... if you dare."
            );
            taunt.rate = 0.7;
            window.speechSynthesis.speak(taunt);
        }, 3000);
    }
}

function startCorruption() {
    // Make text randomly disappear
    setInterval(() => {
        const letters = document.querySelectorAll("#reward p, #reward h2");
        letters.forEach(letter => {
            if (Math.random() > 0.9) {
                letter.style.visibility = "hidden";
                setTimeout(() => {
                    letter.style.visibility = "visible";
                }, 1000);
            }
        });
    }, 500);

    // Slowly "delete" the page
    setTimeout(() => {
        const corruption = setInterval(() => {
            if (document.body.children.length > 0) {
                const randomChild = document.body.children[
                    Math.floor(Math.random() * document.body.children.length)
                ];
                randomChild.remove();
            } else {
                clearInterval(corruption);
                document.body.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100vw;
                        height: 100vh;
                        background: #000;
                        color: #f00;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        font-size: 2rem;
                    ">
                        SYSTEM CORRUPTED. CLOSE THIS PAGE WHILE YOU STILL CAN.
                    </div>
                `;
            }
        }, 1000);
    }, 10000);
}
