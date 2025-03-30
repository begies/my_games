/**************************************************************/
// bb_game_main.mjs
// 
// Written by Mr Bob, Term 1 2025
// Main entry for bb_game.html
/**************************************************************/
console.log('%c bb_game_main.mjs',
    'color: blue; background-color: white;');

/**************************************************************/
// Import all external constants & functions required
/**************************************************************/
// Import all constants & functions required from html_manager module
import { html_load } 
    from '/manager/html_manager.mjs';

// Import all the constants & functions required from bb_game module
import { bb_startPause, bb_reset, bb_leaderboard, bb_instructions  }
    from '/games/bb_game.mjs';
    window.bb_startPause         = bb_startPause;
    window.bb_reset              = bb_reset;
    window.bb_leaderboard        = bb_leaderboard;
    window.bb_instructions       = bb_instructions;

/**************************************************************/
// ad_manager.html main code
/**************************************************************/
// Initialize functions when the page loads
window.addEventListener('DOMContentLoaded', () => {
  html_load();  // Do required stuff for all non index.html files
});

/**************************************************************/
//   END OF CODE
/**************************************************************/