/**************************************************************/
// index_main.mjs
// 
// Written by Mr Bob, Term 1 2025
// Main entry for index.html
/**************************************************************/
console.log('%c index_main.mjs',
            'color: blue; background-color: white;');

/**************************************************************/
// Import all external constants & functions required
/**************************************************************/
// Import all constants & functions required from html_manager module
import { html_index }     
  from '/manager/html_manager.mjs';

// Import all constants & functions required from fb_io module
import { fb_login }
  from '/fb/fb_io.mjs';
  
// Import all constants & functions required from fbR_manager module
import { fbR_procLogin }
  from '/fb/fbR_manager.mjs';

/**************************************************************/
// index.html main code
/**************************************************************/
html_index();     // Do required stuff for index.html

// Handle login button click
document.querySelector('.b_login').addEventListener('click', () => {
  fb_login(fbD_userDetails, fbR_procLogin);
});

/**************************************************************/
//   END OF CODE
/**************************************************************/