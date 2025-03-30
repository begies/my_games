/**************************************************************/
// si_game.js
//
// Written by Mr Bob, Term 4 2022
// Space Invaders game
//
// All variables & function begin with si_  all const with SI_
// Diagnostic code lines have a comment appended to them //DIAG
//
//  v01 Basic game.
//  v02 Rename all variable to si_ and const to SI_
/**************************************************************/
const SI_COL_C = 'black';
const SI_COL_B = '#F0E68C';
console.log('%c si_game.js',
            'color: blue; background-color: white;');

// General game CONSTANTS
const SI_BASETIME      = 300;

// General game variables
var   si_background;
var   si_resetActive   = false;
var   si_timer;
var   si_alienRoundTimer;
var   si_level         = 0;
var   si_numLives;
var   si_numAliens;
var   si_seconds;
var   si_score;
var   si_playerCanFire = true;
var   si_playerRoundTimer;
var   si_saveAlienVel;          // To save alien vel before pausing game

var   si_scoreArray    = [];

// Space Invaders score
var si_fb_score = {
  uid:      '?',
  gameName: '?',
  score:    '0',
  level:    '0',
  lives:    '0',
  aliens:   '0',
  time:     '0',
  ratio:    '0',
  wins:     '0',
  losses:   '0'
}; 

var   si_levelArray    = [];
class Level {
  // DEFINE LEVEL'S PROPERTIES
  constructor(_playerDia, _alienDia, _terminatorDia,
              _numRows, _numInRow, _numTerminators, 
              _numLives, 
              _playerVel, _alienVel, 
              _playerRoundInterval, _playerRoundSpeed, _alienRoundInterval, _alienRoundSpeed,
              _bg) {
    this.playerDia	          = _playerDia;
    this.alienDia	            = _alienDia;
    this.terminatorDia	      = _terminatorDia;
    
    this.numRows              = _numRows;
    this.numInRow             = _numInRow;
    this.numAliens 	          = _numRows * _numInRow;
    this.numTerminators	      = _numTerminators;
    
    this.numLives             = _numLives;
        
    this.playerVel 	          = _playerVel;
    this.alienVel 	          = _alienVel;
    
    this.playerRoundInterval  = _playerRoundInterval;
    this.playerRoundSpeed     = _playerRoundSpeed;
    this.alienRoundInterval   = _alienRoundInterval;
    this.alienRoundSpeed      = _alienRoundSpeed;
    
    this.bg 	                = _bg;    
  }
}

