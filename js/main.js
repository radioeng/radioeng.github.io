// UI elements.
const deviceNameLabel = document.getElementById('device-name');
const connectButton = document.getElementById('connect');
const disconnectButton = document.getElementById('disconnect');
const terminalContainer = document.getElementById('terminal');
const sendForm = document.getElementById('send-form');
const inputField = document.getElementById('input');
const settingButton = document.getElementById('settings');
const pingButton = document.getElementById('ping');
const applyButton = document.getElementById('Apply');

// Helpers.
const defaultDeviceName = 'Terminal';
const terminalAutoScrollingLimit = terminalContainer.offsetHeight / 2;
let isTerminalAutoScrolling = true;

const scrollElement = (element) => {
  const scrollTop = element.scrollHeight - element.offsetHeight;

  if (scrollTop > 0) {
    element.scrollTop = scrollTop;
  }
};

const logToTerminal = (message, type = '') => {
  terminalContainer.insertAdjacentHTML('beforeend',
      `<div${type && ` class="${type}"`}>${message}</div>`);

  if (isTerminalAutoScrolling) {
    scrollElement(terminalContainer);
  }
};

// Obtain configured instance.
const terminal = new BluetoothTerminal();

// Override `receive` method to log incoming data to the terminal.
terminal.receive = function(data) {
	var regex = /{"[a-z]+":/;
	if(data.match(regex)) {
		var setting = JSON.parse(data);}
		
	logToTerminal(setting.ftx);
	//logToTerminal(data, 'in');

};

// Override default log method to output messages to the terminal and console.
terminal._log = function(...messages) {
  // We can't use `super._log()` here.
  messages.forEach((message) => {
    logToTerminal(message);
    console.log(message); // eslint-disable-line no-console
  });
};

// Implement own send function to log outcoming data to the terminal.
const send = (data) => {
  terminal.send(data).
      then(() => logToTerminal(data, 'out')).
      catch((error) => logToTerminal(error));
};

// Bind event listeners to the UI elements.
connectButton.addEventListener('click', () => {
  terminal.connect().
      then(() => {
        deviceNameLabel.textContent = terminal.getDeviceName() ?
            terminal.getDeviceName() : defaultDeviceName;
      });
});

disconnectButton.addEventListener('click', () => {
  terminal.disconnect();
  deviceNameLabel.textContent = defaultDeviceName;
});

settingButton.addEventListener('click', () => {
	
	if(terminal.getDeviceName())
	{
		let settingWindow = document.getElementById('window');
	
		if(settingWindow.style.display == 'none' || settingWindow.style.display == '')
		{
			settingWindow.style.display = 'block';
			send('SETTING');
		}
		else
		{
			settingWindow.style.display = 'none';
		}
	}
	else
	{
		logToTerminal('Error: There is no connected device');
	}
});

pingButton.addEventListener('click', function () {
	send('ping');
});

applyButton.addEventListener('click', function () {
	var ftx = document.getElementById("freqTx");
	var frx = document.getElementById("freqRx");
	
	if(ftx.validity.valid)
	{
		send('set -ftx ' + ftx.value);
	}
	if(frx.validity.valid)
	{
		let temp = frx.value;
		setTimeout(function() {send('set -frx ' + temp)}, 200);
	}
	
});

sendForm.addEventListener('submit', (event) => {
  event.preventDefault();

  send(inputField.value);

  inputField.value = '';
  inputField.focus();
});

// Switch terminal auto scrolling if it scrolls out of bottom.
terminalContainer.addEventListener('scroll', () => {
  const scrollTopOffset = terminalContainer.scrollHeight -
      terminalContainer.offsetHeight - terminalAutoScrollingLimit;

  isTerminalAutoScrolling = (scrollTopOffset < terminalContainer.scrollTop);
});
