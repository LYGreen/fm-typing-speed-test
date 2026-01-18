/* Classes */
class TypingTextbox {    
    constructor() {
        /** @type {string} */
        this.text = '';

        /** @type {string} */
        this.words = '';

        /** @type {number} */
        this.cursor = 0;

        /** @type {Array<{ value: 'wrong' | 'correct' | 'normal', text: string }>} */
        this.strStatus = [];
    }

    /**
     * Clear typed texts.
     */
    clearText() {
        this.text = '';
        this.moveCursorToStart();
    }

    /**
     * Set target text.
     * @param {string} words 
     */
    setWords(words) {
        this.words = words + ' ';
        this.updateStrStatus();
    }

    /**
     * Return true if it is finished.
     * @returns {boolean} true or false
     */
    isFinished() {
        return this.text.length === this.words.length - 1;
    }
    
    /**
     * Update the status of all texts (correct, wrong, normal)
     */
    updateStrStatus() {
        if (this.text.length < 0 || this.words.length < 0) {
            return;
        }

        this.strStatus.length = 0;

        if (this.text.length > 0) {
            /** @type {{ value: 'wrong' | 'correct' | 'normal', text: string }} */
            let status = { value: this.text[0] === this.words[0] ? 'correct' : 'wrong', text: '' };
            
            let lastIsCorrect = status.isCorrect;

            status.text += this.words[0]; // Data texts
            // status.text += this.text[0]; // Typed texts

            for (let i = 1; i < this.text.length; i++) {
                let isCorrect = this.text[i] === this.words[i];
                
                if (isCorrect !== lastIsCorrect) {
                    this.strStatus.push(status);
                    status = {
                        value: isCorrect ? 'correct' : 'wrong',
                        text: '',
                    };
                    lastIsCorrect = isCorrect;
                }

                status.text += this.words[i]; // Data texts
                // status.text += this.text[i]; // Typed texts
                
            }

            this.strStatus.push(status);
        }

        /** @type {{ value: 'wrong' | 'correct' | 'normal', text: string }} */
        const normalStatus = {
            value: 'normal',
            text: this.words.slice(this.text.length),
        };

        
        this.strStatus.push(normalStatus);
    }

    /**
     * Add a character to typed text.
     * @param {string} ch 
     */
    addCharacter(ch) {
        if (this.text.length < this.words.length - 1) {
            this.text = this.text.slice(0, this.cursor) + ch + this.text.slice(this.cursor);
            this.moveCursorBackward(ch.length);

            this.updateStrStatus();
        }
    }

    /**
     * Remove a character.
     */
    removeCharacter() {
        if (this.cursor > 0) {
            this.text = this.text.slice(0, this.cursor - 1) + this.text.slice(this.cursor);
            this.moveCursorForward();

            this.updateStrStatus();
        }
    }

    /**
     * Move the cursor back.
     * @param {number} length 
     */
    moveCursorBackward(length = 1) {
        if (this.cursor < this.text.length) {
            this.cursor += length;
        }
    }

    /**
     * Move the cursor forward.
     * @param {number} length 
     */
    moveCursorForward(length = 1) {
        if (this.cursor > 0) {
            this.cursor -= 1;
        }
    }

    /**
     * Move the cursor to a position.
     * @param {number} pos 
     */
    moveCursorPosition(pos) {
        if (pos < 0) {
            this.moveCursorToStart();
        } else if (pos > this.text.length) {
            this.moveCursorToEnd();
        } else {
            this.cursor = pos;
        }
    }

    /**
     * Move cursor to the start of typed text.
     */
    moveCursorToStart() {
        this.cursor = 0;
    }

    /**
     * Move cursor to the end of typed text.
     */
    moveCursorToEnd() {
        this.cursor = this.text.length;
    }
};

class Timer {
    /**
     * Timer
     * @param {number} interval Interval.
     * @param {Function} func Function callback.
     */
    constructor(interval = 1000, func = null) {
        this.startTime = 0;
        this.interval = interval;
        this.elapsed = 0;
        this.func = func;
        this.timer = null;
    }

