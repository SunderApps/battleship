/***********************************************************************\
** File:        scripts.js                                              *
**                                                                      *
** Author:      Samuel Underwood                                        *
**                                                                      *
** Email:       stu17@pitt.edu                                          *
\***********************************************************************/

/***********************************************************************\
** Variables                                                            *
\***********************************************************************/

var pName = ['Player 1', 'Player 2'];       // Players' Names
var pLayout = ['A:A1-A5; B:B6-E6; S:H3-J3', // Player 1's Ship Layout
               'A:A1-A5; B:B6-E6; S:H3-J3'];// Player 2's Ship Layout
var pField = [[],[]];                       // Players' Playing Field Grids
var p1Lives = new Array(3);                 // Number of Lives Player 1 has Left
var p2Lives = new Array(3);                 // Number of Lives Player 2 has Left
var leaderboard = new Array(10);            // Holds Leaderboard Information
var turn = 1;                               // Which Player's Turn it is

/***********************************************************************\
** Main Script                                                          *
\***********************************************************************/

// Start the game when the page loads
window.onload = init;

/***********************************************************************\
** Functions                                                            *
\***********************************************************************/

// Initialize the game
// Handler for window's onload event
function init()
{
  //        DEBUG CODE        \\
  // Clear the Local Storage
  //localStorage.clear();
  //        DEBUG CODE        //

  // Retrieve the Leaderboard
  for(var i = 0; i < 10; i++)
    leaderboard[i] = new Object;
  if(typeof(Storage) !== 'undefined')
  {
    var lb = document.getElementById('leaderboard');
    for(var i = 0; i < 10; i++)
    {
      leaderboard[i].Name = localStorage.getItem(i+'Name');
      leaderboard[i].Score = localStorage.getItem(i+'Score');
      if(leaderboard[i].Name === null)
        leaderboard[i].Name = '';
      if(leaderboard[i].Score === null)
        leaderboard[i].Score = '0';
      lb.rows[i].cells[1].innerHTML = leaderboard[i].Name;
      lb.rows[i].cells[2].innerHTML = ('0' + leaderboard[i].Score).slice(-2);
    }
  }

  // Initialize Players' Lives
  p1Lives[0] = 5;
  p1Lives[1] = 4;
  p1Lives[2] = 3;
  p2Lives[0] = 5;
  p2Lives[1] = 4;
  p2Lives[2] = 3;

  // Initialize the field to all open water
  for(var i = 0; i < 10; i++)
  {
    pField[0][i] = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
    pField[1][i] = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
  }

  // Get the player names and ship layouts
  getInfo(1);
  getInfo(2);

  // Player 1 goes first
  turn = 1;

  // Attack the target if the user clicks on one of their blocks
  var targetGrid = document.getElementById('targetTable');
  for(var i = 1; i < targetGrid.rows.length; i++)
  {
    for(var j = 1; j < targetGrid.rows[i].cells.length; j++)
    {
      targetGrid.rows[i].cells[j].addEventListener('click', attack);
    }
  }

  // Start the first turn
  nextTurn();
}

