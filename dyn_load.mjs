/**************************************************************/
// dyn_load.mjs
//
// Dynamicaly load modules and dynamicaly load functions from modules
// Written by Mr Bob 2020
//
/**************************************************************/
const DYN_COL_C = 'black';
const DYN_COL_B = '#F0E68C';
console.log('%c dyn_load.mjs',
            'color: blue; background-color: white;');

loadfunc();     // Call the function to load and use the module

/**************************************************************/
// dyn_loadfunc()
// Called by ????                              
// Dynamicaly load a module and assign a function to window
// In this example, a_func_1 is dynamically imported from 
//  c_JS_module.mjs and then assigned to window.a_func_1. 
//  You can then call window.a_func_1() or use it elsewhere in your code.
// Input:   
// Return: 
/**************************************************************/
function dyn_loadfunc() {
    console.log('%c dyn_loadfunc(): ',
                'color: ' + DYN_COL_C + '; background-color: ' + DYN_COL_B + ';');

    import('./c_JS_module.mjs')
        .then(module => {
            // Assign the imported function to window
            window.a_func_1 = module.a_func_1;
            // Call the function if needed
            window.a_func_1();
        })
        .catch(error => {
            console.error('Error loading module:', error);
        });
}

/**************************************************************/
// Using import(): The import() function returns a promise that 
//  resolves to the module. You can use it inside any block of code, 
//  such as an if statement or a function.
/**************************************************************/
/*
if (someCondition) {
    import('./moduleA.js')
        .then(module => {
            // Use the imported module
            module.someFunction();
        })
        .catch(error => {
            console.error('Error loading moduleA:', error);
        });
} else {
    import('./moduleB.js')
        .then(module => {
            // Use the imported module
            module.anotherFunction();
        })
        .catch(error => {
            console.error('Error loading moduleB:', error);
        });
}
*/

/**************************************************************/
// Inside Functions: You can also use dynamic imports inside 
//  functions to load modules when the function is called.
/**************************************************************/
/*
function loadModule() {
    import('./moduleC.js')
        .then(module => {
            module.someFunction();
        })
        .catch(error => {
            console.error('Error loading moduleC:', error);
        });
}

// Call the function to load the module
loadModule();
*/

/**************************************************************/
// EXPORT FUNCTIONS
// List all the functions called by code or html outside of this module  
/**************************************************************/
export { dyn_loadfunc }              

/**************************************************************/
//    END OF PROG
/**************************************************************/