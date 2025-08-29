import React, { useState, useEffect } from 'react'
import ScoreBoard from './components/ScoreBoard'

import blueCandy from './images/blue-candy.png'
import greenCandy from './images/green-candy.png'
import orangeCandy from './images/orange-candy.png'
import purpleCandy from './images/purple-candy.png'
import redCandy from './images/red-candy.png'
import yellowCandy from './images/yellow-candy.png'
import blank from './images/blank.png'

const width = 8
const candyColors = [blueCandy, greenCandy, orangeCandy, purpleCandy, redCandy, yellowCandy]

const App = () => {
	const [currentColorArrangement, setCurrentColorArrangement] = useState([])
	const [squareBeingDragged, setSquareBeingDragged] = useState(null)
	const [squareBeingReplaced, setSquareBeingReplaced] = useState(null)
	const [draggedId, setDraggedId] = useState(null)
	const [targetId, setTargetId] = useState(null)
	const [scoreDisplay, setScoreDisplay] = useState(0)

	// ---------- Matching Functions ----------
	const checkForColumnOfFour = (board) => {
		for (let i = 0; i <= 39; i++) {
			const columnOfFour = [i, i + width, i + width * 2, i + width * 3]
			const decidedColor = board[i]
			if (decidedColor === blank) continue

			if (columnOfFour.every(square => board[square] === decidedColor)) {
				setScoreDisplay(score => score + 4)
				const newBoard = [...board]
				columnOfFour.forEach(square => newBoard[square] = blank)
				return newBoard
			}
		}
		return board
	}

	const checkForRowOfFour = (board) => {
		for (let i = 0; i < 64; i++) {
			const rowOfFour = [i, i + 1, i + 2, i + 3]
			const decidedColor = board[i]
			const notValid = [5,6,7,13,14,15,21,22,23,29,30,31,37,38,39,45,46,47,53,54,55,62,63,64]
			if (decidedColor === blank || notValid.includes(i)) continue

			if (rowOfFour.every(square => board[square] === decidedColor)) {
				setScoreDisplay(score => score + 4)
				const newBoard = [...board]
				rowOfFour.forEach(square => newBoard[square] = blank)
				return newBoard
			}
		}
		return board
	}

	const checkForColumnOfThree = (board) => {
		for (let i = 0; i <= 47; i++) {
			const columnOfThree = [i, i + width, i + width * 2]
			const decidedColor = board[i]
			if (decidedColor === blank) continue

			if (columnOfThree.every(square => board[square] === decidedColor)) {
				setScoreDisplay(score => score + 3)
				const newBoard = [...board]
				columnOfThree.forEach(square => newBoard[square] = blank)
				return newBoard
			}
		}
		return board
	}

	const checkForRowOfThree = (board) => {
		for (let i = 0; i < 64; i++) {
			const rowOfThree = [i, i + 1, i + 2]
			const decidedColor = board[i]
			const notValid = [6,7,14,15,22,23,30,31,38,39,46,47,54,55,63,64]
			if (decidedColor === blank || notValid.includes(i)) continue

			if (rowOfThree.every(square => board[square] === decidedColor)) {
				setScoreDisplay(score => score + 3)
				const newBoard = [...board]
				rowOfThree.forEach(square => newBoard[square] = blank)
				return newBoard
			}
		}
		return board
	}

	const moveIntoSquareBelow = (board) => {
		const newBoard = [...board]
		for (let i = 0; i < 55; i++) {
			const firstRow = [0,1,2,3,4,5,6,7]
			if (firstRow.includes(i) && newBoard[i] === blank) {
				const randomNumber = Math.floor(Math.random() * candyColors.length)
				newBoard[i] = candyColors[randomNumber]
			}
			if (newBoard[i + width] === blank) {
				newBoard[i + width] = newBoard[i]
				newBoard[i] = blank
			}
		}
		return newBoard
	}

	// ---------- Drag & Drop ----------
	const dragStart = (e) => {
		setSquareBeingDragged(e.target)
		setDraggedId(parseInt(e.target.getAttribute('data-id')))
	}

	const dragDrop = (e) => {
		setSquareBeingReplaced(e.target)
	}

	// ---------- Drag End with Immediate Update ----------
	const [touchStartPos, setTouchStartPos] = useState(null)
	const touchStart = (e, index) => {
		setSquareBeingDragged(e.target)
		setDraggedId(index)
		const touch = e.touches[0]
		setTouchStartPos({ x: touch.clientX, y: touch.clientY })
	}

	const touchMove = (e) => {
		if (!touchStartPos) return
		const touch = e.touches[0]
		const deltaX = touch.clientX - touchStartPos.x
		const deltaY = touch.clientY - touchStartPos.y

		// Determine swipe direction
		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			// horizontal swipe
			setTargetId(deltaX > 0 ? draggedId + 1 : draggedId - 1)
		} else {
			// vertical swipe
			setTargetId(deltaY > 0 ? draggedId + width : draggedId - width)
		}
	}

	const touchEnd = () => {
		if (squareBeingDragged && targetId != null) {
			setSquareBeingReplaced(document.querySelector(`[data-id='${targetId}']`))
			dragEndImmediate()
		}
		setTouchStartPos(null)
	}

	const dragEndImmediate = () => {
		if (!squareBeingDragged || !squareBeingReplaced) {
			setDraggedId(null)
			setTargetId(null)
			return
		}

		const draggedIndex = parseInt(squareBeingDragged.getAttribute('data-id'))
		const replacedIndex = parseInt(squareBeingReplaced.getAttribute('data-id'))

		const newBoard = [...currentColorArrangement]
		newBoard[replacedIndex] = squareBeingDragged.getAttribute('src')
		newBoard[draggedIndex] = squareBeingReplaced.getAttribute('src')

		const validMoves = [draggedIndex - 1, draggedIndex + 1, draggedIndex - width, draggedIndex + width]
		const validMove = validMoves.includes(replacedIndex)

		let checkedBoard = [...newBoard]
		checkedBoard = checkForColumnOfFour(checkedBoard)
		checkedBoard = checkForRowOfFour(checkedBoard)
		checkedBoard = checkForColumnOfThree(checkedBoard)
		checkedBoard = checkForRowOfThree(checkedBoard)
		checkedBoard = moveIntoSquareBelow(checkedBoard)

		if (validMove && JSON.stringify(newBoard) !== JSON.stringify(checkedBoard)) {
			setCurrentColorArrangement(checkedBoard)
		} else {
			setCurrentColorArrangement([...currentColorArrangement])
		}

		setDraggedId(null)
		setTargetId(null)
		setSquareBeingDragged(null)
		setSquareBeingReplaced(null)
	}

	// ---------- Board Setup ----------
	const createBoard = () => {
		const randomColorArrangement = []
		for (let i = 0; i < width * width; i++) {
			const randomColor = candyColors[Math.floor(Math.random() * candyColors.length)]
			randomColorArrangement.push(randomColor)
		}
		setCurrentColorArrangement(randomColorArrangement)
	}

	useEffect(() => {
		createBoard()
	}, [])

	// Interval for automatic moves
	useEffect(() => {
		const timer = setInterval(() => {
			if (!squareBeingDragged) {
				let newBoard = [...currentColorArrangement]
				newBoard = checkForColumnOfFour(newBoard)
				newBoard = checkForRowOfFour(newBoard)
				newBoard = checkForColumnOfThree(newBoard)
				newBoard = checkForRowOfThree(newBoard)
				newBoard = moveIntoSquareBelow(newBoard)
				setCurrentColorArrangement(newBoard)
			}
		}, 100) // can reduce to 30 for faster updates
		return () => clearInterval(timer)
	}, [currentColorArrangement, squareBeingDragged])

	return (
		<div className="app">
			<div className="score-board-container">
				<p>SCORE: </p>
				<ScoreBoard score={scoreDisplay} />
			</div>

			<div className="game">
				{currentColorArrangement.map((candyColor, index) => (
					<img
						key={index}
						src={candyColor}
						alt={candyColor}
						data-id={index}
						draggable={true}
						onTouchStart={(e) => touchStart(e, index)}
						onTouchMove={touchMove}
						onTouchEnd={touchEnd}
						onDragStart={dragStart}
						onDragOver={(e) => { e.preventDefault(); setTargetId(index) }}
						onDrop={dragDrop}
						onDragEnd={dragEndImmediate}
						className={
							draggedId === index ? "candy dragged" :
								targetId === index ? "candy target" :
									"candy"
						}
					/>
				))}
			</div>
		</div>
	)
}

export default App
