class Road {
	constructor(centerX, width, laneCount = 3) {
		this.x = centerX
		this.width = width
		this.laneCount = laneCount

		const infinity = 99999
		this.left = centerX - width / 2
		this.right = centerX + width / 2
		this.top = -infinity
		this.bottom = infinity

		const topLeft = { x: this.left, y: this.top }
		const topRight = { x: this.right, y: this.top }
		const bottomLeft = { x: this.left, y: this.bottom }
		const bottomRight = { x: this.right, y: this.bottom }
		this.borders = [
			{ start: topLeft, end: bottomLeft },
			{ start: topRight, end: bottomRight },
		]
	}

	draw(ctx) {
		ctx.lineWidth = 5
		ctx.strokeStyle = '#2e3132'

		for (let i = 1; i < this.laneCount; i++) {
			const laneX = lerp(this.left, this.right, i / this.laneCount)

			ctx.setLineDash([50, 100])
			ctx.beginPath()
			ctx.moveTo(laneX, this.top)
			ctx.lineTo(laneX, this.bottom)
			ctx.stroke()
		}

		ctx.setLineDash([])
		this.borders.forEach((border) => {
			ctx.beginPath()
			ctx.moveTo(border.start.x, border.start.y)
			ctx.lineTo(border.end.x, border.end.y)
			ctx.stroke()
		})
	}

	getLaneCenterX(laneIndex) {
		const laneWidth = this.width / this.laneCount
		return this.left + laneIndex * laneWidth + laneWidth / 2
	}
}
