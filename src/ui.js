export function createSettingsPanel(searchParams, fetchPuzzles) {
  // Create the settings panel
  const settingsPanel = document.createElement('div');
  settingsPanel.id = 'settings-panel';
  
  // Create mobile-friendly container for all content
  const settingsContent = document.createElement('div');
  settingsContent.className = 'settings-content';
  settingsContent.style.display = 'flex';
  settingsContent.style.flexDirection = 'column';
  settingsContent.style.gap = '10px';
  settingsContent.style.padding = '5px';
  settingsPanel.appendChild(settingsContent);

  // Add a header to the settings panel
  const settingsHeader = document.createElement('h3');
  settingsHeader.textContent = 'Settings';
  settingsHeader.style.margin = '5px 0 10px 0';
  settingsContent.appendChild(settingsHeader);

  // Rating Min container - keep fixed size
  const minRatingContainer = document.createElement('div');
  minRatingContainer.style.display = 'flex';
  minRatingContainer.style.alignItems = 'center';
  minRatingContainer.style.gap = '5px';
  minRatingContainer.style.width = '100%';
  minRatingContainer.style.height = '30px';

  const minRatingText = document.createElement('span');
  minRatingText.textContent = 'Min:';
  minRatingText.style.minWidth = '30px';
  minRatingText.style.fontSize = '14px';

  const minRatingSlider = document.createElement('input');
  minRatingSlider.type = 'range';
  minRatingSlider.id = 'min-rating-slider';
  minRatingSlider.min = '0';
  minRatingSlider.max = '3000';
  minRatingSlider.step = '1';
  minRatingSlider.value = searchParams.min_rating;
  minRatingSlider.style.flex = '1';
  minRatingSlider.style.height = '20px';

  const minRatingNumber = document.createElement('span');
  minRatingNumber.textContent = `${searchParams.min_rating}`;
  minRatingNumber.style.width = '40px';
  minRatingNumber.style.textAlign = 'right';
  minRatingNumber.style.fontSize = '14px';

  minRatingContainer.appendChild(minRatingText);
  minRatingContainer.appendChild(minRatingSlider);
  minRatingContainer.appendChild(minRatingNumber);
  settingsContent.appendChild(minRatingContainer);

  // Rating Max container - keep fixed size
  const maxRatingContainer = document.createElement('div');
  maxRatingContainer.style.display = 'flex';
  maxRatingContainer.style.alignItems = 'center';
  maxRatingContainer.style.gap = '5px';
  maxRatingContainer.style.width = '100%';
  maxRatingContainer.style.height = '30px';

  const maxRatingText = document.createElement('span');
  maxRatingText.textContent = 'Max:';
  maxRatingText.style.minWidth = '30px';
  maxRatingText.style.fontSize = '14px';

  const maxRatingSlider = document.createElement('input');
  maxRatingSlider.type = 'range';
  maxRatingSlider.id = 'max-rating-slider';
  maxRatingSlider.min = '0';
  maxRatingSlider.max = '3000';
  maxRatingSlider.step = '1';
  maxRatingSlider.value = searchParams.max_rating;
  maxRatingSlider.style.flex = '1';
  maxRatingSlider.style.height = '20px';

  const maxRatingNumber = document.createElement('span');
  maxRatingNumber.textContent = `${searchParams.max_rating}`;
  maxRatingNumber.style.width = '40px';
  maxRatingNumber.style.textAlign = 'right';
  maxRatingNumber.style.fontSize = '14px';

  maxRatingContainer.appendChild(maxRatingText);
  maxRatingContainer.appendChild(maxRatingSlider);
  maxRatingContainer.appendChild(maxRatingNumber);
  settingsContent.appendChild(maxRatingContainer);

  // Add event listeners to update min_rating and max_rating dynamically
  minRatingSlider.addEventListener('input', () => {
    searchParams.min_rating = parseInt(minRatingSlider.value, 10);
    minRatingNumber.textContent = `${searchParams.min_rating}`;
    
    // Validate rating range and update search button state
    validateRatingRange();
});

maxRatingSlider.addEventListener('input', () => {
  searchParams.max_rating = parseInt(maxRatingSlider.value, 10);
  maxRatingNumber.textContent = `${searchParams.max_rating}`;
  
  // Validate rating range and update search button state
  validateRatingRange();
});

// Function to validate rating range and disable/enable search button
function validateRatingRange() {
  const minRating = parseInt(minRatingSlider.value, 10);
  const maxRating = parseInt(maxRatingSlider.value, 10);
  
  // Disable search button if min rating is greater than max rating
  const isInvalidRange = minRating+400 > maxRating;
  searchButton.disabled = isInvalidRange;
  
  // Optionally add visual feedback
  if (isInvalidRange) {
    searchButton.style.opacity = '0.5';
    searchButton.title = 'Invalid rating range: Min rating cannot be greater than Max rating';
  } else {
    searchButton.style.opacity = '1';
    searchButton.title = 'Normal Search';
  }
}


// Add slider for min_popularity
const popularityContainer = document.createElement('div');
popularityContainer.style.display = 'flex';
popularityContainer.style.alignItems = 'center';
popularityContainer.style.gap = '10px';
popularityContainer.style.visibility = 'hidden'; // Hide the container for users, just for debugging purposes

const popularityLabel = document.createElement('span');
popularityLabel.textContent = 'Min Popularity:';
popularityLabel.style.visibility = 'hidden'; // Hide the label for users, just for debugging purposes

const popularitySlider = document.createElement('input');
popularitySlider.type = 'range';
popularitySlider.id = 'min-popularity-slider';
popularitySlider.min = '0';
popularitySlider.max = '100';
popularitySlider.step = '1';
popularitySlider.value = searchParams.min_popularity;
popularitySlider.style.flex = '1';
popularitySlider.style.visibility = 'hidden'; // Hide the slider for users, just for debugging purposes

const popularityNumber = document.createElement('span');
popularityNumber.textContent = `${searchParams.min_popularity}`;
popularityNumber.style.width = '50px'; // Fixed width for consistent layout
popularityNumber.style.textAlign = 'right'; // Align text to the right
popularityNumber.style.visibility = 'hidden'; // Hide the number for users, just for debugging purposes

popularityContainer.appendChild(popularityLabel);
popularityContainer.appendChild(popularitySlider);
popularityContainer.appendChild(popularityNumber);
settingsContent.appendChild(popularityContainer);

// Add event listener to update min_popularity dynamically
popularitySlider.addEventListener('input', () => {
  searchParams.min_popularity = parseInt(popularitySlider.value, 10);
  popularityNumber.textContent = `${searchParams.min_popularity}`;
  
});

// Add dropdown for themes
const themesLabel = document.createElement('label');
themesLabel.textContent = 'Themes:';
themesLabel.style.visibility = 'hidden'; //Hidden for users, just for debugging purposes
settingsContent.appendChild(themesLabel);

const themesDropdown = document.createElement('select');
themesDropdown.id = 'themes-dropdown';
themesDropdown.style.width = '100%';
themesDropdown.style.visibility = 'hidden'; //Hidden for users, just for debugging purposes
settingsContent.appendChild(themesDropdown);

// Fetch themes from themes.json
fetch('themes.json')
  .then(response => response.json())
  .then(themes => {
    // Add the "All" option at the top
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'All';
    themesDropdown.appendChild(allOption);

    // Add the rest of the themes
    themes.forEach(theme => {
      const option = document.createElement('option');
      option.value = theme;
      option.textContent = theme;
      themesDropdown.appendChild(option);
    });
  })
  .catch(error => console.error('Error fetching themes:', error));



// Create a container for the buttons with fixed size
const buttonContainer = document.createElement('div');
buttonContainer.style.display = 'flex';
buttonContainer.style.justifyContent = 'space-between';
buttonContainer.style.marginTop = '15px';
buttonContainer.style.gap = '10px';
buttonContainer.style.width = '100%';
buttonContainer.style.height = '40px';

// Create the "Search Puzzles" button with fixed size
const searchButton = document.createElement('button');
searchButton.id = 'search-button';
searchButton.textContent = 'Search';
searchButton.style.fontWeight = 'bold';
searchButton.style.backgroundColor = '#4CAF50';
searchButton.style.color = 'white';
searchButton.style.borderRadius = '5px';
searchButton.style.padding = '8px';
searchButton.style.flex = '1';
searchButton.style.border = 'none';
searchButton.style.fontSize = '14px';
searchButton.style.height = '36px';
searchButton.title = 'Normal Search';
searchButton.addEventListener('click', () => {
  fetchPuzzles(searchParams);
  settingsPanel.style.visibility = 'hidden';
});
buttonContainer.appendChild(searchButton);

// Create the "Cancel" button
const cancelButton = document.createElement('button');
cancelButton.id = 'cancel-button';
cancelButton.textContent = 'Cancel';
cancelButton.style.borderRadius = '5px';
cancelButton.style.padding = '8px';
cancelButton.style.flex = '1';
cancelButton.style.border = 'none';
cancelButton.addEventListener('click', () => {
  settingsPanel.style.visibility = 'hidden';
});
buttonContainer.appendChild(cancelButton);

// Append the button container to the settings panel
settingsContent.appendChild(buttonContainer);


// Append the settings panel to the body
document.body.appendChild(settingsPanel);

// Update min_rating and max_rating
minRatingNumber.addEventListener('input', () => {
    searchParams.min_rating = parseInt(minRatingNumber.value, 10);
  
  });
  
  maxRatingNumber.addEventListener('input', () => {
    searchParams.max_rating = parseInt(maxRatingNumber.value, 10);
  });
  
  // Update min_popularity
  popularitySlider.addEventListener('input', () => {
    searchParams.min_popularity = parseInt(popularitySlider.value, 10);
  });
  
  // Update themes
  themesDropdown.addEventListener('change', () => {
    searchParams.themes = themesDropdown.value;
  });
  
}