    /**
     * Start counting.
     */
    start() {
        this.startTime = Date.now();
        let itv = 0;
        this.timer = setInterval(() => {
            const now = Date.now();
            const dt = now - this.startTime - this.elapsed;
            this.elapsed = now - this.startTime;
            itv += dt;

            if (this.func != null && itv >= this.interval) {
                this.func();
                itv -= this.interval;
            }
        }, 100);
    }

    /**
     * Stop counting.
     */
    stop() {
        this.startTime = 0;
        this.elapsed = 0;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}

/* Variables */
const typingTextBox = new TypingTextbox();

/**
 * WPM timer computing wpm.
 */
const wpmTimer = new Timer(100, () => {
    let correctCount = 0;
    const totalTyped = typingTextBox.text.length;
    for (const ss of typingTextBox.strStatus) {
        if (ss.value === 'correct') {
            correctCount += ss.text.length;
        }
    }

    typingStatus.wpm = Math.trunc(correctCount / 5 * (60000 / wpmTimer.elapsed));

    updateWpmInfo();
});

/**
 * Second timer computing time.
 */
const secondTimer = new Timer(1000, () => {
    if (typingStatus.mode === 'timed') {
        typingStatus.time = Math.ceil(60 - secondTimer.elapsed / 1000);
        if (typingStatus.time <= 0) {
            stopTyping();
            changePageTo('complete');
        }
    } else if (typingStatus.mode === 'passage') {
        typingStatus.time = Math.trunc(secondTimer.elapsed / 1000);
    }

    updateTimeInfo();
});

/** @type {HTMLButtonElement} */
const startTypingBtn = document.getElementById('start-typing-btn');

/** @type {HTMLButtonElement} */
const restartBtn = document.getElementById('restart-btn');

/** @type {HTMLButtonElement} */
const goAgainBtn = document.getElementById('go-again-btn');

/** @type {HTMLDivElement} */
const beforeStart = document.querySelector('.before-start');

/** @type {HTMLInputElement} */
const passageInput = document.getElementById('passage');

/** @type {HTMLDivElement} */
const passageElement = document.querySelector('.passage');

/** @type {HTMLDivElement} */
const passageDiv = document.getElementById('passage-div');

/** @type {HTMLSpanElement} */
const currentWpm = document.querySelector('.computations .wpm')

/** @type {HTMLSpanElement} */
const currentAccuracy = document.querySelector('.computations .accuracy');

/** @type {HTMLSpanElement} */
const currentTime = document.querySelector('.computations .time');

/** @type {HTMLInputElement[]} */
const difficultyElements = document.querySelectorAll('input[name=difficulty]');

/** @type {HTMLInputElement[]} */
const modeElements = document.querySelectorAll('input[name=mode]');

/** @type {HTMLSpanElement} */
const personalBestWpm = document.getElementById('personal-best-wpm');

const pages = {
    typing: {
        element: document.querySelector('.typing-page'),
        display: 'block',
    },
    complete: {
        element: document.querySelector('.complete-page'),
        display: 'flex',
    }
};

const results = {
    firstTest: {
        image: './assets/images/icon-completed.svg',
        title: 'Baseline Established!',
        description: 'You\'ve set the bar. Now the real challenge begins--time to beat it.',
        buttonText: 'Beat This Score',
    },
    newPersonalTest: {
        image: './assets/images/icon-new-pb.svg',
        title: 'High Score Smashed!',
        description: 'You\'re getting faster. That was incredible typing.',
        buttonText: 'Beat This Score',
    },
    normalTest: {
        image: './assets/images/icon-completed.svg',
        title: 'Test Complete!',
        description: 'Solid run. Keep pushing to beat your high score.',
        buttonText: 'Go Again',
    },
};

const colors = {
    neutral900: 'hsl(0, 0%, 7%)',
    neutral800: 'hsl(0, 0%, 15%)',
    neutral500: 'hsl(240, 3%, 46%)',
    neutral400: 'hsl(240, 1%, 59%)',
    neutral0: 'hsl(0, 0%, 100%)',
    blue600: 'hsl(214, 100%, 55%)',
    blue400: 'hsl(210, 100%, 65%)',
    red500: 'hsl(354, 63%, 57%)',
    green500: 'hsl(140, 63%, 57%)',
    yellow400: 'hsl(49, 85%, 70%)',
};

const typingStatus = {
    personalBest: 0,
    wpm: 0,
    accuracy: 0.0,
    time: 0,

    /** @type {'easy' | 'medium' | 'hard'} */
    difficulty: 'easy',

    /** @type {'timed' | 'passage'} */
    mode: 'timed',
};

let data = null;

/* Functions */
async function initialize() {
    typingStatus.personalBest = 0;

    personalBestWpm.textContent = typingStatus.personalBest;

    const res = await fetch('./data.json');
    const d = await res.json();
    data = d;

    randomTypingWords();

    resetStatus();

    blockTypingBox();
}

/**
 * Reset all status (wpm, accuracy, time, new target texts).
 */
function resetStatus() {
    typingStatus.wpm = 0;
    typingStatus.accuracy = 100;
    
    typingTextBox.clearText();

    changeDifficultyTo(typingStatus.difficulty);
    changeModeTo(typingStatus.mode);

    updateWpmInfo();
    updateAccuracyInfo();
    updateTimeInfo();
}

/**
 * Compute accuracy.
 */
function computeAccuracy() {
    let correctCount = 0;
    const totalTyped = typingTextBox.text.length;
    for (const ss of typingTextBox.strStatus) {
        if (ss.value === 'correct') {
            correctCount += ss.text.length;
        }
    }

    typingStatus.accuracy = Math.trunc((totalTyped !== 0 ? correctCount / totalTyped : 0) * 100);

    updateAccuracyInfo();
}

/**
 * Blur typing box texts and show start button.
 */
function blockTypingBox() {
    passageInput.disabled = true;
    beforeStart.style.display = 'block';
    passageDiv.querySelectorAll('span').forEach((e) => {
        e.style.filter = 'blur(8px)';
    });
    passageDiv.style.cursor = 'default';
    restartBtn.style.display = 'none';
}

/**
 * Sharpen typing box texts and show restart button.
 */
function showTypingBox() {
    passageInput.disabled = false;
    beforeStart.style.display = 'none';
    passageDiv.querySelectorAll('span').forEach((e) => {
        e.style.filter = 'none';
    });
    passageDiv.style.cursor = 'text';
    restartBtn.style.display = 'block';
}

/**
 * Block difficulty and mode options.
 */
function blockOptions() {
    difficultyElements.forEach((e) => {
        e.disabled = true;
    });

    modeElements.forEach((e) => {
        e.disabled = true;
    });
}

/**
 * Allow difficulty and mode options.
 */
function allowOptions() {
    difficultyElements.forEach((e) => {
        e.disabled = false;
    });

    modeElements.forEach((e) => {
        e.disabled = false;
    });
}

/**
 * Set a random typing target texts according the difficulty.
 */
function randomTypingWords() {
    const dfct = typingStatus.difficulty;

    /** @type {{ id: string, text: string }[]} */
    const arr = data[dfct];
    const obj = arr[Math.floor(Math.random() * arr.length)];

    const text = obj.text;

    typingTextBox.setWords(text);
    
    updateShownTextbox();
}

/**
 * Change pages.
 * @param {'typing' | 'complete'} page 
 */
function changePageTo(page) {
    Object.entries(pages).forEach(([key, value]) => {
        value.element.style.display = 'none';
    });
    
    if (page === 'typing') {
        blockTypingBox();
    } else if (page === 'complete') {
        const oldPersonalBest = typingStatus.personalBest;
        typingStatus.personalBest = Math.max(typingStatus.personalBest, typingStatus.wpm);
        
        if (oldPersonalBest === 0) {
            updateResults('firstTest');
        } else if (typingStatus.wpm > oldPersonalBest) {
            updateResults('newPersonalTest');
        } else {
            updateResults('normalTest');
        }
    }

    pages[page].element.style.display = pages[page].display;
}

/**
 * Change difficulty.
 * @param {'easy' | 'medium' | 'hard'} difficulty 
 */
function changeDifficultyTo(difficulty) {
    typingStatus.difficulty = difficulty;
    randomTypingWords();
}

/**
 * Change mode.
 * @param {'timed' | 'passage'} mode 
 */
function changeModeTo(mode) {
    typingStatus.mode = mode;
    if (mode === 'timed') {
        typingStatus.time = 60;
    } else if (mode === 'passage') {
        typingStatus.time = 0;
    }
    updateTimeInfo();
}

/**
 * Split an object into an array according to the text index.
 * @param {{ text: string }} obj An object containing text key.
 * @param {number} index The index of text
 * @returns {{ text: string }[]}
 */
function splitByTextIndex(obj, index) {
    const { text } = obj;

    if (typeof text !== 'string') {
        throw new Error('obj.text must be string.');
    }
    if (index < 0 || index >= text.length) {
        throw new Error('index out of bound.');
    }

    const leftText = text.slice(0, index);
    const midText = text[index];
    const rightText = text.slice(index + 1);

    const makeObj = (t) => ({ ...obj, text: t });

    const result = [];

    if (leftText) {
        result.push(makeObj(leftText));
    }
    
    result.push(makeObj(midText));
    
    if (rightText) {
        result.push(makeObj(rightText));
    }

    return result;
}

/**
 * Update texts of typing box.
 */
function updateShownTextbox() {
    const status = [...typingTextBox.strStatus];

    let curPos1 = 0, curPos2 = 0, curLoc = 0;

    /* Found the position of cursor (curPos1, curPos2) */
    for (let i = 0; i < typingTextBox.strStatus.length; i++) {
        if (curLoc + typingTextBox.strStatus[i].text.length > typingTextBox.cursor) {
            curPos1 = i;

            for (let j = 0; j < typingTextBox.strStatus[i].text.length; j++) {
                if (curLoc + j === typingTextBox.cursor) {
                    curPos2 = j;
                    break;
                }
            }
            break;
        } else {
            curLoc += typingTextBox.strStatus[i].text.length;
        }
    }

    const splited = splitByTextIndex(status[curPos1], curPos2);
    let curPosInArr = curPos1 + (curPos2 === 0 ? 0 : 1);

    status.splice(curPos1, 1, ...splited);
    
    const dl = status.length - passageDiv.children.length;

    if (dl > 0) {
        for (let i = 0; i < dl; i++) {
            const span = document.createElement('span');
            passageDiv.appendChild(span);
        }
    } else if (dl < 0) {
        for (let i = 0; i < -dl; i++) {
            passageDiv.lastChild?.remove();
        }
    }

    for (let i = 0; i < status.length; i++) {
        if (status[i].value === 'correct') {
            passageDiv.children[i].className = 'correct-words';
        } else if (status[i].value === 'wrong') {
            passageDiv.children[i].className = 'wrong-words';
        } else {
            passageDiv.children[i].className = 'normal-words';
        }

        if (i === curPosInArr) {
            passageDiv.children[i].classList.add('cursor');
        }

        passageDiv.children[i].textContent = status[i].text;
    }
}

/**
 * Update wpm info on web.
 */
function updateWpmInfo() {
    currentWpm.textContent = typingStatus.wpm;
}

/**
 * Update accuracy info on web.
 */
function updateAccuracyInfo() {
    currentAccuracy.textContent = `${typingStatus.accuracy}%`;
    currentAccuracy.style.color = typingStatus.accuracy === 100 ? colors.green500 : colors.red500;
}

/**
 * Update time info on web.
 */
function updateTimeInfo() {
    const minute = Math.trunc(typingStatus.time / 60).toString();
    const second = (Math.trunc(typingStatus.time) % 60).toString().padStart(2, '0');

    currentTime.textContent = `${minute}:${second}`;
}

/**
 * Update the complete page. According to the user WPM, show different complete page.
 * @param {'firstTest' | 'newPersonalTest' | 'normalTest'} test 
 */
function updateResults(test) {

    /** @type {HTMLDivElement} */
    const completePageDiv = document.querySelector('.complete-page');

    /** @type {HTMLImageElement} */
    const image = completePageDiv.querySelector('.img');

    /** @type {HTMLHeadingElement} */
    const title = completePageDiv.querySelector('.title');

    /** @type {HTMLParagraphElement} */
    const description = completePageDiv.querySelector('.description');

    /** @type {HTMLSpanElement} */
    const wpm = completePageDiv.querySelector('.results .wpm');

    /** @type {HTMLSpanElement} */
    const accuracy = completePageDiv.querySelector('.results .accuracy');

    /** @type {HTMLSpanElement} */
    const correct = completePageDiv.querySelector('.results .correct');

    /** @type {HTMLSpanElement} */
    const wrong = completePageDiv.querySelector('.results .wrong');

    /** @type {HTMLSpanElement} */
    const buttonText = completePageDiv.querySelector('.btn-text');

    let correctCnt = 0, wrongCnt = 0;
    for (const ss of typingTextBox.strStatus) {
        if (ss.value === 'correct') {
            correctCnt += ss.text.length;
        } else if (ss.value === 'wrong') {
            wrongCnt += ss.text.length;
        }
    }

    image.src = results[test].image;
    if (test === 'newPersonalTest') {
        image.classList.remove('img-shadow');
    } else {
        image.classList.add('img-shadow');
    }

    title.textContent = results[test].title;
    description.textContent = results[test].description;
    wpm.textContent = typingStatus.wpm;
    accuracy.textContent = `${typingStatus.accuracy}%`;
    accuracy.style.color = typingStatus.accuracy === 100 ? colors.green500 : colors.red500;
    correct.textContent = correctCnt;
    wrong.textContent = wrongCnt;
    buttonText.textContent = results[test].buttonText;
    personalBestWpm.textContent = typingStatus.personalBest;
}

/**
 * Start typing. Set up timers.
 */
function startTyping() {
    wpmTimer.start();
    secondTimer.start();
}

/**
 * Stop typing. Stop timers.
 */
function stopTyping() {
    wpmTimer.stop();
    secondTimer.stop();
}

/**
 * Restart typing. Reset timers.
 */
function restartTyping() {
    stopTyping();
    startTyping();
}

/* Events */
passageElement.addEventListener('click', () => {
    passageInput.focus({ preventScroll: true });
});

passageInput.addEventListener('keydown', (e) => {
    e.preventDefault();

    if (e.key.length === 1) {
        typingTextBox.addCharacter(e.key);
        computeAccuracy();
    } else if (e.key.toLocaleLowerCase() === 'backspace') {
        typingTextBox.removeCharacter();
        computeAccuracy();
    } else if (e.key.toLocaleLowerCase() === 'arrowleft') {
        typingTextBox.moveCursorForward();
    } else if (e.key.toLocaleLowerCase() === 'arrowright') {
        typingTextBox.moveCursorBackward();
    } else if (e.key.toLocaleLowerCase() === 'home') {
        typingTextBox.moveCursorToStart();
    } else if (e.key.toLocaleLowerCase() === 'end') {
        typingTextBox.moveCursorToEnd();
    }

    updateShownTextbox();
    if (typingTextBox.isFinished()) {
        stopTyping();
        changePageTo('complete');
    }
});

startTypingBtn.addEventListener('click', (e) => {
    startTyping();
    showTypingBox();
    blockOptions();
    passageInput.focus();
});

restartBtn.addEventListener('click', (e) => {
    stopTyping();
    resetStatus();
    allowOptions();
    changePageTo('typing');
});

goAgainBtn.addEventListener('click', (e) => {
    resetStatus();
    allowOptions();
    changePageTo('typing');
});

difficultyElements.forEach((e) => {
    e.addEventListener('change', (ev) => {
        changeDifficultyTo(ev.target.value);
    });
});

modeElements.forEach((e) => {
    e.addEventListener('change', (ev) => {
        changeModeTo(ev.target.value);
    });
});

/* Calls */
initialize();
