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
const saveButton = document.getElementById('Save');

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
	if(data.match(regex) != null) 
	{
		var obj = JSON.parse(data);
		if(obj.msg  != null) {
			logToTerminal(obj.head + ': ' + obj.msg, 'in'); }
		else if(obj.ping != null)
		{
			document.getElementById('ping-field').value = obj.ping; 
			document.getElementById('rssi').value = obj.rssi;
		}
		else if(obj.ftx != null) 
		{
			setting = obj;	
			document.getElementById('freqTx').value = setting.ftx.toFixed(3);
			document.getElementById('freqRx').value = setting.frx.toFixed(3);
			document.getElementById('capacitance').value = setting.cap.toFixed(3);	

			let opts =  document.getElementById('modulation').options;
			for(let opt, j = 0; opt = opts[j]; j++) {
				if(opt.value == setting.mod) {
					opt.selected = true;
					break; 
				}
			}
			document.getElementById('manchester').checked = setting.mch;
			document.getElementById('preambleLength').value = setting.prl;
			document.getElementById('preambleTrashold').value = setting.pth;

			 opts =  document.getElementById('ifFilter').options;
				for(let opt, j = 0; opt = opts[j]; j++) {
					if(opt.value == setting.fil) {
						opt.selected = true;
						break; 
					}
				}
			
			opts =  document.getElementById('freqDev').options;
				for(let opt, j = 0; opt = opts[j]; j++) {
					if(opt.value == setting.dev) {
						opt.selected = true;
						break; 
					}
				}
			
			 opts =  document.getElementById('dataRate').options;
				for(let opt, j = 0; opt = opts[j]; j++) {
					if(opt.value == setting.dr) {
						opt.selected = true;
						break; 
					}
				}
				
			document.getElementById('crc').checked = setting.crc;
			document.getElementById('modulationIndex').value = setting.hmod;
			document.getElementById('afc').checked = setting.afc; 
		}
	
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
const send = (data, msg) => {
	if(msg == true) 
	{
		terminal.send(data).
		then(() => logToTerminal(data, 'out')).
		catch((error) => logToTerminal(error));
	} else {
		terminal.send(data);
	}	
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
			send(':q');
			setTimeout(function() {send('SETTING')}, 50);
		}
		else
		{
			settingWindow.style.display = 'none';
			send('msg-start');
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

saveButton.addEventListener('click', function () {
	send('save');
});


applyButton.addEventListener('click', function () {
	let ftx = document.getElementById("freqTx");
	let frx = document.getElementById("freqRx");
	let cap = document.getElementById('capacitance');
	let mod = document.getElementById('modulation');
	let mch = document.getElementById('manchester');
	let prl = document.getElementById('preambleLength');
	let pth = document.getElementById('preambleTrashold');
	let fil = document.getElementById('ifFilter');
	let dev = document.getElementById('freqDev');
	let dr  = document.getElementById('dataRate');
	let crc = document.getElementById('crc');
	let hmod = document.getElementById('modulationIndex');
	let afc = document.getElementById('afc');
		
	var set = 'set';
	
	if(ftx.validity.valid && ftx.value != setting.ftx)
	{
		setting.ftx = ftx.value;
		//send('set -ftx ' + ftx.value);
		set += ' -ftx ' + setting.ftx;
	}
	if(frx.validity.valid && frx.value != setting.frx)
	{
		setting.frx = frx.value;
		//setTimeout(function() {send('set -frx ' + setting.frx)}, delay+=30);
		set += ' -frx ' + setting.frx;
	}	
	if(cap.validity.valid && cap.value != setting.cap)
	{
		setting.cap = cap.value;
		//setTimeout(function() {send('set -cap ' + setting.cap)}, delay+=30);
		set += ' -cap ' + setting.cap;
	}
	
	if(mod.value != setting.mod)
	{
		setting.mod = mod.value;
		//setTimeout(function() {send('set -mod ' + setting.mod)}, delay+=10);
		set += ' -mod ' + setting.mod;
	}
	if(mch.checked != setting.mch)
	{
		setting.mch = mch.checked;
		//setTimeout(function() {send('set -mch ' + setting.mch)}, delay+=10);
		set += ' -mch ' + setting.mch;
	}
	if(prl.validity.valid && prl.value != setting.prl)
	{
		setting.prl = prl.value;
		//setTimeout(function() {send('set -prl ' + setting.prl)}, delay+=10);
		set += ' -prl ' + setting.prl;
	}
	if(pth.validity.valid && pth.value != setting.pth)
	{
		setting.pth = pth.value;
		//setTimeout(function() {send('set -pth ' + setting.pth)}, delay+=10);
		set += ' -pth ' + setting.pth;
	}
	if(fil.value != setting.fil)
	{
		setting.fil = fil.value;
		//setTimeout(function() {send('set -fil ' + setting.fil)}, delay+=10);
		set += ' -fil ' + setting.fil;
	}
	if(dev.value != setting.dev)
	{
		setting.dev = dev.value;
		//setTimeout(function() {send('set -dev ' + setting.dev)}, delay+=20);
		set += ' -dev ' + setting.dev;
	}
	if(dr.value != setting.dr)
	{
		setting.dr = dr.value;
		//setTimeout(function() {send('set -dr ' + setting.dr)}, delay+=20);
		set += ' -dr ' + setting.dr;
	}
	if(crc.checked != setting.crc)
	{
		setting.crc = crc.checked;
		//setTimeout(function() {send('set -crc ' + setting.crc)}, delay+=20);
		set += ' -crc ' + setting.crc;
	}
	if(afc.checked != setting.afc)
	{
		setting.afc = afc.checked;
		//setTimeout(function() {send('set -afc ' + setting.afc)}, delay+=10);
		set += ' -afc ' + setting.afc;
	}
	
	if(set != 'set')
		send(set);
	
	setTimeout(function() {send('SETTING')}, 200);
	
});

sendForm.addEventListener('submit', (event) => {
  event.preventDefault();

  send(inputField.value, true);

  inputField.value = '';
  inputField.focus();
});

// Switch terminal auto scrolling if it scrolls out of bottom.
terminalContainer.addEventListener('scroll', () => {
  const scrollTopOffset = terminalContainer.scrollHeight -
      terminalContainer.offsetHeight - terminalAutoScrollingLimit;

  isTerminalAutoScrolling = (scrollTopOffset < terminalContainer.scrollTop);
});
