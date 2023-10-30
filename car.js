class Car {
	constructor(x, y, width, height, controlType, maxSpeed = 3) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height

		//physics
		this.speed = 0
		this.maxSpeed = maxSpeed
		this.accelaration = 0.3
		this.friction = 0.05
		this.angle = 0
		this.angleSensitivity = 0.01
		this.damaged = false

		this.useBrain = controlType == 'AI'

		//best car
		this.risk = 0
		this.grade = 0

		if (controlType != 'DUMMY') {
			this.sensor = new Sensors(this)
			this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4])
		}
		this.controls = new Controls(controlType)
	}

	draw(ctx, color) {
		if (this.damaged) {
			ctx.fillStyle = 'black'
		} else {
			ctx.fillStyle = color
		}
		ctx.beginPath()
		ctx.moveTo(this.cornerPoints[0].x, this.cornerPoints[0].y)
		for (let i = 1; i < this.cornerPoints.length; i++) {
			ctx.lineTo(this.cornerPoints[i].x, this.cornerPoints[i].y)
		}
		ctx.fill()

		if (this.sensor) {
			this.sensor.draw(ctx)
		}
	}

	update(roadBorders, traffic) {
		if (!this.damaged) {
			this.#move()
			this.cornerPoints = this.#createCarCorners()
			this.damaged = this.#accessDamage(roadBorders, traffic)
		}

		if (this.sensor) {
			//if sensor exists
			this.sensor.update(roadBorders, traffic)
			const risks = this.sensor.readings.map((obstacle) =>
				obstacle == null ? 0 : 1 - obstacle.offset
			)
			const outputs = NeuralNetwork.feedForward(risks, this.brain)

			if (this.useBrain) {
				this.controls.forward = outputs[0]
				this.controls.left = outputs[1]
				this.controls.right = outputs[2]
				this.controls.reverse = outputs[3]
			}
		}
	}

	#accessDamage(roadBorders, traffic) {
		let collision = false
		roadBorders.forEach((borderLine) => {
			if (poly_lineIntersect(this.cornerPoints, borderLine)) {
				collision = true
			}
		})
		traffic.forEach((dummyCar) => {
			if (polysIntersect(this.cornerPoints, dummyCar.cornerPoints)) {
				collision = true
			}
		})
		return collision
	}

	#createCarCorners() {
		const corners = []
		const rad = Math.hypot(this.width, this.height) / 2
		const alpha = Math.atan2(this.width, this.height)
		corners.push({
			x: this.x + Math.sin(this.angle - alpha) * rad,
			y: this.y - Math.cos(this.angle - alpha) * rad,
		})
		corners.push({
			x: this.x + Math.sin(this.angle + alpha) * rad,
			y: this.y - Math.cos(this.angle + alpha) * rad,
		})
		corners.push({
			x: this.x - Math.sin(this.angle - alpha) * rad,
			y: this.y + Math.cos(this.angle - alpha) * rad,
		})
		corners.push({
			x: this.x - Math.sin(this.angle + alpha) * rad,
			y: this.y + Math.cos(this.angle + alpha) * rad,
		})

		return corners
	}

	#move() {
		if (this.controls.forward) {
			this.speed += this.accelaration
		}
		if (this.controls.reverse) {
			this.speed -= this.accelaration
		}
		//max speed
		if (this.speed > this.maxSpeed) {
			this.speed = this.maxSpeed
		}
		if (this.speed < -this.maxSpeed / 2) {
			this.speed = -this.maxSpeed / 2
		}
		//friction
		if (this.speed > 0) {
			this.speed -= this.friction
		}
		if (this.speed < 0) {
			this.speed += this.friction
		}
		if (Math.abs(this.speed) < this.friction) {
			this.speed = 0
		}

		//remember forward is - in y axis
		this.x += Math.sin(this.angle) * this.speed
		this.y -= Math.cos(this.angle) * this.speed

		//HORIZONTAL CONTROL
		if (this.controls.right && this.speed != 0) {
			this.angle += this.angleSensitivity
		}
		if (this.controls.left && this.speed != 0) {
			this.angle -= this.angleSensitivity
		}
	}
}
