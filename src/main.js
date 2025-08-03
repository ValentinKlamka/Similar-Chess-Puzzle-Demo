import { createSettingsPanel, createHelpPanel, createSidebar, createNavigationButtons, createSettingsAndHelpButtons, drawArrow } from './ui.js';
import {createImportPanel} from './import_panel.js';
import { fetchEventSource } from 'https://cdn.skypack.dev/@microsoft/fetch-event-source';
// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js
let chessPuzzle = null;
// Expose the function globally

let pingInterval = setInterval(() => {
  if (tokenManager.isAuthenticated()) {
    fetchWithAuth("https://api.valentinklamka.de/api/keepalive", {
      method: 'POST',
      credentials: 'omit' // No need for credentials with token auth
    });
  }
}, 10000); // every 10s




var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')

let puzzles = []; // Store the list of puzzles
let currentPuzzleIndex = 0; // Track the current puzzle index
let isPuzzleFromHistory = false; // Track if the current puzzle is from history
let isSearchingSimilar = false; // Flag to differentiate between normal and similar search
let searchParams = {
  themes: '',
  min_rating: 0,
  max_rating: 3000,
  min_popularity: 50,
};

const FIRST_RANK = 1; // For black pawns
const EIGTH_RANK = 8; // For white pawns

const searchManager = {
  isInProgress: false,
  currentId: 0,

  startSearch() {
    const isReplacing = this.isInProgress;
    this.isInProgress = true;
    this.currentId++;
    return {
      id: this.currentId,
      isReplacing
    };
  },

  isStillCurrent(id) {
    return id === this.currentId;
  },

  endSearch() {
    this.isInProgress = false;
  }
};


class ChessPuzzle {
  constructor(puzzle) {
    this.puzzle_id = puzzle.puzzle_id;
    this.initialFen = puzzle.fen;
    this.board = null;
    this.game = new Chess(this.initialFen);
    this.themes = puzzle.themes;
    this.rating = puzzle.rating;
    this.currentMoveIndex = 0;
    this.exploredMoves = [];
    this.movesArray = puzzle.moves.split(' ');
    this.moves_ton = puzzle.moves_ton;

    this.reference_puzzle = puzzle.reference_puzzle || null;
    this.score = puzzle.score || null;
    this.mark = puzzle.mark || null;

    // Add this new property to determine if puzzle starts with player move
    this.startsWithPlayerMove = this.movesArray.length % 2 === 1; // Odd number of moves means player starts
  }

  initializeBoard() {
    this.board = Chessboard('board', config); // Initialize the chessboard
    this.updateHintButtonState(); // Update hint button state after initializing
    this.updateNavigationButtonStates()
  }


  updateHintButtonState() {
    const hintButton = document.getElementById('hint-button');

    const shouldDisable = this.exploredMoves.length !== this.currentMoveIndex;
    hintButton.disabled = shouldDisable;

    const hintIcon = hintButton.querySelector('img');
    if (hintIcon) {
      if (shouldDisable) {
        hintIcon.classList.add('hint-disabled');
      } else {
        hintIcon.classList.remove('hint-disabled');
      }
    }

    hintButton.style.cursor = shouldDisable ? 'not-allowed' : 'pointer';

  }


  updateNavigationButtonStates() {
    const backwardButton = document.getElementById('backward-button');
    const forwardButton = document.getElementById('forward-button');
    backwardButton.disabled = this.currentMoveIndex === 0;
    forwardButton.disabled = this.currentMoveIndex >= this.exploredMoves.length;
  }

  reinitialize() {
    this.game = new Chess(this.initialFen);
    this.exploredMoves = [];
    this.currentMoveIndex = 0;
    this.board.position(this.game.fen(), false);
    this.currentMoveIndex = 0;
    this.updateHintButtonState(); // Update hint button state
    this.updateNavigationButtonStates(); // Update navigation button states
  }

  resetBoard() {
    resetBoardToExploredState(this.game, this.initialFen, this.exploredMoves);
    this.board.position(this.game.fen(), false);
    this.updateHintButtonState(); // Update hint button state
    this.updateNavigationButtonStates(); // Update navigation button states
  }
  setMetadata({ mark }) {
    this.mark = mark;
  }

  serialize() {
    return {
      puzzle_id: this.puzzle_id,
      fen: this.initialFen,
      moves: this.movesArray.join(' '),
      themes: this.themes,
      rating: this.rating,
      moves_ton: this.moves_ton,
      reference_puzzle: this.reference_puzzle,
      score: this.score,
      mark: this.mark,
    };
  }


}


