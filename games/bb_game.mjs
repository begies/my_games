/**************************************************************/
// bb_game.mjs
// 
// Written by Mr Bob, Term 4 2022
// Bouncing Balls game
//
// All variables & function begin with bb_  all const with BB_
// Diagnostic code lines have a comment appended to them //DIAG
//
//  v01 Basic game.
//  v02 Convert to modular API
/**************************************************************/
const BB_COL_C = 'black';
const BB_COL_B = '#F0E68C';
console.log('%c bb_game.mjs',
            'color: blue; background-color: white;');

/**************************************************************/
// Import all external constants & functions required
/**************************************************************/
// Import all constants & functions required from html_manager module
import { HTML_NUMLBOARD, 
         html_buildCanvas, html_volume, html_swapPage, html_posElement }
  from '/manager/html_manager.mjs';
 
// Import all constants & functions required from fb_io module
import { fb_readRec,  fb_writeRec, fb_readSortedLimit } 
  from '/fb/fb_io.mjs';
 
// Import all constants & functions required from fbR_manager module
import { fbR_procWScore, fbR_procRScore, fbR_procLeaderboard }
  from '/fb/fbR_manager.mjs';

/**************************************************************/
// General game CONSTANTS
const BB_MINVEL        = 6;
const BB_MAXVEL        = 10;

const BB_LEVELARRAY    = [
  {bg: 'cyan',   dia: 50, secs: 30, velScale: 0.1, numBalls:  5, numTerminators: 1},
  {bg: 'brown',  dia: 45, secs: 30, velScale: 0.2, numBalls:  1, numTerminators: 1},
  {bg: 'grey',   dia: 40, secs: 30, velScale: 0.3, numBalls:  2, numTerminators: 1},
  {bg: 'purple', dia: 35, secs: 30, velScale: 0.4, numBalls:  3, numTerminators: 1}
                         ];

const BB_BASETIME      = 300;
const BB_TERMINATORDIA = 30;

// General game variables
var   bb_gameActive    = false;
var   bb_background;
var   bb_resetActive   = false;
var   bb_timer;
var   bb_level         = 0;
var   bb_numBalls;
var   bb_seconds;
var   bb_score;
var   bb_ratio;

var   bb_scoreArray    = [];

// Bouncing Ball score
var bb_fb_score = {
  uid:      '?',
  gameName: '?',
  score:    '0',
  level:    '0',
  balls:    '0',
  time:     '0',
  ratio:    '0',
  wins:     '0',
  losses:   '0'
};

var bb_terminatorGroup, bb_terminator;
var bb_ballGroup, bb_ball;
var bb_wallGroup;

// Define variables built in preload()
var bb_imgEvilBacteria, bb_gameOverImg, bb_collect;
var bb_levelSuccess, bb_levelFail, bb_gameFail, bb_gameSuccess; 

/**************************************************************/
// preload()
// Called by P5 before setup
/**************************************************************/
function preload() {
  console.log('%c BB preload(): ', 
              'color: ' + BB_COL_C + '; background-color: ' + BB_COL_B + ';');
  
  bb_imgEvilBacteria = loadImage('../assets/images/evilBacteria.png');
  bb_gameOverImg     = loadImage('../assets/background/gameOver.png');
  
  bb_collect         = loadSound('../assets/sounds/collect.mp3');
  bb_levelSuccess    = loadSound('../assets/sounds/levelSuccess.mp3');
  bb_levelFail       = loadSound('../assets/sounds/levelFail.mp3');
  bb_gameFail        = loadSound('../assets/sounds/gameFail.mp3');
  bb_gameSuccess     = loadSound('../assets/sounds/gameSuccess.mp3');
}

