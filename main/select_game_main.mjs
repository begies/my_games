/**************************************************************/
// select_game_main.mjs
// 
// Written by Mr Bob, Term 1 2025
// Main entry for select_game.html
/**************************************************************/
console.log('%c select_game_main.mjs',
    'color: blue; background-color: white;');

/**************************************************************/
// Import all external constants & functions required
/**************************************************************/
// Import all constants & functions required from html_manager module
import { html_load, html_gameSelection } 
    from '/manager/html_manager.mjs';

// Import all constants & functions required from fb_io module
import { fb_logout } 
    from '/fb/fb_io.mjs';
window.fb_logout             = fb_logout;

/**************************************************************/
// select_game.html main code
/**************************************************************/
// Initialize functions when the page loads
window.addEventListener('DOMContentLoaded', () => {
  html_load();  // Do required stuff for all non index.html files
  html_gameSelection('gameSelSlides', 'gameSelButton');
});

/**************************************************************/
//   END OF CODE
/**************************************************************/