// Get a player's name and ship layout
function getInfo(pNum)
{
  // Get Player's
  pName[pNum-1] = window.prompt('Player ' + pNum + ' - Enter your name:', 'Player ' + pNum);
  if(pName[pNum-1] === null) pName[pNum-1] = 'Player ' + pNum;

  // Player Input Validation Loop
  var valid = false;
  while(valid === false)
  {
    // Get Player's ship setup
    pLayout[pNum-1] = window.prompt('Player ' + pNum + ' - Enter your ship placement:\nA for Aircraft Carrier (Size 5)\nB for Battleship (Size 4)\nS for Submarine (Size 3)\nSeparate each ship type and coordinate range by a non-letter/number character.', 'A:A1-A5; B:B6-E6; S:H3-J3');
    if(pLayout[pNum-1] === null) pLayout[pNum-1] = 'A:A1-A5; B:B6-E6; S:H3-J3';

    // If the setup is of the valid form
    var position = pLayout[pNum-1].search(/([ABS]\W+[A-J]\d\d?-[A-J]\d\d?\W*){3}/i);
    if(position === 0)
    {
      // If the setup contains an Aircraft Carrier
      position = pLayout[pNum-1].search(/\W?[A]\W/i);
      if(position !== -1)
      {
        // If the setup contains a Battleship
        position = pLayout[pNum-1].search(/\W?[B]\W/i);
        if(position !== -1)
        {
          // If the setup contains a Submarine
          position = pLayout[pNum-1].search(/\W?[S]\W/i);
          if(position !== -1)
          {
            // Add Player's ships to the field arrays
            var ships = pLayout[pNum-1].match(/[ABS]\W+[A-J]\d\d?-[A-J]\d\d?\W*/gi);
            var beginCol, beginRow, endCol, endRow;
            for(i = 0; i < ships.length; i++)
            {
              // Parse the information
              var shipType = ships[i].charAt(0);
              position = ships[i].search(/[A-J]\d\d?-[A-J]\d\d?/i);
              if(position !== -1)
              {
                beginCol = ships[i].charAt(position++);
                beginRow = ships[i].charAt(position++);
                if(!isNaN(parseInt(ships[i].charAt(position))))
                  beginRow += ships[i].charAt(position++);
                position++;
                beginRow = Number.parseInt(beginRow);

                endCol = ships[i].charAt(position++);
                endRow = ships[i].charAt(position++);
                if(!isNaN(parseInt(ships[i].charAt(position))))
                  endRow += ships[i].charAt(position++);
                endRow = Number.parseInt(endRow);

                // Flip the coordinates if necessary
                if(beginCol > endCol || beginRow > endRow)
                {
                  var temp = beginCol;
                  beginCol = endCol;
                  endCol = temp;
                  temp = beginRow;
                  beginRow = endRow;
                  endRow = temp;
                }

                // If the ship is horizontally placed
                if(beginRow === endRow)
                {
                  // Get the row and column information
                  var row = beginRow - 1;
                  var col = beginCol.toUpperCase().charCodeAt(0) - 65;
                  var end = endCol.toUpperCase().charCodeAt(0) - 65;

                  // Check for cheating
                  if(shipType.toUpperCase() === 'A' && end - col !== 4 ||
                     shipType.toUpperCase() === 'B' && end - col !== 3 ||
                     shipType.toUpperCase() === 'S' && end - col !== 2)
                     {
                       window.alert(pName[pNum-1] + ' didn\'t choose the correct number of spaces for a ship.  Try again.');
                       valid = false;
                       break;
                     }
                  else
                     {
                       valid = true;
                     }
                  // Save the ship in the player's field
                  for(col = beginCol.toUpperCase().charCodeAt(0) - 65; col <= endCol.toUpperCase().charCodeAt(0) - 65; col++)
                  {
                    pField[pNum-1][row][col] = shipType.toUpperCase();
                  }
                }
                // If the ship is vertically placed
                else if(beginCol === endCol)
                {
                  // Get the row and column information
                  var row = beginRow - 1;
                  var col = beginCol.toUpperCase().charCodeAt(0) - 65;
                  var end = endRow - 1;

                  // Check for cheating
                  if(shipType.toUpperCase() === 'A' && end - row !== 4 ||
                     shipType.toUpperCase() === 'B' && end - row !== 3 ||
                     shipType.toUpperCase() === 'S' && end - row !== 2)
                     {
                       window.alert(pName[pNum-1] + ' didn\'t choose the correct number of spaces for a ship.  Try again.');
                       valid = false;
                       break;
                     }
                  else
                     {
                       valid = true;
                     }

                  // Save the ship in the player's field
                  for(row = beginRow - 1; row <= endRow - 1; row++)
                  {
                    pField[pNum-1][row][col] = shipType.toUpperCase();
                  }
                }
                else
                {
                  window.alert(pName[pNum-1] + ', you can\'t place pieces diagonally.  Try again.');
                  valid = false;
                  break;
                }
              }
              else
              {
                document.write('There was an error in parsing your layout strings.  Try again.');
                valid = false;
                break;
              }
            }
          }
          // If the setup doesn't contain a Submarine
          else
          {
            // Inform the user
            window.alert('Player ' + pNum + ':\nYou must include an \'S\' (for Submarine) in your setup string.\nPlease try again!');
          }
        }
        // If the setup doesn't contain a Battleship
        else
        {
          // Inform the user
          window.alert('Player ' + pNum + ':\nYou must include a \'B\' (for Battleship) in your setup string.\nPlease try again!');
        }
      }
      // If the setup doesn't contain an Aircraft Carrier
      else
      {
        // Inform the user
        window.alert('Player ' + pNum + ':\nYou must include an \'A\' (for Aircraft Carrier) in your setup string.\nPlease try again!');
      }
    }
    // If the setup is not of the valid form
    else
    {
      // Inform the user
      window.alert('Player ' + pNum + ':\nYour ship placement string is not of the right format.\nPlease try again!')
    }
  }
}

