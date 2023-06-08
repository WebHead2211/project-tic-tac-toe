const Gameboard = (() => {
    let gameboard = ['', '', '', '', '', '', '', '', ''];

    const render = () => {
        let boxHtml = '';
        gameboard.forEach((value, index) => {
            boxHtml += `<div class="box" data-index="${index}">${value}</div>`
        });
        document.querySelector('.container').innerHTML = boxHtml;

        if (GameControl.gameOver) {
            const boxList = document.querySelectorAll('.box');
            boxList.forEach(box => {
                box.addEventListener('click', GameControl.boxClick);
            });
        }
    };

    const resetRender = () => {
        let boxHtml = '';
        gameboard.forEach((value, index) => {
            boxHtml += `<div class="box" data-index="${index}">${value}</div>`
        });
        document.querySelector('.container').innerHTML = boxHtml;
    };

    const update = (index, sign) => {
        gameboard[index] = sign;
        render();
    };

    const resetUpdate = (index, sign) => {
        gameboard[index] = sign;
        resetRender();
    };

    const getGameboard = () => gameboard;

    return {
        render,
        update,
        getGameboard,
        resetUpdate,
        resetRender
    };

})();

const GameControl = (() => {
    let players = [];
    let currentPlayer = 0;
    let gameOver = true;
    let winner;
    let playerSign;
    let computerSign;

    const winCombo = [
        [0, 1, 2],
        [0, 3, 6],
        [0, 4, 8],
        [1, 4, 7],
        [2, 4, 6],
        [2, 5, 8],
        [3, 4, 5],
        [6, 7, 8],
    ];


    const start = (e) => {
        e.preventDefault();
        playerSign = DisplayControl.signButtonControl();
        if (!computerButton.checked) {
            if (document.querySelector('#player1').value === '' || document.querySelector('#player2').value === '') {
                return;
            } else {
                if ((gameOver && document.querySelector('#player1').value !== '' && document.querySelector('#player2').value !== '') || !gameOver) {
                    {
                        players = [Player(document.querySelector('#player1').value, 'X'), Player(document.querySelector('#player2').value, 'O')];
                        reset()
                        document.querySelector('#player1').value = players[0].name;
                        document.querySelector('#player2').value = players[1].name;
                        DisplayControl.playerHover(0, false);
                        DisplayControl.setPlayer(players);
                        gameOver = false;
                        Gameboard.render();
                    }
                } else if (gameOver) {
                    reset();
                }
            }
        } else {
            DisplayControl.removePlayer2();
            if (document.querySelector('#player1').value === '') {
                return;
            } else {
                if ((gameOver && document.querySelector('#player1').value !== '') || !gameOver) {
                    {
                        if(playerSign == 'O'){
                            players = [Player('Computer', 'X'), Player(document.querySelector('#player1').value, 'O')];
                            document.querySelector('#player1').value = players[1].name;
                            computerSign = 'X';
                        } else {
                            players = [Player(document.querySelector('#player1').value, 'X'), Player('Computer', 'O')];
                            document.querySelector('#player1').value = players[0].name;
                            computerSign = 'O'; 
                        }
                        reset()
                        signButton.setAttribute('disabled', '');
                        DisplayControl.playerHover(0, false);
                        DisplayControl.setPlayer(players);
                        gameOver = false;
                        Gameboard.render();
                        currentPlayer = 0;
                        if(players[currentPlayer].name == 'Computer'){
                            computerTurn();
                            currentPlayer = 1;
                        }

                    }
                } else if (gameOver) {
                    reset();
                }
            }
        }
    };

    const reset = () => {
        document.querySelector('#player1').value = '';
        document.querySelector('#player2').value = '';
        for (let i = 0; i < 9; i++) {
            Gameboard.resetUpdate(i, '');
        }
        gameOver = false;
        currentPlayer = 0;
        document.querySelector('#result').classList.remove('active');
        DisplayControl.resetLine();
        DisplayControl.setPlayer('reset');
        DisplayControl.playerHover(0, 'reset');
        if(computerButton.checked){
            if(signButton.disabled){
                signButton.removeAttribute('disabled');
            }
        }
    };

    const boxClick = (e) => {
        if (gameOver) {
            return;
        }
        let index = +(e.target.dataset.index);
        if (Gameboard.getGameboard()[index] !== '') {
            return;
        }

        Gameboard.update(index, players[currentPlayer].sign);

        winCheck(Gameboard.getGameboard(), players[currentPlayer]);
        currentPlayer = currentPlayer === 1 ? 0 : 1;
        DisplayControl.playerHover(currentPlayer, gameOver);
        if (computerButton.checked && players[currentPlayer].name == 'Computer') {
            GameControl.computerTurn();
        }
    };



    const winCheck = (gameboard, thisPlayer) => {
        for (let i = 0; i < winCombo.length; i++) {
            const [a, b, c] = winCombo[i];
            if (gameboard[a] && gameboard[a] === gameboard[b] && gameboard[a] === gameboard[c]) {
                let currentBox = document.querySelector(`[data-index = "${a}"]`);
                DisplayControl.setLine(currentBox, (b - a));
                if(players[0].sign == gameboard[a]) {
                    winner = players[0].name;
                } else {
                    winner = players[1].name;
                }
                window.addEventListener('resize', () => {
                    DisplayControl.setLine(currentBox, (b - a));
                });
                gameOver = true;
                DisplayControl.winnerDisplay(`${winner} wins the game!`);
                return thisPlayer.sign;
            }
        }
        if (gameboard.every(box => box !== '')) {
            gameOver = true;
            document.querySelector('#result').classList.add('active');
            DisplayControl.winnerDisplay(`It is a tie!`);
            return 'tie';
        }
        return null;
    };

    const winCheckAI = (gameboard) => {
        for (let i = 0; i < winCombo.length; i++) {
            const [a, b, c] = winCombo[i];
            if (gameboard[a] && gameboard[a] === gameboard[b] && gameboard[a] === gameboard[c]) {
                if(players[0].sign == gameboard[a]) {
                    winner = players[0];
                } else {
                    winner = players[1];
                }
                return winner.sign;
            }
        }
        if (gameboard.every(box => box !== '')) {
            return 'tie';
        }
        return +null; 
    }

    const computerTurn = () => {
        let index;
        let board = Gameboard.getGameboard();
        let bestScore = -Infinity;
        let move;
        for (let i = 0; i < 9; i++) {
            if (board[i] == '') {
                board[i] = computerSign;
                let score = minimax(board, 0, false);
                board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        index = move;
        Gameboard.update(index, players[currentPlayer].sign);
        winCheck(Gameboard.getGameboard(), players[0]);
        currentPlayer = currentPlayer === 1 ? 0 : 1;
        DisplayControl.playerHover(currentPlayer, gameOver);
    }

    const minimax = (board, depth, Maximizing) => {
        let result = winCheckAI(board);
        let score;
        if(result){
            if(result == computerSign){
                score = 10
            } else if (result == playerSign){
                score = -10;
            } else if (result == 'tie'){
                score = 0;
            }
            return score;
        }

        if (Maximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] == '') {
                    board[i] = computerSign;
                    let score = minimax(board, depth + 3, false);
                    board[i] = '';
                    if (score > bestScore) {
                        bestScore = score;
                    }
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] == '') {
                    board[i] = playerSign;
                    let score = minimax(board, depth + 3, true);
                    board[i] = '';
                    if (score < bestScore) {
                        bestScore = score;
                    }
                }
            }
            return bestScore;   
        }
    };

    return {
        start,
        boxClick,
        reset,
        computerTurn,
        gameOver
    };

})();