function onDragStart(source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (chessPuzzle.game.game_over()) return false

  // only pick up pieces for the side to move
  if ((chessPuzzle.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
    (chessPuzzle.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
  return true; // Allow the piece to be dragged
}


// Function to execute the computer's move
function executeComputerMove() {
  if (chessPuzzle.currentMoveIndex < chessPuzzle.movesArray.length) {
    $('.correct-move-indicator').remove();
    const moveString = chessPuzzle.movesArray[chessPuzzle.currentMoveIndex];
    const from = moveString.slice(0, 2);
    const to = moveString.slice(2, 4);
    const promotion = moveString.length > 4 ? moveString[4] : undefined; // Check if promotion is specified

    // Make the move, including promotion if applicable
    const move = chessPuzzle.game.move({
      from: from,
      to: to,
      promotion: promotion || 'q', // Default to queen if promotion is needed
    });

    // Push the move to the exploredMoves list
    chessPuzzle.exploredMoves.push(moveString);

    highlightLastMove(from, to); // Highlight the move
    chessPuzzle.board.position(chessPuzzle.game.fen(), false);
    chessPuzzle.currentMoveIndex++;
    chessPuzzle.updateHintButtonState(); // Add this line
    chessPuzzle.updateNavigationButtonStates(); // Update navigation button states
  } else {
    // If all moves are completed, check if the puzzle is solved
    checkPuzzleSolved();
  }
}

function onDrop(source, target) {
  // If the currentMoveIndex is not at the end of exploredMoves, reset the board to the last explored position
  if (chessPuzzle.currentMoveIndex < chessPuzzle.exploredMoves.length) {
    chessPuzzle.resetBoard();
    chessPuzzle.currentMoveIndex = chessPuzzle.exploredMoves.length;
    chessPuzzle.board.position(chessPuzzle.game.fen(), false);
    return 'snapback';
  }

  // Modified check for user's turn that considers startsWithPlayerMove
  if ((chessPuzzle.currentMoveIndex % 2 === 0) && !chessPuzzle.startsWithPlayerMove) {
    return 'snapback'; // Not the user's turn for standard puzzles
  }

  if ((chessPuzzle.currentMoveIndex % 2 === 1) && chessPuzzle.startsWithPlayerMove) {
    return 'snapback'; // Not the user's turn for custom puzzles
  }

  const expectedMove = chessPuzzle.movesArray[chessPuzzle.currentMoveIndex];
  const moveString = source + target;

  // Handle promotion moves
  if (isPromotionMove(source, target)) {
    showPromotionMenu(target, (selectedPiece) => {
      if (!selectedPiece) {
        chessPuzzle.board.position(chessPuzzle.game.fen(), false); // Roll back the pseudo-move if the promotion is canceled
        return 'snapback';
      }

      const moveStringWithPromotion = moveString + selectedPiece;

      // Apply the move with the selected promotion piece
      const move = chessPuzzle.game.move({
        from: source,
        to: target,
        promotion: selectedPiece
      });

      // Allow moves that result in checkmate or match the expected move
      if (chessPuzzle.game.in_checkmate() || moveStringWithPromotion === expectedMove) { //old moveString and expectedMove
        handleUserMove(move); // Finalize the move
      } else {
        if (isPuzzleFromHistory) {
          chessPuzzle.game.undo(); // Undo the wrong move
          chessPuzzle.board.position(chessPuzzle.game.fen(), false);
        }
        else {
          wrongMoveIndicator(target); // Show wrong move indicator
          checkPuzzleSolved(); //abort the puzzle if the move is wrong
        }
        return 'snapback'; // Revert the move
      }
    });
    return; // Wait for promotion selection
  }

  // Handle regular moves
  const move = chessPuzzle.game.move({
    from: source,
    to: target
  });

  if (move === null) return 'snapback'; // Illegal move

  // Allow moves that result in checkmate or match the expected move
  if (chessPuzzle.game.in_checkmate() || moveString === expectedMove) { //old moveString and expectedMove
    handleUserMove(move); // Finalize the move
  } else {

    if (isPuzzleFromHistory) {
      chessPuzzle.game.undo(); // Undo the wrong move
      chessPuzzle.board.position(chessPuzzle.game.fen(), false);
    }
    else {
      wrongMoveIndicator(target); // Show wrong move indicator
      checkPuzzleSolved(); //abort the puzzle if the move is wrong
    }
    return 'snapback'; // Revert the move
  }
}

function handleUserMove(move) {
  const moveString = move.from + move.to + (move.promotion || '');
  const expectedMove = chessPuzzle.movesArray[chessPuzzle.currentMoveIndex];

  if (chessPuzzle.game.in_checkmate() || moveString === expectedMove) { //new moveString and expectedMove
    chessPuzzle.exploredMoves.push(moveString); // Add move to explored moves
    chessPuzzle.board.position(chessPuzzle.game.fen(), false);
    highlightLastMove(move.from, move.to); // Highlight the move
    correctMoveIndicator(move.to);
    chessPuzzle.currentMoveIndex++;
    chessPuzzle.updateHintButtonState();
    chessPuzzle.updateNavigationButtonStates()

    //small delay to allow the board to update
    setTimeout(() => {
      executeComputerMove();
    }, 50);
    // Execute the computer's move
  } else {
    chessPuzzle.game.undo(); // Undo the wrong move
    chessPuzzle.board.position(chessPuzzle.game.fen(), false);
    return 'snapback'; // Revert the move
  }
}

function isPromotionMove(source, target) {
  const targetRank = parseInt(target[1]);
  const piece = chessPuzzle.game.get(source)?.type;

  // Check if the piece is a pawn
  if (piece !== 'p') return false;

  // Check if the move reaches the last rank
  if (!(targetRank === 8 || targetRank === 1)) return false;

  // Test if the move is legal
  const testMove = chessPuzzle.game.move({
    from: source,
    to: target,
    promotion: 'q' // Temporarily test with queen promotion
  });

  if (testMove === null) return false; // Illegal move

  // Undo the test move
  chessPuzzle.game.undo();

  return true; // Legal promotion move
}

function showPromotionMenu(target, callback) {
  const file = target[0];
  const rank = parseInt(target[1]);
  const boardOrientation = chessPuzzle.board.orientation(); // Get the current board orientation
  const isFlipped = boardOrientation === 'black';

  // Determine the promotion color based on orientation and rank
  const isTopRank = isFlipped ? rank === FIRST_RANK : rank === EIGTH_RANK; // Check if the rank is the top rank for the current orientation
  const color = rank === EIGTH_RANK ? 'w' : 'b'; // White promotes on the top rank, Black on the bottom rank

  // Determine the order of pieces based on the rank
  const pieces = isTopRank ? ['q', 'n', 'r', 'b'] : ['b', 'r', 'n', 'q'];

  // Calculate the size of a chessboard square
  const squareSize = $('#board .square-55d63').outerWidth();

  // Create the promotion menu
  const $menu = $('<div id="promotion-menu"></div>');
  $menu.css({
    position: 'absolute',
    display: 'grid',
    gridTemplateRows: `repeat(4, ${squareSize}px) ${squareSize / 2}px`, // 4 rows for pieces, 0.5 row for cancel button
    width: `${squareSize}px`,
    height: `${4 * squareSize + squareSize / 2}px`,
    backgroundColor: '#fff',
    border: '1px solid #000',
    zIndex: 1000
  });
  let left;
  // Calculate menu position
  const boardOffset = $('#board').offset();
  if (color === 'w') {
    left = isTopRank
      ? boardOffset.left + (file.charCodeAt(0) - 'a'.charCodeAt(0)) * squareSize
      : boardOffset.left + (7 - (file.charCodeAt(0) - 'a'.charCodeAt(0))) * squareSize
  }
  else {
    left = isTopRank
      ? boardOffset.left + (7 - (file.charCodeAt(0) - 'a'.charCodeAt(0))) * squareSize
      : boardOffset.left + (file.charCodeAt(0) - 'a'.charCodeAt(0)) * squareSize
  }
  const top = boardOffset.top + (isTopRank ? 0 : 4 * squareSize);

  $menu.css({ left: `${left}px`, top: `${top}px` });

  // Add promotion options with piece images
  pieces.forEach((piece) => {
    const $option = $(`<div><img src="img/chesspieces/wikipedia/${color}${piece.toUpperCase()}.png" alt="${piece}" /></div>`);
    $option.css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #000',
      cursor: 'pointer',
      backgroundColor: '#fff',
      width: `${squareSize}px`,
      height: `${squareSize}px`
    });
    $option.find('img').css({
      width: '80%', // Slightly smaller than the square
      height: '80%'
    });
    $option.on('click', () => {
      $menu.remove();
      callback(piece);
    });
    $menu.append($option);
  });

  // Add cancel button
  const $cancel = $('<div>&#x2715</div>');
  $cancel.css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #000',
    backgroundColor: '#fff',
    color: '#000',
    cursor: 'pointer',
    width: `${squareSize}px`,
    height: `${squareSize / 2}px`
  });
  $cancel.on('click', () => {
    $menu.remove();
    callback(null); // Cancel promotion
  });
  $menu.append($cancel);

  // Append the menu to the body
  $('body').append($menu);
}

