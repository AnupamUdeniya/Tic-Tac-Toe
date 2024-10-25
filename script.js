const boardElement = document.getElementById("board");
const cells = document.querySelectorAll(".cell");
const messageElement = document.getElementById("message");
const restartButton = document.getElementById("restart");
const playerScoreElement = document.getElementById("playerScore");
const player2ScoreElement = document.getElementById("player2Score");
const gameModeSelect = document.getElementById("gameModeSelect");

let currentPlayer = "X"; // Player 1
let board = Array(9).fill(" ");
let player1Score = 0;
let player2Score = 0; // Score for Player 2 (multiplayer)
let aiScore = 0; // Score for the AI
let gameMode = "multiplayer"; // Default to multiplayer

// Display scores
function updateScore() {
    playerScoreElement.textContent = `Player 1 (X) Score: ${player1Score}`;
    player2ScoreElement.textContent = gameMode === "multiplayer"
        ? `Player 2 (O) Score: ${player2Score}`
        : `Robo (O) Score: ${aiScore}`;
}

// Function to apply win effects
function applyWinEffects(winner) {
    const winBackground = winner === "X" ? "#d1c4e9" : "#ffcdd2"; // Light purple for Player 1, light red for Player 2
    document.body.style.backgroundColor = winBackground;

    const overlay = document.createElement("div");
    overlay.classList.add("win-overlay");
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.classList.add("show");
    }, 100); // Delay to allow the overlay to be created before showing

    cells.forEach(cell => cell.removeEventListener("click", handleCellClick));
}

function minimax(board, depth, isMaximizing) {
    const scores = {
        X: -1,
        O: 1,
        draw: 0
    };

    // Check for a terminal state (win/draw)
    if (checkWin("O")) return scores.O; // AI wins
    if (checkWin("X")) return scores.X; // Player wins
    if (board.every(cell => cell !== " ")) return scores.draw; // Draw

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === " ") {
                board[i] = "O"; // AI's turn
                const score = minimax(board, depth + 1, false);
                board[i] = " "; // Undo move
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === " ") {
                board[i] = "X"; // Player's turn
                const score = minimax(board, depth + 1, true);
                board[i] = " "; // Undo move
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function aiMove() {
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === " ") {
            board[i] = "O"; // AI's move
            const score = minimax(board, 0, false);
            board[i] = " "; // Undo move

            if (score > bestScore) {
                bestScore = score;
                move = i; // Best move for AI
            }
        }
    }

    board[move] = "O"; // Make the best move
    cells[move].textContent = "O"; // Update the UI
    currentPlayer = "X"; // Switch back to player
}

function handleCellClick(event) {
    const cell = event.target;
    const index = cell.getAttribute("data-index");

    if (board[index] !== " ") {
        return; // Cell already filled
    }

    board[index] = currentPlayer;
    cell.textContent = currentPlayer;

    if (checkWin(currentPlayer)) {
        messageElement.textContent = `Player ${currentPlayer} wins!`;
        if (currentPlayer === "X") {
            player1Score++;
        } else if (currentPlayer === "O") {
            if (gameMode === "ai") {
                aiScore++;
            } else {
                player2Score++;
            }
        }
        updateScore();
        applyWinEffects(currentPlayer); // Apply win effects
    } else if (board.every(cell => cell !== " ")) {
        messageElement.textContent = "It's a draw!";
    } else {
        currentPlayer = gameMode === "multiplayer" ? (currentPlayer === "X" ? "O" : "X") : "O"; // Switch player or let AI play
        if (gameMode === "ai" && currentPlayer === "O") {
            aiMove(); // AI makes a move
            if (checkWin("O")) {
                messageElement.textContent = "Robo (O) wins!";
                aiScore++;
                updateScore();
                applyWinEffects("O"); // Apply win effects for AI
            }
        }
    }
}

function checkWin(player) {
    const winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    return winConditions.some(condition =>
        condition.every(index => board[index] === player)
    );
}

function restartGame() {
    board.fill(" ");
    cells.forEach(cell => {
        cell.textContent = "";
        cell.addEventListener("click", handleCellClick);
    });
    currentPlayer = "X"; // Reset to Player 1
    messageElement.textContent = "";
    document.body.style.backgroundColor = ""; // Reset background
    const overlay = document.querySelector(".win-overlay");
    if (overlay) overlay.remove(); // Remove overlay
}

// Reset scores when game mode changes
function resetScores() {
    if (gameMode === "multiplayer") {
        player1Score = 0;
        player2Score = 0;
    } else {
        aiScore = 0;
    }
    updateScore();
}

// Initialize scores
updateScore();

cells.forEach(cell => {
    cell.addEventListener("click", handleCellClick);
});

restartButton.addEventListener("click", restartGame);

// Game mode selection
gameModeSelect.addEventListener("change", (event) => {
    gameMode = event.target.value; // Update game mode based on selection
    resetScores(); // Reset scores when changing mode
    restartGame(); // Restart the game to apply changes
});