export function createHelpPanel() {
  // Create the help panel
  const helpPanel = document.createElement('div');
  helpPanel.id = 'help-panel';
  
  // Add styles for panel layout with flexbox
  helpPanel.style.display = 'flex';
  helpPanel.style.flexDirection = 'column';
  helpPanel.style.maxHeight = '80vh'; // Maximum height
  
  // Create content container (scrollable)
  const contentContainer = document.createElement('div');
  contentContainer.style.flex = '1';
  contentContainer.style.overflowY = 'auto';
  contentContainer.style.paddingBottom = '10px';
  contentContainer.innerHTML = '<p>Loading help content...</p>';
  helpPanel.appendChild(contentContainer);
  
  // Create footer with sticky positioning
  const footer = document.createElement('div');
  footer.style.borderTop = '1px solid #444';
  footer.style.padding = '10px 0';
  footer.style.display = 'flex';
  footer.style.justifyContent = 'center';
  footer.style.position = 'sticky';
  footer.style.bottom = '0';
  footer.style.backgroundColor = '#262421'; // Match panel background
  footer.style.width = '100%';
  
  // Create SVG close button (X in circle)
  const closeButton = document.createElement('button');
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '0';
  closeButton.style.width = '32px';
  closeButton.style.height = '32px';
  closeButton.title = 'Close help';
  
  // SVG for X in circle
  closeButton.innerHTML = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="none" stroke="#888" stroke-width="2"/>
      <line x1="10" y1="10" x2="22" y2="22" stroke="#888" stroke-width="2" stroke-linecap="round"/>
      <line x1="22" y1="10" x2="10" y2="22" stroke="#888" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
  
  // Event listener to close the panel
  closeButton.addEventListener('click', () => {
    helpPanel.style.visibility = 'hidden';
  });
  
  footer.appendChild(closeButton);
  helpPanel.appendChild(footer);
  
  // Add content from markdown file
  fetch('/Similar-Chess-Puzzle-Demo/docs/help.md')
    .then(response => response.text())
    .then(markdownContent => {
      // Use marked.js to convert Markdown to HTML
      contentContainer.innerHTML = marked.parse(markdownContent);
    })
    .catch(error => {
      console.error('Error loading help content:', error);
      // Fallback content
      contentContainer.innerHTML = `
        <h3>Help</h3>
      `;
    });
  
  // Append to document body
  document.body.appendChild(helpPanel);
  
  return helpPanel;
}

