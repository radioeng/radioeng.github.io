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
	var regex = /^[$]([A-Z]+)[=]([\+|\-]?\d+(\,\d{1,3})?|[A-Z]{2,4}|true|false)/;
	let result = data.match(regex);
	
	if(result != true)
	{		
		switch(result[1])
		{
			case 'PING':
				document.getElementById('ping-field').value = result[2] + ' ms';
				break;
				
			case 'FTX':
				document.getElementById('freqTx').value = result[2];
				break;
			
			case 'FRX':
				document.getElementById('freqRx').value = result[2];
				break;
			
			case 'CAP':
				document.getElementById('capacitance').value = result[2];
				break;
				
			case 'MOD':
				let sel  = document.getElementById('modulation');
				let opts =  sel.options;
				for(let opt, j = 0; opt = opts[j]; j++) {
					if(opt.value == result[2]) {
						opt.selected = true;
						break; 
					}
				}
				break;
				
			case 'MCH':
				if(result[2] === 'true')
					document.getElementById('manchester').checked = true;
				else if(result[2] === 'false')
					document.getElementById('manchester').checked = false;
				break;
				
			case 'PRL':
				document.getElementById('preambleLength').value = result[2];
				break;
			
			case 'PTH':
				document.getElementById('preambleTrashold').value = result[2];
				break;
				
			case 'FIL':
				sel  = document.getElementById('ifFilter');
				opts =  sel.options;
				for(let opt, j = 0; opt = opts[j]; j++) {
					if(opt.value + '00' == result[2]) {
						opt.selected = true;
						break; 
					}
				}
				break;
				
			case 'DEV':
				document.getElementById('freqDev').value = result[2];
				break;
			
			case 'DR':
				document.getElementById('dataRate').value = result[2];
				break;
			
			case 'CRC':
				if(result[2] === 'true')
					document.getElementById('crc').checked = true;
				else if(result[2] === 'false')
					document.getElementById('crc').checked = false;
				break;
				
			default:
				break;
		}
	}
	else
	{
		logToTerminal(data, 'in');
	}
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
	let settingWindow = document.getElementById('window');
	
	if(settingWindow.style.display == 'none' || settingWindow.style.display == '')
	{
		settingWindow.style.display = 'block';
	}
	else
	{
		settingWindow.style.display = 'none';
	}
});

pingButton.addEventListener('click', function () {
	send('ping');
});

applyButton.addEventListener('click', function () {
	send('SETTING');
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
