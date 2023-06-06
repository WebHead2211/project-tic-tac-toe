const Gameboard = (() => {
    let gameboard = ['', '', '', '', '', '', '', '', ''];

    const render = () => {
        let boxHtml = '';
        gameboard.forEach((value, index) => {
            boxHtml += `<div class="box" data-index="${index}">${value}</div>`
        });
        document.querySelector('.container').innerHTML = boxHtml;

        const boxList = document.querySelectorAll('.box');
        boxList.forEach(box => {
            box.addEventListener('click', GameControl.boxClick);
        });
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
    let gameOver;
    let winner;

    const start = () => {
        if (document.querySelector('#player1').value === '' || document.querySelector('#player2').value === '') {
            return;
        }
        
        else {
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
            }
            else if (gameOver) {
                reset();
            }
        }
    };
    
    const reset = () => {
        if (document.querySelector('#player1').value === '' || document.querySelector('#player2').value === '') {
            return;
        }
        if(gameOver){
            document.querySelector('#player1').value = '';
            document.querySelector('#player2').value = '';
        }
        for (let i = 0; i < 9; i++) {
            Gameboard.resetUpdate(i, '');
        }
        gameOver = false;
        currentPlayer = 0;
        document.querySelector('#result').classList.remove('active');
        DisplayControl.resetLine();
        DisplayControl.setPlayer('reset');
        DisplayControl.playerHover(0, 'reset');
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

        if (winCheck(Gameboard.getGameboard(), players[currentPlayer].sign)) {
            gameOver = true;
            winner = players[currentPlayer].name;
            console.log(`${winner} wins!`);
            DisplayControl.winnerDisplay(`${winner} wins the game!`);
            currentPlayer = 3;
        } else if (tieCheck(Gameboard.getGameboard())) {
            gameOver = true;
            console.log('tie!');
            document.querySelector('#result').classList.add('active');
            DisplayControl.winnerDisplay(`It is a tie!`);
            currentPlayer = 3;
        }
        console.log(currentPlayer);
        currentPlayer = currentPlayer === 1 ? 0 : 1;
        DisplayControl.playerHover(currentPlayer, gameOver);
    };



    const winCheck = (gameboard, sign) => {
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

        for (let i = 0; i < winCombo.length; i++) {
            const [a, b, c] = winCombo[i];
            if (gameboard[a] && gameboard[a] === gameboard[b] && gameboard[a] === gameboard[c]) {
                let currentBox = document.querySelector(`[data-index = "${a}"]`);
                DisplayControl.setLine(currentBox, (b - a));
                window.addEventListener('resize', () => {
                    DisplayControl.setLine(currentBox, (b - a));
                });
                return true;
            }
        }
        return false;
    };

    const tieCheck = (gameboard) => {
        return gameboard.every(box => box !== '');
    }

    return {
        start,
        boxClick,
        reset
    };

})();


const DisplayControl = (() => {

    const winnerDisplay = (winner) => {
        document.querySelector('#resultText').textContent = winner;
        document.querySelector('#result').classList.add('active');
    };

    const setLine = (box, rotate) => {
        const line = document.querySelector('#line');
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
        line.style.left = '-1000px';
        line.style.top = '-1000px';
        line.style.transform = 'rotate(0deg)';
    };

    const setPlayer = (players) => {
        const displayName = document.querySelectorAll('.display-name');
        if (players == 'reset'){
            for (let i = 0; i < 2; i++) {
                displayName[i].textContent = `Player 1`;
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
        }
        else if (currentPlayer == 0 && !gameOver){
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

    return {
        winnerDisplay,
        setLine,
        resetLine,
        setPlayer,
        playerHover
    };

})();


const Player = (name, sign) => {

    return {
        name,
        sign
    };
};


Gameboard.render();

const startButton = document.querySelector('#start-button');
startButton.addEventListener('click', GameControl.start);

const resetButton = document.querySelector('#reset-button');
resetButton.addEventListener('click', GameControl.reset);