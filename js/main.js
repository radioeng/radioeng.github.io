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
	if(data.match(regex) != null) {
		setting = JSON.parse(data);
	
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
	}
	else {
	logToTerminal(data, 'in'); }
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
	let ftx = document.getElementById("freqTx");
	let frx = document.getElementById("freqRx");
	let cap = document.getElementById('capacitance');
	let mod = document.getElementById('modulation');
	let mch = document.getElementById('manchester');
	let prl = document.getElementById('preambleLength');
	let pth = document.getElementById('preambleTrashold');
	let dev = document.getElementById('freqDev');
	let dr  = document.getElementById('dataRate');
	let crc = document.getElementById('crc');
	let hmod = document.getElementById('modulationIndex');
	let afc = document.getElementById('afc');
		
	var delay = 0;
	
	if(ftx.validity.valid && ftx.value != setting.ftx)
	{
		setting.ftx = ftx.value;
		send('set -ftx ' + ftx.value);
	}
	if(frx.validity.valid && frx.value != setting.frx)
	{
		setting.frx = frx.value;
		setTimeout(function() {send('set -frx ' + setting.frx)}, delay+=50);
	}	
	if(cap.validity.valid && cap.value != setting.cap)
	{
		setting.cap = cap.value;
		setTimeout(function() {send('set -cap ' + setting.cap)}, delay+=20);
	}
	
	if(mod.value != setting.mod)
	{
		setting.mod = mod.value;
		setTimeout(function() {send('set -mod ' + setting.mod)}, delay+=10);
	}
	if(mch.checked != setting.mch)
	{
		setting.mch = mch.checked;
		setTimeout(function() {send('set -mch ' + setting.mch)}, delay+=10);
	}
	if(prl.validity.valid && prl.value != setting.prl)
	{
		setting.prl = prl.value;
		setTimeout(function() {send('set -prl ' + setting.prl)}, delay+=10);
	}
	if(pth.validity.valid && pth.value != setting.pth)
	{
		setting.pth = pth.value;
		setTimeout(function() {send('set -pth ' + setting.pth)}, delay+=10);
	}
	if(dev.validity.valid && dev.value != setting.dev)
	{
		setting.dev = dev.value;
		setTimeout(function() {send('set -dev ' + setting.dev)}, delay+=50);
	}
	if(dr.validity.valid && dr.value != setting.dr)
	{
		setting.dr = dr.value;
		setTimeout(function() {send('set -dr ' + setting.dr)}, delay+=50);
	}
	if(crc.checked != setting.crc)
	{
		setting.crc = crc.checked;
		setTimeout(function() {send('set -crc ' + setting.crc)}, delay+=10);
	}
	if(afc.checked != setting.afc)
	{
		setting.afc = afc.checked;
		setTimeout(function() {send('set -afc ' + setting.afc)}, delay+=10);
	}
	
	setTimeout(function() {send('SETTING')}, delay+=100);
	
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
