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

setting = new Object();

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
		setting = JSON.parse(data);}
	
	document.getElementById('freqTx').value = setting.ftx.toFixed(3);
	document.getElementById('freqRx').value = setting.frx.toFixed(3);
	document.getElementById('capacitance').value = setting.cap.toFixed(3);	
	
	let sel  = document.getElementById('modulation');
	let opts =  sel.options;
	for(let opt, j = 0; opt = opts[j]; j++) {
		if(opt.value == setting.mod) {
			opt.selected = true;
			break; 
		}
	}
	document.getElementById('manchester').checked = setting.mch;
	document.getElementById('preambleLength').value = setting.prl;
	document.getElementById('preambleTrashold').value = setting.pth;

	let selt  = document.getElementById('ifFilter');
	let optst =  selt.options;
		for(let optt, jt = 0; optt = optst[jt]; jt++) {
			if(optt.value == setting.fil) {
				optt.selected = true;
				break; 
			}
		}
	document.getElementById('freqDev').value = setting.dev.toFixed(3);
	document.getElementById('dataRate').value = setting.dr.toFixed(3);
	document.getElementById('crc').checked = setting.crc;
	document.getElementById('modulationIndex').value = setting.hmod;
	document.getElementById('afc').checked = setting.afc;
	
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
	var cap = getElementById('capacitance');
	var mod = document.getElementById('modulation');
	
	var delay_ms = 100;
	if(ftx.validity.valid && ftx.value != setting.ftx)
	{
		send('set -ftx ' + ftx.value);
	}
	if(frx.validity.valid && frx.value != setting.frx)
	{
		let temp = frx.value;
		setTimeout(function() {send('set -frx ' + temp)}, delay_ms);
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
