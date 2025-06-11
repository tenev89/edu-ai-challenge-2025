const readline = require('readline');

/**
 * Constants for game configuration
 */
const CONFIG = {
    BOARD_SIZE: 10,
    NUM_SHIPS: 3,
    SHIP_LENGTH: 3,
    SYMBOLS: {
        WATER: '~',
        SHIP: 'S',
        HIT: 'X',
        MISS: 'O'
    }
};

/**
 * Ship class representing a battleship
 */
class Ship {
    constructor(locations) {
        this.locations = locations;
        this.hits = new Array(locations.length).fill(false);
    }

    /**
     * Attempts to hit the ship at a given location
     * @param {string} location - The location to hit (e.g., "34")
     * @returns {boolean} - True if hit, false otherwise
     */
    hit(location) {
        const index = this.locations.indexOf(location);
        if (index >= 0 && !this.hits[index]) {
            this.hits[index] = true;
            return true;
        }
        return false;
    }

    /**
     * Checks if the ship is sunk
     * @returns {boolean} - True if all parts are hit
     */
    isSunk() {
        return this.hits.every(hit => hit === true);
    }

    /**
     * Checks if a location is part of this ship
     * @param {string} location - The location to check
     * @returns {boolean} - True if location is part of ship
     */
    hasLocation(location) {
        return this.locations.includes(location);
    }
}

/**
 * Board class managing the game board
 */
class Board {
    constructor() {
        this.size = CONFIG.BOARD_SIZE;
        this.grid = this.initializeGrid();
        this.ships = [];
    }

    /**
     * Creates an empty grid
     * @returns {Array<Array<string>>} - The initialized grid
     */
    initializeGrid() {
        return Array(this.size).fill(null).map(() => 
            Array(this.size).fill(CONFIG.SYMBOLS.WATER)
        );
    }

    /**
     * Places ships randomly on the board
     * @param {number} numShips - Number of ships to place
     * @param {number} shipLength - Length of each ship
     */
    placeShipsRandomly(numShips, shipLength) {
        let placedShips = 0;
        
        while (placedShips < numShips) {
            const ship = this.createRandomShip(shipLength);
            if (ship && this.isValidPlacement(ship.locations)) {
                this.addShip(ship);
                placedShips++;
            }
        }
    }

    /**
     * Generates a random ship with valid placement
     * @param {number} length - Length of the ship
     * @returns {Ship|null} - The generated ship or null if invalid
     */
    createRandomShip(length) {
        const isHorizontal = Math.random() < 0.5;
        let startRow, startCol;

        if (isHorizontal) {
            startRow = Math.floor(Math.random() * this.size);
            startCol = Math.floor(Math.random() * (this.size - length + 1));
        } else {
            startRow = Math.floor(Math.random() * (this.size - length + 1));
            startCol = Math.floor(Math.random() * this.size);
        }

        const locations = [];
        for (let i = 0; i < length; i++) {
            const row = isHorizontal ? startRow : startRow + i;
            const col = isHorizontal ? startCol + i : startCol;
            locations.push(`${row}${col}`);
        }

        return new Ship(locations);
    }

    /**
     * Checks if a ship can be placed at given locations
     * @param {Array<string>} locations - Array of location strings
     * @returns {boolean} - True if ship can be placed
     */
    isValidPlacement(locations) {
        return locations.every(location => {
            const [row, col] = this.parseLocation(location);
            return this.isInBounds(row, col) && 
                   this.grid[row][col] === CONFIG.SYMBOLS.WATER;
        });
    }

    /**
     * Adds a ship to the board
     * @param {Ship} ship - The ship to add
     */
    addShip(ship) {
        this.ships.push(ship);
        if (this.showShips) {
            ship.locations.forEach(location => {
                const [row, col] = this.parseLocation(location);
                this.grid[row][col] = CONFIG.SYMBOLS.SHIP;
            });
        }
    }

    /**
     * Processes a guess at a location
     * @param {string} location - The location to guess
     * @returns {Object} - Result object with hit status and ship info
     */
    processGuess(location) {
        const [row, col] = this.parseLocation(location);
        
        for (const ship of this.ships) {
            if (ship.hit(location)) {
                this.grid[row][col] = CONFIG.SYMBOLS.HIT;
                return { hit: true, sunk: ship.isSunk(), location };
            }
        }
        
        this.grid[row][col] = CONFIG.SYMBOLS.MISS;
        return { hit: false, sunk: false, location };
    }

    /**
     * Parses a location string into row and column
     * @param {string} location - Location string (e.g., "34")
     * @returns {Array<number>} - [row, col] array
     */
    parseLocation(location) {
        return [parseInt(location[0]), parseInt(location[1])];
    }

