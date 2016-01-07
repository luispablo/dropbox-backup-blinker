var Gpio = require('onoff').Gpio;
var led = new Gpio(3, 'out');

var ledSignal = {
	counter: 0,
	interval: null,
	alert: function () {
		this.interval = setInterval(function () {
			led.writeSync(led.readSync() === 0 ? 1 : 0);
		}, 100);
		return this.interval;
	},
	ok: function () {
		this.counter = 0;

		this.interval = setInterval(function () {
			this.counter = this.counter > 50 ? 0 : this.counter + 1; // cycle every 5 seconds

			var currentStatus = led.readSync();
			var status = this.counter < 5 ? (currentStatus === 0 ? 1 : 0) : 0;
			led.writeSync(status);
		}.bind(this), 100);
		return this.interval;
	},
	stop: function () {
		if (this.interval !== null) {
			clearInterval(this.interval);
			this.interval = null;
		}
	},
	release: function () {
		led.writeSync(0); // Turn LED off
		led.unexport(); // Unexport GPIO, free resources
	}
};

module.exports = ledSignal;
