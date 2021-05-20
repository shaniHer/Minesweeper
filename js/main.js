'use strict';

const MINE = '💣';
const BLOWN_MINE = '💥';
const EMPTY = '';
const FLAG = '🏳‍🌈';
const LIFE = '💙'
const NORMAL_SMILE = `<img src="img/normal.png"></img>`;
const WORRY_SMILE = `<img src="img/worried.png"></img>`;
const LOSE_SMILE = `<img src="img/lose.png"></img>`;
const WIN_SMILE = `<img src="img/win.png"></img>`;
const HINT_OFF = `<img src="img/bulbOff.png"></img>`;
const HINT_ON = `<img src="img/bulbOn.png"></img>`;

var gIsFirstClick = true;
var gTimerInterval;
var gMinesIdxs;
var gLivesCount = 3;
var gSmileys = [NORMAL_SMILE, WORRY_SMILE, LOSE_SMILE, WIN_SMILE];
var gIsHint = false;
var gHintsCount = 3;
var gSafeClickCount = 3;

var gLevels = [
    { SIZE: 4, SIZESQR: 16, MINES: 2 },
    { SIZE: 8, SIZESQR: 64, MINES: 12 },
    { SIZE: 12, SIZESQR: 144, MINES: 30 }
];

var gGame = {
    level: 0,
    isManual: false,
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};
var gBoard;
function hintClicked() {
    if (gGame.isManual) return;
    if (!gGame.isOn) return;
    gIsHint = true;
    renderHints();
}

function cellClickedWithHint(idxI, idxJ) {
    gHintsCount--;
    gIsHint = false;
    renderHints();
    var cellsToReveal = getNegs(idxI, idxJ, gBoard, true);
    for (var i = 0; i < cellsToReveal.length; i++) {
        var cellId = cellsToReveal[i].cellId;
        var elCell = document.querySelector(`#${cellId}`);
        elCell.classList.add('hint-revealed');
    }
    setTimeout(function () {
        for (var i = 0; i < cellsToReveal.length; i++) {
            var cellId = cellsToReveal[i].cellId;
            var elCell = document.querySelector(`#${cellId}`);
            elCell.classList.remove('hint-revealed');
        }
    }, 1000);
}
function renderHints() {
    var strHTML = '';
    var hintsOffCount = (gIsHint) ? gHintsCount - 1 : gHintsCount;
    for (var i = 0; i < hintsOffCount; i++) {
        strHTML += `<img src="img/bulbOff.png"></img>`;
    };
    if (gIsHint) strHTML += `<img src="img/bulbOn.png"></img>`
    var elHints = document.querySelector('.hints');
    elHints.innerHTML = strHTML;
}

function initGame(levelIdx) {
    gLevels = [
        { SIZE: 4, SIZESQR: 16, MINES: 2 },
        { SIZE: 8, SIZESQR: 64, MINES: 12 },
        { SIZE: 12, SIZESQR: 144, MINES: 30 }
    ]
    gIsHint = false;
    gHintsCount = 3;
    resetSafeClick()
    renderHints();
    renderBestscore(levelIdx);
    setSmiley(gSmileys, 0);
    gLivesCount = 3;
    renderLivesCount(gLivesCount);
    gGame = { level: levelIdx, isManual: false, isOn: true, shownCount: 0, markedCount: 0, secsPassed: 0 }
    resetManualModeBtns();
    gIsFirstClick = true;
    stopTimer();
    clearInterval(gTimerInterval);
    gTimerInterval = null;
    var gElTimer = document.querySelector('.timer');
    gElTimer.innerText = gGame.secsPassed;
    gMinesIdxs;
    gBoard = buildBoard(levelIdx);
    renderBoard(gBoard, levelIdx);
}

function safeClick(board) {
    if (!gGame.isOn) return;
    if (gGame.isManual) return;
    if (gSafeClickCount === 0) return;
    gSafeClickCount--;
    var elSafeCount = document.querySelector('.safeclick-count');
    elSafeCount.innerText = ` ${gSafeClickCount}`;
    if (gSafeClickCount === 0) {
        var elSafeBtn = document.querySelector('.safeclick-btn');
        elSafeBtn.classList.add('safe-btn-off');
    }
    var safeCells = [];
    for (var i = 0; i < board.length - 1; i++) {
        for (var j = 0; j < board[0].length - 1; j++) {
            var cell = board[i][j];
            if (cell.isMine || cell.isShown) continue;
            safeCells.push({ i: i, j: j });
        }
    }
    var safeCell = safeCells[getRandomInt(0, safeCells.length - 1)];
    var elSafeCell = document.querySelector(`#cell-${safeCell.i}-${safeCell.j}`);
    elSafeCell.classList.add('safecell-on');
    setTimeout(function () {
        elSafeCell.classList.remove('safecell-on');
        elSafeCell.classList.add('safecell-off');
    }, 2000);
}