// Run the next player's turn
// Called first from init() and then from attack() after that
function nextTurn()
{
  // Variables to hold the two grids
  var targetGrid = document.getElementById('targetTable');
  var playerGrid = document.getElementById('playerTable');

  // Clear the tables of the other player's information
  clearTables();

  // If Player 1 is out of lives
  if(p1Lives[0] === 0 && p1Lives[1] === 0 && p1Lives[2] === 0)
  {
    // Player 2 won
    turn = 2;
    victory();
    return;
  }

  // If Player 2 is out of Lives
  if(p2Lives[0] === 0 && p2Lives[1] === 0 && p2Lives[2] === 0)
  {
    // Player 1 won
    turn = 1;
    victory();
    return;
  }

  // If it is Player 1's turn
  if(turn === 1)
  {
    window.alert(pName[0] + '\'s Turn! Give the device to ' + pName[0] + ' before clicking OK.');
  }
  // If it is Player 2's turn
  else
  {
    window.alert(pName[1] + '\'s Turn! Give the device to ' + pName[1] + ' before clicking OK.');
  }

  // Draw the field
  if(turn === 1)
  {
    drawTable(2, true, true);
    drawTable(1, false, false);
  }
  else
  {
    drawTable(1, true, true);
    drawTable(2, false, false);
  }

  // Make it the next player's turn
  turn = turn - 1;
  turn = 1 - turn;
  turn = turn + 1;
}

// Attack the specified block
// Handler for the table cells' click event
function attack()
{
  // Get the row and column of the attack
  var row = this.parentNode.rowIndex - 1;
  var col = this.cellIndex - 1;

  // If it is Player 1's turn (turn === 2 because Player 2 is NEXT)
  if(turn === 2)
  {
    // Check if there was a ship there
    switch(pField[1][row][col])
    {
      // If there was a ship
      case 'A':
        // Attack it
        pField[1][row][col] = pField[1][row][col].toLowerCase();
        p2Lives[0]--;
        this.backgroundColor = '#FF0000';
        window.alert('Hit!');
        if(p2Lives[0] === 0)
        {
          window.alert('You sunk ' + pName[1] + '\'s Aircraft Carrier!');
        }
        nextTurn();
        break;
      case 'B':
        // Attack it
        pField[1][row][col] = pField[1][row][col].toLowerCase();
        p2Lives[1]--;
        this.backgroundColor = '#FF0000';
        window.alert('Hit!');
        if(p2Lives[1] === 0)
        {
          window.alert('You sunk ' + pName[1] + '\'s Battleship!');
        }
        nextTurn();
        break;
      case 'S':
        // Attack it
        pField[1][row][col] = pField[1][row][col].toLowerCase();
        p2Lives[2]--;
        this.backgroundColor = '#FF0000';
        window.alert('Hit!');
        if(p2Lives[2] === 0)
        {
          window.alert('You sunk ' + pName[1] + '\'s Submarine!');
        }
        nextTurn();
        break;
      // If there wasn't a ship
      case ' ':
        // Player missed
        pField[1][row][col] = 'O';
        window.alert('Miss!');
        nextTurn();
        break;
    }
  }
  // If it is Player 2's turn
  else
  {
    // Check if there was a ship there
    switch(pField[0][row][col])
    {
      // If there was a ship
      case 'A':
        // Attack it
        pField[0][row][col] = pField[0][row][col].toLowerCase();
        p1Lives[0]--;
        this.backgroundColor = '#FF0000';
        window.alert('Hit!');
        if(p1Lives[0] === 0)
        {
          window.alert('You sunk ' + pName[0] + '\'s Aircraft Carrier!');
        }
        nextTurn();
        break;
      case 'B':
        // Attack it
        pField[0][row][col] = pField[0][row][col].toLowerCase();
        p1Lives[1]--;
        this.backgroundColor = '#FF0000';
        window.alert('Hit!');
        if(p1Lives[1] === 0)
        {
          window.alert('You sunk ' + pName[0] + '\'s Battleship!');
        }
        nextTurn();
        break;
      case 'S':
        // Attack it
        pField[0][row][col] = pField[0][row][col].toLowerCase();
        p1Lives[2]--;
        this.backgroundColor = '#FF0000';
        window.alert('Hit!');
        if(p1Lives[2] === 0)
        {
          window.alert('You sunk ' + pName[0] + '\'s Submarine!');
        }
        nextTurn();
        break;
      // If there wasn't a ship
      case ' ':
        // Player missed
        pField[0][row][col] = 'O';
        window.alert('Miss!');
        nextTurn();
        break;
    }
  }
}