/**************************************************************/
// setup()
/**************************************************************/
function setup() {
  console.log('%c BB setup(); ',
              'color: ' + BB_COL_C + '; background-color: ' + BB_COL_B + ';');

  html_buildCanvas();
  //html_mouseTrail();          // Register mouse move event to build mouse trail
  // Register slider event to alter volume
  html_volume([bb_collect, bb_levelSuccess, bb_levelFail, 
               bb_gameFail, bb_gameSuccess]); 
  noLoop();                     // No point looping thru draw until START clicked
  
  bb_fb_score.uid        = fbD_userDetails.uid;
  bb_fb_score.gameName   = fbD_userDetails.gameName;
  p_gameName.textContent = fbD_userDetails.gameName;
  
  fb_readRec(BB, fbD_userDetails.uid, bb_fb_score, fbR_procRScore);

  bb_imgEvilBacteria.resize(BB_TERMINATORDIA, BB_TERMINATORDIA);
  
  // Build game screen & enable buttons
  bb_reset();
  
  b_leaderboard.classList.remove("w3-disabled");
  b_inst.classList.remove("w3-disabled");
  b_startPause.classList.remove("w3-disabled");
  b_reset.classList.remove("w3-disabled");
}

/**************************************************************/
// draw()
/**************************************************************/
function draw() {
  clear();
  background(bb_background);

  if(bb_gameActive == 'p') {
    noLoop();                          // Game paused
  }
  else if (bb_gameActive == 'a') {   // Game active
    if (bb_terminator.mouse.pressed()) {
      for (let bb_terminator of bb_terminatorGroup) {
        if (bb_terminator.mouse.pressed()) {
          bb_levelOver(2, 'You ran out of lives', 'red'); 
        }
      }
    }
      
    else { 
      for (let bb_ball of bb_ballGroup) {
        if (bb_ball.mouse.pressed()) {
          console.log('%c draw(): mouseX/Y= ' + mouseX + '/' + mouseY + 
                      ' bb_ball.x/y= ' + bb_ball.x + '/' + bb_ball.y,
                      'color: ' + BB_COL_C + '; background-color: ' + BB_COL_B + ';');
          bb_collect.play();
          bb_ball.remove();
          bb_numBalls--;
          p_balls.textContent = bb_numBalls;
          // Calc new ratio 
          bb_ratio = Math.round((BB_LEVELARRAY[bb_level].numBalls - 
                                 bb_numBalls) / BB_LEVELARRAY[bb_level].numBalls *
                                 1000) / 10;
          p_ratio.textContent = bb_ratio;
          if (bb_numBalls <= 0) {
             bb_levelOver(0, 'You won level ' + (bb_level+1), 'lime');
          }
        }
      }
    }
  }
}

/**************************************************************/
// bb_admin()
// Called by game page ADMIN button
// Pause the game and goto admin page
// Input:  opt = 'd' to display leaderboard & 'r' return
// Return: n/a
/**************************************************************/
function bb_admin() {
  console.log('%c bb_admin(): ',
              'color: ' + BB_COL_C + '; background-color: ' + BB_COL_B + ';');

  bb_startPause();
  ad_admin();
}

/**************************************************************/
// bb_leaderboard(_opt)
// Called by game page LEADERBOARD button 
// Read the top BB score records & display in table
// Input:  opt = 'd' to display leaderboard & 'r' return
// Return: n/a
/**************************************************************/
function bb_leaderboard(_opt) {
  console.log('%c bb_leaderboard(): opt= ' + _opt +
              ' bb_gameActive= ' + bb_gameActive, 
              'color: ' + BB_COL_C + '; background-color: ' + BB_COL_B + ';');

  if (_opt == 'd') {
    b_leaderboard.classList.add("w3-disabled");
    b_inst.classList.add("w3-disabled");
    b_startPause.classList.add("w3-disabled");
    b_reset.classList.add("w3-disabled");
    
    noLoop();     
    clearInterval(bb_timer);

    if (bb_gameActive != false) {
      b_startPause.style.backgroundColor = "lightgreen";
      b_startPause.textContent = "RE-START";
      bb_gameActive = 'p';
    }
   
    html_swapPage(null, "s_leaderbPage");
    html_posElement("s_leaderbPage", "defaultCanvas0");
    html_swapPage("defaultCanvas0", null);
  
    bb_scoreArray = [];
    fb_readSortedLimit(BB, fbR_procLeaderboard, bb_scoreArray, 
                       'score', HTML_NUMLBOARD);
  }
  else {
    html_swapPage('s_leaderbPage', "defaultCanvas0");
    b_inst.classList.remove("w3-disabled");
    b_leaderboard.classList.remove("w3-disabled");
    b_startPause.classList.remove("w3-disabled");
    b_reset.classList.remove("w3-disabled");
  }
}