    /**
     * Gets the number of ships still afloat
     * @returns {number} - Number of unsunk ships
     */
    getShipsRemaining() {
        return this.ships.filter(ship => !ship.isSunk()).length;
    }

    /**
     * Displays the board
     * @param {boolean} hideShips - Whether to hide ship positions
     * @returns {string} - Formatted board string
     */
    display(hideShips = false) {
        let output = '  ';
        for (let i = 0; i < this.size; i++) {
            output += `${i} `;
        }
        output += '\n';

        for (let row = 0; row < this.size; row++) {
            output += `${row} `;
            for (let col = 0; col < this.size; col++) {
                let symbol = this.grid[row][col];
                if (hideShips && symbol === CONFIG.SYMBOLS.SHIP) {
                    symbol = CONFIG.SYMBOLS.WATER;
                }
                output += `${symbol} `;
            }
            output += '\n';
        }
        return output;
    }

    /**
     * Checks if a location is within bounds
     * @param {number} row - Row coordinate
     * @param {number} col - Column coordinate
     * @returns {boolean} - True if valid
     */
    isInBounds(row, col) {
        return row >= 0 && row < this.size && col >= 0 && col < this.size;
    }
}

/**
 * Player class for human player
 */
class Player {
    constructor(name = 'Player') {
        this.name = name;
        this.board = new Board();
        this.board.showShips = true;
        this.guesses = new Set();
    }

    /**
     * Places ships on the player's board
     */
    placeShips() {
        this.board.placeShipsRandomly(CONFIG.NUM_SHIPS, CONFIG.SHIP_LENGTH);
    }

    /**
     * Validates a guess
     * @param {string} guess - The guess to validate
     * @returns {Object} - Validation result
     */
    validateGuess(guess) {
        if (!guess || guess.length !== 2) {
            return { 
                valid: false, 
                message: 'Oops, input must be exactly two digits (e.g., 00, 34, 98).' 
            };
        }

        const [row, col] = guess.split('').map(Number);
        
        if (isNaN(row) || isNaN(col) || 
            row < 0 || row >= CONFIG.BOARD_SIZE || 
            col < 0 || col >= CONFIG.BOARD_SIZE) {
            return { 
                valid: false, 
                message: `Oops, please enter valid row and column numbers between 0 and ${CONFIG.BOARD_SIZE - 1}.` 
            };
        }

        if (this.guesses.has(guess)) {
            return { valid: false, message: 'You already guessed that location!' };
        }

        return { valid: true };
    }

    /**
     * Makes a guess
     * @param {string} guess - The guess location
     * @returns {Object|null} - Guess result or null if invalid
     */
    makeGuess(guess) {
        const validation = this.validateGuess(guess);
        if (!validation.valid) {
            return validation;
        }

        this.guesses.add(guess);
        return { valid: true, guess };
    }
}

/**
 * CPU class for AI opponent
 */
class CPU {
    constructor(name = 'CPU') {
        this.name = name;
        this.board = new Board();
        this.guesses = new Set();
        this.mode = 'hunt'; // 'hunt' or 'target'
        this.targetQueue = [];
    }

    /**
     * Places ships on the CPU's board
     */
    placeShips() {
        this.board.placeShipsRandomly(CONFIG.NUM_SHIPS, CONFIG.SHIP_LENGTH);
    }

    /**
     * Makes a guess using AI logic
     * @returns {string} - The guess location
     */
    makeGuess() {
        let guess;

        if (this.mode === 'target' && this.targetQueue.length > 0) {
            guess = this.targetQueue.shift();
            if (this.guesses.has(guess)) {
                if (this.targetQueue.length === 0) {
                    this.mode = 'hunt';
                }
                return this.makeGuess(); // Recursive call to get next guess
            }
        } else {
            this.mode = 'hunt';
            guess = this.generateRandomGuess();
        }

        this.guesses.add(guess);
        return guess;
    }

    /**
     * Generates a random guess
     * @returns {string} - Random location string
     */
    generateRandomGuess() {
        let guess;
        do {
            const row = Math.floor(Math.random() * CONFIG.BOARD_SIZE);
            const col = Math.floor(Math.random() * CONFIG.BOARD_SIZE);
            guess = `${row}${col}`;
        } while (this.guesses.has(guess));
        
        return guess;
    }

    /**
     * Processes the result of a guess
     * @param {Object} result - The guess result
     */
    processGuessResult(result) {
        if (result.hit) {
            if (result.sunk) {
                this.mode = 'hunt';
                this.targetQueue = [];
            } else {
                this.mode = 'target';
                this.addAdjacentTargets(result.location);
            }
        } else if (this.mode === 'target' && this.targetQueue.length === 0) {
            this.mode = 'hunt';
        }
    }

