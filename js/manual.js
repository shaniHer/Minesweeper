'use strict';
var gIsFirstMine = true;

function setManualOn(elBtn) {
    gGame.isManual = true;
    gIsFirstMine = true;
    gIsHint = false;
    gHintsCount = 3;
    resetSafeClick()
    renderHints();
    setSmiley(gSmileys, 0);
    gLivesCount = 3;
    renderLivesCount(gLivesCount);
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    stopTimer();
    clearInterval(gTimerInterval);
    gTimerInterval = null;
    var gElTimer = document.querySelector('.timer');
    gElTimer.innerText = gGame.secsPassed;
    gGame.isOn = true;
    gIsFirstClick = false;
    gMinesIdxs;
    elBtn.classList.add('manualmode-on');
    createManualBoard(gGame.level);
    renderBoard(gBoard, gGame.level);
}

function startManualGame() {
    if (gIsFirstMine) return;
    console.log('startmanual');
    gGame.isManual = false;
    resetManualModeBtns();
    setMinesNegsCount(gBoard);
    renderBoard(gBoard, gGame.level);
}

function placeMineManually(elCell, idxI, idxJ) {
    gBoard[idxI][idxJ].isMine = true;
    elCell.innerText = MINE;
    elCell.classList.add('visible');
    if (gIsFirstMine) {
        var gElStartManualBtn = document.querySelector('.start-manual');
        gElStartManualBtn.classList.add('allow-startmanual');
    }
    gIsFirstMine = false;
    gMinesIdxs.push({ i: idxI, j: idxJ })
}

function resetManualModeBtns() {
    var gElStartManualBtn = document.querySelector('.start-manual');
    gElStartManualBtn.classList.remove('allow-startmanual');
    var gElSetManualModeBtn = document.querySelector('.manual-mode');
    gElSetManualModeBtn.classList.remove('manualmode-on');
}

function createManualBoard(levelIdx) {
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
        }
    }
    gBoard = board;
}