/**************************************************************/
// bb_instructions(_opt)
// Called by game page INSTRUCTIONS button
// Disable game buttons & display game instructions
// Input:  opt = 'd' to display instructions & 'r' return
// Return: n/a
/**************************************************************/
function bb_instructions(_opt) {
  console.log('%c bb_instructions(): opt= ' + _opt, 
              'color: ' + BB_COL_C + '; background-color: ' + BB_COL_B + ';');

  if (_opt == 'd') {
    b_leaderboard.classList.add("w3-disabled");
    b_inst.classList.add("w3-disabled");
    b_startPause.classList.add("w3-disabled");
    b_reset.classList.add("w3-disabled");
    
    noLoop();     
    clearInterval(bb_timer);

    if (bb_gameActive != false) {
      b_startPause.style.backgroundColor = "lightgreen";
      b_startPause.textContent = "RE-START";
      bb_gameActive = 'p';
    }
    
    html_swapPage(null, "s_instPage");
    html_posElement("s_instPage", "defaultCanvas0");
    html_swapPage("defaultCanvas0", null);
  }
  else {
    html_swapPage('s_instPage', "defaultCanvas0");
    b_inst.classList.remove("w3-disabled");
    b_leaderboard.classList.remove("w3-disabled");
    b_startPause.classList.remove("w3-disabled");
    b_reset.classList.remove("w3-disabled");
  }
}

/**************************************************************/
// bb_startPause()
// Called by game page START/PAUSE button
// Enable RESET button
// If game; Currently active, pause it.
//          Currently paused, re-start it.
//          Over, pause it & clear timer
// Input:  n/a
// Return: n/a
/**************************************************************/
function bb_startPause() {
  console.log('%c bb_startPause(): bb_gameActive= ' + bb_gameActive +
             ' bb_background= ' + bb_background +
             ' bb_level= ' + (bb_level+1), 
             'color: ' + BB_COL_C + '; background-color: ' + BB_COL_B + ';');

  p_msg.textContent = '';
  b_reset.classList.remove("w3-disabled");
  bb_resetActive = false;

  // Game is active so pause it
  if (bb_gameActive == 'a') {
    // Game currently ACTIVE so PAUSE IT
    bb_gameActive = 'p';     
    clearInterval(bb_timer);
    
    b_startPause.style.backgroundColor = "lightgreen";
    b_startPause.textContent = "RE-START";
  }

  // Game is paused so make it active
  else if (bb_gameActive == 'p') {
    // Game currently PAUSED so make it ACTIVE
    bb_timer = setInterval(bb_timerFunc, 1000);
    bb_gameActive = 'a';
    loop();

    b_startPause.style.backgroundColor = "grey";
    b_startPause.textContent = "PAUSE";
  }

  // Game is over
  else if (bb_gameActive == 'e') {
    bb_gameActive = 'p';     
    clearInterval(bb_timer);
  }
}

/**************************************************************/
// bb_reset()
// Called by setup() & game page RESET button
// If RESET button disabled then exit.
// If game has been running cancel it, create & start new game &
//  disable RESET button.
// If game not yet started, create a new game.
// Input:  n/a
// Return: n/a
/**************************************************************/
function bb_reset() {
    console.log('%c bb_reset(): bb_resetActive= ' + bb_resetActive + 
                ' bb_gameActive= ' + bb_gameActive, 
                'color: ' + BB_COL_C + '; background-color: ' + BB_COL_B + ';');

  if (bb_resetActive) {
    return;
  }

  if (bb_gameActive == 'a' || bb_gameActive == 'p' || 
      bb_gameActive == 'e') {
    // Game has been running so cancel it & disable RESET button.
    b_reset.classList.add("w3-disabled");
    bb_resetActive = true;
    clearInterval(bb_timer);
    
    // Delete all previous sprites
    allSprites.remove();
  }
  
  // Create terminator, ball & wall sprites
  bb_createTerminators();
  bb_createBallSprites();
  bb_createWalls();

  // Reset counters and update display
  if (fbD_debugStatus == 'y') {
    bb_background     = 'white';
  }
  else {
    bb_background     = BB_LEVELARRAY[bb_level].bg;
  }
  bb_seconds          = BB_LEVELARRAY[bb_level].secs;    
  bb_numBalls         = BB_LEVELARRAY[bb_level].numBalls;
  bb_level            = 0;
  bb_gameActive       = 'p';

  // Update display
  p_msg.textContent   = '';
  p_level.textContent = (bb_level+1);
  p_balls.textContent = bb_numBalls;
  p_time.textContent  = bb_seconds;
  p_ratio.textContent = 0;
  p_score.textContent = 0;
  
  b_startPause.style.backgroundColor = "green";
  b_startPause.textContent = "START";
  b_startPause.classList.remove("w3-disabled");
}