function showHint() {
  // First remove any existing hint arrows
  $('.hint-arrow').remove();

  // Only show hint if we're at the latest explored position
  if (chessPuzzle.exploredMoves.length !== chessPuzzle.currentMoveIndex) {
    return;
  }

  if (chessPuzzle.currentMoveIndex < chessPuzzle.movesArray.length) {
    const moveString = chessPuzzle.movesArray[chessPuzzle.currentMoveIndex];
    const from = moveString.slice(0, 2);
    const to = moveString.slice(2, 4);
    const orientation = chessPuzzle.board.orientation();

    // Draw an arrow from source to target square
    drawArrow(from, to, '#3e8ef7', orientation); // Blue arrow for hints
  } else {
    alert('Puzzle solved already.');
  }
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
  chessPuzzle.board.position(chessPuzzle.game.fen())
}

async function correctMoveIndicator(target) {
  // Select the square element
  const square = $(`#board .square-${target}`);
  // Ensure the square has relative positioning
  square.css('position', 'relative');

  // Load the SVG
  const svg = await loadSVG('./assets/svg/correct.svg');

  // Create a container for the SVG
  const svgContainer = document.createElement('div');
  svgContainer.innerHTML = svg; // Add the SVG content
  svgContainer.style.position = 'absolute'; // Position it absolutely
  svgContainer.style.top = '0'; // Align to the top of the square
  svgContainer.style.right = '0'; // Align to the right of the square
  svgContainer.style.width = '100%'; // Match the square's width
  svgContainer.style.height = '100%'; // Match the square's height
  svgContainer.style.pointerEvents = 'none'; // Prevent interference with user interactions
  svgContainer.classList.add('correct-move-indicator'); // Add a class for easy removal
  // Append the SVG container to the square
  square.append(svgContainer);
}