export function createSidebar() {
  const sidebar = document.createElement('div');
  sidebar.id = 'solved-puzzles';
  document.body.appendChild(sidebar);

  // Create the toggle button
  const toggleButton = document.createElement('button');
  toggleButton.id = 'toggle-solved-puzzles';
  
  // Add styles to make the entire button clickable
  toggleButton.style.display = 'flex';
  toggleButton.style.justifyContent = 'center';
  toggleButton.style.alignItems = 'center';
  toggleButton.style.width = '40px';
  toggleButton.style.height = '40px';
  toggleButton.style.backgroundColor = '#e0e0e0'; // Add a background color
  toggleButton.title = 'Log';
  
  const svgIcon = document.createElement('img');
  svgIcon.src = 'assets/svg/scroll-text-svgrepo-com.svg';
  svgIcon.alt = 'Search Similar Icon Icon';
  svgIcon.style.width = '24px';
  svgIcon.style.height = '24px';
  svgIcon.style.pointerEvents = 'none'; // This is crucial - prevents SVG from capturing clicks
  
  // Toggle function
  const toggleSidebar = () => {
    const sidebar = document.getElementById('solved-puzzles');
    if (sidebar.style.visibility === 'visible') {
      sidebar.style.visibility = 'hidden';
    } else {
      sidebar.style.visibility = 'visible';
    }
  };

  // Add event listener to the button
  toggleButton.addEventListener('click', toggleSidebar);
  
  // Append SVG to button
  toggleButton.appendChild(svgIcon);
  document.body.appendChild(toggleButton);

  // Add global click listener for lower resolutions
  const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
  if (isSmallScreen) {
    document.addEventListener('click', (event) => {
      const sidebar = document.getElementById('solved-puzzles');
      const toggleButton = document.getElementById('toggle-solved-puzzles');

      // Check if the click target is NOT the toggle button
      if (!toggleButton.contains(event.target) && !sidebar.contains(event.target)) {
        sidebar.style.visibility = 'hidden'; // Hide the sidebar
      }
    });
  }
}

