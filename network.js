class NeuralNetwork {
	constructor(neuronStructureArray) {
		this.levels = []
		for (let i = 0; i < neuronStructureArray.length - 1; i++) {
			this.levels.push(new Level(neuronStructureArray[i], neuronStructureArray[i + 1]))
		} //build level from neuron structure
	}

	static feedForward(givenInputs, network) {
		//feed givenInputs to the first level
		//the first layer inputs is the giveInputs
		let value = givenInputs
		//feed PREVIOUS level outputs to the next level
		for (let i = 0; i < network.levels.length; i++) {
			value = Level.feedForward(value, network.levels[i])
		}
		return value
	}

	static mutate(network, difference = 1) {
		//randomly change weights and biases
		//difference = 1 means highly different car
		network.levels.forEach((level) => {
			//goes through all biases
			for (let i = 0; i < level.biases.length; i++) {
				level.biases[i] = lerp(level.biases[i], randomBetween(-1, 1), difference)
			}
			//goes through all weights
			for (let i = 0; i < level.weights.length; i++) {
				for (let j = 0; j < level.weights[i].length; j++) {
					level.weights[i][j] = lerp(level.weights[i][j], randomBetween(-1, 1), difference)
				}
			}
		})
	}
}

class Level {
	constructor(inputCount, outputCount) {
		this.inputs = new Array(inputCount) //return an emty array has length = inputCount
		this.outputs = new Array(outputCount)
		this.biases = new Array(outputCount)

		this.weights = []
		for (let inNode = 0; inNode < inputCount; inNode++) {
			this.weights[inNode] = new Array(outputCount)
		}

		Level.#randomize(this)
	}

	static #randomize(level) {
		for (let inNode = 0; inNode < level.inputs.length; inNode++) {
			for (let outNode = 0; outNode < level.outputs.length; outNode++) {
				level.weights[inNode][outNode] = randomBetween(-1, 1)
			}
		}

		for (let outNode = 0; outNode < level.biases.length; outNode++) {
			level.biases[outNode] = randomBetween(-1, 1)
		}
	}

	static feedForward(givenInputs, level) {
		for (let i = 0; i < level.inputs.length; i++) {
			level.inputs[i] = givenInputs[i]
		}

		for (let outNode = 0; outNode < level.outputs.length; outNode++) {
			let sum = 0
			for (let inNode = 0; inNode < level.inputs.length; inNode++) {
				sum += level.inputs[inNode] * level.weights[inNode][outNode]
			}

			if (sum > level.biases[outNode]) {
				level.outputs[outNode] = 1
			} else {
				level.outputs[outNode] = 0
			}
		}
		return level.outputs
	}
}
