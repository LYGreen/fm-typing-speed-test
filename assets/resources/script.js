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
     * Add a character to the text.
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
     * Move the cursor to the start of typed text.
     */
    moveCursorToStart() {
        this.cursor = 0;
    }

    /**
     * Move the cursor to the end of typed text.
     */
    moveCursorToEnd() {
        this.cursor = this.text.length;
    }
};

/* Variables */
const typingTextBox = new TypingTextbox();

/** @type {HTMLInputElement} */
const passageInput = document.getElementById('passage');

/** @type {HTMLDivElement} */
const passageElement = document.querySelector('.passage');

/** @type {HTMLDivElement} */
const passageDiv = document.getElementById('passage-div');

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

let data = null;

/* Functions */
async function initialize() {
    const res = await fetch('./data.json');
    const d = await res.json();
    data = d;

    typingTextBox.setWords(data.easy[0].text);
    updateShownTextbox();
}

/**
 * Split the object into an array according to the text index.
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
 * Update the texts of typing box.
 */
function updateShownTextbox() {
    console.log(typingTextBox.strStatus);

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

/* Events */
passageElement.addEventListener('click', () => {
    passageInput.focus({ preventScroll: true });
});

passageInput.addEventListener('keydown', (e) => {
    e.preventDefault();

    if (e.key.length === 1) {
        typingTextBox.addCharacter(e.key);
    } else if (e.key.toLocaleLowerCase() === 'backspace') {
        typingTextBox.removeCharacter();
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
});

/* Calls */
initialize();