    /**
     * Adds adjacent locations to target queue
     * @param {string} location - The hit location
     */
    addAdjacentTargets(location) {
        const [row, col] = location.split('').map(Number);
        const adjacentPositions = [
            { r: row - 1, c: col },
            { r: row + 1, c: col },
            { r: row, c: col - 1 },
            { r: row, c: col + 1 }
        ];

        adjacentPositions.forEach(({ r, c }) => {
            if (this.isValidPosition(r, c)) {
                const adjLocation = `${r}${c}`;
                if (!this.guesses.has(adjLocation) && !this.targetQueue.includes(adjLocation)) {
                    this.targetQueue.push(adjLocation);
                }
            }
        });
    }

    /**
     * Validates if a location is within bounds
     * @param {number} row - Row coordinate
     * @param {number} col - Column coordinate
     * @returns {boolean} - True if valid
     */
    isValidPosition(row, col) {
        return row >= 0 && row < CONFIG.BOARD_SIZE && 
               col >= 0 && col < CONFIG.BOARD_SIZE;
    }
}

/**
 * Main Game class that orchestrates the entire game
 */
class Game {
    constructor() {
        this.player = new Player();
        this.cpu = new CPU();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.gameOver = false;
    }

    /**
     * Initializes the game
     */
    initialize() {
        console.log('Boards created.');
        this.player.placeShips();
        this.cpu.placeShips();
        console.log(`${CONFIG.NUM_SHIPS} ships placed randomly for Player.`);
        console.log(`${CONFIG.NUM_SHIPS} ships placed randomly for CPU.`);
        console.log(`\nLet's play Sea Battle!`);
        console.log(`Try to sink the ${CONFIG.NUM_SHIPS} enemy ships.`);
    }

    /**
     * Displays both boards side by side
     */
    displayBoards() {
        console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
        
        const opponentLines = this.cpu.board.display(true).split('\n');
        const playerLines = this.player.board.display(false).split('\n');
        
        for (let i = 0; i < Math.max(opponentLines.length, playerLines.length); i++) {
            const opponentLine = opponentLines[i] || '';
            const playerLine = playerLines[i] || '';
            console.log(`${opponentLine.padEnd(25)} ${playerLine}`);
        }
        console.log();
    }

    /**
     * Processes the player's turn
     * @param {string} guess - The player's guess
     * @returns {Promise<boolean>} - True if valid guess was made
     */
    processPlayerTurn(guess) {
        const guessResult = this.player.makeGuess(guess);
        
        if (!guessResult.valid) {
            console.log(guessResult.message);
            return false;
        }

        const result = this.cpu.board.processGuess(guess);
        
        if (result.hit) {
            console.log('PLAYER HIT!');
            if (result.sunk) {
                console.log('You sunk an enemy battleship!');
            }
        } else {
            console.log('PLAYER MISS.');
        }

        return true;
    }

    /**
     * Processes the CPU's turn
     */
    processCPUTurn() {
        console.log("\n--- CPU's Turn ---");
        
        const guess = this.cpu.makeGuess();
        console.log(`CPU ${this.cpu.mode === 'target' ? 'targets' : 'guesses'}: ${guess}`);
        
        const result = this.player.board.processGuess(guess);
        
        if (result.hit) {
            console.log(`CPU HIT at ${guess}!`);
            if (result.sunk) {
                console.log('CPU sunk your battleship!');
            }
        } else {
            console.log(`CPU MISS at ${guess}.`);
        }

        this.cpu.processGuessResult(result);
    }

    /**
     * Checks if the game is over
     * @returns {boolean} - True if game is over
     */
    checkGameOver() {
        if (this.cpu.board.getShipsRemaining() === 0) {
            console.log('\n*** CONGRATULATIONS! You sunk all enemy battleships! ***');
            this.displayBoards();
            return true;
        }
        
        if (this.player.board.getShipsRemaining() === 0) {
            console.log('\n*** GAME OVER! The CPU sunk all your battleships! ***');
            this.displayBoards();
            return true;
        }
        
        return false;
    }



    /**
     * Main game loop
     */
    gameLoop() {
        if (this.checkGameOver()) {
            this.rl.close();
            return;
        }

        this.displayBoards();
        
        this.rl.question('Enter your guess (e.g., 00): ', (answer) => {
            const validGuess = this.processPlayerTurn(answer);
            
            if (validGuess) {
                if (this.checkGameOver()) {
                    this.rl.close();
                    return;
                }
                
                this.processCPUTurn();
                
                if (this.checkGameOver()) {
                    this.rl.close();
                    return;
                }
            }
            
            this.gameLoop();
        });
    }

    /**
     * Starts the game
     */
    start() {
        this.initialize();
        this.gameLoop();
    }
}

// Start the game
const game = new Game();
game.start(); 