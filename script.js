const gameContainer = document.getElementById('game-container');
const messageBox = document.getElementById('message-box');
const interactionPrompt = document.getElementById('interaction-prompt');
const scenes = document.querySelectorAll('.scene');
const inventory = document.getElementById('inventory');

let playerX = 190;
let playerY = 190;
let moveUp = false;
let moveDown = false;
let moveLeft = false;
let moveRight = false;
let currentScene = 'town';

const housePositions = {};
let plotProgress = 0;
let hasEvidence = false;
let hasTowerKey = false;

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
        const x = 50 + index * 100;
        const y = 50;
        house.style.left = `${x}px`;
        house.style.top = `${y}px`;
        housePositions[house.dataset.house] = { x, y };
    });

    exits.forEach(exit => {
        exit.style.right = '0px';
        exit.style.top = '175px';
    });
}

function updatePlayerPosition() {
    const currentSceneElement = document.querySelector('.scene.active');
    let playerElement = currentSceneElement.querySelector('#player');
    if (!playerElement) {
        playerElement = document.createElement('div');
        playerElement.id = 'player';
        currentSceneElement.appendChild(playerElement);
    }
    playerElement.style.left = `${playerX}px`;
    playerElement.style.top = `${playerY}px`;
}

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

    if (newX >= 0 && newX <= 380 && newY >= 0 && newY <= 380) {
        playerX = newX;
        playerY = newY;
        updatePlayerPosition();
    }

    checkProximity();
    requestAnimationFrame(gameLoop);
}

function checkProximity() {
    let nearObject = false;
    const currentSceneElement = document.querySelector('.scene.active');
    const playerRect = {
        left: playerX,
        top: playerY,
        width: 20,
        height: 20
    };
    const interactables = currentSceneElement.querySelectorAll('.npc, .house, .exit');

    interactables.forEach(obj => {
        const objRect = obj.getBoundingClientRect();
        const sceneRect = currentSceneElement.getBoundingClientRect();
        const adjustedRect = {
            left: objRect.left - sceneRect.left,
            top: objRect.top - sceneRect.top,
            width: objRect.width,
            height: objRect.height
        };

        if (isOverlapping(playerRect, adjustedRect)) {
            if (obj.classList.contains('npc')) {
                showPrompt("Press E to talk", adjustedRect);
            } else if (obj.classList.contains('house')) {
                showPrompt("Press E to enter", adjustedRect);
            } else if (obj.classList.contains('exit')) {
                showPrompt("Press E to exit", adjustedRect);
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
    const currentSceneElement = document.querySelector('.scene.active');
    const playerRect = {
        left: playerX,
        top: playerY,
        width: 20,
        height: 20
    };
    const interactables = currentSceneElement.querySelectorAll('.npc, .house, .exit');

    interactables.forEach(obj => {
        const objRect = obj.getBoundingClientRect();
        const sceneRect = currentSceneElement.getBoundingClientRect();
        const adjustedRect = {
            left: objRect.left - sceneRect.left,
            top: objRect.top - sceneRect.top,
            width: objRect.width,
            height: objRect.height
        };

        if (isOverlapping(playerRect, adjustedRect)) {
            if (obj.classList.contains('npc')) {
                talkToNPC(obj);
            } else if (obj.classList.contains('house')) {
                enterHouse(obj.dataset.house);
            } else if (obj.classList.contains('exit')) {
                exitHouse();
            }
        }
    });
}

function talkToNPC(npc) {
    const message = npc.dataset.message;
    messageBox.textContent = message;
    
    switch(npc.dataset.id) {
        case 'citizen1':
            if (plotProgress === 0) {
                plotProgress = 1;
                messageBox.textContent += " You should check out the library for more information.";
            }
            break;
        case 'librarian':
            if (plotProgress === 1) {
                plotProgress = 2;
                messageBox.textContent += " The secretary at the Town Hall might know more about the mayor's activities.";
            }
            break;
        case 'secretary':
            if (plotProgress === 2) {
                plotProgress = 3;
                messageBox.textContent += " The mystic at the Mystic Shop might have insight into these strange occurrences.";
            }
            break;
        case 'mystic':
            if (plotProgress === 3) {
                plotProgress = 4;
                hasEvidence = true;
                hasTowerKey = true;
                inventory.textContent = "Evidence of dark magic, Tower Key";
                messageBox.textContent += " You now have evidence of the mayor's misdeeds and the key to the tower. Confront the mayor at the Ancient Tower!";
            }
            break;
        case 'mayor':
            if (plotProgress === 4 && hasEvidence) {
                messageBox.textContent = "You confront the mayor with your evidence. He breaks down and confesses to using dark magic for personal gain. The town is saved, but at what cost to its trust in leadership? The citizens will need to rebuild their faith in democracy and work together for a better future.";
                plotProgress = 5; // Game end state
            } else {
                messageBox.textContent = "You're not ready to confront the mayor yet. Gather more evidence!";
            }
            break;
    }
}

function enterHouse(houseNumber) {
    if (houseNumber === '4' && !hasTowerKey) {
        messageBox.textContent = "The tower is locked. You need to find the key first.";
        return;
    }
    currentScene = `house${houseNumber}`;
    updateScene();
    playerX = 190;
    playerY = 350;
    updatePlayerPosition();
    const houseName = document.querySelector(`.house[data-house="${houseNumber}"]`).dataset.name;
    messageBox.textContent = `You entered ${houseName}`;
}

function exitHouse() {
    const previousHouse = currentScene.replace('house', '');
    currentScene = 'town';
    updateScene();
    
    const housePos = housePositions[previousHouse];
    playerX = Math.max(0, Math.min(380, housePos.x + 30));
    playerY = Math.max(0, Math.min(380, housePos.y + 60));
    
    updatePlayerPosition();
    const houseName = document.querySelector(`.house[data-house="${previousHouse}"]`).dataset.name;
    messageBox.textContent = `You exited ${houseName}`;
}

function updateScene() {
    scenes.forEach(scene => scene.classList.remove('active'));
    document.getElementById(currentScene).classList.add('active');
}

function isOverlapping(rect1, rect2) {
    return (rect1.left < rect2.left + rect2.width &&
            rect1.left + rect1.width > rect2.left &&
            rect1.top < rect2.top + rect2.height &&
            rect1.top + rect1.height > rect2.top);
}

// Initialize the game
initializeScene('town');
initializeScene('house1');
initializeScene('house2');
initializeScene('house3');
initializeScene('house4'); // Ancient Tower
updatePlayerPosition();
gameLoop();
