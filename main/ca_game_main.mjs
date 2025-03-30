/**************************************************************/
// ca_game_main.mjs
// 
// Written by Mr Bob, Term 1 2025
// Main entry for ca_game.html
/**************************************************************/
console.log('%c ca_game_main.mjs',
    'color: blue; background-color: white;');

/**************************************************************/
// Import all external constants & functions required
/**************************************************************/
// Import all constants & functions required from html_manager module
import { html_load } 
    from '/manager/html_manager.mjs';

// Import all the constants & functions required from ca_game module
import { ca_startPause, ca_reset, ca_leaderboard, ca_instructions  }
    from '/games/ca_game.mjs';
    window.ca_startPause         = ca_startPause;
    window.ca_reset              = ca_reset;
    window.ca_leaderboard        = ca_leaderboard;
    window.ca_instructions       = ca_instructions;

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