/**************************************************************/
// bb_timerFunc()
// Called by timer event started by bb_startPause
// Subtract 1 sec, if out of time level is over else 
//  update html timer paragraph.
// Input:  n/a
// Return: n/a
/**************************************************************/
function bb_timerFunc() {
  if (bb_gameActive) {
    bb_seconds--; 
    if (bb_seconds <= 0) {
      bb_levelOver(1, 'You ran out of time', 'fuchsia');
    }
    p_time.textContent = bb_seconds;
  }
}

/**************************************************************/
// bb_createBallSprites()
// Called by bb_reset() when game is starting
// Create ball sprites
// Input:  n/a
// Return: n/a
/**************************************************************/
function bb_createBallSprites() { 
  console.log('%c bb_createBallSprites(): bb_level= ' + (bb_level+1) +
              ' num= ' + BB_LEVELARRAY[bb_level].numBalls, 
              'color: ' + BB_COL_C + '; background-color: ' + BB_COL_B + ';');

  bb_ballGroup = new Group();
  
  for (var i = 0; i < BB_LEVELARRAY[bb_level].numBalls; i++) {
    var bb_x = random(BB_LEVELARRAY[bb_level].dia/2, 
                      width-BB_LEVELARRAY[bb_level].dia/2)
    var bb_y = random(BB_LEVELARRAY[bb_level].dia/2, 
                      height-BB_LEVELARRAY[bb_level].dia/2)

    bb_ball = new Sprite(bb_x, bb_y, BB_LEVELARRAY[bb_level].dia, 'd');
    bb_ball.vel.x = random(BB_MINVEL, BB_MAXVEL) * random([-1, 1]) * BB_LEVELARRAY[bb_level].velScale;
    bb_ball.vel.y = random(BB_MINVEL, BB_MAXVEL) * random([-1, 1]) * BB_LEVELARRAY[bb_level].velScale;
    if (fbD_debugStatus == 'y') {
      bb_ball.debug = true;
    }
    //bb_ball.vel.x = 0;
    //bb_ball.vel.y = 0;
    bb_ballGroup.add(bb_ball);
  }
  
  bb_ballGroup.bounciness = 1;
  bb_ballGroup.friction   = 0;
}

/**************************************************************/
// bb_createTerminators)
// Called by bb_reset() when game is starting
// Create terminator sprites
// Input:  n/a
// Return: n/a
/**************************************************************/
function bb_createTerminators() { 
  console.log('%c bb_createTerminators(): bb_level= ' + (bb_level+1) + 
              ' num= ' + BB_LEVELARRAY[bb_level].numTerminators, 
              'color: ' + BB_COL_C + '; background-color: ' + BB_COL_B + ';');

  bb_terminatorGroup = new Group();
  
  for (var i = 0; i < BB_LEVELARRAY[bb_level].numTerminators; i++) {
    var bb_x = random(BB_TERMINATORDIA, width-BB_TERMINATORDIA);
    var bb_y = random(BB_TERMINATORDIA, height-BB_TERMINATORDIA);
           
    bb_terminator = new Sprite(bb_x, bb_y, BB_TERMINATORDIA, 'd');
    bb_terminator.vel.x = random(BB_MINVEL, BB_MAXVEL) * random([-1, 1]) * BB_LEVELARRAY[bb_level].velScale;
    bb_terminator.vel.y = random(BB_MINVEL, BB_MAXVEL) * random([-1, 1]) * BB_LEVELARRAY[bb_level].velScale;
    if (fbD_debugStatus == 'y') {
      bb_terminator.debug = true;
    }
    //bb_terminator.vel.x = 0;
    //bb_terminator.vel.y = 0;
    bb_terminator.image = (bb_imgEvilBacteria);  
    bb_terminatorGroup.add(bb_terminator);
  }
  
  bb_terminatorGroup.bounciness = 1;
  bb_terminatorGroup.friction   = 0;
}

