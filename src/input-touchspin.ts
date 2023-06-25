enum EventType {
	MouseDown = 'mousedown',
	MouseUp = 'mouseup',
	MouseLeave = 'mouseleave',
	TouchStart = 'touchstart',
	TouchEnd = 'touchend',
	Wheel = 'wheel',
}

const ReleaseEvents = [EventType.MouseUp, EventType.MouseLeave, EventType.TouchEnd];

class InputTouchspin {
	#input: HTMLInputElement
	#btnUp: HTMLButtonElement
	#btnDown: HTMLButtonElement

	#inputSelectors = [
		`input[data-touchspin-input]`,
		`[data-touchspin-input] input`,
	]
	#styleId = 'input-touchspin-style'
	#styleContent = `
	${[...this.#inputSelectors.map((selector) => `${selector}::-webkit-inner-spin-button`),
		...this.#inputSelectors.map((selector) => `${selector}::-webkit-outer-spin-button`)].join()} {
		margin:0;
		-webkit-appearance:none;
	}
	${this.#inputSelectors.join()} {
		-moz-appearance:textfield;
	}
	`

	#timeout: number
	#interval: number

	constructor(target: Element) {
		this.#input = target.querySelector(this.#inputSelectors.join())
		this.#btnUp = target.querySelector('[data-touchspin-up]')
		this.#btnDown = target.querySelector('[data-touchspin-down]')

		this.#style()
		
		if (this.#input && !this.#input.readOnly && !this.#input.disabled) {
			this.cleanUp();
			this.#events()
		}
	}

	#style() {
		if (document.getElementById(this.#styleId) === null) {
			const style = document.createElement('style')
			style.id = this.#styleId
			style.textContent = this.#styleContent;
			document.head.appendChild(style)
		}
	}

	#handler = {
		onSpinUpMouseDown: () => this.#spin(),
		onSpinDownMouseDown: () => this.#spin(false),
		onSpinUpTouchStart: (e) => {
			this.#spin();
			e.cancelable && e.preventDefault();
		},
		onSpinDownTouchStart: (e) => {
			this.#spin(false);
			e.cancelable && e.preventDefault();
		},
		onSpinButtonReleased: () => this.#clearTimers(),
		onWheel: (e) => {
			Math.sign(e.deltaY) < 1 ? this.#step() : this.#step(false)
			e.preventDefault()
		},
	}

	#events() {
		// click
		this.#btnUp.addEventListener(EventType.MouseDown, this.#handler.onSpinUpMouseDown)
		this.#btnDown.addEventListener(EventType.MouseDown, this.#handler.onSpinDownMouseDown)

		// touch
		this.#btnUp.addEventListener(EventType.TouchStart, this.#handler.onSpinUpTouchStart)
		this.#btnDown.addEventListener(EventType.TouchStart, this.#handler.onSpinDownTouchStart)

		// stop
		Array.from(ReleaseEvents).forEach((e) => {
			this.#btnUp.addEventListener(e, this.#handler.onSpinButtonReleased)
			this.#btnDown.addEventListener(e, this.#handler.onSpinButtonReleased)
		})

		// wheel
		this.#input.addEventListener(EventType.Wheel, this.#handler.onWheel)
	}

	#clearTimers() {
		clearTimeout(this.#timeout)
		clearInterval(this.#interval)
	}

	#step(up = true) {
		const before = this.#input.value
		up ? this.#input.stepUp() : this.#input.stepDown()
		const after = this.#input.value
		before !== after && this.#input.dispatchEvent(new Event('change'))
	}

	#spin(up = true) {
		this.#step(up)
		this.#timeout = setTimeout(() => (this.#interval = setInterval(() => this.#step(up), 50)), 300)
	}

	cleanUp() {
		// click
		this.#btnUp.removeEventListener(EventType.MouseDown, this.#handler.onSpinUpMouseDown)
		this.#btnDown.removeEventListener(EventType.MouseDown, this.#handler.onSpinDownMouseDown)

		// touch
		this.#btnUp.removeEventListener(EventType.TouchStart, this.#handler.onSpinUpTouchStart)
		this.#btnDown.removeEventListener(EventType.TouchStart, this.#handler.onSpinDownTouchStart)

		// stop
		Array.from(ReleaseEvents).forEach((e) => {
			this.#btnUp.removeEventListener(e, this.#handler.onSpinButtonReleased)
			this.#btnDown.removeEventListener(e, this.#handler.onSpinButtonReleased)
		})

		// wheel
		this.#input.removeEventListener(EventType.Wheel, this.#handler.onWheel)
	}
}

export default InputTouchspin
