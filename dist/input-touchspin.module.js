/*!
* @erwinstone/input-touchspin v1.0.3 (https://input-touchspin.vercel.app/)
* Copyright 2023 erwinstone
* Licensed under MIT (https://github.com/erwinstone/input-touchspin/blob/master/LICENSE)
*/
const ReleaseEvents = ["mouseup" /* MouseUp */, "mouseleave" /* MouseLeave */, "touchend" /* TouchEnd */];
class InputTouchspin {
  #input;
  #btnUp;
  #btnDown;
  #inputSelectors = [
    `input[data-touchspin-input]`,
    `[data-touchspin-input] input`
  ];
  #styleId = "input-touchspin-style";
  #styleContent = `
	${[
    ...this.#inputSelectors.map((selector) => `${selector}::-webkit-inner-spin-button`),
    ...this.#inputSelectors.map((selector) => `${selector}::-webkit-outer-spin-button`)
  ].join()} {
		margin:0;
		-webkit-appearance:none;
	}
	${this.#inputSelectors.join()} {
		-moz-appearance:textfield;
	}
	`;
  #timeout;
  #interval;
  constructor(target) {
    this.#input = target.querySelector(this.#inputSelectors.join());
    this.#btnUp = target.querySelector("[data-touchspin-up]");
    this.#btnDown = target.querySelector("[data-touchspin-down]");
    this.#style();
    if (this.#input && !this.#input.readOnly && !this.#input.disabled) {
      this.cleanUp();
      this.#events();
    }
  }
  #style() {
    if (document.getElementById(this.#styleId) === null) {
      const style = document.createElement("style");
      style.id = this.#styleId;
      style.textContent = this.#styleContent;
      document.head.appendChild(style);
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
      Math.sign(e.deltaY) < 1 ? this.#step() : this.#step(false);
      e.preventDefault();
    }
  };
  #events() {
    this.#btnUp.addEventListener("mousedown" /* MouseDown */, this.#handler.onSpinUpMouseDown);
    this.#btnDown.addEventListener("mousedown" /* MouseDown */, this.#handler.onSpinDownMouseDown);
    this.#btnUp.addEventListener("touchstart" /* TouchStart */, this.#handler.onSpinUpTouchStart);
    this.#btnDown.addEventListener("touchstart" /* TouchStart */, this.#handler.onSpinDownTouchStart);
    Array.from(ReleaseEvents).forEach((e) => {
      this.#btnUp.addEventListener(e, this.#handler.onSpinButtonReleased);
      this.#btnDown.addEventListener(e, this.#handler.onSpinButtonReleased);
    });
    this.#input.addEventListener("wheel" /* Wheel */, this.#handler.onWheel);
  }
  #clearTimers() {
    clearTimeout(this.#timeout);
    clearInterval(this.#interval);
  }
  #step(up = true) {
    const before = this.#input.value;
    up ? this.#input.stepUp() : this.#input.stepDown();
    const after = this.#input.value;
    before !== after && this.#input.dispatchEvent(new Event("change"));
  }
  #spin(up = true) {
    this.#step(up);
    this.#timeout = setTimeout(() => this.#interval = setInterval(() => this.#step(up), 50), 300);
  }
  cleanUp() {
    this.#btnUp.removeEventListener("mousedown" /* MouseDown */, this.#handler.onSpinUpMouseDown);
    this.#btnDown.removeEventListener("mousedown" /* MouseDown */, this.#handler.onSpinDownMouseDown);
    this.#btnUp.removeEventListener("touchstart" /* TouchStart */, this.#handler.onSpinUpTouchStart);
    this.#btnDown.removeEventListener("touchstart" /* TouchStart */, this.#handler.onSpinDownTouchStart);
    Array.from(ReleaseEvents).forEach((e) => {
      this.#btnUp.removeEventListener(e, this.#handler.onSpinButtonReleased);
      this.#btnDown.removeEventListener(e, this.#handler.onSpinButtonReleased);
    });
    this.#input.removeEventListener("wheel" /* Wheel */, this.#handler.onWheel);
  }
}

export { InputTouchspin as default };
