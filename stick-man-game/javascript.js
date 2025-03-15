// Project by Carter Colton

// Extend the base functionality of Javascript
Array.prototype.last = function() {
    return this[this.length - 1]; // the this references the object excuting the current function, so it's Array.prototype.last. Which means that it returns the last element of the array.
};

// A sinus function that accepts degrees instead of radians
Math.sinus = function(degree) {
    return Math.sin((degree/180) * Math.PI);
};

// Game data 
let phase = "waiting"; // waiting | stretching | turning | walking | transitioning | falling
let lastTimestamp; // The timestamp of the previous requestAnimationFrame cycle

let heroX; // Changes when moving forward
let heroY; // Changes when falling
let sceneOffset; // Moves the whole game

let platforms = [];
let sticks = [];
let trees = [];

// Todo: Save high score to localStorage

let score = 0;

// Configuration
const canvasWidth = 375;
const canvasHeight = 375;
const platformHeight = 100;
const heroDistanceFromEdge = 10;
const paddingX = 100;
const perfectAreaSize = 10;

// The background moves slower than the hero
const backgroundSpeedMultiplier = 0.2;

const hill1BaseHeight = 100;
const hill1Amplitude = 10;
const hill1Stretch = 1;
const hill2BaseHeight = 70;
const hill2Amplitude = 20;
const hill2Stretch = 0.5;

const stretchingSpeed = 4; // Miliseconds it takes to draw a pixel
const turningSpeed = 4; // Milliseconds it takes to turn a degree
const walkingSpeed = 4;
const transitioningSpeed = 2;
const fallingSpeed = 2;

const heroWidth = 17; // 24
const heroHeight = 30; // 40

const canvas = document.getElementById("game"); // Document object refers to your webpage. If you want to access any element in an HTML page, you always start with accessing the document object. 
canvas.width = window.innerWidth; // Make the canvas full screen
canvas.height = window.innerHeight; // see https://www.w3schools.com/js/js_window.asp

const ctx = canvas.getContext("2d"); // The getContext function is the function that you use to get access to the canvas tags 2D drawing functions.

const introductionElement = document.getElementById("introduction");
const perfectElement = document.getElementById("perfect");
const restartButton = document.getElementById("restart");
const scoreElement = document.getElementById("score");

// Initialize layout
resetGame();

// Resets game variables and layouts but does not start the game (game starts on keypress)
function resetGame() {
    // Reset game progress
    phase = "waiting";
    lastTimestamp = undefined;
    sceneOffset = 0;
    score = 0;

    introductionElement.style.opacity = 1;
    perfectElement.style.opacity = 0;
    restartButton.style.display = "none";
    scoreElement.innerText = score; // The innerText property returns: Just the text content of the element and all its children, without CSS hidden text spacing and tags, except <script> and <style> elements.

    // The first platform is always the same
    // x + w has to match paddingX
    platforms = [{x: 50, w: 50 }];
    generatePlatform();
    generatePlatform();
    generatePlatform();
    generatePlatform();

    sticks = [{ x: platforms[0].x + platforms[0].w, length: 0, rotation: 0}]; // The platform object uses names to access its members. Thus, we get the value of 50 for x by calling platforms[0].x. The zero indice includes the entire function object because of the {}

    trees = [];
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();

    heroX = platforms[0].x + platforms[0].w - heroDistanceFromEdge;
    heroY = 0;

    draw(); // executes the code in this function until the program is stopped or noLoop() is called
}

function generateTree() {
    const minimumGap = 30;
    const maximumGap = 150;

    // X coordinate of the right edge of the furthest tree
    const lastTree = trees[trees.length - 1];
    let furthestX = lastTree ? lastTree.x : 0; // see https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_comparison
    // Use lastTree.x to get the tree with the maximum x value, because above we defined x to be platforms[0].x + platforms[0].w

    const x = 
        furthestX +
        minimumGap +
        Math.floor(Math.random() * (maximumGap - minimumGap));

    const treeColors = ["#6D8821", "#8FAC34", "#988333"];
    const color = treeColors[Math.floor(Math.random() * 3)]; // floor rounds number down to nearest integer. random yields a random number between 0 and 1. Since we have three choices for colors, we multiply it by 3.

    trees.push({x, color}); // Make our tree
}

