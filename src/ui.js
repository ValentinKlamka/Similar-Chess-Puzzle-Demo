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
  const isInvalidRange = minRating > maxRating;
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
    
    // Flip the visibility state of the settings panel
    if (settingsPanel.style.visibility === 'visible') {
      settingsPanel.style.visibility = 'hidden';
    } else {
      settingsPanel.style.visibility = 'visible';
      // Close help panel if it's open
      if (helpPanel && helpPanel.style.visibility === 'visible') {
        helpPanel.style.visibility = 'hidden';
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
    
    // Toggle visibility of the help panel
    if (helpPanel.style.visibility === 'visible') {
      helpPanel.style.visibility = 'hidden';
    } else {
      helpPanel.style.visibility = 'visible';
      // Close settings panel if it's open
      if (settingsPanel && settingsPanel.style.visibility === 'visible') {
        settingsPanel.style.visibility = 'hidden';
      }
    }
  });
  document.body.appendChild(helpButton);
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