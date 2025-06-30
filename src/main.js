import { createSettingsPanel, createSidebar, createNavigationButtons,addSettingsPanelToggle} from './ui.js';
import { fetchEventSource } from 'https://cdn.skypack.dev/@microsoft/fetch-event-source';

// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js
window.triggerSearchSimilar = triggerSearchSimilar;
let chessPuzzle = null; 
// Expose the function globally

let pingInterval = setInterval(() => {
  navigator.sendBeacon("/api/keepalive");
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
    this.lastDevicePixelRatio = window.devicePixelRatio; // Track zoom level
  }
  initializeBoard() {
    
    this.board = Chessboard('board', config); // Initialize the chessboard
  }
    
  
    

  reinitialize() {
    this.game = new Chess(this.initialFen);
    this.exploredMoves = [];
    this.currentMoveIndex = 0;
    this.board.position(this.game.fen(), false);
    this.currentMoveIndex = 0;
  }

  resetBoard() {
    resetBoardToExploredState(this.game, this.initialFen, this.exploredMoves);
    this.board.position(this.game.fen(), false);
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


function onDragStart (source, piece, position, orientation) { 
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

  // Check if it's the user's turn
  if (chessPuzzle.currentMoveIndex % 2 === 0) {
    return 'snapback'; // Not the user's turn
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
        if (isPuzzleFromHistory){
          chessPuzzle.game.undo(); // Undo the wrong move
          chessPuzzle.board.position(chessPuzzle.game.fen(), false);
        }
        else{
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
    
    if (isPuzzleFromHistory){
      chessPuzzle.game.undo(); // Undo the wrong move
      chessPuzzle.board.position(chessPuzzle.game.fen(), false);
    }
    else{
    wrongMoveIndicator(target); // Show wrong move indicator
    checkPuzzleSolved(); //abort the puzzle if the move is wrong
    }
    return 'snapback'; // Revert the move
  }
}

function handleUserMove(move) {
  const moveString = move.from + move.to + (move.promotion || '');
  const expectedMove = chessPuzzle.movesArray[chessPuzzle.currentMoveIndex];

  if (chessPuzzle.game.in_checkmate()||moveString === expectedMove) { //new moveString and expectedMove
    chessPuzzle.exploredMoves.push(moveString); // Add move to explored moves

    chessPuzzle.board.position(chessPuzzle.game.fen(), false);
    highlightLastMove(move.from, move.to); // Highlight the move
    correctMoveIndicator(move.to);
    chessPuzzle.currentMoveIndex++;
    //small delay to allow the board to update
    setTimeout(() => {
      executeComputerMove();
    },50);
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
  if(color==='w') {
    left = isTopRank
    ? boardOffset.left + (file.charCodeAt(0) - 'a'.charCodeAt(0)) * squareSize
    : boardOffset.left + (7 - (file.charCodeAt(0) - 'a'.charCodeAt(0))) * squareSize
  }
  else{left = isTopRank
    ? boardOffset.left + (7 - (file.charCodeAt(0) - 'a'.charCodeAt(0))) * squareSize
    : boardOffset.left + (file.charCodeAt(0) - 'a'.charCodeAt(0)) * squareSize
  }
  const top = boardOffset.top + (isTopRank ? 0 : 4 * squareSize);

  $menu.css({ left: `${left}px`, top: `${top}px` });

  // Add promotion options with piece images
  pieces.forEach((piece) => {
    const $option = $(`<div><img src="img/chesspieces/wikipedia/${color}${piece}.png" alt="${piece}" /></div>`);
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

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
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

async function wrongMoveIndicator(target){
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
      setTimeout(() => {
        if (isSearchingSimilar) {
          loadNextPuzzleFromHeap(); // Load the next puzzle from the heap
        } else {
          loadPuzzle(currentPuzzleIndex + 1); // Load the next puzzle from the puzzles array
        }
      },200);
    });
  } else { // If the puzzle is from history
    setTimeout(() => {
      puzzles[currentPuzzleIndex].reinitialize();
      loadPuzzle(currentPuzzleIndex); // Reload the current puzzle

    },200);
  }

  // Reset the flag
  isPuzzleFromHistory = false;
}

function updatePuzzleIdText() {
  const puzzleIdElement = document.getElementById('puzzle-id');
  if (chessPuzzle && chessPuzzle.puzzle_id) {
    if (chessPuzzle.reference_puzzle!== null && chessPuzzle.score !== null) {

      puzzleIdElement.textContent = `Puzzle ${chessPuzzle.puzzle_id} ${chessPuzzle.score.toFixed(2)} similarity to puzzle ${chessPuzzle.reference_puzzle}`;
    } else {
      puzzleIdElement.textContent = `Puzzle ${chessPuzzle.puzzle_id}`;
    }
  } else {
    puzzleIdElement.textContent = ''; // Clear the text if no puzzle is given
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
  chessPuzzle = puzzle; // Directly use the ChessPuzzle instance
  chessPuzzle.initializeBoard() // Initialize the board if not already done
  updatePuzzleIdText(); // Update the puzzle ID text

  // Set the board orientation based on the FEN string
  const orientation = puzzle.initialFen.split(' ')[1] === 'b' ? 'white' : 'black';
  chessPuzzle.board.orientation(orientation);

  chessPuzzle.resetBoard(); // Reset the board to the initial state
  executeComputerMove(); // Execute the first move by the computer
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
    else  {
      const moveString = chessPuzzle.movesArray[chessPuzzle.currentMoveIndex-1];
      const from = moveString.slice(0, 2);
      const to = moveString.slice(2, 4);
      highlightLastMove(from, to);
    }
  }
}
function resetHighlights() {
  // Remove all highlights from the board
  $('#board .square-55d63').removeClass('highlight-light highlight-dark');
}

async function initializeSession() {
  console.log('Initializing session...');
  try {
    const response = await fetch('https://api.valentinklamka.de/api/assign_session_id', {
      method: 'GET',
      credentials: 'include', // Ensure cookies are included
    });
    if (!response.ok) {
      throw new Error('Failed to initialize session');
    }
    const message = await response.json();
  } catch (error) {
    console.error('Error initializing session:', error);
  }
}

// Function to fetch puzzles from the backend
async function fetchPuzzles(searchParams) {
  try {
    // Construct the query string from the searchParams object
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await fetch(`https://api.valentinklamka.de/api/puzzles?${queryString}`, {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
    });
    isSearchingSimilar = false; // Set the flag to indicate normal search mode

    if (!response.ok) {
      throw new Error('Failed to fetch puzzles');
    }

    const rawPuzzles = await response.json();

    // Map the puzzles to ChessPuzzle instances
    puzzles = rawPuzzles.map((rawPuzzle) => new ChessPuzzle(mapPuzzleKeys(rawPuzzle)));

    if (puzzles.length > 0) {
      loadPuzzle(0); // Load the first puzzle
      updatePuzzleIdText(); // Update the puzzle ID text
    } else {
      alert('No puzzles found');
    }
  } catch (error) {
    console.error('Error fetching puzzles:', error);
    alert('Error fetching puzzles');
  }
}



// Function to save a solved puzzle
async function saveSolvedPuzzle(puzzle) {
  try {
    await fetch('https://api.valentinklamka.de/api/solved_puzzles', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(puzzle),
    });
  } catch (error) {
    console.error('Error saving solved puzzle:', error);
  }
}

// Function to fetch solved puzzles
async function fetchSolvedPuzzles() {
  try {
    const response = await fetch('https://api.valentinklamka.de/api/solved_puzzles', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch solved puzzles');
    }

    const puzzles = await response.json();
    displaySolvedPuzzles(puzzles);
  } catch (error) {
    console.error('Error fetching solved puzzles:', error);
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
  console.log('Triggering search for similar puzzles...');
  if (!chessPuzzle) {
    alert('No active puzzle to search similar puzzles.');
    return;
  }

  const reference_puzzle = chessPuzzle.puzzle_id; // Store the reference puzzle ID in the instance

  try {
    const referenceMoves = encodeURIComponent(chessPuzzle.moves_ton); // Ensure it's properly encoded
    console.log(`Searching for similar puzzles to reference moves: ${referenceMoves}`);
    fetchEventSource('https://api.valentinklamka.de/api/similar_puzzles?reference_moves=' + referenceMoves, {
      method: 'GET',
      credentials: 'include',
      onmessage(event) { 
      console.log('Received event:', event.data);
      const [score, raw_puzzle] = JSON.parse(event.data); // Parse the streamed (score, puzzle) pair
      const puzzle = new ChessPuzzle(mapPuzzleKeys(raw_puzzle)); // Initialize as ChessPuzzle
      puzzles.length = 0; // Clear the existing puzzles array
      puzzles.push(puzzle); // Add the new puzzle to the array
      currentPuzzleIndex = 0; // Reset the current puzzle index
      isSearchingSimilar = true; // Set the flag to indicate similar search mode

      if (puzzles.length > 0) {
        loadPuzzle(0); // Load the first puzzle
        chessPuzzle.score = score; // Store the score in the chessPuzzle instance
        chessPuzzle.reference_puzzle = reference_puzzle; // Store the reference puzzle ID in the instance
        updatePuzzleIdText();
      } else {
        alert('No puzzles found');
      }

      eventSource.close(); // Close the EventSource after receiving the first message
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
    const response = await fetch(`https://api.valentinklamka.de/api/pop_max_puzzle`, {
      method:'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch the next puzzle from the heap.');
    }
    const reference_puzzle = chessPuzzle.reference_puzzle; // Store the reference puzzle in the instance
    
    const [score, raw_puzzle] = await response.json();
    const puzzle= new ChessPuzzle(mapPuzzleKeys(raw_puzzle)); // Initialize as ChessPuzzle
    if (puzzle) {
      puzzles.push(puzzle); // Add the new puzzle to the puzzles array
      currentPuzzleIndex = puzzles.length - 1; // Set the current puzzle index to the last puzzle
      loadPuzzle(currentPuzzleIndex); // Load the puzzle into the board
      chessPuzzle.score = score; // Store the score in the chessPuzzle instance
      chessPuzzle.reference_puzzle = reference_puzzle; // Store the reference puzzle ID in the instance
      updatePuzzleIdText(); // Update the puzzle ID text
    } else {
      alert('No more puzzles available in the heap.');
    }
  } catch (error) {
    console.error('Error fetching the next puzzle from the heap:', error);
    alert('Error fetching the next puzzle from the heap.');
  }
}


createSettingsPanel(searchParams, fetchPuzzles);
addSettingsPanelToggle();
createSidebar();

createNavigationButtons(moveBackward, moveForward);



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
window.addEventListener('load', initializeSession);
window.addEventListener('load', () => {
  fetchPuzzles(searchParams); // Fetch puzzles with the initial search parameters
});
window.addEventListener('load', fetchSolvedPuzzles);
// Add this to your main JavaScript file




var config = {
  draggable: true,
  position:"start",
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