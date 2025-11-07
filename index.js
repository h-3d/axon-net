import { RegExpMatcher, TextCensor, englishDataset, englishRecommendedTransformers } from 'https://cdn.jsdelivr.net/npm/obscenity@0.4/+esm';
import GUN from 'https://cdn.skypack.dev/gun';

const matcher = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });
const censor = new TextCensor();

const button = document.getElementById(`button`);
const messages = document.querySelector(`.grid`);

if (isMobile.phone) {
    document.getElementById(`group`).style.width = `80vw`;
}

function isWebkit() {
    return "GestureEvent" in window;
}

if (isWebkit()) {
    button.style.fontSize = `400%`;
}

const gun = GUN({
    peers: [
        `https://relay.peer.ooo/gun`,
        `https://gun.defucc.me/gun`
    ]
});

const chatroom = gun.get(`axon-net-chatroom`);
const seen = new Set();

chatroom.map().on((data, key) => {
    if (!data || typeof data !== `string` || seen.has(key)) return;
    seen.add(key);
    receive(data);
});

function receive(data) {
    const text = data.trim();
    const matches = matcher.getAllMatches(text);
    const message = censor.applyTo(text, matches);
    if (message !== `` && message.length <= 100) {
        const article = document.createElement(`article`);
        const identicon = document.createElement(`img`);
        if (isMobile.phone) {
            article.style.width = `80vw`;
        }
        article.textContent = message;
        identicon.src = `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(message)}`;
        identicon.alt = `avatar`;
        messages.prepend(article);
        article.prepend(identicon);
    }
};

button.addEventListener(`click`, () => {
    if (!isProcessing) {
        send();
    }
});

document.getElementById(`input`).addEventListener(`keydown`, (event) => {
    if (event.key == `Enter` && !isProcessing) {
        send();
    }
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

let isProcessing = false;

async function send() {
    if (isProcessing) return;
    const text = document.getElementById(`input`).value.trim();
    const matches = matcher.getAllMatches(text);
    const input = censor.applyTo(text, matches);
    if (input !== `` && input.length <= 100) {
        isProcessing = true;
        chatroom.set(input);
        document.getElementById(`input`).value = ``;
        button.disabled = true;
        await sleep(3000);
        button.disabled = false;
        isProcessing = false;
    }
};