// Presents victory for the winner
// Called from nextTurn() when a player has 0 lives
function victory()
{
  // Display the play again button
  var play = document.getElementById('playAgain');
  play.addEventListener('click', playAgain);
  play.style.display = 'block';

  // Remove the event listeners on the table
  var targetGrid = document.getElementById('targetTable');
  for(var i = 1; i < targetGrid.rows.length; i++)
  {
    for(var j = 1; j < targetGrid.rows[i].cells.length; j++)
    {
      targetGrid.rows[i].cells[j].removeEventListener('click', attack);
    }
  }

  // If Player 1 won
  if(turn === 1)
  {
    // Display the fields
    drawTable(1, true, false);
    drawTable(2, false, false);
    document.getElementById('title1').innerHTML = pName[0] + ' won!';
    document.getElementById('title2').innerHTML = pName[1] + ' lost!';

    // Calculate score
    var score = 24 - (5 - p1Lives[0]) * 2 - (4 - p1Lives[1]) * 2 - (3 - p1Lives[2]) * 2;
    document.getElementById('subtitle1').innerHTML = 'With a score of: ' + score;

    // If there is a new top 10 score
    if(score > leaderboard[9].Score)
    {
      // Congratulate the player
      window.alert(pName[0] + ' has won with a new top 10 score of: ' + score + ' points!');

      // Add the score to the leaderboard
      leaderboard[9].Name = pName[0];
      leaderboard[9].Score = score;
      leaderboard.sort(scoreCompare);
      var lbTable = document.getElementById('leaderboard');
      for(var i = 0; i < 10; i++)
      {
        lbTable.rows[i].cells[1].innerHTML = leaderboard[i].Name;
        lbTable.rows[i].cells[2].innerHTML = ('0' + leaderboard[i].Score).slice(-2);
      }
    }
    // If there isn't a new top 10 score
    else
    {
      // Congratulate the player
      window.alert(pName[0] + ' has won with ' + score + ' points!');
    }
  }
  // If Player 2 won
  else
  {
    // Display the fields
    drawTable(2, true, false);
    drawTable(1, false, false);
    document.getElementById('title1').innerHTML = pName[1] + ' won!';
    document.getElementById('title2').innerHTML = pName[0] + ' lost!';

    // Calculate score
    var score = 24 - (5 - p2Lives[0]) * 2 - (4 - p2Lives[1]) * 2 - (3 - p2Lives[2]) * 2;
    document.getElementById('subtitle1').innerHTML = 'With a score of: ' + score;

    // If there is a new top 10 score
    if(score > leaderboard[9].Score)
    {
      // Congratulate the player
      window.alert(pName[1] + ' has won with a new top 10 score of: ' + score + ' points!');

      // Add the score to the leaderboard
      leaderboard[9].Name = pName[1];
      leaderboard[9].Score = score;
      leaderboard.sort(scoreCompare);
      var lbTable = document.getElementById('leaderboard');
      for(var i = 0; i < 10; i++)
      {
        lbTable.rows[i].cells[1].innerHTML = leaderboard[i].Name;
        lbTable.rows[i].cells[2].innerHTML = ('0' + leaderboard[i].Score).slice(-2);
      }
    }
    // If there isn't a new top 10 score
    else
    {
      // Congratulate the player
      window.alert(pName[1] + ' has won with ' + score + ' points!');
    }
  }

  // Save the leaderboard
  for(var i = 0; i < 10; i++)
  {
    if(leaderboard[i].Score !== 0)
    {
      localStorage.setItem(i+'Name', leaderboard[i].Name);
      localStorage.setItem(i+'Score', leaderboard[i].Score);
    }
  }
}