function generatePlatform() {
    const minimumGap = 40;
    const maximumGap = 200;
    const minimumWidth = 20;
    const maximumWidth = 100;

    // X coordinate of the right edge of the furthest platfrom
    const lastPlatform = platforms[platforms.length - 1];
    let furthestX = lastPlatform.x + lastPlatform.w;

    const x = 
        furthestX + 
        minimumGap +
        Math.floor(Math.random() * (maximumGap - minimumGap));
    const w =
        minimumWidth + Math.floor(Math.random() * (maximumWidth - minimumWidth));

    platforms.push({ x,w }); // Each platform is stored in an array with an x coordinate and a width
}

resetGame();

// If spacebar was pressed restart the game
window.addEventListener("keyboard", function (event) {
    if (event.key == " ") {
        event.preventDefault(); // cancels the event that was runnning so that resetGame() can start afresh
        resetGame();
        return;
    }
});

window.addEventListener("mousedown", function (event) { // mousedown occurs when the button on a pointing mouse is pressed
    if (phase == "waiting") {
        lastTimestamp = undefined;
        introductionElement.style.opacity = 0; // Get rid of our introductory words
        phase = "stretching"; // set the phase to stretching when an interactor begins to stretch out the stick
        window.requestAnimationFrame(animate); // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser calls a specified function to update an animation right before the next repaint.
    }
});

// When a user or browser interacts with a webpage, and event occurs. Event handlers are used to create a customized piece of code that will run in response to specific events (e.g., opening a pop-up window when a user clicks a button). Some events are user-generated, while some are generated by APIs.
// addEventListener makes adding many event handlers to one element easy — it lets you respond to events associated with an element via an event handler function. The change effect is an example of an event. You can attach an event handler to any DOM object.
// The window above is our target. target is the most important parameter; it specifies the DOM object you wish to attach an event listener to. HTML elements are frequently targeted DOM objects.
// see https://coderpad.io/blog/development/addeventlistener-javascript/#:~:text=addEventListener%20makes%20adding%20many%20event,handler%20to%20any%20DOM%20object.

window.addEventListener("mouseup", function (event) { // mouseup occurs when the button on a pointing mouse is released
    if (phase == "stretching") {
        phase = "turning";
    }
});

window.addEventListener("resize", function (event) { // resize occurs when the browser window changes size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
});

window.requestAnimationFrame(animate);

// The main game loop
function animate(timestamp) {
    if (!lastTimestamp) { // if there is no last time stamp, the game needs to start, so we set last time stamp to a new timestamp and request the aniamtion to begin.
        lastTimestamp = timestamp;
        window.requestAnimationFrame(animate);
        return;
    }

    switch (phase) {
        case "waiting":
            return; // Stop the loop
        case "stretching": {
            sticks.last().length += (timestamp - lastTimestamp) / stretchingSpeed; // add the length of the last stick to the difference of the timestamps (how much time has passed) and divide it by the stretching speed
            break;
        }
        case "turning": {
            sticks.last().rotation += (timestamp - lastTimestamp) / turningSpeed;

            if (sticks.last().rotation > 90) {
                sticks.last().rotation = 90; // if the rotation is greater than 90 make it equal to 90 so that the sticks are level and hit the platforms

                const [nextPlatform, perfectHit] = thePlatformTheStickHits();
                if(nextPlatform) {
                    // Increase score
                    score += perfectHit ? 2 : 1;
                    scoreElement.innerText = score;

                    if (perfectHit) {
                        perfectElement.style.opacity = 1;
                        setTimeout(() => (perfectElement.style.opacity = 0), 1000); 
                    }

                    generatePlatform();
                    generateTree();
                    generateTree();
                }

                phase = "walking";
            }
            break;
        }
        case "walking": {
            heroX += (timestamp - lastTimestamp) / walkingSpeed; // miliseconds / (miliseconds per one pixel movement) = number of pixels moved. We then add this to heroX to get the character's new x coordinate and set that to be heroX.

            const [nextPlatform] = thePlatformTheStickHits();
            if (nextPlatform) {
                // If the hero will reach another platform then limit it's position at it's edge
                const maxHeroX = nextPlatform.x + nextPlatform.w - heroDistanceFromEdge; // x must be the left edge of the platform and w is the right edge or the width.
                if (heroX > maxHeroX) {
                    heroX = maxHeroX;
                    phase = "transitioning";
                }
            } else {
                // If the hero won't reach another platform then limits it's position at the end of the pole
                const maxHeroX = sticks.last().x + sticks.last().length + heroWidth;
                if (heroX > maxHeroX) {
                    heroX = maxHeroX;
                    phase = "falling";
                }
            }
            break;
        }
        case "transitioning": {
            sceneOffset += (timestamp - lastTimestamp) / transitioningSpeed;

            const [nextPlatform] = thePlatformTheStickHits();
            if (sceneOffset > nextPlatform.x + nextPlatform.w - paddingX) {
                // Add the next step
                sticks.push({
                    x: nextPlatform.x + nextPlatform.w,
                    length: 0,
                    rotation: 0
                });
                phase = "waiting";
            }
            break;
        }
        case "falling": {
            if (sticks.last().rotation < 180)
                sticks.last().rotation += (timestamp - lastTimestamp) / turningSpeed;

            heroY += (timestamp - lastTimestamp) / fallingSpeed;
            const maxHeroY = 
                platformHeight + 100 + (window.innerHeight - canvasHeight) / 2;
            if (heroY > maxHeroY) {
                restartButton.style.display = "block";
                return;
            }
            break;
        }
        default:
            throw Error("Wrong phase");
    }

    draw();
    window.requestAnimationFrame(animate);

    lastTimestamp = timestamp;
}