async function wrongMoveIndicator(target) {
  // Select the square element
  const square = $(`#board .square-${target}`);
  // Ensure the square has relative positioning
  square.css('position', 'relative');

  // Load the SVG
  const svg = await loadSVG('./assets/svg/wrong.svg');

  // Create a container for the SVG
  const svgContainer = document.createElement('div');
  svgContainer.innerHTML = svg; // Add the SVG content
  svgContainer.style.position = 'absolute'; // Position it absolutely
  svgContainer.style.top = '0'; // Align to the top of the square
  svgContainer.style.right = '0'; // Align to the right of the square
  svgContainer.style.width = '100%'; // Match the square's width
  svgContainer.style.height = '100%'; // Match the square's height
  svgContainer.style.pointerEvents = 'none'; // Prevent interference with user interactions
  svgContainer.classList.add('wrong-move-indicator'); // Add a class for easy removal
  // Append the SVG container to the square
  square.append(svgContainer);
}
function highlightLastMove(source, target) {
  // Remove previous highlights
  $('#board .square-55d63').removeClass('highlight-light highlight-dark');

  // Determine if a square is light or dark
  function isLightSquare(square) {
    const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // File as 0-based index
    const rank = parseInt(square[1]) - 1; // Rank as 0-based index
    return (file + rank) % 2 === 1; // Light squares have odd sums
  }

  // Add the appropriate highlight class for source and target squares
  if (isLightSquare(source)) {
    $(`#board .square-${source}`).addClass('highlight-light');
  } else {
    $(`#board .square-${source}`).addClass('highlight-dark');
  }

  if (isLightSquare(target)) {
    $(`#board .square-${target}`).addClass('highlight-light');
  } else {
    $(`#board .square-${target}`).addClass('highlight-dark');
  }
  // Store the highlighted squares for reapplying after flip
  chessPuzzle.board.lastHighlighted = { source, target };
}

// Function to convert PascalCase keys to camelCase
function mapPuzzleKeys(puzzle) {
  return {
    puzzle_id: puzzle.PuzzleId,
    fen: puzzle.FEN,
    moves: puzzle.Moves,
    rating: puzzle.Rating,
    rating_deviation: puzzle.RatingDeviation,
    popularity: puzzle.Popularity,
    nb_plays: puzzle.NbPlays,
    themes: puzzle.Themes,
    game_url: puzzle.GameUrl,
    opening: puzzle.OpeningTags,
    moves_ton: puzzle.Moves_ton,
  };
}

async function loadSVG(filePath) {
  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error(`Failed to load SVG: ${filePath}`);
  }
  return await response.text();
}


// Function to check if the puzzle is solved
async function checkPuzzleSolved() {
  let mark = document.createElement('div');

  if (chessPuzzle.currentMoveIndex >= chessPuzzle.movesArray.length) {
    const svg = await loadSVG('./assets/svg/correct.svg');
    mark.innerHTML = svg; // Use the loaded SVG for the correct mark
  } else {
    const svg = await loadSVG('./assets/svg/wrong.svg');
    mark.innerHTML = svg; // Use the loaded SVG for the wrong mark
  }


  // Check if the current puzzle exists
  if (!puzzles[currentPuzzleIndex]) {
    return;
  }
  chessPuzzle.setMetadata({
    mark: mark.innerHTML
  });

  // Save the solved puzzle
  const puzzle = chessPuzzle.serialize();

  // Only push to history if the puzzle was not loaded from history
  if (!isPuzzleFromHistory) { //if the puzzle is not from history
    saveSolvedPuzzle(puzzle).then(() => {
      fetchSolvedPuzzles(); // Update the history immediately after saving

      if (isSearchingSimilar) {
        loadNextPuzzleFromHeap(); // Load the next puzzle from the heap
      } else {
        loadPuzzle(currentPuzzleIndex + 1); // Load the next puzzle from the puzzles array
      }

    });
  } else { // If the puzzle is from history

    puzzles[currentPuzzleIndex].reinitialize();
    loadPuzzle(currentPuzzleIndex); // Reload the current puzzle

  }

  // Reset the flag
  isPuzzleFromHistory = false;
}


