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
});

maxRatingSlider.addEventListener('input', () => {
  searchParams.max_rating = parseInt(maxRatingSlider.value, 10);
  maxRatingNumber.textContent = `${searchParams.max_rating}`;
});

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

export function createNavigationButtons(moveBackward, moveForward) {
    // Add buttons below the chessboard
    const navigationContainer = document.createElement('div');
    navigationContainer.style.marginTop = '10px';
    navigationContainer.style.display = 'flex';
    navigationContainer.style.justifyContent = 'center';
    navigationContainer.style.gap = '10px';

    const backwardButton = document.createElement('button');
    backwardButton.textContent = '<';
    backwardButton.style.padding = '10px';
    backwardButton.addEventListener('click', moveBackward);


    const searchSimilarButton = document.createElement('button');
    searchSimilarButton.id = 'search-similar-button';
    searchSimilarButton.style.padding = '10px';
    searchSimilarButton.style.backgroundColor = '#4CAF50';
  
    searchSimilarButton.style.borderRadius = '5px';
    
    //on hover, show a tooltip with the text "Search Similar Puzzles"
    searchSimilarButton.title = 'Search Similar Puzzles';
    searchSimilarButton.addEventListener('click', () => {
      window.triggerSearchSimilar();
    });
    const svgIcon = document.createElement('img');
    svgIcon.src = 'assets/svg/similarity_search.svg';
    svgIcon.alt = 'Search Similar Icon Icon';
    svgIcon.style.width = '24px'; // Adjust size as needed
    svgIcon.style.height = '24px';

    searchSimilarButton.appendChild(svgIcon);

    const forwardButton = document.createElement('button');
    forwardButton.textContent = '>';
    forwardButton.style.padding = '10px';
    forwardButton.addEventListener('click', moveForward);

    navigationContainer.appendChild(backwardButton);
    navigationContainer.appendChild(searchSimilarButton);
    navigationContainer.appendChild(forwardButton);
    document.getElementById('board').parentNode.appendChild(navigationContainer);
}


// Apply the fix on page load and window resize
//window.addEventListener('load', fixPanelWidthOnZoom);
//window.addEventListener('resize', fixPanelWidthOnZoom);

export function addSettingsPanelToggle() {
  const toggleButton = document.createElement('button');
  toggleButton.style.position = 'absolute';
  toggleButton.style.top = '10px';
  toggleButton.style.left = '10px';
  toggleButton.style.zIndex = '1000';
  toggleButton.style.background = 'none'; // Remove default button styling
  toggleButton.style.border = 'none';
  toggleButton.style.cursor = 'pointer';

  const settingsPanel = document.getElementById('settings-panel');

  // Add the SVG graphic to the button
  const svgIcon = document.createElement('img');
  svgIcon.src = 'assets/svg/settings-2-svgrepo-com.svg';
  svgIcon.alt = 'Settings Icon';
  svgIcon.style.width = '24px'; // Adjust size as needed
  svgIcon.style.height = '24px';

  toggleButton.appendChild(svgIcon);

  toggleButton.addEventListener('click', () => {
    // Flip the visibility state of the settings panel
    if (settingsPanel.style.visibility === 'visible') {
      settingsPanel.style.visibility = 'hidden'; // Hide the settings panel
    } else {
      settingsPanel.style.visibility = 'visible'; // Show the settings panel
    }
  });

  document.body.appendChild(toggleButton);
}