function resetSafeClick() {
    var elSafeBtn = document.querySelector('.safeclick-btn');
    elSafeBtn.classList.remove('safe-btn-off');
    gSafeClickCount = 3;
    var elSafeBtn = document.querySelector('.safeclick-count');
    elSafeBtn.innerText = ` ${gSafeClickCount}`;
}
function buildBoard(levelIdx) {
    var board = [];
    gMinesIdxs = [];
    var size = gLevels[levelIdx].SIZE;
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            var cell = {
                minesAroundCount: 4,
                isShown: false,
                isMine: false,
                isMarked: false
            };
            board[i][j] = cell;
            gMinesIdxs.push({ i: i, j: j });
        }
    }

    return board;
}

function placeMines(idxs, board, idxI, idxJ, levelIdx) {
    var minesIdxs = null;
    var count = 0;
    while (count < gLevels[levelIdx].MINES) {
        var randNum = getRandomInt(0, idxs.length - 1);
        var randIdx = idxs[randNum];
        if (idxI === randIdx.i && idxJ === randIdx.j) continue;
        if (!minesIdxs) {
            minesIdxs = [randIdx];
            count++; continue;
        } else {
            for (var i = 0; i < minesIdxs.length; i++) {
                if (minesIdxs[i] === randIdx) break;
            }
        }
        if (i < minesIdxs.length) continue;
        else { minesIdxs.push(randIdx); count++; }
    }
    for (var i = 0; i < minesIdxs.length; i++) {
        var idx = minesIdxs[i];
        var cell = board[idx.i][idx.j];
        cell.isMine = true;
    }
    gMinesIdxs = minesIdxs;
}


function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var negs = getNegs(i, j, board, false);
            var minesCount = 0;
            for (var k = 0; k < negs.length; k++) {
                if (negs[k].cell.isMine) minesCount++;
            }
            board[i][j].minesAroundCount = minesCount;
        }
    }
}


function renderBoard(board, levelIdx) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            var tdId = `cell-${i}-${j}`;
            strHTML += `<td id="${tdId}" oncontextmenu="event.preventDefault()" 
            onmousedown="firstClick(${i},${j},${levelIdx})" 
            onmouseup="cellClicked(event,this, ${i}, ${j},${levelIdx})">`;
            if (currCell.isMine) strHTML += MINE;
            else {
                strHTML += (currCell.minesAroundCount > 0) ? currCell.minesAroundCount : '';
            };
            strHTML += '</td>';
        }
        strHTML += '</tr>';

        var elBoard = document.querySelector('.board');
        elBoard.innerHTML = strHTML;
    }
}
function cellClicked(ev, elCell, idxI, idxJ, levelIdx) {
    if (!gGame.isOn) return;
    if (gGame.isManual) {
        placeMineManually(elCell, idxI, idxJ);
        return;
    }
    var cell = gBoard[idxI][idxJ];
    if (ev.button === 0) {
        if (gIsHint) {
            cellClickedWithHint(idxI, idxJ);
            return;
        };
        if (cell.isMarked) return;
        else if (cell.isMine) mineClicked(elCell, idxI, idxJ);
        else if (cell.minesAroundCount === 0) {
            expandShown(gBoard, idxI, idxJ);
            elCell.classList.add('empty-clicked');
            cell.isShown = true;
        } else if (!cell.isShown) {
            cell.isShown = true;
            gGame.shownCount++;
            elCell.classList.add('clicked');
        };
        elCell.classList.add('visible');
    } else if (ev.button === 2) {
        if (cell.isShown) return;
        if (!gGame.isOn) return;
        if (gGame.isManual) return;
        else if (cell.isMarked) cellUnmarked(elCell, idxI, idxJ);
        else cellMarked(elCell, idxI, idxJ);
    }
    if (checkGameDone(levelIdx)) console.log('Game Done!')
    console.log('shownCount', gGame.shownCount)
    console.log('markedCount', gGame.markedCount)
}
function firstClick(idxI, idxJ, levelIdx) {
    if (!gIsFirstClick) return;
    startTimer();
    placeMines(gMinesIdxs, gBoard, idxI, idxJ, levelIdx);
    setMinesNegsCount(gBoard);
    renderBoard(gBoard, levelIdx);
    renderBestscore(levelIdx);
    gIsFirstClick = false;
}