function updatePuzzleIdText() {
  const puzzleIdElement = document.getElementById('puzzle-id');
  
  if (chessPuzzle && chessPuzzle.puzzle_id) {
    // Function to create a lichess hyperlink if the ID seems valid
    const createPuzzleLink = (puzzleId) => {
      // Check if this looks like a valid lichess puzzle ID (not starting with "c_" and only alphanumeric)
      if (puzzleId && !String(puzzleId).startsWith('c_') && /^[a-zA-Z0-9]+$/.test(String(puzzleId))) {
        return `<a href="https://lichess.org/training/${puzzleId}" target="_blank">${puzzleId}</a>`;
      }
      return puzzleId; // Return plain text for custom puzzle IDs
    };
    
    if (chessPuzzle.reference_puzzle !== null && chessPuzzle.score !== null) {
      // For puzzles with a reference and similarity score
      const puzzleLink = createPuzzleLink(chessPuzzle.puzzle_id);
      const referenceLink = createPuzzleLink(chessPuzzle.reference_puzzle);
      
      puzzleIdElement.innerHTML = `Puzzle ${puzzleLink} ${chessPuzzle.score.toFixed(2)} similarity to puzzle ${referenceLink}`;
    } else {
      // For regular puzzles without a reference
      const puzzleLink = createPuzzleLink(chessPuzzle.puzzle_id);
      puzzleIdElement.innerHTML = `Puzzle ${puzzleLink}`;
    }
  } else {
    puzzleIdElement.innerHTML = ''; // Clear the text if no puzzle is given
  }
}
// Function to load a puzzle into the board
function loadPuzzle(puzzleIdentifier) {
  let puzzle;
  // Determine if the puzzleIdentifier is an index or a puzzle object
  if (typeof puzzleIdentifier === 'number') {
    if (puzzleIdentifier >= puzzles.length) {
      alert('No more puzzles available!');
      return;
    }
    isPuzzleFromHistory = false; // Mark the puzzle as being loaded from the main list
    currentPuzzleIndex = puzzleIdentifier;
    puzzle = puzzles[puzzleIdentifier];
  } else if (typeof puzzleIdentifier === 'object') {
    isPuzzleFromHistory = true; // Mark the puzzle as being loaded from history
    puzzle = new ChessPuzzle(puzzleIdentifier); // Create a new ChessPuzzle instance
  } else {
    console.error('Invalid puzzle identifier');
    return;
  }
  chessPuzzle = puzzle; // Set the global chessPuzzle variable

  chessPuzzle.initializeBoard() // Initialize the board if not already done
  updatePuzzleIdText(); // Update the puzzle ID text

  let orientation;
  const fenColor = puzzle.initialFen.split(' ')[1];

  if (chessPuzzle.startsWithPlayerMove) {
    // For custom puzzles where player starts, orient board so player's color is at bottom
    orientation = fenColor === 'w' ? 'white' : 'black';
  } else {
    // For standard puzzles, player plays as opposite of FEN color
    orientation = fenColor === 'b' ? 'white' : 'black';
  }

  chessPuzzle.board.orientation(orientation);

  chessPuzzle.resetBoard(); // Reset the board to the initial state

  // Only execute computer's first move if puzzle doesn't start with player move
  if (!chessPuzzle.startsWithPlayerMove) {
    executeComputerMove(); // Execute the first move by the computer
  }
  // If startsWithPlayerMove is true, wait for the player's input
}

function resetBoardToExploredState(game, initialFen, moves) {
  game.load(initialFen); // Load the initial FEN
  moves.forEach((moveString) => {
    const from = moveString.slice(0, 2);
    const to = moveString.slice(2, 4);
    const promotion = moveString.length > 4 ? moveString[4] : undefined;
    game.move({ from, to, promotion }); // Reapply the move
  });
}

