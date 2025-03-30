/**************************************************************/
// ad_manager_main.mjs
// 
// Written by Mr Bob, Term 1 2025
// Main entry for ad_manager.html
/**************************************************************/
console.log('%c ad_manager_main.mjs',
    'color: blue; background-color: white;');

/**************************************************************/
// Import all external constants & functions required
/**************************************************************/
// Import all constants & functions required from html_manager module
import { html_load } 
    from '/manager/html_manager.mjs';

// Import all constants & functions required from ad_manager module
import { ad_user, ad_BB, ad_CA, ad_DB, ad_SI, ad_TG } 
    from '/manager/ad_manager.mjs';
    window.ad_user               = ad_user;
    window.ad_BB                 = ad_BB;
    window.ad_CA                 = ad_CA;
    window.ad_DB                 = ad_DB;
    window.ad_SI                 = ad_SI;
    window.ad_TG                 = ad_TG;

/**************************************************************/
// ad_manager.html main code
/**************************************************************/
// Initialize functions when the page loads
window.addEventListener('DOMContentLoaded', () => {
  html_load();  // Do required stuff for all non index.html files
  ad_user();
});

/**************************************************************/
//   END OF CODE
/**************************************************************/