// Returns the platform the stick hit (if it didn't hit any stick then return undefined)
function thePlatformTheStickHits() {
    if (sticks.last().rotation != 90) // If the rotation is not 90 it means that the character did not land on a platform
        throw Error(`Stick is ${sticks.last().rotation}*`);
    const stickFarX = sticks.last().x + sticks.last().length; // sticks.last() gives the last stick in our array. The sticks.last().x gives us its x coordinate. Then, we add the length to it to draw the stick length from the given x coordinate to the new platform.
    // essentially we're adding the stick length to the previous x coordinate

    const platformTheStickHits = platforms.find(
        (platform) => platform.x < stickFarX && stickFarX < platform.x + platform.w
    ); // if the x coordinate (the left-most edge) of the platform is less than the stickFarX coordinate and the stickFarX coordinat is less than the platform x coordinate plus its width, then the character makes the next platform.

    // If the stick hits the perfect area
    if (
        platformTheStickHits &&
        platformTheStickHits.x + platformTheStickHits.w / 2 - perfectAreaSize / 2 <
            stickFarX &&
        stickFarX <
            platformTheStickHits.x + platformTheStickHits.w / 2 + perfectAreaSize / 2
    )
        return [platformTheStickHits, true];

    return [platformTheStickHits, false];
}

function draw() {
    ctx.save();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); // clearRect clears our canvas clearRect(x od top left corner, y of top left corner, width, height)

    drawBackground();

    // Center main canvas area to the middle of the screen
    ctx.translate(
        (window.innerWidth - canvasWidth) / 2 - sceneOffset,
        (window.innerHeight - canvasHeight) / 2
    );

    // Draw scene
    drawPlatforms();
    drawHero();
    drawSticks();

    // Restore transformation
    ctx.restore();
}

restartButton.addEventListener("click", function (event) {
    event.preventDefault();
    resetGame();
    restartButton.style.display = "none";
});

function drawPlatforms() {
    platforms.forEach(({ x, w }) => {
        // Draw platform
        ctx.fillStyle = "black";
        ctx.fillRect(
            x, // x coordinate of top left part of platform
            canvasHeight - platformHeight, // y coordinate of top left part of platform
            w, // width
            platformHeight + (window.innerHeight - canvasHeight) / 2 // height
        );

        // Draw perfect area only if hero did not yet reach the platform
        if (sticks.last().x < x) {
            ctx.fillStyle = "red";
            ctx.fillRect(
                x + w / 2 - perfectAreaSize / 2,
                canvasHeight - platformHeight,
                perfectAreaSize,
                perfectAreaSize
            );
        }
    });
}