export function createNavigationButtons(moveBackward, moveForward, triggersearchSimilar, showHint) {
    // Add buttons below the chessboard
    const navigationContainer = document.createElement('div');
    navigationContainer.style.marginTop = '10px';
    navigationContainer.style.display = 'flex';
    navigationContainer.style.justifyContent = 'center';
    navigationContainer.style.gap = '10px';

    const backwardButton = document.createElement('button');
    backwardButton.id = 'backward-button';
    backwardButton.title = 'Go Backward';
    backwardButton.textContent = '<';
    backwardButton.style.padding = '10px';
    backwardButton.disabled = true; // Initially disabled as we start at position 0
    backwardButton.addEventListener('click', () => {
        moveBackward();
    });

    const searchSimilarButton = document.createElement('button');
    searchSimilarButton.id = 'search-similar-button';
    searchSimilarButton.style.padding = '10px';
    searchSimilarButton.style.backgroundColor = '#4CAF50';
    searchSimilarButton.style.borderRadius = '5px';
    searchSimilarButton.title = 'Search Similar Puzzles';
    searchSimilarButton.addEventListener('click', () => {
        triggersearchSimilar();
    });
    const svgIcon = document.createElement('img');
    svgIcon.src = 'assets/svg/similarity_search.svg';
    svgIcon.alt = 'Search Similar Icon Icon';
    svgIcon.style.width = '24px'; // Adjust size as needed
    svgIcon.style.height = '24px';
    searchSimilarButton.appendChild(svgIcon);

    // Add a hint button
    const hintButton = document.createElement('button');
    hintButton.id = 'hint-button';
    hintButton.style.padding = '10px';
    hintButton.style.borderRadius = '5px';
    hintButton.title = 'Show Hint';
    hintButton.addEventListener('click', () => {
        if (!hintButton.disabled) {
            showHint();
        }
    });
    const hintIcon = document.createElement('img');
    hintIcon.src = 'assets/svg/hint.svg';
    hintIcon.alt = 'Hint Icon';
    hintIcon.style.width = '24px'; // Adjust size as needed
    hintIcon.style.height = '24px';
    hintButton.appendChild(hintIcon);

    const forwardButton = document.createElement('button');
    forwardButton.id = 'forward-button';
    forwardButton.title = 'Go Forward';
    forwardButton.textContent = '>';
    forwardButton.style.padding = '10px';
    forwardButton.disabled = true; // Initially disabled as we start with no explored moves
    forwardButton.addEventListener('click', () => {
        moveForward();
    });

    navigationContainer.appendChild(backwardButton);
    navigationContainer.appendChild(searchSimilarButton);
    navigationContainer.appendChild(hintButton);
    navigationContainer.appendChild(forwardButton);
    document.getElementById('board').parentNode.appendChild(navigationContainer);
    
    // Store the button references in the chessPuzzle instance
    if (window.chessPuzzle) {
        window.chessPuzzle.setHintButton(hintButton);
        window.chessPuzzle.setNavigationButtons(backwardButton, forwardButton);
    }
    
    return { hintButton, backwardButton, forwardButton }; // Return buttons for reference
}