// Function to move forward in the puzzle
function moveForward() {
  if (chessPuzzle.currentMoveIndex < chessPuzzle.exploredMoves.length) {
    const moveString = chessPuzzle.exploredMoves[chessPuzzle.currentMoveIndex];
    const from = moveString.slice(0, 2);
    const to = moveString.slice(2, 4);
    const promotion = moveString.length > 4 ? moveString[4] : undefined;

    chessPuzzle.game.move({ from, to, promotion });
    chessPuzzle.board.position(chessPuzzle.game.fen(), false);
    highlightLastMove(from, to);
    chessPuzzle.currentMoveIndex++;
    chessPuzzle.updateHintButtonState(); // Update hint button state
    chessPuzzle.updateNavigationButtonStates()
  }
}

// Function to move backward in the puzzle
function moveBackward() {
  if (chessPuzzle.currentMoveIndex > 0) {
    chessPuzzle.game.undo();
    chessPuzzle.currentMoveIndex--;
    chessPuzzle.board.position(chessPuzzle.game.fen(), false);
    if (chessPuzzle.currentMoveIndex === 0) {
      resetHighlights()
    }
    else {
      const moveString = chessPuzzle.movesArray[chessPuzzle.currentMoveIndex - 1];
      const from = moveString.slice(0, 2);
      const to = moveString.slice(2, 4);
      highlightLastMove(from, to);
    }
    chessPuzzle.updateHintButtonState(); // Update hint button state
    chessPuzzle.updateNavigationButtonStates(); // Update navigation button states
  }
}

function resetHighlights() {
  // Remove all highlights from the board
  $('#board .square-55d63').removeClass('highlight-light highlight-dark');
}


