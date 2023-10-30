class Sensors {
	constructor(car) {
		this.car = car
		this.rayCount = 5
		this.rayLength = 200
		this.raySpread = Math.PI / 2
		this.waringOffset = 0.2

		this.rays = []
		this.readings = []
	}

	update(roadBorders, traffic) {
		this.#castRays()
		this.readings = []

		this.rays.forEach((ray) => {
			this.readings.push(this.#getDataBetween(ray, roadBorders, traffic))
		})
	}

	#getDataBetween(ray, roadBorders, traffic) {
		let intersections = []

		roadBorders.forEach((border) => {
			const touch = getIntersection(ray.start, ray.end, border.start, border.end)
			if (touch) {
				intersections.push(touch)
			}
		})

		traffic.forEach((dummyCar) => {
			const dummyCarCorners = dummyCar.cornerPoints
			for (let j = 0; j < dummyCarCorners?.length; j++) {
				const nextPoint = (j + 1) % dummyCarCorners.length
				const touch = getIntersection(
					ray.start,
					ray.end,
					dummyCarCorners[j],
					dummyCarCorners[nextPoint]
				)
				if (touch) {
					intersections.push(touch)
				}
			}
		})

		if (intersections.length == 0) {
			return null
		} else {
			const offsets = intersections.map((touch) => touch.offset)
			const minOffset = Math.min(...offsets)
			return intersections.find((touch) => touch.offset == minOffset)
		}
	}

	#castRays() {
		this.rays = []

		for (let i = 0; i < this.rayCount; i++) {
			const rayAngle =
				lerp(this.raySpread / 2, -this.raySpread / 2, i / (this.rayCount - 1)) - this.car.angle

			const start = { x: this.car.x, y: this.car.y }
			const end = {
				x: this.car.x - Math.sin(rayAngle) * this.rayLength,
				y: this.car.y - Math.cos(rayAngle) * this.rayLength,
			}

			this.rays.push({ start, end })
		}
	}

	draw(ctx) {
		for (let i = 0; i < this.rayCount; i++) {
			let targetRay = this.rays[i]
			let touchPoint = targetRay.end //there is no intersection
			if (this.readings[i]) {
				touchPoint = this.readings[i]
				if (touchPoint.offset < this.waringOffset) {
					ctx.beginPath()
					ctx.lineWidth = 2
					ctx.strokeStyle = 'red'
					ctx.moveTo(touchPoint.x, touchPoint.y)
					ctx.lineTo(targetRay.end.x, targetRay.end.y)
					ctx.stroke()
				} else {
					ctx.beginPath()
					ctx.lineWidth = 2
					ctx.strokeStyle = '#6e6e6e' //outside road
					ctx.moveTo(touchPoint.x, touchPoint.y)
					ctx.lineTo(targetRay.end.x, targetRay.end.y)
					ctx.stroke()
				}
			}

			ctx.beginPath()
			ctx.lineWidth = 2
			ctx.strokeStyle = '#16e0cc' //safe road
			ctx.moveTo(targetRay.start.x, targetRay.start.y)
			ctx.lineTo(touchPoint.x, touchPoint.y)
			ctx.stroke()
		}
	}
}
