const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const messageBox = document.getElementById('message-box');
const interactionPrompt = document.getElementById('interaction-prompt');
const scenes = document.querySelectorAll('.scene');

let playerX = 190;
let playerY = 190;
let moveUp = false;
let moveDown = false;
let moveLeft = false;
let moveRight = false;
let currentScene = 'town';

function initializeScene(sceneName) {
    const scene = document.getElementById(sceneName);
    const npcs = scene.querySelectorAll('.npc');
    const houses = scene.querySelectorAll('.house');
    const exits = scene.querySelectorAll('.exit');

    npcs.forEach(npc => {
        npc.style.left = `${Math.floor(Math.random() * 380)}px`;
        npc.style.top = `${Math.floor(Math.random() * 380)}px`;
    });

    houses.forEach((house, index) => {
        house.style.left = `${50 + index * 200}px`;
        house.style.top = '50px';
    });

    exits.forEach(exit => {
        exit.style.right = '0px';
        exit.style.top = '175px';
    });
}

initializeScene('town');
initializeScene('house1');
initializeScene('house2');

document.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
        case 'w': moveUp = true; break;
        case 's': moveDown = true; break;
        case 'a': moveLeft = true; break;
        case 'd': moveRight = true; break;
        case 'e': interact(); break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.key.toLowerCase()) {
        case 'w': moveUp = false; break;
        case 's': moveDown = false; break;
        case 'a': moveLeft = false; break;
        case 'd': moveRight = false; break;
    }
});

function gameLoop() {
    const step = 2;
    let newX = playerX;
    let newY = playerY;

    if (moveUp) newY -= step;
    if (moveDown) newY += step;
    if (moveLeft) newX -= step;
    if (moveRight) newX += step;

    if (canMove(newX, newY)) {
        playerX = newX;
        playerY = newY;
        player.style.top = `${playerY}px`;
        player.style.left = `${playerX}px`;
    }

    checkProximity();
    requestAnimationFrame(gameLoop);
}

function canMove(x, y) {
    const currentSceneElement = document.querySelector('.scene.active');
    const objects = currentSceneElement.querySelectorAll('.npc, .house, .exit');
    const playerRect = {left: x, top: y, right: x + 20, bottom: y + 20};

    for (let obj of objects) {
        const objRect = obj.getBoundingClientRect();
        if (
            playerRect.left < objRect.right &&
            playerRect.right > objRect.left &&
            playerRect.top < objRect.bottom &&
            playerRect.bottom > objRect.top
        ) {
            return false;
        }
    }

    return x >= 0 && x <= 380 && y >= 0 && y <= 380;
}

function checkProximity() {
    let nearObject = false;
    const playerRect = player.getBoundingClientRect();
    const currentSceneElement = document.querySelector('.scene.active');
    const interactables = currentSceneElement.querySelectorAll('.npc, .house, .exit');

    interactables.forEach(obj => {
        const objRect = obj.getBoundingClientRect();
        if (isNear(playerRect, objRect)) {
            if (obj.classList.contains('npc')) {
                showPrompt("Press E to talk", objRect);
            } else if (obj.classList.contains('house')) {
                showPrompt("Press E to enter house", objRect);
            } else if (obj.classList.contains('exit')) {
                showPrompt("Press E to exit", objRect);
            }
            nearObject = true;
        }
    });

    if (!nearObject) {
        hidePrompt();
    }
}

function showPrompt(text, rect) {
    interactionPrompt.textContent = text;
    interactionPrompt.style.display = 'block';
    interactionPrompt.style.left = `${rect.left}px`;
    interactionPrompt.style.top = `${rect.top - 30}px`;
}

function hidePrompt() {
    interactionPrompt.style.display = 'none';
}

function interact() {
    const playerRect = player.getBoundingClientRect();
    const currentSceneElement = document.querySelector('.scene.active');
    const interactables = currentSceneElement.querySelectorAll('.npc, .house, .exit');

    interactables.forEach(obj => {
        const objRect = obj.getBoundingClientRect();
        if (isNear(playerRect, objRect)) {
            if (obj.classList.contains('npc')) {
                messageBox.textContent = obj.dataset.message;
            } else if (obj.classList.contains('house')) {
                enterHouse(obj.dataset.house);
            } else if (obj.classList.contains('exit')) {
                exitHouse();
            }
        }
    });
}

function enterHouse(houseNumber) {
    currentScene = `house${houseNumber}`;
    updateScene();
    playerX = 190;
    playerY = 350;
    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
    messageBox.textContent = `You entered house ${houseNumber}`;
}

function exitHouse() {
    currentScene = 'town';
    updateScene();
    playerX = 190;
    playerY = 190;
    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
    messageBox.textContent = 'You exited the house';
}

function updateScene() {
    scenes.forEach(scene => scene.classList.remove('active'));
    document.getElementById(currentScene).classList.add('active');
}

function isNear(rect1, rect2) {
    return Math.abs(rect1.left - rect2.left) < 30 && Math.abs(rect1.top - rect2.top) < 30;
}

gameLoop();