// Apply the fix on page load and window resize
//window.addEventListener('load', fixPanelWidthOnZoom);
//window.addEventListener('resize', fixPanelWidthOnZoom);

export function createSettingsAndHelpButtons() {
  // Create settings button
  const settingsButton = document.createElement('button');
  settingsButton.style.position = 'absolute';
  settingsButton.style.top = '10px';
  settingsButton.style.left = '10px';
  settingsButton.style.zIndex = '1000';
  settingsButton.style.background = 'none';
  settingsButton.style.border = 'none';
  settingsButton.style.cursor = 'pointer';

  const settingsPanel = document.getElementById('settings-panel');

  // Add the SVG graphic to the button
  const settingsIcon = document.createElement('img');
  settingsIcon.src = 'assets/svg/settings-2-svgrepo-com.svg';
  settingsIcon.alt = 'Settings Icon';
  settingsIcon.style.width = '24px';
  settingsIcon.style.height = '24px';

  settingsButton.appendChild(settingsIcon);

  settingsButton.addEventListener('click', () => {
    const helpPanel = document.getElementById('help-panel');
    const importPanel = document.getElementById('import-panel');

    // Flip the visibility state of the settings panel
    if (settingsPanel.style.visibility === 'visible') {
      settingsPanel.style.visibility = 'hidden';
    } else {
      settingsPanel.style.visibility = 'visible';
      // Close other panels if they're open
      if (helpPanel && helpPanel.style.visibility === 'visible') {
        helpPanel.style.visibility = 'hidden';
      }
      if (importPanel && importPanel.style.visibility === 'visible') {
        importPanel.style.visibility = 'hidden';
      }
    }
  });

  document.body.appendChild(settingsButton);
  
  // Create help button below settings button
  const helpButton = document.createElement('button');
  helpButton.style.position = 'absolute';
  helpButton.style.top = '44px'; // Position below settings button (10px + 24px + 10px padding)
  helpButton.style.left = '10px'; // Same left position as settings button
  helpButton.style.zIndex = '1000';
  helpButton.style.background = 'none';
  helpButton.style.border = 'none';
  helpButton.style.cursor = 'pointer';

  // Add the SVG graphic to the button
  const helpIcon = document.createElement('img');
  helpIcon.src = 'assets/svg/help-circle-outline-svgrepo-com.svg';
  helpIcon.alt = 'Help Icon';
  helpIcon.style.width = '24px';
  helpIcon.style.height = '24px';

  helpButton.appendChild(helpIcon);

  helpButton.addEventListener('click', () => {
    const helpPanel = document.getElementById('help-panel');
    const importPanel = document.getElementById('import-panel');

    // Toggle visibility of the help panel
    if (helpPanel.style.visibility === 'visible') {
      helpPanel.style.visibility = 'hidden';
    } else {
      helpPanel.style.visibility = 'visible';
      // Close other panels if they're open
      if (settingsPanel && settingsPanel.style.visibility === 'visible') {
        settingsPanel.style.visibility = 'hidden';
      }
      if (importPanel && importPanel.style.visibility === 'visible') {
        importPanel.style.visibility = 'hidden';
      }
    }
  });
  document.body.appendChild(helpButton);

  // Create import button below help button
  const importButton = document.createElement('button');
  importButton.style.position = 'absolute';
  importButton.style.top = '78px'; // Position below help button (44px + 24px + 10px padding)
  importButton.style.left = '10px'; // Same left position as other buttons
  importButton.style.zIndex = '1000';
  importButton.style.background = 'none';
  importButton.style.border = 'none';
  importButton.style.cursor = 'pointer';

  // Add the SVG graphic to the button
  const importIcon = document.createElement('img');
  importIcon.src = 'assets/svg/file-import-svgrepo-com.svg'; // You'll need to add this SVG
  importIcon.alt = 'Import Icon';
  importIcon.style.width = '24px';
  importIcon.style.height = '24px';

  importButton.appendChild(importIcon);

  importButton.addEventListener('click', () => {
    const importPanel = document.getElementById('import-panel');
    const helpPanel = document.getElementById('help-panel');

    // Toggle visibility of the import panel
    if (importPanel.style.visibility === 'visible') {
      importPanel.style.visibility = 'hidden';
    } else {
      importPanel.style.visibility = 'visible';
      // Close other panels if they're open
      if (settingsPanel && settingsPanel.style.visibility === 'visible') {
        settingsPanel.style.visibility = 'hidden';
      }
      if (helpPanel && helpPanel.style.visibility === 'visible') {
        helpPanel.style.visibility = 'hidden';
      }
    }
  });
  document.body.appendChild(importButton);
}