const DisplayControl = (() => {

    const displayName = document.querySelectorAll('.display-name');
    const signTitles = document.querySelectorAll('.sign-title');

    const winnerDisplay = (winner) => {
        document.querySelector('#resultText').textContent = winner;
        document.querySelector('#result').classList.add('active');
    };

    const setLine = (box, rotate) => {
        const line = document.querySelector('#line');
        if (Gameboard.getGameboard()[box.dataset.index] !== '') {
            line.classList.remove('hidden');
        }
        const left = box.getBoundingClientRect().left + 48;
        const top = box.getBoundingClientRect().top;
        if (rotate == 1) {
            line.style.transform = 'rotate(90deg)';
            line.style.left = `${left+100}px`;
            line.style.top = `${top-100}px`;
        } else if (rotate == 2) {
            line.style.transform = 'rotate(45deg)';
            line.style.left = `${left-100}px`;
            line.style.top = `${top}px`;
        } else if (rotate == 3) {
            line.style.transform = 'rotate(180deg)';
            line.style.left = `${left}px`;
            line.style.top = `${top}px`;
        } else if (rotate == 4) {
            line.style.transform = 'rotate(135deg)';
            line.style.left = `${left+100}px`;
            line.style.top = `${top}px`;
        }

    }

    const resetLine = () => {
        line.classList.add('hidden');
        line.style.left = '-1000px';
        line.style.top = '-1000px';
        line.style.transform = 'rotate(0deg)';
    };

    const setPlayer = (players) => {
        if (players == 'reset') {
            if(computerButton.checked && !signButton.checked){
                document.querySelector('#player1').placeholder = 'Player';
                displayName[0].textContent = 'Player';
                displayName[1].textContent = 'Computer';   
            } else if(computerButton.checked && signButton.checked){
                document.querySelector('#player1').placeholder = 'Player';
                displayName[0].textContent = 'Computer';
                displayName[1].textContent = 'Player';   
            } else if(!computerButton.checked){
                displayName[0].textContent = 'Player 1';
                displayName[1].textContent = 'Player 2';
            }
        } else {
            for (let i = 0; i < 2; i++) {
                displayName[i].textContent = players[i].name;
            }
        }
    }

    const playerHover = (currentPlayer, gameOver) => {
        const playerContainer = document.querySelectorAll('.player-container');
        if (currentPlayer == 'reset') {
            playerContainer[0].classList.remove('hover');
            playerContainer[1].classList.remove('hover');
        } else if (currentPlayer == 0 && !gameOver) {
            playerContainer[0].classList.add('hover');
            playerContainer[1].classList.remove('hover');
        } else if (currentPlayer == 1 && !gameOver) {
            playerContainer[1].classList.add('hover');
            playerContainer[0].classList.remove('hover');
        } else {
            playerContainer[0].classList.remove('hover');
            playerContainer[1].classList.remove('hover');
        }
    }

    const removePlayer2 = () => {
        const player1 = document.querySelector('#player1');
        const player2 = document.querySelector('#player2');
        if(computerButton.checked){
            player2.classList.add('hidden');
            displayName[0].textContent = 'Computer';
            displayName[1].textContent = 'Player';
            signButton.removeAttribute('disabled');
            signButtonControl();
            if(!GameControl.gameOver){
                GameControl.reset();
            }
            document.querySelector('#player1').placeholder = 'Player';
        } else {
            player2.classList.remove('hidden');
            GameControl.reset();
            signTitles[0].classList.add('invisible');
            signTitles[1].classList.add('invisible');
            signButton.setAttribute('disabled', '');
            document.querySelector('#player1').placeholder = 'Player1';
        }
    };

    const computerButtonControl = () => {
        removePlayer2();
    };

    const signButtonControl = () => {
        const displayNames = document.querySelectorAll('.display-name');
        if(GameControl.gameOver){
            if(signButton.checked){
                if(computerButton.checked){
                    displayNames[0].textContent = 'Computer';
                    displayNames[1].textContent = 'Player';
                    signTitles[0].classList.add('invisible');
                    signTitles[1].classList.remove('invisible');
                }
                return 'O';
            } else {
                if(computerButton.checked){
                    displayNames[0].textContent = 'Player';
                    displayNames[1].textContent = 'Computer';
                    signTitles[1].classList.add('invisible');
                    signTitles[0].classList.remove('invisible');
                }
                return 'X';
            }
        } else {
            signButton.setAttribute('disabled', '');
        }
    };

    return {
        winnerDisplay,
        setLine,
        resetLine,
        setPlayer,
        playerHover,
        removePlayer2,
        computerButtonControl,
        signButtonControl
    };

})();


const Player = (name, sign) => {

    return {
        name,
        sign
    };
};

const startButton = document.querySelector('#start-button');
startButton.addEventListener('click', GameControl.start);

const resetButton = document.querySelector('#reset-button');
resetButton.addEventListener('click', GameControl.reset);

const computerButton = document.querySelector('#computer-button');
computerButton.addEventListener('change', DisplayControl.computerButtonControl);

const signButton = document.querySelector('#sign-button');
signButton.addEventListener('change', DisplayControl.signButtonControl);

Gameboard.render();