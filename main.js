//CAR CANVAS
const canvas = document.getElementById('myCanvas')
canvas.width = 300

const ctx = canvas.getContext('2d')
const road = new Road(canvas.width / 2, canvas.width * 0.85)

//NETWORK CANVAS
const networkCanvas = document.getElementById('networkCanvas')
networkCanvas.width = 300
const networkCtx = networkCanvas.getContext('2d')

//MAIN CAR
const carProps = {
	startingLane: 1,
	startingY: 400,
	width: 30,
	height: 50,
	maxSpeed: 5,
	color: 'white',
}
const N = 30
const randomness = 1
const car = generateCars(N)
let bestCar = car[0]

if (localStorage.getItem('bestBrain')) {
	//all cars initialize the best brain
	for (let i = 0; i < car.length; i++) {
		car[i].brain = JSON.parse(localStorage.getItem('bestBrain'))
		//mutate for difference
		if (i != 0) {
			NeuralNetwork.mutate(car[i].brain, randomness)
		}
	}
}
//TRAFFIC
const trafficColor = '#2e3132'
const traffic = [
	new Car(road.getLaneCenterX(1), 300, carProps.width, carProps.height, 'DUMMY', 2),
	new Car(road.getLaneCenterX(2), 0, carProps.width, carProps.height, 'DUMMY', 2),
	new Car(road.getLaneCenterX(0), 0, carProps.width, carProps.height, 'DUMMY', 2),
	new Car(road.getLaneCenterX(1), -200, carProps.width, carProps.height, 'DUMMY', 2),
	new Car(road.getLaneCenterX(2), -400, carProps.width, carProps.height, 'DUMMY', 2),
]

//ANIMATE
const animate = (time) => {
	canvas.height = window.innerHeight
	networkCanvas.height = window.innerHeight

	bestCar = findBestCar()

	for (let i = 0; i < car.length; i++) {
		car[i].update(road.borders, traffic)
	}

	ctx.save()
	ctx.translate(0, -bestCar.y + canvas.height * 0.7)

	road.draw(ctx)
	for (let i = 0; i < car.length; i++) {
		car[i].draw(ctx, carProps.color)
	}

	for (let i = 0; i < traffic.length; i++) {
		traffic[i].update(road.borders, [])
		traffic[i].draw(ctx, trafficColor)
	}

	ctx.restore()

	networkCtx.lineDashOffset = -time / 50
	Visualizer.drawNetwork(networkCtx, car[0].brain)
	requestAnimationFrame(animate)
}
animate()

//FUNCTIONS
function generateCars(N) {
	let cars = []
	for (let i = 1; i <= N; i++) {
		cars.push(
			new Car(
				road.getLaneCenterX(carProps.startingLane),
				carProps.startingY,
				carProps.width,
				carProps.height,
				'AI',
				carProps.maxSpeed
			)
		)
	}
	return cars
}

function saveBrain() {
	localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain))
}

function discard() {
	localStorage.removeItem('bestBrain')
}

function findBestCar() {
	car.forEach((c) =>
		c.sensor.readings.forEach((obstacle) => {
			if (obstacle?.offset) {
				c.risk += 1 - obstacle?.offset
				c.grade = -c.y
			}
		})
	)
	return car.find((c) => c.grade == Math.max(...car.map((c) => c.grade)))
}
