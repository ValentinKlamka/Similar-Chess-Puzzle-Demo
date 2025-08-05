// New function to create the import panel
export function createImportPanel(saveSolvedPuzzle, fetchSolvedPuzzles) {
  // Create the import panel
  const importPanel = document.createElement('div');
  importPanel.id = 'import-panel';


  // Create container for content
  const importContent = document.createElement('div');
  importContent.className = 'import-content';
  importPanel.appendChild(importContent);

  // Add header
  const importHeader = document.createElement('h3');
  importHeader.textContent = 'Import Chess Position';
  importContent.appendChild(importHeader);

  // Image URL input section
  const imageUrlSection = document.createElement('div');
  imageUrlSection.className = 'import-section';

  const imageUrlLabel = document.createElement('label');
  imageUrlLabel.textContent = 'Image URL:';
  imageUrlLabel.htmlFor = 'image-url-input';

  const imageUrlInput = document.createElement('input');
  imageUrlInput.type = 'text';
  imageUrlInput.id = 'image-url-input';
  imageUrlInput.placeholder = 'https://example.com/chess-position.jpg';
  
  // Add click handler to auto-select all text or deselect on second click
  imageUrlInput.addEventListener('click', function() {
    if (document.activeElement === this && 
        this.selectionStart === 0 && 
        this.selectionEnd === this.value.length) {
      // Already selected, so deselect by moving cursor to end
      this.setSelectionRange(this.value.length, this.value.length);
    } else {
      // Select all text
      this.select();
    }
  });

  imageUrlSection.appendChild(imageUrlLabel);
  imageUrlSection.appendChild(imageUrlInput);
  importContent.appendChild(imageUrlSection);

  // Divider
  const divider = document.createElement('div');
  divider.textContent = 'OR';
  divider.className = 'import-divider';
  importContent.appendChild(divider);

  // FEN String input section
  const fenSection = document.createElement('div');
  fenSection.className = 'import-section';

  const fenLabel = document.createElement('label');
  fenLabel.textContent = 'FEN String:';
  fenLabel.htmlFor = 'fen-input';

  const fenInput = document.createElement('input');
  fenInput.type = 'text';
  fenInput.id = 'fen-input';
  fenInput.placeholder = 'e.g. rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  
  // Add click handler to auto-select all text or deselect on second click
  fenInput.addEventListener('click', function() {
    if (document.activeElement === this && 
        this.selectionStart === 0 && 
        this.selectionEnd === this.value.length) {
      // Already selected, so deselect by moving cursor to end
      this.setSelectionRange(this.value.length, this.value.length);
    } else {
      // Select all text
      this.select();
    }
  });

  fenSection.appendChild(fenLabel);
  fenSection.appendChild(fenInput);
  importContent.appendChild(fenSection);


  // Divider
  const divider2 = document.createElement('div');
  divider2.textContent = 'OR';
  divider2.className = 'import-divider';
  importContent.appendChild(divider2);

  // Image upload section
  const imageUploadSection = document.createElement('div');
  imageUploadSection.className = 'import-section';

  const imageUploadLabel = document.createElement('label');
  imageUploadLabel.textContent = 'Upload Image:';
  imageUploadLabel.htmlFor = 'image-upload-input';

  const imageUploadInput = document.createElement('input');
  imageUploadInput.type = 'file';
  imageUploadInput.id = 'image-upload-input';
  imageUploadInput.accept = 'image/*';

  imageUploadSection.appendChild(imageUploadLabel);
  imageUploadSection.appendChild(imageUploadInput);
  importContent.appendChild(imageUploadSection);

  // Add image preview section
  const previewSection = document.createElement('div');
  previewSection.className = 'preview-section';

  const previewLabel = document.createElement('div');
  previewLabel.textContent = 'Position:';
  previewLabel.className = 'preview-label';

  const previewContainer = document.createElement('div');
  previewContainer.className = 'preview-container';

  const previewImage = document.createElement('img');
  previewContainer.appendChild(previewImage);

  previewSection.appendChild(previewLabel);
  previewSection.appendChild(previewContainer);
  importContent.appendChild(previewSection);


  // Add wheel event handler to prevent page scrolling when scrolling inside the panel
  importContent.addEventListener('wheel', (e) => {
    const contentHeight = importContent.scrollHeight;
    const visibleHeight = importContent.clientHeight;
    const scrollTop = importContent.scrollTop;

    // Check if scrolling down and already at the bottom
    if (e.deltaY > 0 && scrollTop + visibleHeight >= contentHeight) {
      e.preventDefault();
    }
    // Check if scrolling up and already at the top
    else if (e.deltaY < 0 && scrollTop <= 0) {
      e.preventDefault();
    }
    else {
      // We're in the middle of the content, stop event propagation
      e.stopPropagation();
    }
  }, { passive: false });


  // Add event listeners for image preview

  // Update the URL input event handler to automatically analyze images
  imageUrlInput.addEventListener('input', () => {
    const url = imageUrlInput.value.trim();
    if (url) {
      // Show preview section with loading indicator
      previewSection.style.display = 'flex';
      previewContainer.innerHTML = '<div class="loading-spinner">Loading image...</div>';

      // Process URL immediately instead of just showing a preview
      setTimeout(async () => {
        try {
          // Use a CORS proxy to fetch the image directly
          const corsProxyUrl = 'https://corsproxy.io/?';
          const proxyUrl = corsProxyUrl + encodeURIComponent(url);

          const response = await fetch(proxyUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch image (status: ${response.status})`);
          }

          const blob = await response.blob();
          const imageData = await blobToBase64(blob);

          // Show a preview of the image
          previewContainer.innerHTML = '';
          const previewImg = document.createElement('img');
          previewImg.src = URL.createObjectURL(blob);
          previewImg.alt = 'Chess position';
          previewImg.className = 'preview-image';
          previewContainer.appendChild(previewImg);

          // Now analyze the image
          analyzeChessImage(imageData);

        } catch (e) {
          console.error('Error processing URL:', e);
          previewContainer.innerHTML = '';
          const errorMsg = document.createElement('div');
          errorMsg.textContent = 'Invalid FEN string format';
          errorMsg.className = 'fen-note error-message';
          previewContainer.appendChild(errorMsg);
        }
      }, 500); // Small delay to avoid processing while user is still typing
    } else {
      // Hide preview if URL is empty
      previewSection.style.display = 'none';
    }
  });

  // For file upload
  imageUploadInput.addEventListener('change', () => {
    const file = imageUploadInput.files[0];
    if (file && file.type.startsWith('image/')) {
      // Show preview section with loading indicator
      previewSection.style.display = 'flex';
      previewContainer.innerHTML = '<div class="loading-spinner">Loading image...</div>';

      // Create file reader to read the image
      const reader = new FileReader();
      reader.onload = (e) => {
        // Skip showing preview, go straight to analysis
        analyzeChessImage(e.target.result).catch(e => {
          console.error('Error analyzing uploaded image:', e);
          const errorMsg = document.createElement('div');
          errorMsg.textContent = 'Error analyzing image: ' + e.message;
          errorMsg.className = 'fen-note';
          previewContainer.appendChild(errorMsg);
        });
      };

      reader.onerror = () => {
        previewContainer.innerHTML = '';
        const errorMsg = document.createElement('div');
        errorMsg.innerHTML = `
            <p>Error loading image file.</p>
            <p>Please try another file.</p>
          `;
        errorMsg.className = 'fen-note';
        previewContainer.appendChild(errorMsg);
      };

      reader.readAsDataURL(file);
    } else if (file) {
      // Show error if file is not an image
      previewSection.style.display = 'flex';
      previewContainer.innerHTML = '';

      const errorMsg = document.createElement('div');
      errorMsg.innerHTML = `
          <p>Selected file is not an image.</p>
          <p>Please select a JPG, PNG, or GIF file.</p>
        `;
      errorMsg.className = 'fen-note';
      previewContainer.appendChild(errorMsg);
    } else {
      // Hide preview if no file is selected
      previewSection.style.display = 'none';
    }
  });

  // Button container
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';


  // Import button - update to Search Similar
  const okButton = document.createElement('button');
  okButton.className = 'import-button disabled';
  okButton.disabled = true; // Start with button disabled

  // Add the SVG icon
  const searchIcon = document.createElement('img');
  searchIcon.src = 'assets/svg/similarity_search.svg';
  searchIcon.alt = 'Search Similar Icon';
  searchIcon.className = 'search-icon';
  okButton.appendChild(searchIcon);

  // Add text label
  const buttonText = document.createElement('span');
  buttonText.textContent = 'Search Similar';
  okButton.appendChild(buttonText);


  // Cancel button
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.className = 'cancel-button';
  cancelButton.addEventListener('click', () => {
    importPanel.style.visibility = 'hidden';
  });

  buttonContainer.appendChild(okButton);
  buttonContainer.appendChild(cancelButton);
  importContent.appendChild(buttonContainer);

  // Append panel to body
  document.body.appendChild(importPanel);

  // Add event listener for FEN input to show preview
  fenInput.addEventListener('input', () => {
    const fen = fenInput.value.trim();
    if (fen) {
      // Show preview section
      previewSection.style.display = 'flex';
      updateBoardWithFen(fen, previewContainer);
    } else {
      // Hide preview if FEN is empty
      previewSection.style.display = 'none';
    }
  });

  // Extract the image analysis logic into a reusable function
  async function analyzeChessImage(imageData) {
    try {
      // Show loading state
      previewContainer.innerHTML = '<div class="loading-spinner">Analyzing chess position...</div>';

      // Convert any image format to JPEG
      const jpegBase64 = await convertToJpeg(imageData);

      // Prepare the request to ChessVision.ai
      const payload = {
        board_orientation: "predict",
        cropped: false,
        current_player: "white",
        image: "data:image/jpeg;base64," + jpegBase64,
        predict_turn: true
      };

      // Send to ChessVision.ai (using HTTPS)
      const response = await fetch('https://app.chessvision.ai/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`ChessVision API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      // Check for FEN in the correct location of the response structure
      // The API returns the FEN in result.result, not result.fen
      if (result && result.result) {
        // Get the FEN string from the response
        let fenString = result.result;

        // Fix the FEN format - replace underscores with spaces
        const fixedFenString = fenString.replace(/_/g, ' ');
        // Update the FEN input
        fenInput.value = fixedFenString;

        // Use our shared function to update the board
        if (!updateBoardWithFen(fixedFenString, previewContainer)) {
          throw new Error('Invalid FEN received from analysis');
        }

        return true;
      } else {
        throw new Error('No FEN found in ChessVision response');
      }
    } catch (e) {
      console.error('Error in image processing:', e);
      previewContainer.innerHTML = '';
      const errorMsg = document.createElement('div');
      errorMsg.textContent = 'Error analyzing image: ' + e.message;
      errorMsg.className = 'fen-note';
      previewContainer.appendChild(errorMsg);
      return false;
    }
  }

  // Add a function to convert any image format to JPEG
  async function convertToJpeg(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw image on canvas
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = 'white'; // White background for transparent PNGs
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          // Convert to JPEG data URL
          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9); // 90% quality

          // Extract base64 part
          const base64 = jpegDataUrl.split(',')[1];
          resolve(base64);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = (e) => {
        reject(new Error('Failed to load image for conversion'));
      };

      img.src = dataUrl;
    });
  }



  // Helper function to convert a blob to base64
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Add this function to call the Stockfish online API
  async function getStockfishAnalysis(fen) {
    try {
      const apiUrl = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=15`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Stockfish API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (e) {
      console.error('Error fetching Stockfish analysis:', e);
      throw e;
    }
  }

  // Update the updateBoardWithFen function to place engine analysis below the preview container
  function updateBoardWithFen(fenString, previewContainer) {
    try {
      // Create temporary div for the chess board preview
      let boardPreview = previewContainer.querySelector('.fen-preview-board');

      // Clear previous content if needed
      if (!boardPreview) {
        // Remove existing content
        previewContainer.innerHTML = '';

        // Create new board container
        boardPreview = document.createElement('div');
        boardPreview.className = 'fen-preview-board';
        previewContainer.appendChild(boardPreview);
      }

      // Initialize chess instance to validate FEN
      const chess = new Chess();

      // Try to load the FEN
      if (chess.load(fenString)) {
        // Valid FEN - create or update the board

        // Clear any error messages that might exist
        const existingErrorMsg = previewContainer.querySelector('.fen-note');
        if (existingErrorMsg) {
          existingErrorMsg.remove();
        }

        // Determine whose turn it is from the FEN
        const fenParts = fenString.split(' ');
        const activeColor = fenParts.length > 1 ? fenParts[1] : 'w';
        const orientation = activeColor === 'b' ? 'black' : 'white';

        if (boardPreview.chessboard) {
          // Update existing board
          boardPreview.chessboard.position(fenString);
          boardPreview.chessboard.orientation(orientation);
        } else {
          // Create new board with proper sizing and orientation
          boardPreview.chessboard = Chessboard(boardPreview, {
            position: fenString,
            draggable: false,
            showNotation: true,
            orientation: orientation,
            width: '100%'
          });

          // Do an immediate resize followed by a delayed one
          if (boardPreview.chessboard) {
            boardPreview.chessboard.resize();

            window.setTimeout(() => {
              if (boardPreview.chessboard) {
                boardPreview.chessboard.resize();
              }
            }, 250);
          }
        }

        // Get the parent element that contains the preview container
        const previewSection = previewContainer.parentNode;

        // Now add Stockfish analysis section BELOW the preview container
        let analysisContainer = document.getElementById('stockfish-analysis');
        if (!analysisContainer) {
          analysisContainer = document.createElement('div');
          analysisContainer.id = 'stockfish-analysis';
          analysisContainer.className = 'stockfish-analysis';
          
          // Insert after previewContainer
          previewSection.insertBefore(analysisContainer, previewContainer.nextSibling);
        }

        // Show loading state
        analysisContainer.innerHTML = '<div class="loading-spinner">Calculating best move...</div>';

        // Get the analysis asynchronously (don't block the UI)
        getStockfishAnalysis(fenString)
          .then(analysis => {
            if (analysis && analysis.success) {
              let evalText = '';

              // Handle mate score
              if (analysis.mate) {
                evalText = `Mate in ${analysis.mate}`;
              }
              // Handle normal evaluation
              else if (analysis.evaluation !== null) {
                // Convert evaluation to a formatted string with sign
                const scoreValue = parseFloat(analysis.evaluation);
                const scoreSign = scoreValue > 0 ? '+' : '';
                evalText = `Evaluation: ${scoreSign}${scoreValue.toFixed(2)}`;
              } else {
                evalText = 'Evaluation: 0.00';
              }

              // Convert UCI moves to SAN format
              let sanMoves = [];
              if (analysis.continuation) {
                // Create a chess instance with the current position
                const chessForMoves = new Chess(fenString);

                // Split the continuation into individual moves
                const uciMoves = analysis.continuation.split(' ');

                // Convert each UCI move to SAN
                for (const uciMove of uciMoves) {
                  try {
                    // UCI format is from-to, like "e2e4"
                    const from = uciMove.substring(0, 2);
                    const to = uciMove.substring(2, 4);
                    // Check for promotion
                    let promotion = undefined;
                    if (uciMove.length > 4) {
                      promotion = uciMove.substring(4, 5);
                    }

                    // Create move object
                    const moveObj = {
                      from: from,
                      to: to,
                      promotion: promotion
                    };

                    // Make the move
                    const move = chessForMoves.move(moveObj);

                    // If move is valid, add its SAN representation
                    if (move) {
                      sanMoves.push(move.san);
                    }
                  } catch (e) {
                    console.error('Error converting move:', uciMove, e);
                  }
                }
                // After successfully processing moves, enable the search button
                if (sanMoves.length > 0) {
                  okButton.disabled = false;
                  okButton.className = 'import-button enabled';
                } else {
                  okButton.disabled = true;
                  okButton.className = 'import-button disabled';
                }
              }
              else {
                // No continuation available, keep button disabled
                okButton.disabled = true;
                okButton.className = 'import-button disabled';
              }


              // Join the SAN moves into a readable format
              let bestLine = '';

              if (sanMoves.length > 0) {
                // Store the original FEN for resetting
                const originalFen = fenString;

                // Create slider container
                const sliderContainer = document.createElement('div');
                sliderContainer.className = 'slider-container';

                // Create a container for the line text and edit button
                const lineContainer = document.createElement('div');
                lineContainer.className = 'line-container';

                // Create a div for the line text that will be styled
                const lineTextContainer = document.createElement('div');
                lineTextContainer.className = 'line-text-container';

                // Create edit button
                const editButton = document.createElement('button');
                editButton.innerHTML = '✏️';
                editButton.title = 'Edit analysis line';
                editButton.className = 'edit-button';
                

                // Add click handler for edit button
                editButton.addEventListener('click', async () => {
                  // Open the editor with just the original FEN
                  const result = await createLineEditor(originalFen);

                  if (result && result.sanMoves.length > 0) {
                    // Update the moves with the new custom line
                    sanMoves = result.sanMoves;

                    // Re-format the moves with proper move numbers
                    formattedMoves = [];
                    let moveNumber = fullMoveNumber;

                    // Process each move for display
                    for (let i = 0; i < sanMoves.length; i++) {
                      let moveText = "";
                      // Add move number before White's move
                      if (i === 0 && activeColor === 'w') {
                        moveText = moveNumber + '.' + sanMoves[i];
                      }
                      // Add move number before White's move (every even index after initial Black move)
                      else if (i === 0 && activeColor === 'b') {
                        moveText = moveNumber + '...' + sanMoves[i];
                        moveNumber++; // Increment move number after Black's move
                      }
                      // Add move number before White's moves (every even index if starting with White)
                      else if (activeColor === 'w' && i % 2 === 0) {
                        moveNumber++;
                        moveText = moveNumber + '.' + sanMoves[i];
                      }
                      // Add move number before White's moves (every odd index if starting with Black)
                      else if (activeColor === 'b' && i % 2 === 1) {
                        moveNumber++;
                        moveText = moveNumber + '.' + sanMoves[i];
                      }
                      // Just add the move without a number for Black's moves
                      else {
                        moveText = sanMoves[i];
                      }
                      formattedMoves.push(moveText);
                    }

                    // Update the evaluation text to indicate this is a custom line
                    analysisContainer.innerHTML = `
  <div><strong>Custom Analysis Line</strong> <span style="color:#f8c4c4; font-style:italic;">(Evaluation not available)</span></div>
`;
                    
                    // Add the slider container back
                    analysisContainer.appendChild(sliderContainer);
                    
                    // Update the slider and line display
                    slider.max = (sanMoves.length - 1).toString();
                    slider.value = (sanMoves.length - 1).toString(); // Reset to end
                    updateLineDisplay();

                    // Enable the Search Similar button
                    okButton.disabled = false;
                    okButton.style.opacity = '1';
                    okButton.style.cursor = 'pointer';
                  }
                });

                lineContainer.appendChild(lineTextContainer);
                lineContainer.appendChild(editButton);
                sliderContainer.appendChild(lineContainer);

                // Create the slider element
                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = "0";
                slider.max = (sanMoves.length - 1).toString();
                slider.value = (sanMoves.length - 1).toString(); // Start at the end
                slider.className = 'analysis-slider';

                // Format all moves with proper move numbers
                let formattedMoves = [];

                // Get the starting move number from FEN
                const fenParts = fenString.split(' ');
                const fullMoveNumber = fenParts.length >= 6 ? parseInt(fenParts[5]) : 1;
                const activeColor = fenParts.length >= 2 ? fenParts[1] : 'w';

                let moveNumber = fullMoveNumber;

                // Process each move for display
                for (let i = 0; i < sanMoves.length; i++) {
                  let moveText = "";
                  // Add move number before White's move
                  if (i === 0 && activeColor === 'w') {
                    moveText = moveNumber + '.' + sanMoves[i];
                  }
                  // Add move number before White's move (every even index after initial Black move)
                  else if (i === 0 && activeColor === 'b') {
                    moveText = moveNumber + '...' + sanMoves[i];
                    moveNumber++; // Increment move number after Black's move
                  }
                  // Add move number before White's moves (every even index if starting with White)
                  else if (activeColor === 'w' && i % 2 === 0) {
                    moveNumber++;
                    moveText = moveNumber + '.' + sanMoves[i];
                  }
                  // Add move number before White's moves (every odd index if starting with Black)
                  else if (activeColor === 'b' && i % 2 === 1) {
                    moveNumber++;
                    moveText = moveNumber + '.' + sanMoves[i];
                  }
                  // Just add the move without a number for Black's moves
                  else {
                    moveText = sanMoves[i];
                  }
                  formattedMoves.push(moveText);
                }
                // Function to update line display and board position based on slider
                const updateLineDisplay = () => {
                  const sliderValue = parseInt(slider.value);

                  // Snap to even indices (0, 2, 4, etc.)
                  const snappedValue = Math.floor(sliderValue / 2) * 2;

                  // Only change the value if it's different from the current value
                  // and it's within the valid range of moves
                  if (snappedValue !== sliderValue && snappedValue < sanMoves.length) {
                    slider.value = snappedValue.toString();
                  } else if (snappedValue >= sanMoves.length && sanMoves.length > 1) {
                    // If snapped value would be out of range, use the largest valid odd index
                    const largestOddIndex = sanMoves.length % 2 === 0 ?
                      sanMoves.length - 1 : sanMoves.length - 2;
                    slider.value = largestOddIndex.toString();
                  }

                  // Create the display text with active and greyed out parts
                  lineTextContainer.innerHTML = '';

                  // Active part (before and including slider position)
                  const activePart = document.createElement('span');
                  activePart.className = 'active-moves';
                  activePart.textContent = formattedMoves.slice(0, parseInt(slider.value) + 1).join(' ') + ' ';
                  lineTextContainer.appendChild(activePart);

                  // Greyed out part (after slider position)
                  if (parseInt(slider.value) < formattedMoves.length - 1) {
                    const greyedPart = document.createElement('span');
                    greyedPart.className = 'inactive-moves';
                    greyedPart.textContent = formattedMoves.slice(parseInt(slider.value) + 1).join(' ');
                    lineTextContainer.appendChild(greyedPart);
                  }

                  // Update board position to match slider position
                  updateBoardPosition(parseInt(slider.value));
                };

                // Function to update the board position based on number of moves
                const updateBoardPosition = (moveCount) => {
                  // Create a new Chess instance starting from the original position
                  const tempChess = new Chess(originalFen);

                  // Track the last move and penultimate move to highlight them
                  let lastFrom = null;
                  let lastTo = null;
                  let penultimateFrom = null;
                  let penultimateTo = null;

                  // Apply moves up to the current slider position
                  for (let i = 0; i <= moveCount && i < sanMoves.length; i++) {
                    const move = tempChess.move(sanMoves[i]);
                    if (i === moveCount) {
                      // Store the source and target of the last move
                      lastFrom = move.from;
                      lastTo = move.to;
                    } else if (i === moveCount - 1) {
                      // Store the source and target of the penultimate move
                      penultimateFrom = move.from;
                      penultimateTo = move.to;
                    }
                  }

                  // Update the board with the new position
                  if (boardPreview.chessboard) {
                    boardPreview.chessboard.position(tempChess.fen());

                    // Highlight the moves
                    highlightLastMoveOnPreviewBoard(lastFrom, lastTo, penultimateFrom, penultimateTo);
                  }
                };
                // Function to reset the board position (this is the missing function)
                const resetBoardPosition = () => {
                  // Reset the board to the original position without applying any moves
                  if (boardPreview.chessboard) {
                    // Set the position back to the original FEN
                    boardPreview.chessboard.position(originalFen);
                    
                    // Clear any highlights
                    const previewSquares = boardPreview.querySelectorAll('.highlight-light, .highlight-dark, .highlight-prev-light, .highlight-prev-dark');
                    previewSquares.forEach(sq => {
                      sq.classList.remove('highlight-light');
                      sq.classList.remove('highlight-dark');
                      sq.classList.remove('highlight-prev-light');
                      sq.classList.remove('highlight-prev-dark');
                    });
                  }
                };


                // Function to highlight last move on the preview board
                const highlightLastMoveOnPreviewBoard = (source, target, prevSource, prevTarget) => {
                  // Remove previous highlights from preview board
                  const previewSquares = boardPreview.querySelectorAll('.highlight-light, .highlight-dark, .highlight-prev-light, .highlight-prev-dark');
                  previewSquares.forEach(sq => {
                    sq.classList.remove('highlight-light');
                    sq.classList.remove('highlight-dark');
                    sq.classList.remove('highlight-prev-light');
                    sq.classList.remove('highlight-prev-dark');
                  });

                  // Determine if a square is light or dark
                  function isLightSquare(square) {
                    const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
                    const rank = parseInt(square[1]) - 1;
                    return (file + rank) % 2 === 1; // Light squares have odd sums
                  }

                  // Highlight the penultimate move if available (with reddish highlight)
                  if (prevSource && prevTarget) {
                    const prevSourceSquare = boardPreview.querySelector(`.square-${prevSource}`);
                    const prevTargetSquare = boardPreview.querySelector(`.square-${prevTarget}`);

                    if (prevSourceSquare) {
                      if (isLightSquare(prevSource)) {
                        prevSourceSquare.classList.add('highlight-prev-light');
                      } else {
                        prevSourceSquare.classList.add('highlight-prev-dark');
                      }
                    }

                    if (prevTargetSquare) {
                      if (isLightSquare(prevTarget)) {
                        prevTargetSquare.classList.add('highlight-prev-light');
                      } else {
                        prevTargetSquare.classList.add('highlight-prev-dark');
                      }
                    }
                  }

                  // Highlight the last move (with yellow highlight)
                  if (source && target) {
                    const sourceSquare = boardPreview.querySelector(`.square-${source}`);
                    const targetSquare = boardPreview.querySelector(`.square-${target}`);

                    if (sourceSquare) {
                      if (isLightSquare(source)) {
                        sourceSquare.classList.add('highlight-light');
                      } else {
                        sourceSquare.classList.add('highlight-dark');
                      }
                    }

                    if (targetSquare) {
                      if (isLightSquare(target)) {
                        targetSquare.classList.add('highlight-light');
                      } else {
                        targetSquare.classList.add('highlight-dark');
                      }
                    }
                  }
                };

                // Add event listener for slider input (during dragging)
                slider.addEventListener('input', updateLineDisplay);

                // Add event listener for slider change (when released)
                slider.addEventListener('change', resetBoardPosition);

                // Initial display update
                updateLineDisplay();

                // Initial board position (start with original position)
                resetBoardPosition();

                // Add slider and line display to container
                sliderContainer.appendChild(lineTextContainer);
                sliderContainer.appendChild(slider);

                // Update the analysis container
                analysisContainer.innerHTML = `
      <div><strong>${evalText}</strong></div>
    `;
                analysisContainer.appendChild(sliderContainer);
              } else {
                bestLine = 'No continuation available';
                analysisContainer.innerHTML = `
      <div><strong>${evalText}</strong></div>
      <div>Line: ${bestLine}</div>
    `;
              }
            } else {
              analysisContainer.innerHTML = '<div>No analysis available</div>';
            }
          })
          .catch(e => {
            // Error in analysis, keep button disabled
            okButton.disabled = true;
            okButton.style.opacity = '0.5';
            okButton.style.cursor = 'not-allowed';
            console.error('Error displaying Stockfish analysis:', e);
            analysisContainer.innerHTML = '<div>Engine analysis failed: ' + e.message + '</div>';
          });

        return true;
      } else {
        // Invalid FEN - show error message
        // DON'T clear boardPreview.innerHTML as it breaks future updates

        // Remove any existing chessboard
        if (boardPreview.chessboard) {
          boardPreview.chessboard.destroy();
          boardPreview.chessboard = null;
        }

        // Show error message without destroying the board container
        const errorMsg = document.createElement('div');
        errorMsg.textContent = 'Invalid FEN string format';
        errorMsg.className = 'fen-note';
        errorMsg.style.color = '#ff6b6b';
        errorMsg.style.padding = '10px';
        errorMsg.style.textAlign = 'center';

        // Remove any existing message
        const existingNote = previewContainer.querySelector('.fen-note');
        if (existingNote) {
          existingNote.remove();
        }

        previewContainer.appendChild(errorMsg);
        return false;
      }
    } catch (e) {
      console.error('Error rendering FEN preview:', e);

      // Show error message without destroying the board container
      const errorMsg = document.createElement('div');
      errorMsg.textContent = 'Error rendering position: ' + e.message;
      errorMsg.className = 'fen-note';
      errorMsg.style.color = '#ff6b6b';
      errorMsg.style.padding = '10px';
      errorMsg.style.textAlign = 'center';

      // Remove any existing message
      const existingNote = previewContainer.querySelector('.fen-note');
      if (existingNote) {
        existingNote.remove();
      }

      previewContainer.appendChild(errorMsg);
      return false;
    }
  }


  function tonCombination(fen, moves) {


    // Create a chess instance with the current position
    const chess = new Chess(fen);
    const tonMoves = [];

    // Track piece counts for capture detection
    function countPieces(board) {
      const pieceCount = {
        'K': 0, 'Q': 0, 'R': 0, 'B': 0, 'N': 0, 'P': 0,
        'k': 0, 'q': 0, 'r': 0, 'b': 0, 'n': 0, 'p': 0
      };

      // Count pieces on the board
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const piece = board[i][j];
          if (piece) {
            pieceCount[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()]++;
          }
        }
      }
      return pieceCount;
    }

    for (const move of moves) {
      // Handle castling moves explicitly
      if (move.match(/^O-O(-O)?[+#]?$/)) {
        tonMoves.push(move);
        continue;
      }

      const pieceCountBefore = countPieces(chess.board());

      // Get the UCI components before making the move
      const moveObj = chess.move(move);
      if (!moveObj) {
        console.error("Invalid move:", move);
        continue;
      }

      const pieceCountAfter = countPieces(chess.board());

      // Determine if a piece was captured and which one
      let capturedPiece = "";
      for (const piece in pieceCountBefore) {
        if (pieceCountBefore[piece] > pieceCountAfter[piece]) {
          if (moveObj.promotion === undefined || (moveObj.flags.includes('c') && piece !== 'P' && piece !== 'p')) {
            capturedPiece = piece.toLowerCase();
          }
        }
      }

      // Build the TON format move
      let tonMove;
      if (moveObj.piece.toUpperCase() !== 'P') {
        tonMove = `${moveObj.piece.toUpperCase()}${moveObj.flags.includes('c') ? 'x' : ''}${capturedPiece}${moveObj.to}${moveObj.promotion || ''}${moveObj.san.includes('+') ? '+' : ''}${moveObj.san.includes('#') ? '#' : ''}`;
      } else {
        tonMove = `P${moveObj.flags.includes('c') ? 'x' : ''}${capturedPiece}${moveObj.to}${moveObj.promotion || ''}${moveObj.san.includes('+') ? '+' : ''}${moveObj.san.includes('#') ? '#' : ''}`;
      }

      tonMoves.push(tonMove);
    }

    const result = tonMoves.join(' ');
    return result;
  }

  // Update the okButton click handler to create and save a custom puzzle
  okButton.addEventListener('click', async () => {
    const fen = fenInput.value.trim();

    if (fen) {
      try {
        importPanel.style.visibility = 'hidden';
        // Get the active moves from the analysis
        const analysisContainer = document.getElementById('stockfish-analysis');
        if (analysisContainer) {
          const activeSpan = analysisContainer.querySelector('.active-moves');
          if (activeSpan) {
            // Extract the active moves
            const activeMoveText = activeSpan.textContent.trim();

            // Extract SAN moves using regex to remove move numbers
            const sanMoves = [];
            const moveRegex = /([NBRQKP]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQK])?(?:\+|#)?|O-O(?:-O)?(?:\+|#)?)/g;
            let match;
            while ((match = moveRegex.exec(activeMoveText)) !== null) {
              sanMoves.push(match[1]);
            }

            if (sanMoves.length > 0) {
              // Generate a custom puzzle ID with timestamp with HHMMSS format
              const now = new Date();
              const hours = String(now.getHours()).padStart(2, '0');
              const minutes = String(now.getMinutes()).padStart(2, '0');
              const seconds = String(now.getSeconds()).padStart(2, '0');
              const customPuzzleId = `c_${hours}${minutes}${seconds}`;

              // Convert to TON format
              const tonMoves = tonCombination(fen, sanMoves);

              // Convert SAN moves to UCI format for storing in puzzle
              const uciMoves = [];
              const tempChess = new Chess(fen);
              for (const san of sanMoves) {
                const move = tempChess.move(san);
                if (move) {
                  uciMoves.push(move.from + move.to + (move.promotion || ''));
                }
              }

              // Create a custom puzzle object
              const customPuzzle = {
                puzzle_id: customPuzzleId,
                fen: fen,
                moves: uciMoves.join(' '),
                themes: 'custom',
                rating: 0,
                moves_ton: tonMoves,
                mark: ''
              };

              // Save the custom puzzle to the solved puzzles log using the passed function
              await saveSolvedPuzzle(customPuzzle);

              // Update the solved puzzles display using the passed function
              fetchSolvedPuzzles();

              // Create loading overlay
              const loadingElement = document.createElement('div');
              loadingElement.className = 'loading-overlay';
              loadingElement.innerHTML = '<div class="loading-spinner"></div><div>Searching...</div>';
              
              document.body.appendChild(loadingElement);

              // Call the search function directly
              window.triggerSearchSimilarWithMoves(tonMoves, customPuzzleId);

              // Update the solved puzzles display
              fetchSolvedPuzzles();

              // Hide the import panel
              importPanel.style.visibility = 'hidden';

              // Remove loading overlay after a short delay
              setTimeout(() => {
                document.body.removeChild(loadingElement);
              }, 2000);

              return;
            } else {
              alert("No valid moves found in the analysis");
            }
          } else {
            alert("No active moves found in the analysis");
          }
        } else {
          alert("No analysis available");
        }
      } catch (e) {
        console.error("Error processing TON format:", e);
        alert("Error: " + e.message);
      }
      // Hide the import panel
      importPanel.style.visibility = 'hidden';
    } else {
      // No FEN provided
      alert('Please provide a FEN string or analyze an image.');
    }
  });

  // Add this code to fix the chessboard reference issue
  function createLineEditor(originalFen) {
    // Create a unique ID for this board instance
    const boardId = 'editor-board-' + Date.now();

    // Create the editor panel
    const editorPanel = document.createElement('div');
    editorPanel.id = 'line-editor-panel';
    
    // Prevent scrolling on touch devices
    editorPanel.addEventListener('touchmove', function(e) {
      e.preventDefault();
    }, { passive: false });
    
    // Prevent scrolling when user interacts with the board
    editorPanel.addEventListener('wheel', function(e) {
      e.preventDefault();
    }, { passive: false });

    // Add header
    const header = document.createElement('div');
    header.textContent = 'Create Analysis Line';
    header.className = 'editor-header';
    editorPanel.appendChild(header);

    // Add board container with unique ID
    const boardContainer = document.createElement('div');
    boardContainer.id = boardId; // Use a unique ID
    boardContainer.className = 'editor-board-container';
    editorPanel.appendChild(boardContainer);

    // Add CSS to document to help with mobile scrolling issues
    const scrollStyle = document.createElement('style');
    scrollStyle.textContent = `
    #${boardId} {
      touch-action: none;
      pointer-events: auto;
    }
    #${boardId} .square-55d63 {
      touch-action: none;
    }
  `;
    document.head.appendChild(scrollStyle);
    
    // Add class to body to prevent scrolling
    document.body.classList.add('editor-open');

    // Create a new Chess instance for the editor
    const chess = new Chess(originalFen);

    // Start with empty moves array
    const editorMoves = [];
    let currentMoveIndex = 0;

    // Add to document first so DOM elements exist
    document.body.appendChild(editorPanel);

    // Navigation buttons
    const navContainer = document.createElement('div');
    navContainer.className = 'editor-nav-container';

    const backwardButton = document.createElement('button');
    backwardButton.innerHTML = '<';
    backwardButton.title = 'Go Backward';
    backwardButton.className = 'editor-nav-button';
    backwardButton.disabled = true;

    const forwardButton = document.createElement('button');
    forwardButton.innerHTML = '>';
    forwardButton.title = 'Go Forward';
    forwardButton.className = 'editor-nav-button';
    forwardButton.disabled = true;

    navContainer.appendChild(backwardButton);
    navContainer.appendChild(forwardButton);
    editorPanel.appendChild(navContainer);

    // Add text area for displaying moves
    const movesDisplay = document.createElement('textarea');
    movesDisplay.className = 'editor-moves-display';
    movesDisplay.readOnly = true;
    editorPanel.appendChild(movesDisplay);

    // Add buttons container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'editor-button-container';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'editor-button';

    const okButton = document.createElement('button');
    okButton.textContent = 'Apply Changes';
    okButton.className = 'editor-button editor-apply-button';
    buttonContainer.appendChild(okButton);
    buttonContainer.appendChild(cancelButton);

    editorPanel.appendChild(buttonContainer);

    // Constants for promotion detection
    const FIRST_RANK = 1; // For black pawns
    const EIGTH_RANK = 8; // For white pawns

    // Check if a move is a promotion move
    function isPromotionMove(source, target) {
      const targetRank = parseInt(target[1]);
      const piece = chess.get(source)?.type;

      // Check if the piece is a pawn
      if (piece !== 'p') return false;

      // Check if the move reaches the last rank
      if (!(targetRank === EIGTH_RANK || targetRank === FIRST_RANK)) return false;

      // Test if the move is legal
      const testMove = chess.move({
        from: source,
        to: target,
        promotion: 'q' // Temporarily test with queen promotion
      });

      if (testMove === null) return false; // Illegal move

      // Undo the test move
      chess.undo();

      return true; // Legal promotion move
    }

    // Show promotion menu
    function showPromotionMenu(target, callback) {
      const file = target[0];
      const rank = parseInt(target[1]);
      const boardOrientation = chessboard.orientation(); // Get the current board orientation
      const isFlipped = boardOrientation === 'black';

      // Determine the promotion color based on orientation and rank
      const isTopRank = isFlipped ? rank === FIRST_RANK : rank === EIGTH_RANK; 
      const color = rank === EIGTH_RANK ? 'w' : 'b'; // White promotes on the top rank, Black on the bottom rank

      // Determine the order of pieces based on the rank
      const pieces = isTopRank ? ['q', 'n', 'r', 'b'] : ['b', 'r', 'n', 'q'];

      // Calculate the size of a chessboard square
      const squareSize = document.querySelector(`#${boardId} .square-55d63`).offsetWidth;

      // Create the promotion menu
      const menu = document.createElement('div');
      menu.id = 'promotion-menu';
      menu.className = 'promotion-menu';
      menu.style.gridTemplateRows = `repeat(4, ${squareSize}px) ${squareSize / 2}px`; // 4 rows for pieces, 0.5 row for cancel button
      menu.style.width = `${squareSize}px`;
      menu.style.height = `${4 * squareSize + squareSize / 2}px`;

      // Calculate menu position
      const boardRect = document.getElementById(boardId).getBoundingClientRect();
      let left;
      if (color === 'w') {
        left = isTopRank
          ? boardRect.left + (file.charCodeAt(0) - 'a'.charCodeAt(0)) * squareSize
          : boardRect.left + (7 - (file.charCodeAt(0) - 'a'.charCodeAt(0))) * squareSize;
      } else {
        left = isTopRank
          ? boardRect.left + (7 - (file.charCodeAt(0) - 'a'.charCodeAt(0))) * squareSize
          : boardRect.left + (file.charCodeAt(0) - 'a'.charCodeAt(0)) * squareSize;
      }
      const top = boardRect.top + (isTopRank ? 0 : 4 * squareSize);

      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;

      // Add promotion options with piece images
      pieces.forEach((piece) => {
        const option = document.createElement('div');
        option.className = 'promotion-option';
        option.style.width = `${squareSize}px`;
        option.style.height = `${squareSize}px`;

        const img = document.createElement('img');
        img.src = `img/chesspieces/wikipedia/${color}${piece.toUpperCase()}.png`;
        img.alt = piece;
        img.style.width = '80%';
        img.style.height = '80%';
        
        option.appendChild(img);
        option.addEventListener('click', () => {
          document.body.removeChild(menu);
          callback(piece);
        });
        
        menu.appendChild(option);
      });

      // Add cancel button
      const cancel = document.createElement('div');
      cancel.innerHTML = '&#x2715;';
      cancel.className = 'promotion-cancel';
      cancel.style.width = `${squareSize}px`;
      cancel.style.height = `${squareSize / 2}px`;
      
      cancel.addEventListener('click', () => {
        document.body.removeChild(menu);
        callback(null); // Cancel promotion
      });
      
      menu.appendChild(cancel);

      // Append the menu to the body
      document.body.appendChild(menu);
    }

    // Modified highlight functions that only affect this specific board
    function highlightLastMoveOnBoard(source, target) {
      // Clear previous highlights only in this board
      const editorSquares = editorPanel.querySelectorAll('.highlight-light, .highlight-dark');
      editorSquares.forEach(sq => {
        sq.classList.remove('highlight-light');
        sq.classList.remove('highlight-dark');
      });

      // Determine if a square is light or dark
      function isLightSquare(square) {
        const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = parseInt(square[1]) - 1;
        return (file + rank) % 2 === 1;
      }

      // Use more specific selectors that only target this editor's board
      const sourceSquare = editorPanel.querySelector(`.square-${source}`);
      const targetSquare = editorPanel.querySelector(`.square-${target}`);

      if (sourceSquare && targetSquare) {
        if (isLightSquare(source)) {
          sourceSquare.classList.add('highlight-light');
        } else {
          sourceSquare.classList.add('highlight-dark');
        }

        if (isLightSquare(target)) {
          targetSquare.classList.add('highlight-light');
        } else {
          targetSquare.classList.add('highlight-dark');
        }
      }
    }

    function resetHighlights() {
      // Only reset highlights in this board
      const squares = editorPanel.querySelectorAll('.highlight-light, .highlight-dark');
      squares.forEach(sq => {
        sq.classList.remove('highlight-light');
        sq.classList.remove('highlight-dark');
      });
    }

    // Update navigation button states
    function updateNavButtons() {
      backwardButton.disabled = currentMoveIndex === 0;
      forwardButton.disabled = currentMoveIndex >= editorMoves.length;
    }

    // Move backward in the editor
    function moveBackwardInEditor() {
      if (currentMoveIndex > 0) {
        currentMoveIndex--;
        chess.undo();
        chessboard.position(chess.fen());
        updateNavButtons();
        updateMovesDisplay();

        // Handle highlighting the previous move
        if (currentMoveIndex > 0) {
          const prevMove = editorMoves[currentMoveIndex - 1];
          const from = prevMove.substring(0, 2);
          const to = prevMove.substring(2, 4);
          highlightLastMoveOnBoard(from, to);
        } else {
          resetHighlights();
        }
      }
    }

    // Move forward in the editor
    function moveForwardInEditor() {
      if (currentMoveIndex < editorMoves.length) {
        const moveString = editorMoves[currentMoveIndex];
        const from = moveString.substring(0, 2);
        const to = moveString.substring(2, 4);
        const promotion = moveString.length > 4 ? moveString.substring(4) : undefined;

        chess.move({
          from: from,
          to: to,
          promotion: promotion
        });

        chessboard.position(chess.fen());
        highlightLastMoveOnBoard(from, to);
        currentMoveIndex++;
        updateNavButtons();
        updateMovesDisplay();
      }
    }

    // Update the moves display with formatted moves
    function updateMovesDisplay() {
      const tempChess = new Chess(originalFen);
      let formattedMoves = [];
      let moveNumber = parseInt(originalFen.split(' ')[5]) || 1;
      const startingColor = originalFen.split(' ')[1];

      editorMoves.forEach((moveUci, index) => {
        const from = moveUci.substring(0, 2);
        const to = moveUci.substring(2, 4);
        const promotion = moveUci.length > 4 ? moveUci.substring(4) : undefined;

        const move = tempChess.move({
          from: from,
          to: to,
          promotion: promotion
        });

        if (!move) return;

        if ((startingColor === 'w' && index % 2 === 0) ||
          (startingColor === 'b' && index % 2 === 1)) {
          formattedMoves.push(`${moveNumber}.${move.san}`);
          if (startingColor === 'b' && index % 2 === 1) {
            moveNumber++;
          }
        } else {
          if (startingColor === 'w' && index === 0) {
            formattedMoves.push(`${moveNumber}...${move.san}`);
          } else {
            formattedMoves.push(move.san);
            if (startingColor === 'w' && index % 2 === 1) {
              moveNumber++;
            }
          }
        }
      });

      movesDisplay.value = formattedMoves.join(' ');
    }



    // Let onApply be resolved later
    let onApply;

    // Declare chessboard variable at function scope level
    let chessboard = null;

    // Configure the chessboard with higher z-index for dragged pieces
    const config = {
      position: originalFen,
      draggable: true,
      pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',
      appearSpeed: 200,
      moveSpeed: 200,
      snapbackSpeed: 100,
      snapSpeed: 100,
      trashSpeed: 100,
      // Set the orientation based on FEN
      orientation: originalFen.split(' ')[1] === 'w' ? 'white' : 'black',
      onDragStart: (source, piece, position, orientation) => {
        // Allow dragging only for the side to move
        if ((chess.turn() === 'w' && piece.search(/^b/) !== -1) ||
          (chess.turn() === 'b' && piece.search(/^w/) !== -1)) {
          return false;
        }
        
        // Always allow dragging - we'll handle overwriting in onDrop
        return true;
      },
      onDrop: (source, target) => {
        // Check if this is a promotion move
        if (isPromotionMove(source, target)) {
          showPromotionMenu(target, (selectedPiece) => {
            if (!selectedPiece) {
              return; // User canceled promotion
            }

            // Try to make the move with the selected promotion piece
            const move = chess.move({
              from: source,
              to: target,
              promotion: selectedPiece
            });

            if (move === null) return; // Invalid move

            // If we're not at the end of the moves list, truncate the list
            if (currentMoveIndex < editorMoves.length) {
              editorMoves.splice(currentMoveIndex);
            }

            // Add the move to our list with promotion piece
            const moveString = move.from + move.to + selectedPiece;
            editorMoves.push(moveString);
            currentMoveIndex++;

            // Update the UI
            chessboard.position(chess.fen());
            updateNavButtons();
            updateMovesDisplay();
            highlightLastMoveOnBoard(move.from, move.to);
          });
          return;
        }

        // Handle regular (non-promotion) moves
        try {
          const move = chess.move({
            from: source,
            to: target
          });

          if (move === null) return 'snapback';

          // If we're not at the end of the moves list, truncate the list
          if (currentMoveIndex < editorMoves.length) {
            editorMoves.splice(currentMoveIndex);
          }

          // Add the move to our list
          const moveString = move.from + move.to + (move.promotion || '');
          editorMoves.push(moveString);
          currentMoveIndex++;

          // Update the UI
          updateNavButtons();
          updateMovesDisplay();
          highlightLastMoveOnBoard(move.from, move.to);

          return;
        } catch (e) {
          return 'snapback';
        }
      },
      onSnapEnd: () => {
        // Use board position directly when chessboard isn't assigned yet
        if (chessboard) {
          chessboard.position(chess.fen());
        }
      }
    };

    // Make sure to clean up when editor is closed
    function cleanupEditorScrolling() {
      document.body.classList.remove('editor-open');
      scrollStyle.remove();
      
      // Remove any promotion menu if it exists
      const promotionMenu = document.getElementById('promotion-menu');
      if (promotionMenu) {
        document.body.removeChild(promotionMenu);
      }
    }

    // Wait for the DOM to be ready, then initialize the board
    setTimeout(() => {
      // Create the chessboard and assign to the variable declared above
      chessboard = Chessboard(boardId, config);

      // Add CSS to ensure dragged pieces are visible
      const style = document.createElement('style');
      style.textContent = `
      /* Make sure dragged pieces are visible */
      .piece-417db {
        z-index: 9995 !important;
      }
    `;
      document.head.appendChild(style);

      // Resize the board to fit the container
      window.setTimeout(() => {
        chessboard.resize();
        updateNavButtons();
        updateMovesDisplay();
      }, 100);

      // Event listeners for buttons
      backwardButton.addEventListener('click', moveBackwardInEditor);
      forwardButton.addEventListener('click', moveForwardInEditor);

      cancelButton.addEventListener('click', () => {
        cleanupEditorScrolling();
        document.body.removeChild(editorPanel);
        style.remove(); // Clean up the style
        onApply && onApply(null); // Resolve with null to indicate cancellation
      });

      okButton.addEventListener('click', () => {
        cleanupEditorScrolling();
        // Return the edited moves
        const result = {
          moves: editorMoves,
          sanMoves: []
        };

        // Convert UCI moves to SAN
        const tempChess = new Chess(originalFen);
        for (const moveUci of editorMoves) {
          const from = moveUci.substring(0, 2);
          const to = moveUci.substring(2, 4);
          const promotion = moveUci.length > 4 ? moveUci.substring(4) : undefined;

          const move = tempChess.move({
            from: from,
            to: to,
            promotion: promotion
          });

          if (move) {
            result.sanMoves.push(move.san);
          }
        }

        document.body.removeChild(editorPanel);
        style.remove(); // Clean up the style
        onApply && onApply(result);
      });
    }, 50);

    return new Promise((resolve) => {
      onApply = resolve;
    });
  }
}