async function initializeSession() {
  try {
    const headers = {};

    // If we have a token, include it in the request
    if (tokenManager.isAuthenticated()) {
      headers['Authorization'] = `Bearer ${tokenManager.getToken()}`;
    }

    // Request a session (either validate existing or get new)
    const response = await fetch('https://api.valentinklamka.de/api/assign_session_id', {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to initialize session');
    }

    const data = await response.json();

    // Save the token (whether it's the same or a new one)
    tokenManager.setToken(data.token);

  } catch (error) {
    console.error('Error initializing session:', error);
  }
}

// Function to fetch puzzles from the backend
async function fetchPuzzles(searchParams) {
  try {
    const search = searchManager.startSearch();

    // Construct the query string from the searchParams object
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await fetchWithAuth(`https://api.valentinklamka.de/api/puzzles?${queryString}`, {
      method: 'GET',
      credentials: 'omit', // No need for cookies
    });

    // If another search has started since this one, ignore the results
    if (!searchManager.isStillCurrent(search.id)) {
      return; // Simply return without processing the results
    }

    isSearchingSimilar = false; // Set the flag to indicate normal search mode
    searchManager.endSearch(); // Mark search as completed

    if (!response.ok) {
      throw new Error('Failed to fetch puzzles');
    }

    const rawPuzzles = await response.json();

    // Check again if this search is still current
    if (!searchManager.isStillCurrent(search.id)) {
      return;
    }

    // Map the puzzles to ChessPuzzle instances
    puzzles = rawPuzzles.map((rawPuzzle) => new ChessPuzzle(mapPuzzleKeys(rawPuzzle)));

    if (puzzles.length > 0) {
      loadPuzzle(0); // Load the first puzzle
      updatePuzzleIdText(); // Update the puzzle ID text
    } else {
      // Only show "No puzzles found" if this was the most recent search
      alert('No puzzles found');
    }
  } catch (error) {
    searchManager.endSearch();
    console.error('Error fetching puzzles:', error);
    alert('Error fetching puzzles');
  }
}


// Function to save a solved puzzle
async function saveSolvedPuzzle(puzzle) {
  try {
    const response = await fetchWithAuth('https://api.valentinklamka.de/api/solved_puzzles', {
      method: 'POST',
      credentials: 'omit', // No need for cookies with token auth
      body: JSON.stringify(puzzle),
    });

    if (!response.ok) {
      throw new Error(`Failed to save puzzle: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('Error saving solved puzzle:', error);
    // Optionally show a user-friendly message
    // alert('Failed to save your progress. Please try again.');
  }
}

// Function to fetch solved puzzles
async function fetchSolvedPuzzles() {
  try {
    const response = await fetchWithAuth('https://api.valentinklamka.de/api/solved_puzzles', {
      method: 'GET',
      credentials: 'omit', // No need for cookies with token auth
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch solved puzzles: ${response.statusText}`);
    }

    const puzzles = await response.json();
    displaySolvedPuzzles(puzzles);
  } catch (error) {
    console.error('Error fetching solved puzzles:', error);
    // You could show a user-friendly error message here
    // Or silently fail since this is a secondary feature
  }
}

// Function to display solved puzzles in the sidebar
function displaySolvedPuzzles(puzzles) {
  const sidebar = document.getElementById('solved-puzzles');
  sidebar.innerHTML = ''; // Clear the sidebar

  // Create a container for the content (needed for proper scrolling)
  const contentContainer = document.createElement('div');
  contentContainer.style.position = 'relative';
  contentContainer.style.height = '100%';
  contentContainer.style.overflow = 'auto';
  sidebar.appendChild(contentContainer);

  // Add a header to the sidebar with sticky positioning
  const header = document.createElement('div');
  header.style.display = 'grid';
  header.style.gridTemplateColumns = '1fr 2fr 2fr'; // Define column widths
  header.style.fontWeight = 'bold';
  header.style.padding = '10px 5px 5px 5px';
  header.style.borderBottom = '1px solid #ccc';
  header.style.backgroundColor = '#747474'; // Match sidebar background
  header.style.position = 'sticky';
  header.style.top = '0';
  header.style.zIndex = '10'; // Ensure header stays on top

  // Add header labels
  const markHeader = document.createElement('div');
  markHeader.textContent = '✅'; // Use checkmark symbol
  const puzzleIdHeader = document.createElement('div');
  puzzleIdHeader.textContent = 'Puzzle ID';
  const ratingHeader = document.createElement('div');
  ratingHeader.textContent = 'Rating';
  header.appendChild(markHeader);
  header.appendChild(puzzleIdHeader);
  header.appendChild(ratingHeader);
  contentContainer.appendChild(header);

  // Add each puzzle to the sidebar
  puzzles.forEach((puzzle) => {
    const puzzleElement = document.createElement('div');
    puzzleElement.style.display = 'grid';
    puzzleElement.style.gridTemplateColumns = '1fr 2fr 2fr'; // Match the header layout
    puzzleElement.style.marginBottom = '5px'; // Add some spacing between items
    puzzleElement.style.padding = '5px';
    puzzleElement.style.cursor = 'pointer';

    // Add puzzle details
    const markElement = document.createElement('div');
    markElement.innerHTML = puzzle.mark;
    const puzzleIdElement = document.createElement('div');
    puzzleIdElement.textContent = puzzle.puzzle_id;
    const ratingElement = document.createElement('div');
    ratingElement.textContent = puzzle.rating;
    puzzleElement.appendChild(markElement);
    puzzleElement.appendChild(puzzleIdElement);
    puzzleElement.appendChild(ratingElement);

    // Add click event to load the puzzle
    puzzleElement.addEventListener('click', () => loadPuzzle(puzzle));
    contentContainer.appendChild(puzzleElement);
  });
}


// Function to trigger the search for similar puzzles
async function triggerSearchSimilar() {
  if (!chessPuzzle) {
    alert('No active puzzle to search similar puzzles.');
    return;
  }

  const reference_puzzle = chessPuzzle.puzzle_id; // Store the reference puzzle ID in the instance

  try {
    const token = tokenManager.getToken();
    const referenceMoves = encodeURIComponent(chessPuzzle.moves_ton);
    const controller = new AbortController();

    fetchEventSource('https://api.valentinklamka.de/api/similar_puzzles?reference_moves=' + referenceMoves + "&reference_puzzle=" + reference_puzzle, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'omit', // Don't send cookies
      signal: controller.signal,
      onmessage(event) {

        const [score, raw_puzzle] = JSON.parse(event.data);
        const puzzle = new ChessPuzzle(mapPuzzleKeys(raw_puzzle));
        puzzles.length = 0;
        puzzles.push(puzzle);
        currentPuzzleIndex = 0;
        isSearchingSimilar = true;

        if (puzzles.length > 0) {
          loadPuzzle(0);
          chessPuzzle.score = score;
          chessPuzzle.reference_puzzle = reference_puzzle;
          updatePuzzleIdText();
        } else {
          alert('No puzzles found');
        }

        // ✅ Stop listening to the event source after the first puzzle
        controller.abort();
      }
    });

  } catch (error) {
    console.error('Error triggering search for similar puzzles:', error);
    alert('Error searching similar puzzles.');
  }
}