/*******************************************************/
// bb_ballDestroyed(bb_terminator, bb_ballGroup)
// Called by event registered in bb_createBallSprites()
// Spaceship hit an ball so delete the ball
// Input:  n/a
// Return: n/a
/*******************************************************/
function bb_ballDestroyed(bb_terminator, bb_ballGroup) {
  console.log('%c bb_ballDestroyed(): bb_numBalls= ' + bb_numBalls,
              'color: ' + BB_COL_C + '; background-color: ' + BB_COL_B + ';');
  
  bb_ballGroup.remove();
  
  bb_numBalls--;
  p_balls.textContent = bb_numBalls;
  // Calc new ratio 
  bb_ratio = Math.round((BB_LEVELARRAY[bb_level].numBalls - 
                         bb_numBalls) / BB_LEVELARRAY[bb_level].numBalls
                         * 1000) / 10;
  p_ratio.textContent = bb_ratio;
  if (bb_numBalls <= 0) {
    bb_levelOver(0, 'You won level ' + (bb_level+1), 'green');
  }
}

/**************************************************************/
// bb_createWalls()
// Called by bb_reset() when game is starting
// Create wall sprites
// Input:  n/a
// Return: n/a
/**************************************************************/
function bb_createWalls() {
  console.log('%c bb_createWalls(): ', 
              'color: ' + BB_COL_C + '; background-color: ' + BB_COL_B + ';');

  bb_wallGroup = new Group();
  var wallLH  = new bb_wallGroup.Sprite(      0, height/2,     8, height, 'k');	
  var wallRH  = new bb_wallGroup.Sprite(  width, height/2,     8, height, 'k');
  var wallTop = new bb_wallGroup.Sprite(width/2,        0, width,      8, 'k');          
	var wallBot = new bb_wallGroup.Sprite(width/2,   height, width,      8, 'k');

  if (fbD_debugStatus == 'y') {
    bb_wallGroup.debug = true;
  }

  wallLH.shapeColor  = color("purple");
  wallRH.shapeColor  = color("purple");
  wallTop.shapeColor = color("purple");
  wallBot.shapeColor = color("purple");
}