// Runs the game again
// Handler for the Play Again <div>'s click event
function playAgain()
{
  this.style.display = 'none';
  clearTables();
  init();
}

// Draws player's field to targetTable if target = true
// Ship locations are hidden if secret is true
function drawTable(player, target, secret)
{
  // Select the correct table
  var grid;
  if(target === true)
  {
    grid = document.getElementById('targetTable');
  }
  else
  {
    grid = document.getElementById('playerTable');
  }

  // Draw the field
  for(var i = 0; i < 10; i++)
  {
    for(var j = 0; j < 10; j++)
    {
      // If drawing Player 1's field
      if(player === 1)
      {
        // Change the color of the grid according to Player 1's field
        switch(pField[0][i][j])
        {
          case 'A':
          case 'B':
          case 'S':
            if(secret)
            {
              grid.rows[i+1].cells[j+1].style.backgroundColor = '#0099FF';
            }
            else
            {
              grid.rows[i+1].cells[j+1].style.backgroundColor = '#00FF00';
              grid.rows[i+1].cells[j+1].innerHTML = pField[0][i][j];
            }
            break;
          case 'a':
          case 'b':
          case 's':
            grid.rows[i+1].cells[j+1].style.backgroundColor = '#FF0000';
            if(!secret)
            {
              grid.rows[i+1].cells[j+1].innerHTML = pField[0][i][j].toUpperCase();
            }
            break;
          case 'O':
            grid.rows[i+1].cells[j+1].style.backgroundColor = '#FFFFFF';
            break;
        }
      }
      // If drawing Player 2's field
      else
      {
        // Change the color of the grid according to Player 2's field
        switch(pField[1][i][j])
        {
          case 'A':
          case 'B':
          case 'S':
            if(secret)
            {
              grid.rows[i+1].cells[j+1].style.backgroundColor = '#0099FF';
            }
            else
            {
              grid.rows[i+1].cells[j+1].style.backgroundColor = '#00FF00';
              grid.rows[i+1].cells[j+1].innerHTML = pField[1][i][j];
            }
            break;
          case 'a':
          case 'b':
          case 's':
            grid.rows[i+1].cells[j+1].style.backgroundColor = '#FF0000';
            if(!secret)
            {
              grid.rows[i+1].cells[j+1].innerHTML = pField[1][i][j].toUpperCase();
            }
            break;
          case 'O':
            grid.rows[i+1].cells[j+1].style.backgroundColor = '#FFFFFF';
            break;
        }
      }
    }
  }
}

// Clear the target and player grids
// Called in nextTurn()
function clearTables()
{
  // Clear the target table
  var table = document.getElementById('targetTable');
  for(var i = 1; i < 11; i++)
  {
    for(var j = 1; j < 11; j++)
    {
      table.rows[i].cells[j].style.backgroundColor = '#0099FF';
      table.rows[i].cells[j].innerHTML = '';
    }
  }

  // Clear the player table
  table = document.getElementById('playerTable');
  for(var i = 1; i < 11; i++)
  {
    for(var j = 1; j < 11; j++)
    {
      table.rows[i].cells[j].style.backgroundColor = '#0099FF';
      table.rows[i].cells[j].innerHTML = '';
    }
  }
}

// Comparison function for sorting the leaderboard
function scoreCompare(a, b)
{
  return -(a.Score - b.Score);
}