function cellMarked(elCell, idxI, idxJ) {
    var cell = gBoard[idxI][idxJ];
    cell.isMarked = true;
    if (cell.isMine) gGame.markedCount++;
    elCell.innerText = FLAG;
    elCell.classList.add('visible');
}

function cellUnmarked(elCell, idxI, idxJ) {
    var cell = gBoard[idxI][idxJ];
    if (cell.isMine) {
        gGame.markedCount--;
        elCell.innerText = MINE;
    } else if (cell.minesAroundCount > 0) {
        elCell.innerText = cell.minesAroundCount;
    } else elCell.innerText = '';
    cell.isMarked = false;
    elCell.classList.remove('visible');
}

function checkGameDone(levelIdx) {
    var level = gLevels[levelIdx];
    if (gGame.markedCount !== level.MINES) return false;
    var nonMineCellsCount = level.SIZESQR - level.MINES;
    if (gGame.shownCount !== nonMineCellsCount) return false;
    gGame.isOn = false;
    setSmiley(gSmileys, 3);
    stopTimer();
    var bestScore = localStorage.getItem(`bestscore-${levelIdx}`)
    if (!bestScore || gGame.secsPassed < bestScore) {
        localStorage.setItem(`bestscore-${levelIdx}`, `${gGame.secsPassed}`);
        var elModal = document.querySelector('.modal');
        elModal.classList.add('show-modal');
        setTimeout(function () {
            elModal.classList.remove('show-modal');
        }, 2000)
    }
    return true;
}

function renderBestscore(levelIdx) {
    var elBestScore = document.querySelector('.score');
    var storedScore = localStorage.getItem(`bestscore-${levelIdx}`);
    var bestScore = (!storedScore) ? 'NONE YET' : storedScore;
    elBestScore.innerText = ` ${bestScore}`;
}


function setSmiley(smileys, smileIdx) {
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerHTML = smileys[smileIdx];
}

function expandShown(board, idxI, idxJ) {
    for (var i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            var cell = board[i][j];
            if (cell.isShown) continue;
            cell.isShown = true;
            gGame.shownCount++;
            var cellId = `cell-${i}-${j}`;
            var elCell = document.querySelector(`#${cellId}`);
            elCell.classList.add('visible');
            var styleClass = (cell.minesAroundCount !== 0) ? 'clicked' : 'empty-clicked';
            elCell.classList.add(styleClass);
            if (cell.minesAroundCount === 0) expandShown(board, i, j);
        }
    }
}


function revealAllMines(board) {
    for (var i = 0; i < gMinesIdxs.length; i++) {
        var idx = gMinesIdxs[i];
        var idSelector = `#cell-${idx.i}-${idx.j}`;
        var elCell = document.querySelector(idSelector);
        elCell.classList.add('visible');
    }
}
function mineClicked(elCell, idxI, idxJ) {
    gLivesCount--;
    elCell.innerText = BLOWN_MINE;
    if (gLivesCount < 0) gameOver();
    else {
        setSmiley(gSmileys, 1)
        renderLivesCount(gLivesCount);
        gBoard[idxI][idxJ].isMarked = true;
        gGame.markedCount++;
    }
}

function renderLivesCount(lives) {
    var str = '';
    for (var i = 0; i < lives; i++) {
        str += LIFE;
    }
    var elLivesCount = document.querySelector('.lives');
    elLivesCount.innerText = str;
}

function gameOver() {
    gGame.isOn = false;
    revealAllMines();
    console.log('game over');
    setSmiley(gSmileys, 2);
    stopTimer();
}

function startTimer() {
    gTimerInterval = setInterval(function () {
        gGame.secsPassed++;
        var gElTimer = document.querySelector('.timer');
        gElTimer.innerText = gGame.secsPassed;
    }, 1000);

}

function stopTimer() {
    clearInterval(gTimerInterval);
    gTimerInterval = null;
}