/**************************************************************/
// preload()
// Called by P5 before setup
/**************************************************************/
function preload() {
  console.log('%c SI preload(): ',
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  si_imgBGHubble     = loadImage('../assets/background/Hubble_NASA.jpg');
  si_imgBGUniverse   = loadImage('../assets/background/scifi.jpg');
  si_imgBGStartTrek  = loadImage('../assets/background/StarTrek.webp');
  si_imgBGRomulan    = loadImage('../assets/background/Romulan.webp');
  si_imgBGSpace      = loadImage('../assets/background/outerSpace.png');
  si_imgPlayer       = loadImage('../assets/images/player.png');
  si_imgEvilBacteria = loadImage('../assets/images/evilBacteria.png');
  si_imgGameOver     = loadImage('../assets/background/gameOver.png');

  si_spaceSound      = loadSound('../assets/sounds/spaceAtmospheric.mp3');
  si_collect         = loadSound('../assets/sounds/collect.mp3');
  si_explosion       = loadSound('../assets/sounds/explosion.mp3');
  si_levelSuccess    = loadSound('../assets/sounds/levelSuccess.mp3');
  si_levelSuccess.setVolume(0.1);
  si_levelFail       = loadSound('../assets/sounds/levelFail.mp3');
  si_gameFail        = loadSound('../assets/sounds/gameFail.mp3');
  si_gameSuccess     = loadSound('../assets/sounds/gameSuccess.mp3');
  //si_spaceSound.setVolume(0.1);
  
  si_alien_1 = loadImage('../assets/images/alien_1.png');
  si_alien_2 = loadImage('../assets/images/alien_2.png');
  si_alien_3 = loadImage('../assets/images/alien_3.png');
}

/**************************************************************/
// setup()
/**************************************************************/
function setup() {
  console.log('%c SI setup(): ',
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  html_buildCanvas();
  // Register slider event to alter volume
    html_volume([si_spaceSound, si_collect, si_explosion,
                si_levelSuccess, si_levelFail, si_gameFail, si_gameSuccess]);
  html_volume(si_spaceSound);// Register slider event to alter volume
  html_volume(si_collect);
  html_volume(si_explosion);
  html_volume(si_levelSuccess);
  html_volume(si_levelFail);
  html_volume(si_gameFail);
  html_volume(si_gameSuccess);
  noLoop();                  // No point looping thru draw until START clicked

  si_fb_score.uid        = fbD_userDetails.uid;
  si_fb_score.gameName   = fbD_userDetails.gameName;
  p_gameName.textContent = fbD_userDetails.gameName;
  
  fb_readRec(SI, fbD_userDetails.uid, si_fb_score, fbR_procRScore);
   
  // Build levels array
  //constructor(_playerDia, _alienDia, _terminatorDia,
  //            _numRows, _numInRow, _numTerminators, 
  //            _numLives, 
  //            _playerVel, alienVel, 
  //            _playerRoundInterval, _playerRoundSpeed, _alienRoundInterval, alienRoundSpeed,
  //            _bg) {
  si_levelArray[0] = new Level(30, 20, 30,
                               6, 10, 1,
                               4, 
                               3, 3, 
                               1000, 4, 1000, 1,
                               si_imgBGHubble);
  si_levelArray[1] = new Level(30, 20, 30,
                               6, 10, 1,
                               4, 
                               3, 3, 
                               1000, 1, 1000, 1, 
                               si_imgBGRomulan);
  si_levelArray[2] = new Level(30, 20, 30,
                               6, 10, 1, 
                               4, 
                               3, 3, 
                               1000, 1, 1000, 1,
                               si_imgBGStartTrek);
  si_levelArray[3] = new Level(30, 20, 30,
                               6, 10, 1,  
                               4, 
                               3, 3, 
                               1000, 1, 1000, 1,
                               si_imgBGSpace);
    
  si_imgPlayer.resize(si_levelArray[si_level].playerDia, 
                      si_levelArray[si_level].playerDia);
  si_alien_1.resize(si_levelArray[si_level].alienDia, 
                    si_levelArray[si_level].alienDia);
  si_alien_2.resize(si_levelArray[si_level].alienDia, 
                    si_levelArray[si_level].alienDia);
  si_alien_3.resize(si_levelArray[si_level].alienDia, 
                    si_levelArray[si_level].alienDia);
  si_imgEvilBacteria.resize(si_levelArray[si_level].terminatorDia, 
                            si_levelArray[si_level].terminatorDia);

  // Build game screen & enable buttons
  si_reset();
  //si_regEvent();// eventListener results in delay to detecting input
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
  background(si_background);

  if(html_gameActive == 'p') {
    noLoop();                          // Game paused
  }
  else if (html_gameActive == 'a') {   // Game active
    si_keyInput();                     // Detect keyboard input
    // Detect aliens hitting side walls
    if (wallRH.collides(si_alienGroup)) {
      si_alienGroup.vel.x = -si_alienGroup.vel.x;
      for (let si_alien of si_alienGroup) {
        si_alien.y = si_alien.y + si_levelArray[si_level].alienDia;
      }
    }
    else if (wallLH.collides(si_alienGroup)) {
      si_alienGroup.vel.x = -si_alienGroup.vel.x;
      for (let si_alien of si_alienGroup) {
        si_alien.y = si_alien.y + si_levelArray[si_level].alienDia;
      }
    }
  }
}

/**************************************************************/
// si_admin()
// Called by game page ADMIN button
// Pause the game and goto admin page
// Input:  opt = 'd' to display leaderboard & 'r' return
// Return: n/a
/**************************************************************/
function si_admin() {
  console.log('%c si_admin(): ',
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  html_gameActive = 'a';
  si_startPause();
  si_admin();
}

/**************************************************************/
// si_leaderboard(_opt)
// Called by game page LEADERBOARD button 
// Read the top score records & display in table
// Input:  opt = 'd' to display leaderboard & 'r' return
// Return: n/a
/**************************************************************/
function si_leaderboard(_opt) {
  console.log('%c si_leaderboard(): opt= ' + _opt, 
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  if (_opt == 'd') {
    si_spaceSound.stop();
    b_leaderboard.classList.add("w3-disabled");
    b_inst.classList.add("w3-disabled");
    b_startPause.classList.add("w3-disabled");
    b_reset.classList.add("w3-disabled");
    
    noLoop();     
    clearInterval(si_timer);
    clearTimeout(si_alienRoundTimer);
    
    b_startPause.style.backgroundColor = "lightgreen";
    b_startPause.textContent = "RE-START";

    if (html_gameActive == 'a') {
      si_saveAlienVel = si_alienGroup.vel.x;
      html_gameActive = 'p';
    }
    
    html_swapPage(null, "s_leaderbPage");
    html_posElement("s_leaderbPage", "defaultCanvas0");
    html_swapPage("defaultCanvas0", null);
  
    si_scoreArray = [];
    fb_readSortedLimit(SI, fbR_procLeaderboard, si_scoreArray, 
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
// si_instructions(_opt)
// Called by game page INSTRUCTIONS button
// Disable game buttons & display game instructions
// Input:  opt = 'd' to display instructions & 'r' return
// Return: n/a
/**************************************************************/
function si_instructions(_opt) {
  console.log('%c si_instructions(): opt= ' + _opt + 
              '  html_gameActive= ' + html_gameActive,
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  if (_opt == 'd') {
    si_spaceSound.stop();
    b_leaderboard.classList.add("w3-disabled");
    b_inst.classList.add("w3-disabled");
    b_startPause.classList.add("w3-disabled");
    b_reset.classList.add("w3-disabled");
    
    noLoop();     
    clearInterval(si_timer);
    clearTimeout(si_alienRoundTimer);
    
    b_startPause.style.backgroundColor = "lightgreen";
    b_startPause.textContent = "RE-START";
    
    if (html_gameActive == 'a') {
      si_saveAlienVel = si_alienGroup.vel.x;
      html_gameActive = 'p';
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
// si_keyInput()
// Called by draw()
// Detect keyboard input for player with no delay):
//  left & right arrows to move sideways
//               space bar to fire
// Input:  n/a
// Return: n/a
/**************************************************************/
function si_keyInput() {
  //console.log('%c si_keyInput(): ',
  //            'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

    if (kb.pressing('ArrowLeft')) {
      si_player.vel.x = -si_levelArray[si_level].playerVel;
    }
    else if (kb.pressing('ArrowRight')) {
      si_player.vel.x = si_levelArray[si_level].playerVel;
    }          
    else if (kb.presses('space')) {
      si_playerFire(si_levelArray[si_level].playerRoundInterval);
    }
 
    if (kb.released('ArrowLeft')) {
      si_player.vel.x = 0;
    }
    else if (kb.released('ArrowRight')) {
      si_player.vel.x = 0;
    }
}

/**************************************************************/
// si_regEvent()
// Called by setup()
// Register keyboard events for player (has delay so not used):
//  left & right arrows to move sideways
//               space bar to fire
// Input:  n/a
// Return: n/a
/**************************************************************/
function si_regEvent() {
  console.log('%c si_regEvent(): ',
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  document.addEventListener("keydown", function(event) {
    if (event.code === 'ArrowLeft') {
      //si_player.x = si_player.x - si_levelArray[si_level].playerVel;
      si_player.vel.x = -si_levelArray[si_level].playerVel;
    }
    else if (event.code === 'ArrowRight') {
      //si_player.x = si_player.x + si_levelArray[si_level].playerVel;
      si_player.vel.x = si_levelArray[si_level].playerVel;
    }
          
    if (event.code === 'Space') {
      si_playerFire(si_levelArray[si_level].playerRoundInterval);
    }
  });

  document.addEventListener("keyup", function(event) {
    if (event.code === 'ArrowLeft') {
      //si_player.x = si_player.x - si_levelArray[si_level].playerVel;
      si_player.vel.x = 0;
    }
    else if (event.code === 'ArrowRight') {
      //si_player.x = si_player.x + si_levelArray[si_level].playerVel;
      si_player.vel.x = 0;
    }
  });
}

/**************************************************************/
// si_startPause()
// Called by game page START/PAUSE button
// Enable RESET button
// If game; Currently active, pause it.
//          Currently paused, re-start it.
//          Over, pause it & clear timer
// Input:  n/a
// Return: n/a
/**************************************************************/
function si_startPause() {
  console.log('%c si_startPause(): html_gameActive= ' + html_gameActive +
              ' si_background= ' + si_background +
              ' si_level= ' + (si_level+1), 
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  p_msg.textContent = '';
  b_reset.classList.remove("w3-disabled");
  si_resetActive = false;

  // Game is active so pause it
  if (html_gameActive == 'a') {
    // Game currently ACTIVE so PAUSE IT
    si_saveAlienVel = si_alienGroup.vel.x;
    si_alienGroup.vel.x = 0;
    si_spaceSound.stop();
    html_gameActive = 'p';     
    clearInterval(si_timer);
    clearTimeout(si_alienRoundTimer);
    
    b_startPause.style.backgroundColor = "lightgreen";
    b_startPause.textContent = "RE-START";
  }

  // Game is paused so make it active
  else if (html_gameActive == 'p') {
    // Game currently PAUSED so make it ACTIVE
    si_alienGroup.vel.x = si_saveAlienVel;
    si_spaceSound.play();
    //si_spaceSound.loop();//DISG
    si_timer = setInterval(si_timerFunc, 1000);
    // Set random alien to fire rounds at random intervals
    si_aliensSetFiring();
    html_gameActive = 'a';
    loop();

    b_startPause.style.backgroundColor = "grey";
    b_startPause.textContent = "PAUSE";
  }

  // Game is over
  else if (html_gameActive == 'e') {
    html_gameActive = 'p';     
    clearInterval(si_timer);
    clearTimeout(si_alienRoundTimer);
  }
}

/**************************************************************/
// si_reset()
// Called by setup() & game page RESET button
// If RESET button disabled exit.
// If game has been running cancel it, create & start new game &
//  disable RESET button.
// If game not yet started, create a new game.
// Input:  n/a
// Return: n/a
/**************************************************************/
function si_reset() {
    console.log('%c si_reset(): si_resetActive= ' + si_resetActive + 
                ' html_gameActive= ' + html_gameActive, 
                'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  if (si_resetActive) {
    return;
  }

  if (html_gameActive == 'a' || html_gameActive == 'p' || 
      html_gameActive == 'e') {
    // Game has been running so cancel it & disable RESET button.
    b_reset.classList.add("w3-disabled");
    si_resetActive = true;
    clearInterval(si_timer);
    clearTimeout(si_alienRoundTimer);
    si_spaceSound.stop();
    
    // Delete all previous sprites
    allSprites.remove();
  }
  
  // Create walls, player & alien sprites
  si_createWalls();
  si_createPlayer();
  //si_createTerminators();
  si_createAlienSprites();
  
  // Reset counters
  si_seconds           = 0;    
  si_numAliens         = si_levelArray[si_level].numAliens;
  si_numLives          = si_levelArray[si_level].numLives;
  si_level             = 0;
  html_gameActive      = 'p';

  // Update display
  si_background        = si_levelArray[si_level].bg;
  p_msg.textContent    = '';
  p_level.textContent  = (si_level+1);
  p_aliens.textContent = si_numAliens;
  p_lives.textContent  = si_numLives;
  p_time.textContent   = si_seconds;
  p_ratio.textContent  = 0;
  p_score.textContent  = 0;
  
  b_startPause.style.backgroundColor = "green";
  b_startPause.textContent = "START";
  b_startPause.classList.remove("w3-disabled");

  si_saveAlienVel = si_levelArray[si_level].alienVel;
}

/**************************************************************/
// si_timerFunc()
// Called by timer event started by si_startPause
// Add a sec & update html timer paragraph.
// Input:  n/a
// Return: n/a
/**************************************************************/
function si_timerFunc() {
  if (html_gameActive) {
    si_seconds++; 
    p_time.textContent = si_seconds;
  }
}

/**************************************************************/
// si_createPlayer()
// Called by si_reset() when game is starting
// Create player sprite
// Input:  n/a
// Return: n/a
/**************************************************************/
function si_createPlayer() {
  console.log('%c si_createPlayer(): ',
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');
  
  si_player = new Sprite(width/2, height - si_levelArray[si_level].playerDia,
                         si_levelArray[si_level].playerDia/2, 'k');
  si_player.image = (si_imgPlayer);
  si_player.rotationLock = true;
  if (html_debugStatus == 'y') {
    si_player.debug = true;
  }
  
  // Create player's shell round group & set up collides
  si_playerRoundGroup = new Group();
  si_alienGroup = new Group();
  si_playerRoundGroup.collides(si_alienGroup, si_alienHit);
  //tg_wallGroup.collides(si_playerRoundGroup, tg_p1RoundDestroyed);
  //si_playerRoundGroup.collides(si_alienGroup, si_alienHit);
}

/*******************************************************/
// si_alienHit()
// Called by collides event created by si_createPlayer()
// Player round hit alien
// Add 1 to Player hits & remove alien
// If no aliens remain, level completed
// Input:  2nd parameter is the round that hit 
// Return: n/a
/*******************************************************/
function si_alienHit(si_playerRoundGroup, si_alienGroup) {
  console.log('%c si_alienHit(): si_numAliens= ' + si_numAliens,
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  //si_collect.play();
  si_alienGroup.remove();
  si_playerRoundGroup.remove();
  
  si_numAliens--;
  p_aliens.textContent = si_numAliens;
  /*
  // Calc new ratio 
  si_ratio = Math.round((si_levelArray[si_level].numAliens - 
                         si_numAliens) / si_levelArray[si_level].numAliens
                         * 1000) / 10;
  p_ratio.textContent = si_ratio;
  */
  if (si_numAliens <= 0) {
    si_levelOver(0, 'You won level ' + (si_level+1), 'green');
  }
}

/**************************************************************/
// si_createAlienSprites()
// Called by si_reset() when game is starting
// Create alien sprites
// Input:  n/a
// Return: n/a
/**************************************************************/
function si_createAlienSprites() { 
  console.log('%c si_createAlienSprites(): si_level= ' + (si_level+1) +
              ' num= ' + si_levelArray[si_level].numAliens, 
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');
    
  var si_gap  = si_levelArray[si_level].alienDia/2;
  var si_xPos = si_levelArray[si_level].alienDia;
  var si_yPos = si_levelArray[si_level].alienDia;
  
  for (var i = 0; i < si_levelArray[si_level].numRows; i++) {
    for (var j = 0; j < si_levelArray[si_level].numInRow; j++) {
      si_x = si_xPos + si_levelArray[si_level].alienDia + si_gap;
      si_y = si_yPos;
      si_alien = new Sprite(si_x, si_y, si_levelArray[si_level].alienDia, 'd');
      if (html_debugStatus == 'y') {
        si_alien.debug = true;
      }
      si_alien.image = (si_alien_1);
      si_alienGroup.add(si_alien);
      si_xPos = si_xPos + si_levelArray[si_level].alienDia + si_gap;
    }
    si_xPos = si_levelArray[si_level].alienDia;
    si_yPos = si_yPos + si_levelArray[si_level].alienDia + si_gap;
  }
  
  //si_alienGroup.bounciness = 1;
  si_alienGroup.friction   = 0;
  si_player.collides(si_alienGroup, si_playerDead);

  // Create alien's round group
  // Set random alien to fire rounds at random intervals
  si_alienRoundGroup = new Group();
  si_player.collides(si_alienRoundGroup, si_playerHit);
  wallBot.collides(si_alienRoundGroup, si_DeadRound);
}

/*******************************************************/
// si_playerDead(si_terminator, si_alienGroup)
// Called by collides event registered in si_createAlienSprites()
// Aliens crash into player so game over
// Input:  2nd parameter is the alien that hit player
// Return: n/a
/*******************************************************/
function si_playerDead(si_terminator, si_alienGroup) {
  console.log('%c si_playerDead(): ',
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  si_spaceSound.pause();
  si_collect.play();
  si_levelOver(1, 'Aliens crashed into you', 'red');
}

/*******************************************************/
// si_playerHit(si_player, si_alienRoundGroup)
// Called by collides event registered in si_createAlienSprites()
// Alien's round hit player so lose a life
// Input:  2nd parameter is the round that hit 
// Return: n/a
/*******************************************************/
function si_playerHit(si_player, si_alienRoundGroup) {
  console.log('%c si_playerHit(): ',
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  si_explosion.play();
  si_alienRoundGroup.remove();
  si_numLives--;
  p_lives.textContent  = si_numLives;
  
  if (si_numLives <= 0) {
    si_levelOver(1, 'You ran out of lives', 'red');
  }
}

/*******************************************************/
// si_DeadRound(wallBot, round)
// Called by collides event registered in si_createAlienSprites()
// Alien's round hit bottom wall so remove it
// Input:  2nd parameter is the round that hit wall
// Return: n/a
/*******************************************************/
function si_DeadRound(wallBot, round) {
  console.log('%c si_DeadRound(): ',
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');
  round.remove();
}

/**************************************************************/
// si_createTerminators()
// Called by si_reset() when game is starting
// Create terminator sprites - out of the way of the spaceShip...
// Input:  n/a
// Return: n/a
/**************************************************************/
function si_createTerminators() { 
  console.log('%c si_createTerminators(): si_level= ' + (si_level+1) + 
              ' num= ' + si_levelArray[si_level].numTerminators,
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  si_terminatorGroup = new Group();
  
  for (var i = 0; i < si_levelArray[si_level].numTerminators; i++) {
    si_x = random(si_levelArray[si_level].alienDia/2, 
                  width-si_levelArray[si_level].alienDia/2)
    si_y = random((height-si_levelArray[si_level].alienDia/2)/2, 
                  height-si_levelArray[si_level].alienDia/2)
           
    si_terminator = new Sprite(si_x, si_y, si_levelArray[si_level].alienDia/2, 'd');
    //si_terminator.vel.x = random(SI_MINVEL, SI_MAXVEL) * random([-1, 1]) * si_levelArray[si_level].velScale;
    //si_terminator.vel.y = random(SI_MINVEL, SI_MAXVEL) * random([-1, 1]) * si_levelArray[si_level].velScale;
    //si_terminator.vel.x = 0;
    //si_terminator.vel.y = 0;
    if (html_debugStatus == 'y') {
      si_terminator.debug = true;
    }
    si_terminator.image = (si_imgEvilBacteria);  
    si_terminatorGroup.add(si_terminator);
  }
  
  si_terminatorGroup.bounciness = 1;
  si_terminatorGroup.friction   = 0;
  si_player.collides(si_terminatorGroup, si_terminatorHitSpaceShip);
}

/*******************************************************/
// si_terminatorHitSpaceShip(si_terminator, si_alienGroup)
// Called by collides event registered in si_createAlienSprites()
// Terminator hit spaceShip so loose a life & 
//  end level if no more lives
// Input:  2nd parameter is the terminator that hit 
// Return: n/a
/*******************************************************/
function si_terminatorHitSpaceShip(si_player, si_terminator) {
  console.log('%c si_terminatorHitSpaceShip(): si_numLives= ' + si_numLives,
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  si_explosion.play();
  si_numLives--;
  p_lives.textContent  = si_numLives;
  
  if (si_numLives <= 0) {
    si_levelOver(1, 'You ran out of lives', 'red');
  }
}

/**************************************************************/
// si_createWalls()
// Called by si_reset() when game is starting
// Create wall sprites
// Input:  n/a
// Return: n/a
/**************************************************************/
function si_createWalls() {
  console.log('%c si_createWalls(): ',
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  si_wallGroup = new Group();
  
  wallLH  = new si_wallGroup.Sprite(      0, height/2,     8, height, 'k');	
  wallRH  = new si_wallGroup.Sprite(  width, height/2,     8, height, 'k');
  //wallTop = new si_wallGroup.Sprite(width/2,        0, width,      8, 'k');          
	wallBot = new si_wallGroup.Sprite(width/2,   height, width,      8, 'k');

  wallLH.shapeColor  = color("purple");
  wallRH.shapeColor  = color("purple");
  //wallTop.shapeColor = color("purple");
  wallBot.shapeColor = color("purple");
}

/********************************************************/
// si_playerFire(_sec)
// Event triggered by space bar & registered by si_regEvent()
// You can only fire a round once per _sec
// Input:  _sec is time between firing rounds
// Return: n/a
/********************************************************/
function si_playerFire(_sec) {
  console.log('%c si_playerFire(): si_playerCanFire= ' + si_playerCanFire +
              '  millisec= ' + _sec, 
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  if (si_playerCanFire == true) {
    //si_tankRoundSound.play();
    si_playerCanFire = false;
    si_playerRoundTimer = setTimeout(si_playerTimerFunc, _sec);
    si_playerRound = new Sprite(si_player.x, si_player.y - (si_player.h / 2 + 7), 4, 14, 'd');
    si_playerRound.friction = 0;
    si_playerRound.rotationLock = true;
    if (html_debugStatus == 'y') {
      si_playerRound.debug = true;
    }
    si_playerRoundGroup.add(si_playerRound);
    si_playerRound.vel.y = -si_levelArray[si_level].playerRoundSpeed;
  }
}

/********************************************************/
// si_playerTimerFunc()
// timer event, created by si_playerFire()
// Player can now fire a round
// Input:  n/a
// Return: n/a
/********************************************************/
function si_playerTimerFunc() {
  console.log('%c si_playerTimerFunc(): ',
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  si_playerCanFire = true;
}

/*******************************************************/
// si_aliensSetFiring()
// Called by si_createAlienSprites()
// Set random gap between alien firing & call si_alienTimerFunc() 
// Input:  n/a
// Return: n/a
/*******************************************************/
function si_aliensSetFiring() {
  console.log('%c si_aliensSetFiring(): ',
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  si_alienRoundInterval = random(500, 1000);  
  si_alienRoundTimer = setTimeout(si_alienTimerFunc, 
                                  si_alienRoundInterval);
}

/*******************************************************/
// si_alienTimerFunc()
// Called by si_aliensSetFiring()
// Set random alien to fire round & 
//  call si_aliensSetFiring() to start process again
// Input:  n/a
// Return: n/a
/*******************************************************/
function si_alienTimerFunc() {
  console.log('%c si_alienTimerFunc(): ',
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');
  
  si_alien2Fire = Math.round(random(0, si_alienGroup.length-1)); 
  console.log('%c si_alienTimerFunc(): alien to fire= ' + si_alien2Fire +
              '  x/y= ' + si_alienGroup[si_alien2Fire].x + '/' + 
              si_alienGroup[si_alien2Fire].y,
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  si_alienRound = new Sprite(si_alienGroup[si_alien2Fire].x, 
                             si_alienGroup[si_alien2Fire].y - 
                             (si_alienGroup[si_alien2Fire].h / 2 + 7), 
                             4, 14, 'd');
  
  si_alienRound.overlaps(si_alienGroup);
  si_alienRound.friction = 0;
  si_alienRound.color = 'red';
  si_alienRound.rotationLock = true;
  if (html_debugStatus == 'y') {
    si_alienRound.debug = true;
  }

  si_alienRoundGroup.add(si_alienRound);
  //si_positionRound(si_player, si_alienRound);
  si_alienRound.vel.y = si_levelArray[si_level].alienRoundSpeed;
  si_aliensSetFiring();      // Randomly fire next round
}

/**************************************************************/
// si_levelOver(_reason, _msg, _colour)
// Called by si_playerDead() if alien crashed into player or
//           si_playerHit() if out of lives
//           si_playerDead() if alien crashed into player or
//           ??() if terminator round hit player
// Level is over, so deactivate game, If new high score, write to db
// Input:  _reason = 0 if no more aliens, 
//                   1 if no more lives or alien crashed into player
//         _msg is message to display
//         _colour is colour of message
// Return: n/a
/**************************************************************/
function si_levelOver(_reason, _msg, _colour) {
  console.log('%c si_levelOver(): reason= ' + _reason,
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');
  
  clearInterval(si_timer);
  clearTimeout(si_alienRoundTimer);
  si_spaceSound.stop();
  b_startPause.classList.add("w3-disabled");
  
  // Delete any previous spaceShip, alien & terminator sprites
  si_player.remove();
  si_alienGroup.remove();
  si_alienRoundGroup.remove();
  //si_terminatorGroup.remove();
  
  // Calc win or loss
  if (_reason == 0) {
    si_fb_score.wins++;
    si_levelSuccess.play()
  }
  else {
    si_fb_score.losses++;
    si_levelFail.play();
  }
  p_msg.textContent  = _msg
  p_msg.style.color  = _colour;
  
  // Calc new ratio & time taken
  si_ratio = Math.round((si_levelArray[si_level].numAliens - 
                         si_numAliens) / si_levelArray[si_level].numAliens
                         * 1000) / 10;
  
  // Calc new score by concatenating level, lives, ratio & time
  si_score = Number("" + (si_level+1) + si_numLives + si_ratio + 
                    (SI_BASETIME - si_seconds));
  
  if (si_score > si_fb_score.score) {
    si_fb_score.score  = si_score;
    si_fb_score.level  = si_level+1;
    si_fb_score.lives  = si_numLives;
    si_fb_score.aliens = si_numAliens;
    si_fb_score.time   = si_seconds;
    si_fb_score.ratio  = si_ratio;
  }

  // Update session storage & write updated SI score object to fb
  //  even its only updated win/losses
  sessionStorage.setItem('game_score', JSON.stringify(si_fb_score));
  fb_writeRec(SI, fbD_userDetails.uid, si_fb_score, fbR_procWScore);

  html_gameActive = 'p'; 
  
  // Check for next level ONLY if won current level
  if (_reason == 0) {       // Won current level 
    if (si_level+1 < si_levelArray.length) {
      si_level++;           // Set to next level
      si_prepLevel();
    }
    else {                  // No more levels = game over
      si_gameOver(_reason);
    }
  }
    
  else if (_reason == 2) {  // CLICKed on terminator = game over
     si_gameOver(_reason);
  }
  else {                    // Ran out of time = play same level
    si_prepLevel();
  }

  // Reset counters & update display
  si_seconds           = 0;    
  si_numAliens         = si_levelArray[si_level].numAliens;
  si_numLives          = si_levelArray[si_level].numLives;

  p_level.textContent  = si_level+1;
  p_aliens.textContent = si_numAliens;
  p_lives.textContent  = si_numLives;
  p_time.textContent   = si_seconds;
  p_ratio.textContent  = 0;
  p_score.textContent  = 0;

  /*----------------------------------------------------------*/
  // si_prepLevel()
  // Called by si_levelOver()
  // Prepare for level to play
  // Input:  n/a
  // Return: n/a
  /*----------------------------------------------------------*/
  function si_prepLevel() {
    console.log('%c si_prepLevel(): ',
                'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');
    
    b_reset.classList.add("w3-disabled");
    si_resetActive = true;

    // Create new level's player & alien sprites
    si_createPlayer();
    //si_createTerminators();
    si_createAlienSprites();
     
    // Reset counters and update display
    si_background   = si_levelArray[si_level].bg;
    
    b_startPause.style.backgroundColor = "green";
    b_startPause.textContent = "START";
    b_startPause.classList.remove("w3-disabled");
  }
}

/**************************************************************/
// si_gameOver(_reason)
// Called by si_levelOver() 
// Game is over, so deactivate game & set level back to start
// Input:  n/a
// Return: n/a
/**************************************************************/
function si_gameOver(_reason) {
  console.log('%c si_gameOver(): reason= ' + _reason,
              'color: ' + SI_COL_C + '; background-color: ' + SI_COL_B + ';');

  if ((si_level+1) < si_levelArray.length) {
    si_gameFail.play();
  }
  else {
    si_gameSuccess.play();
  }
  
  si_background   = si_imgGameOver;
  html_gameActive = 'e';
  b_startPause.classList.add("w3-disabled");
  si_resetActive  = false;
      
  si_level = 0;    // Set to 1st level
}

/**************************************************************/
//   END OF APP
/**************************************************************/