// Function to load the next puzzle from the heap
async function loadNextPuzzleFromHeap() {
  try {
    const response = await fetchWithAuth(`https://api.valentinklamka.de/api/pop_max_puzzle`, {
      method: 'GET',
      credentials: 'omit', // No need for cookies with token auth
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch the next puzzle from the heap: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data) {
      alert('No more puzzles available in the heap.');
      return;
    }

    const reference_puzzle = chessPuzzle.reference_puzzle; // Store the reference puzzle ID
    const [score, raw_puzzle] = data;

    // Ensure we have a valid puzzle
    if (!raw_puzzle) {
      alert('No more puzzles available in the heap.');
      return;
    }

    const puzzle = new ChessPuzzle(mapPuzzleKeys(raw_puzzle)); // Initialize as ChessPuzzle
    puzzles.push(puzzle); // Add the new puzzle to the puzzles array
    currentPuzzleIndex = puzzles.length - 1; // Set the current puzzle index to the last puzzle
    loadPuzzle(currentPuzzleIndex); // Load the puzzle into the board
    chessPuzzle.score = score; // Store the score in the chessPuzzle instance
    chessPuzzle.reference_puzzle = reference_puzzle; // Store the reference puzzle ID
    updatePuzzleIdText(); // Update the puzzle ID text
  } catch (error) {
    console.error('Error fetching the next puzzle from the heap:', error);
    alert('Error fetching the next puzzle. Please try again later.');
  }
}

// Token management utilities
const tokenManager = {
  getToken() {
    return localStorage.getItem('chess_puzzle_token');
  },

  setToken(token) {
    localStorage.setItem('chess_puzzle_token', token);
  },

  clearToken() {
    localStorage.removeItem('chess_puzzle_token');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};

// API request helper with token
async function fetchWithAuth(url, options = {}) {
  const token = tokenManager.getToken();

  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge options
  const fetchOptions = {
    ...options,
    headers
  };

  // Make the request
  const response = await fetch(url, fetchOptions);

  // Handle 401 Unauthorized (token expired or invalid)
  if (response.status === 401) {
    tokenManager.clearToken();
    // Optional: Redirect to login or reinitialize
    await initializeSession();
    return fetchWithAuth(url, options); // Retry with new token
  }

  return response;
}


createSettingsPanel(searchParams, fetchPuzzles);
createHelpPanel();
createSettingsAndHelpButtons();
createImportPanel(saveSolvedPuzzle, fetchSolvedPuzzles);
createSidebar();

createNavigationButtons(moveBackward, moveForward, triggerSearchSimilar, showHint);



// Add CSS for highlighting
const style = document.createElement('style');
style.innerHTML = `
  .highlight-light {
    background-color: #f6ea71 !important; /* Light yellow tint for light squares */
  }

  .highlight-dark {
    background-color: #dbc34a !important; /* Dark yellow tint for dark squares */
  }
`;
document.head.appendChild(style);


// Disable right-click menu on the chessboard
document.getElementById('board').addEventListener('contextmenu', (event) => {
  event.preventDefault();
});



// Fetch solved puzzles on page load
window.addEventListener('load', async () => {
  await initializeSession();
  fetchPuzzles(searchParams);
});
window.addEventListener('load', fetchSolvedPuzzles);




var config = {
  draggable: true,
  position: "start",
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
}
// Global initialization
chessPuzzle = new ChessPuzzle({
  puzzle_id: null,
  initialFen: 'start',
  moves: '',
  themes: '',
  rating: 0,
  moves_ton: '',
  reference_puzzle: null,
  score: null,
  mark: null
});
chessPuzzle.initializeBoard();

// Make the chess puzzle instance global
window.chessPuzzle = chessPuzzle;

// Update the search function with better debugging
window.triggerSearchSimilarWithMoves = function(tonMoves, puzzleId = "c_puzzle"){
  console.log("MAIN.JS: Function called with moves:", tonMoves);

  if (!tonMoves) {
    console.error("No TON moves provided");
    alert("Error: No moves provided for search");
    return;
  }


  // Use the provided puzzle ID instead of hardcoded value
  const reference_puzzle = puzzleId;

  try {
    const token = tokenManager.getToken();
    const encodedMoves = encodeURIComponent(tonMoves);
    const controller = new AbortController();

    console.log(`MAIN.JS: Searching with moves: ${encodedMoves} and reference: ${reference_puzzle}`);

    // Include both reference_moves and reference_puzzle in the API request
    fetchEventSource(`https://api.valentinklamka.de/api/similar_puzzles?reference_moves=${encodedMoves}&reference_puzzle=${reference_puzzle}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'omit',
      signal: controller.signal,
      onmessage(event) {
        console.log("MAIN.JS: Received event:", event.data);
        const [score, raw_puzzle] = JSON.parse(event.data);
        const puzzle = new ChessPuzzle(mapPuzzleKeys(raw_puzzle));
        puzzles.length = 0;
        puzzles.push(puzzle);
        currentPuzzleIndex = 0;
        isSearchingSimilar = true;

        if (puzzles.length > 0) {
          loadPuzzle(0);
          chessPuzzle.score = score;
          chessPuzzle.reference_puzzle = reference_puzzle;
          updatePuzzleIdText();
        } else {
          alert('No puzzles found');
        }

        controller.abort();
      },
      onerror(err) {
        console.error("MAIN.JS: Error from event source:", err);
        alert("Error communicating with the server");
        controller.abort();
      }
    });
  } catch (error) {
    console.error('MAIN.JS: Error in search:', error);
    alert('Error searching similar puzzles: ' + error.message);
  }
};