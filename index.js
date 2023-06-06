const allButtons = document.querySelectorAll('button');
let playerOne = [];
let playerTwo = [];
let playerTurn = 0;
const winCombo = [[1,2,3], [1,4,7], [1,5,9], [2,5,8], [3,5,7], [3,6,9], [4,5,6], [7,8,9]];

allButtons.forEach(button => {
    button.addEventListener('click', playRound);
});

function playRound() {
    const thisButton = this;
    selectNumber(thisButton);
}


function selectNumber(button) {
    if (playerTurn == 0) {
        if (playerTwo.includes(+(button.dataset.index))) {
            return;
        }
        button.textContent = 'X';
        playerOne.push(+(button.dataset.index));
        playerTurn = 1;
        console.log(playerOne);
        console.log(playerTwo);
        checkWin(playerOne);
    } else {
        if (playerOne.includes(+(button.dataset.index))) {
            return;
        }
        button.textContent = 'O';
        playerTwo.push(+(button.dataset.index));
        playerTurn = 0;
        console.log(playerOne);
        console.log(playerTwo);
        checkWin(playerTwo);
    }
}


function checkWin(player) {
    for(let i = 0; i < winCombo.length; i++){
        if(winCombo[i].every(r => player.includes(r))) {
            console.log('win!');
            endGame();
        }
    } 
}


function endGame() {
    playerOne = [];
    playerTwo = [];
    playerTurn = 0;
    clearDisplay();
}

function clearDisplay() {
    allButtons.forEach(button => {
        button.textContent = '';
    });
}