// Function to draw an arrow between two squares
export function drawArrow(from, to, color = '#3e8ef7', orientation) {
  
  // Remove any existing arrows first
  $('.hint-arrow').remove();
  
  // Get positions of the squares
  const $boardContainer = $('#board');
  const boardOffset = $boardContainer.offset();
  const squareSize = $('.square-55d63').width();
  
  // Calculate center points of the squares
  const fromFile = from.charCodeAt(0) - 'a'.charCodeAt(0);
  const fromRank = 8 - parseInt(from[1]);
  const toFile = to.charCodeAt(0) - 'a'.charCodeAt(0);
  const toRank = 8 - parseInt(to[1]);
  
  // Adjust for board orientation
  let fromX, fromY, toX, toY;
  
  if (orientation === 'white') {
    fromX = boardOffset.left + (fromFile + 0.5) * squareSize;
    fromY = boardOffset.top + (fromRank + 0.5) * squareSize;
    toX = boardOffset.left + (toFile + 0.5) * squareSize;
    toY = boardOffset.top + (toRank + 0.5) * squareSize;
  } else {
    fromX = boardOffset.left + (7 - fromFile + 0.5) * squareSize;
    fromY = boardOffset.top + (7 - fromRank + 0.5) * squareSize;
    toX = boardOffset.left + (7 - toFile + 0.5) * squareSize;
    toY = boardOffset.top + (7 - toRank + 0.5) * squareSize;
  }
  
  // First create SVG container with all properties, but don't attach to DOM yet
  const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgContainer.setAttribute('class', 'hint-arrow');
  svgContainer.style.position = 'absolute';
  svgContainer.style.top = boardOffset.top + 'px';
  svgContainer.style.left = boardOffset.left + 'px';
  svgContainer.style.width = (8 * squareSize) + 'px';
  svgContainer.style.height = (8 * squareSize) + 'px';
  svgContainer.style.pointerEvents = 'none';
  svgContainer.style.zIndex = '1000';
  
  // Add a unique ID to prevent marker conflicts
  const arrowheadId = 'arrowhead-' + Date.now();
  
  // Adjust the start and end points to avoid covering the pieces
  // Calculate vector direction and normalize it
  const dx = toX - fromX;
  const dy = toY - fromY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Normalize the direction vector
  const dirX = dx / distance;
  const dirY = dy / distance;
  
  // Use a fixed offset based on square size rather than a percentage of distance
  const fixedOffset = squareSize * 0.3; // Fixed distance from center (30% of square size)
  
  // Apply offset in the direction of the arrow
  const startX = fromX + dirX * fixedOffset - boardOffset.left;
  const startY = fromY + dirY * fixedOffset - boardOffset.top;
  const endX = toX - dirX * fixedOffset - boardOffset.left;
  const endY = toY - dirY * fixedOffset - boardOffset.top;
  
  // Create marker definition first
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', arrowheadId);
  marker.setAttribute('markerWidth', '4');  // Smaller
  marker.setAttribute('markerHeight', '3'); // Smaller
  marker.setAttribute('refX', '0.5');       // Better positioned
  marker.setAttribute('refY', '1.5');       // Better positioned
  marker.setAttribute('orient', 'auto');
  
  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  polygon.setAttribute('points', '0 0, 4 1.5, 0 3'); // Smaller triangle
  polygon.setAttribute('fill', color);
  
  // Create the arrow line
  const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  arrow.setAttribute('x1', startX);
  arrow.setAttribute('y1', startY);
  arrow.setAttribute('x2', endX);
  arrow.setAttribute('y2', endY);
  arrow.setAttribute('stroke', color);
  arrow.setAttribute('stroke-width', squareSize / 10); // Thinner line
  arrow.setAttribute('marker-end', `url(#${arrowheadId})`);
  
  // Assemble all the SVG elements
  marker.appendChild(polygon);
  defs.appendChild(marker);
  svgContainer.appendChild(defs);
  svgContainer.appendChild(arrow);

  // set opacity and pointer events
  svgContainer.style.opacity = '0.8'; // Slightly transparent
  svgContainer.style.pointerEvents = 'none'; // Prevent interaction with the arrow
  
  // Now that the SVG is fully assembled, add it to the document body
  document.body.appendChild(svgContainer);
  
  
  // Auto-remove the arrow after a few seconds
  setTimeout(() => {
    $('.hint-arrow').fadeOut(500, function() {
      $(this).remove();
    });
  }, 3000);
}

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
          previewImg.style.maxWidth = '100%';
          previewImg.style.maxHeight = '200px';
          previewContainer.appendChild(previewImg);

          // Now analyze the image
          analyzeChessImage(imageData);

        } catch (e) {
          console.error('Error processing URL:', e);
          previewContainer.innerHTML = '';
          const errorMsg = document.createElement('div');
          errorMsg.textContent = 'Error processing image URL: ' + e.message;
          errorMsg.className = 'fen-note';
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
        console.log('File uploaded:', file.name);
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
  okButton.className = 'import-button';
  okButton.style.display = 'flex';
  okButton.style.alignItems = 'center';
  okButton.style.justifyContent = 'center';
  okButton.style.gap = '5px';
  okButton.style.backgroundColor = '#4CAF50';
  okButton.style.borderRadius = '5px';
  okButton.disabled = true; // Start with button disabled
  okButton.style.opacity = '0.5'; // Visual indicator of disabled state
  okButton.style.cursor = 'not-allowed';

  // Add the SVG icon
  const searchIcon = document.createElement('img');
  searchIcon.src = 'assets/svg/similarity_search.svg';
  searchIcon.alt = 'Search Similar Icon';
  searchIcon.style.width = '20px';
  searchIcon.style.height = '20px';
  okButton.appendChild(searchIcon);

  // Add text label
  const buttonText = document.createElement('span');
  buttonText.textContent = 'Search Similar';
  okButton.appendChild(buttonText);

  okButton.addEventListener('click', () => {
    // Here you would add code to handle the import
    console.log('Import: FEN:', fenInput.value);
    console.log('Import: URL:', imageUrlInput.value);
    console.log('Import: File:', imageUploadInput.files[0]?.name || 'None');

    importPanel.style.visibility = 'hidden';
  });

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

      console.log('Sending request to ChessVision.ai...');

      // Send to ChessVision.ai (using HTTPS)
      const response = await fetch('https://app.chessvision.ai/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`ChessVision API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('ChessVision response:', result);

      // Check for FEN in the correct location of the response structure
      // The API returns the FEN in result.result, not result.fen
      if (result && result.result) {
        // Get the FEN string from the response
        let fenString = result.result;
        console.log('FEN from ChessVision:', fenString);

        // Fix the FEN format - replace underscores with spaces
        const fixedFenString = fenString.replace(/_/g, ' ');
        console.log('Fixed FEN:', fixedFenString);

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

  // Update the okButton click handler to handle CORS issues
  okButton.addEventListener('click', async () => {
    const url = imageUrlInput.value.trim();

    if (url) {
      try {
        previewContainer.innerHTML = '<div class="loading-spinner">Attempting to analyze image...</div>';

        // Use a CORS proxy to fetch the image
        const corsProxyUrl = 'https://corsproxy.io/?';
        const proxyUrl = corsProxyUrl + encodeURIComponent(url);

        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image (status: ${response.status})`);
        }

        const blob = await response.blob();
        const imageData = await blobToBase64(blob);

        // Now analyze the image data
        await analyzeChessImage(imageData);

      } catch (e) {
        console.error('Error fetching image with proxy:', e);
        previewContainer.innerHTML = '';
        const errorMsg = document.createElement('div');
        errorMsg.textContent = 'Error fetching image: ' + e.message;
        errorMsg.className = 'fen-note';
        previewContainer.appendChild(errorMsg);
      }
    } else if (fenInput.value.trim()) {
      // Handle FEN input
      importPanel.style.visibility = 'hidden';
    } else {
      // No inputs provided
      alert('Please provide a FEN string, image URL, or upload an image file.');
    }
  });

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
      console.log('Stockfish analysis result:', result);
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
        boardPreview.style.width = '100%';
        boardPreview.style.height = '100%';
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
          analysisContainer.style.marginTop = '10px';
          analysisContainer.style.padding = '8px';
          analysisContainer.style.backgroundColor = '#2a2a2a';
          analysisContainer.style.borderRadius = '4px';
          analysisContainer.style.fontSize = '14px';
          analysisContainer.style.width = '100%';

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
                  okButton.style.opacity = '1';
                  okButton.style.cursor = 'pointer';
                } else {
                  okButton.disabled = true;
                  okButton.style.opacity = '0.5';
                  okButton.style.cursor = 'not-allowed';
                }
              }
              else {
                // No continuation available, keep button disabled
                okButton.disabled = true;
                okButton.style.opacity = '0.5';
                okButton.style.cursor = 'not-allowed';
              }
              

              // Join the SAN moves into a readable format
              let bestLine = '';

              if (sanMoves.length > 0) {
                // Store the original FEN for resetting
                const originalFen = fenString;

                // Create slider container
                const sliderContainer = document.createElement('div');
                sliderContainer.style.marginTop = '10px';
                sliderContainer.style.display = 'flex';
                sliderContainer.style.flexDirection = 'column';
                sliderContainer.style.gap = '8px';

                // Create a div for the line text that will be styled
                const lineTextContainer = document.createElement('div');
                lineTextContainer.style.fontFamily = 'monospace';
                lineTextContainer.style.whiteSpace = 'normal';
                lineTextContainer.style.wordBreak = 'break-word';

                // Create the slider element
                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = "0";
                slider.max = (sanMoves.length - 1).toString();
                slider.value = (sanMoves.length - 1).toString(); // Start at the end
                slider.style.width = '100%';

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
                  activePart.style.color = 'white';
                  activePart.textContent = formattedMoves.slice(0, parseInt(slider.value) + 1).join(' ') + ' ';
                  lineTextContainer.appendChild(activePart);

                  // Greyed out part (after slider position)
                  if (parseInt(slider.value) < formattedMoves.length - 1) {
                    const greyedPart = document.createElement('span');
                    greyedPart.style.color = '#888';
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

                  // Apply moves up to the current slider position
                  for (let i = 0; i <= moveCount && i < sanMoves.length; i++) {
                    tempChess.move(sanMoves[i]);
                  }

                  // Update the board with the new position
                  if (boardPreview.chessboard) {
                    boardPreview.chessboard.position(tempChess.fen());
                  }
                };

                // Function to reset the board to the original position
                const resetBoardPosition = () => {
                  if (boardPreview.chessboard) {
                    boardPreview.chessboard.position(originalFen);
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
    console.log("Converting moves to TON format:", fen, moves);

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
    console.log("Generated TON moves:", result);
    return result;
  }

  // Update the okButton click handler to create and save a custom puzzle
  okButton.addEventListener('click', async () => {
    const fen = fenInput.value.trim();

    if (fen) {
      try {
        // Get the active moves from the analysis
        const analysisContainer = document.getElementById('stockfish-analysis');
        if (analysisContainer) {
          const activeSpan = analysisContainer.querySelector('span[style*="color: white"]');
          if (activeSpan) {
            // Extract the active moves
            const activeMoveText = activeSpan.textContent.trim();
            console.log("Active moves text:", activeMoveText);

            // Extract SAN moves using regex to remove move numbers
            const sanMoves = [];
            const moveRegex = /([NBRQKP]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQK])?(?:\+|#)?|O-O(?:-O)?(?:\+|#)?)/g;
            let match;
            while ((match = moveRegex.exec(activeMoveText)) !== null) {
              sanMoves.push(match[1]);
            }

            console.log("Extracted SAN moves:", sanMoves);

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
              loadingElement.style.position = 'fixed';
              loadingElement.style.top = '0';
              loadingElement.style.left = '0';
              loadingElement.style.width = '100%';
              loadingElement.style.height = '100%';
              loadingElement.style.backgroundColor = 'rgba(0,0,0,0.7)';
              loadingElement.style.display = 'flex';
              loadingElement.style.justifyContent = 'center';
              loadingElement.style.alignItems = 'center';
              loadingElement.style.zIndex = '9999';
              loadingElement.style.color = 'white';
              document.body.appendChild(loadingElement);

              console.log("Before calling window.triggerSearchSimilarWithMoves");
              // Call the search function directly
              window.triggerSearchSimilarWithMoves(tonMoves);
              console.log("After calling window.triggerSearchSimilarWithMoves");

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
}

