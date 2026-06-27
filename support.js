// ============================================
// FLAPPY MARIO - SUPPORT SYSTEM (Like Steam)
// ============================================

const supportModal = document.getElementById('supportModal');
const modalOverlay = document.getElementById('modalOverlay');

// ============================================
// MODAL MANAGEMENT
// ============================================

function openSupportModal() {
    supportModal.classList.add('active');
    modalOverlay.classList.add('active');
    
    // Pause game if playing
    const wasPlaying = gameState.isPlaying;
    gameState.isPlaying = false;
    
    // Store pause state to resume later
    supportModal.dataset.wasPaused = wasPlaying;
}

function closeSupportModal() {
    supportModal.classList.remove('active');
    modalOverlay.classList.remove('active');
    
    // Resume game if it was playing
    if (supportModal.dataset.wasPaused === 'true') {
        gameState.isPlaying = true;
        gameLoop();
    }
}

// ============================================
// HELP BUTTON LISTENERS
// ============================================

// Help button on start screen
const helpBtnStart = document.getElementById('helpBtnStart');
if (helpBtnStart) {
    helpBtnStart.addEventListener('click', openSupportModal);
}

// Help button on game screen
const helpBtnGame = document.getElementById('helpBtnGame');
if (helpBtnGame) {
    helpBtnGame.addEventListener('click', openSupportModal);
}

// Close on overlay click
modalOverlay.addEventListener('click', closeSupportModal);

// Close on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && supportModal.classList.contains('active')) {
        closeSupportModal();
    }
});

// ============================================
// TAB SWITCHING
// ============================================

function showTab(tabName) {
    // Hide all tab contents
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.classList.remove('active');
    });

    // Remove active from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Highlight selected button
    event.target.classList.add('active');

    console.log(`📚 Switched to: ${tabName}`);
}

// ============================================
// SUPPORT SYSTEM FEATURES
// ============================================

/**
 * Flowchart Logic:
 * 
 * Player clicks Help Button
 *     ↓
 * Modal Opens (pauses game)
 *     ↓
 * Choose Tab:
 *     - FAQ: Common questions & answers
 *     - Rules: How to play, scoring
 *     - Troubleshooting: Common problems & solutions
 *     ↓
 * Find Answer
 *     ↓
 * Close Modal (resumes game)
 */

// ============================================
// ERROR MESSAGE SYSTEM
// ============================================

/**
 * Instead of harsh error messages, show friendly ones
 * (Like Module 5 code reference)
 */

const friendlyMessages = {
    collision: "❌ Ouch! You hit a pipe. Try jumping earlier next time!",
    boundary: "⚠️ You touched the boundary! Stay in the middle!",
    gameOver: "💀 Game Over! But don't worry, you'll do better next time!",
    highScore: "🎉 New High Score! Amazing!",
    welcomeBack: "👋 Welcome back! Try to beat your last score!"
};

function showFriendlyMessage(messageType) {
    console.log(friendlyMessages[messageType] || "Check the help system!");
}

// ============================================
// ANALYTICS / LOGGING
// ============================================

/**
 * Track help requests to understand what players struggle with
 * (Useful for game designers improving the game)
 */

const helpAnalytics = {
    helpRequests: 0,
    tabViews: {},
    questionsClicked: {}
};

function logHelpRequest() {
    helpAnalytics.helpRequests++;
    console.log(`📊 Help requested ${helpAnalytics.helpRequests} times`);
}

function logTabView(tabName) {
    helpAnalytics.tabViews[tabName] = (helpAnalytics.tabViews[tabName] || 0) + 1;
    console.log(`📊 Tab views:`, helpAnalytics.tabViews);
}

// Track when help is opened
const originalOpen = openSupportModal;
window.openSupportModal = function() {
    logHelpRequest();
    originalOpen();
};

// ============================================
// ADVANCED FEATURES (Future Implementation)
// ============================================

/**
 * Ideas for expanding support system:
 * 
 * 1. Search functionality
 *    - Type a keyword, get relevant FAQs
 * 
 * 2. Video tutorials
 *    - Embedded YouTube videos for visual learners
 * 
 * 3. Contact form
 *    - Send feedback or report bugs
 * 
 * 4. Feedback system
 *    - "Was this helpful?" buttons on each answer
 * 
 * 5. Multi-language support
 *    - Switch between English, Romanian, etc.
 * 
 * 6. Contextual help
 *    - Show relevant help based on what player is doing
 * 
 * 7. Video playback
 *    - Show animated GIFs of how to jump correctly
 */

// ============================================
// INITIALIZATION
// ============================================

window.addEventListener('load', () => {
    console.log('✓ Support system loaded');
    console.log('💡 Players can press ❓ button or ESC to close help');
});

console.log('Support module loaded ✓');