function drawHero() {
    ctx.save();
    ctx.fillStyle = "black";
    ctx.translate(
        heroX - heroWidth / 2,
        heroY + canvasHeight - platformHeight - heroHeight / 2
    );

    // Body
    drawRoundedRect(
        -heroWidth / 2,
        -heroHeight / 2,
        heroWidth,
        heroHeight - 4,
        5
    );

    // Legs
    const legDistance = 5;
    ctx.beginPath(); // clears path so we can start afresh
    ctx.arc(legDistance, 11.5, 3, 0, Math.PI * 2, false); // (x coordinate of center, y coordinate of center, radius, startAngle,  endAngle, counterclockwise: true or false) draws an arc
    ctx.fill(); // fills the current path, will fill our drawn arc with black
    ctx.beginPath();
    ctx.arc(-legDistance, 11.5, 3, 0, Math.PI * 2, false); // the x and y coordinates are based on the ctx.translate element we set above
    ctx.fill();

    // Eye
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(5, -7, 3, 0, Math.Pi * 2, false);
    ctx.fill(); // fills with white because we set fillStyle to white

    // Band
    ctx.fillStyle = "red";
    ctx.fillRect(-heroWidth / 2 - 1, -12, heroWidth + 2, 4.5);
    ctx.beginPath();
    ctx.moveTo(-9, 14.5); // we start here
    ctx.lineTo(-17, -18.5); // we draw a line to here
    ctx.lineTo(-14, -8.5); // we draw a second line to here
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, -10.5); // we start here
    ctx.lineTo(-15, -3.5); // draw another line to here
    ctx.lineTo(-5, -7); // draw another line to here
    ctx.fill();

    ctx.restore(); // restore to the start saved by the most recent call to save
}

function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius); // (x1, y1, x2, y2, radius)
    ctx.lineTo(x + width - radius, y + height);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.lineTo(x + width, y + radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.lineTo(x + radius, y);
    ctx.arcTo(x, y, x, y + radius, radius);
    ctx.fill();
}

function drawSticks() {
    sticks.forEach((stick) => {
        ctx.save();

        // Move another point to the start of the stick and rotate
        ctx.translate(stick.x, canvasHeight - platformHeight);
        ctx.rotate((Math.PI / 180) * stick.rotation);

        // Draw stick
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -stick.length);
        ctx.stroke(); // draw but do not fill

        // Restore transformations
        ctx.restore();
    });
}

function drawBackground() {
    // Draw sky
    var gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight); // (x0, y0, x1, y1) (x0, y0) are start point of gradient (x1, y1) art end point of gradient
    gradient.addColorStop(0, "#BBD691"); // 0 represents start of graident and the second element is the color
    gradient.addColorStop(1, "#FEF1E1"); //  1 represents the end of the gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight); // Then we will the entire window with the gradient we created

    // Draw Hills
    drawHill(hill1BaseHeight, hill1Amplitude, hill1Stretch, "#95C629");
    drawHill(hill2BaseHeight, hill2Amplitude, hill2Stretch, "#659F1C");

    // Draw trees
    trees.forEach((tree) => drawTree(tree.x, tree.color));
}

// A hill is a shape under a stretched out sinus wave
function drawHill(baseHeight, amplitude, stretch, color) {
    ctx.beginPath();
    ctx.moveTo(0, window.innerHeight);
    ctx.lineTo(0, getHillY(0, baseHeight, amplitude, stretch));
    for (let i = 0; i < window.innerWidth; i++) {
        ctx.lineTo(i, getHillY(i, baseHeight, amplitude, stretch));
    }
    ctx.lineTo(window.innerWidth, window.innerHeight);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawTree(x, color) {
    ctx.save();
    ctx.translate(
        (-sceneOffset * backgroundSpeedMultiplier + x) * hill1Stretch,
        getTreeY(x, hill1BaseHeight, hill1Amplitude) // Set where the trees will be
    );

    const treeTrunkHeight = 5;
    const treeTrunkWidth = 2;
    const treeCrownHeight = 25;
    const treeCrownWidth = 10;

    // Draw trunk
    ctx.fillStyle = "#7D833C";
    ctx.fillRect(
        -treeTrunkWidth / 2,
        -treeTrunkHeight,
        treeTrunkWidth,
        treeTrunkHeight
    );

    // Draw crown
    ctx.beginPath();
    ctx.moveTo(-treeCrownWidth / 2, -treeTrunkHeight);
    ctx.lineTo(0, -(treeTrunkHeight + treeCrownHeight));
    ctx.lineTo(treeCrownWidth / 2, -treeTrunkHeight);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
}

function getHillY(windowX, baseHeight, amplitude, stretch) {
    const sineBaseY = window.innerHeight - baseHeight;
    return (
        Math.sinus((sceneOffset * backgroundSpeedMultiplier + windowX) * stretch) *
            amplitude + 
        sineBaseY
    );
}

function getTreeY(x, baseHeight, amplitude) {
    const sineBaseY = window.innerHeight - baseHeight;
    return Math.sinus(x) * amplitude + sineBaseY;
}
