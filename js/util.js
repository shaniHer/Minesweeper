'use strict';

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function getNegs(idxI, idxJ, board, includeClicked) {
    var negs = [];
    for (var i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (i === idxI && j === idxJ && !includeClicked) continue;
            if (j < 0 || j >= board[i].length) continue;
            var cell = board[i][j];
            var cellId = `cell-${i}-${j}`;
            var cellData = { cell: cell, cellId: cellId }
            negs.push(cellData);
        }
    }
    return negs;
}
// function countNegsMines(cellI, cellJ, board) {
//     var minesCount = 0;
//     for (var i = cellI - 1; i <= cellI + 1; i++) {
//         if (i < 0 || i >= board.length) continue;
//         for (var j = cellJ - 1; j <= cellJ + 1; j++) {
//             if (i === cellI && j === cellJ) continue;
//             if (j < 0 || j >= board[i].length) continue;
//             if (board[i][j].isMine) minesCount++;
//         }
//     }
//     return minesCount;
// }

// Called when a cell (td) is clicked
// function cellClicked(elCell, i, j) {
    //     if (gGame.shownCount === 0) firstClick(elCell);
    //     gGame.shownCount++;
    //     // elCell.classList.remove('invisible');
    //     elCell.classList.add('visible');
    // }

    // function firstClick(elCell) {
        //     placeMines(gIdxs, gBoard);
        //     setMinesNegsCount(gBoard);
        //     renderBoard(gBoard);
        //     elCell.classList.add('visible');
        // }