/**************************************************************/
// bb_levelOver(_reason, _msg, _colour)
// Called by draw() if no more balls or 
//           bb_timerFunc() if out of time
// Level is over, so deactivate game, If new high score, write to db
// Input:  _reason = 0 if no more balls, 
//                   1 if no more time
//                   2 if CLICKed on terminator
//         _msg is message to display
//         _colour is colour of message
// Return: n/a
/**************************************************************/
function bb_levelOver(_reason, _msg, _colour) {
  console.log('%c bb_levelOver(): reason= ' + _reason, 
              'color: ' + BB_COL_C + '; background-color: ' + BB_COL_B + ';');
  
  clearInterval(bb_timer);
  b_startPause.classList.add("w3-disabled");
  
  // Delete any previous ball & terminator sprites
  bb_ballGroup.remove();
  bb_terminatorGroup.remove();
  
  // Calc win or loss
  if (_reason == 0) {
    bb_fb_score.wins++;
    bb_levelSuccess.play();
  }
  else {
    bb_fb_score.losses++;
    bb_levelFail.play();
  }
  p_msg.textContent  = _msg
  p_msg.style.color  = _colour;
  
  // Calc new ratio & time taken
  bb_ratio = Math.round((BB_LEVELARRAY[bb_level].numBalls - 
                         bb_numBalls) / BB_LEVELARRAY[bb_level].numBalls
                         * 1000) / 10;
  bb_seconds = BB_LEVELARRAY[bb_level].secs - bb_seconds;

  // Calc new score by concatenating level, ratio & time
  bb_score = Number("" + (bb_level+1) + bb_ratio + (BB_BASETIME - bb_seconds));
  
  if (bb_score > bb_fb_score.score) {
    bb_fb_score.score = bb_score;
    bb_fb_score.level = bb_level+1;
    bb_fb_score.ratio = bb_ratio;
    bb_fb_score.balls = bb_numBalls;
    bb_fb_score.time  = bb_seconds;
  }

  // Update session storage & write updated BB score object to fb
  //  even its only updated win/losses
  sessionStorage.setItem('game_score', JSON.stringify(bb_fb_score));
  fb_writeRec(BB, fbD_userDetails.uid, bb_fb_score, fbR_procWScore);

  bb_gameActive = 'p'; 
  
  // Check for next level ONLY if won current level
  if (_reason == 0) {       // Won current level 
    if (bb_level+1 < BB_LEVELARRAY.length) {
      bb_level++;           // Set to next level
      bb_prepLevel();
    }
    else {                  // No more levels = game over
      bb_gameOver(_reason);
    }
  }
    
  else if (_reason == 2) {  // CLICKed on terminator = game over
     bb_gameOver(_reason);
  }
  else {                    // Ran out of time = play same level
    bb_prepLevel();
  }

  // Reset counters & update display
  bb_seconds          = BB_LEVELARRAY[bb_level].secs;    
  bb_numBalls         = BB_LEVELARRAY[bb_level].numBalls;

  p_level.textContent = bb_level+1;
  p_balls.textContent = bb_numBalls;
  p_time.textContent  = bb_seconds;
  p_ratio.textContent = 0;
  p_score.textContent = 0;

  /*----------------------------------------------------------*/
  // bb_prepLevel()
  // Called by bb_levelOver()
  // Prepare for level to play
  // Input:  n/a
  // Return: n/a
  /*----------------------------------------------------------*/
  function bb_prepLevel() {
    console.log('%c bb_prepLevel(): ',
                'color: ' + BB_COL_C + '; background-color: ' + BB_COL_B + ';');
    
    b_reset.classList.add("w3-disabled");
    bb_resetActive = true;
    
    // Create new level's terminator & ball sprites
    bb_createTerminators();
    bb_createBallSprites();
   
    // Reset counters and update display
    if (fbD_debugStatus == 'y') {
      bb_background     = 'white';
    }
    else {
      bb_background     = BB_LEVELARRAY[bb_level].bg;
    }
    
    b_startPause.style.backgroundColor = "green";
    b_startPause.textContent = "START";
    b_startPause.classList.remove("w3-disabled");
  }
}

/**************************************************************/
// bb_gameOver(_reason)
// Called by bb_levelOver() 
// Game is over, so deactivate game.
// Input:  n/a
// Return: n/a
/**************************************************************/
function bb_gameOver(_reason) {
  console.log('%c bb_gameOver(): reason= ' + _reason,
              'color: ' + BB_COL_C + '; background-color: ' + BB_COL_B + ';');

  if ((bb_level+1) < BB_LEVELARRAY.length) {
    bb_gameFail.play();
  }
  else {
    bb_gameSuccess.play();
  }
  
  bb_background   = bb_gameOverImg;
  bb_gameActive = 'e';
  b_startPause.classList.add("w3-disabled");
  bb_resetActive  = false;
      
  bb_level = 0;    // Set to 1st level
}

/**************************************************************/
// ASSIGN P5.JS FUNCTIONS TO THE GLOBAL WINDOW OBJECT
/**************************************************************/
window.preload = preload;
window.setup = setup;
window.draw = draw;

/**************************************************************/
// EXPORT FUNCTIONS
// List all the functions called by code or html outside of this module
/**************************************************************/
export { 
  preload, setup, draw, 
  bb_admin, bb_leaderboard, bb_instructions, bb_startPause, bb_reset
}
         
/**************************************************************/
//   END OF APP
/**************************************************************/