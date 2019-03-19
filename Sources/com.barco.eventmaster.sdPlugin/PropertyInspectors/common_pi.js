var websocket = null,
    uuid = null,
    actionInfo = {},
    inInfo = {},
    runningApps = [],
    isQT = navigator.appVersion.includes('QtWebEngine');
    
    

function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
    uuid = inUUID;
    actionInfo = JSON.parse(inActionInfo); // cache the info
    inInfo = JSON.parse(inInfo);
    websocket = new WebSocket('ws://localhost:' + inPort);

    addDynamicStyles(inInfo.colors);

    websocket.onopen = function () {
        var json = {
            event: inRegisterEvent,
            uuid: inUUID
        };

        websocket.send(JSON.stringify(json));

        // Notify the plugin that we are connected
        sendValueToPlugin('propertyInspectorConnected', 'property_inspector');
    };

    websocket.onmessage = function (evt) {
        // Received message from Stream Deck
        var jsonObj = JSON.parse(evt.data);

        
        // This event should come
        if (jsonObj.event === 'sendToPropertyInspector') {
            var payload = jsonObj.payload;

            var ipAddress_payload = payload['ipAddress'];
            if( ipAddress_payload != null ) {
                var ipAddresElement = document.getElementById('ipAddress');
                ipAddresElement.value = payload['ipAddress'];
            }
            
            var port_payload = payload['port'];
            if( port_payload != null ) {

                var portElement = document.getElementById('port');
                portElement.value = payload['port'];
            }
            
            var presetName_payload = payload['presetName'];
            if( presetName_payload != null ) {
                var presetNameElement = document.getElementById('presetName');
                presetNameElement.value = payload['presetName'];
            }
                
            var payload_presetMode = payload["presetMode"];
            var presetModeElement = document.getElementsByName('presetMode');
            if( payload_presetMode == null ) {
                if( presetModeElement != null ) 
                    setChecked(presetModeElement, "presetMode_toPreview");
            }
            else {
                if( payload_presetMode == 0  ) {
                    setChecked(presetModeElement, "presetMode_toPreview");
                }
                else {
                    setChecked(presetModeElement, "presetMode_toProgram");
                }
            }

            var cueName_payload = payload['cueName'];
            if( cueName_payload != null ) {
                var cueNameElement = document.getElementById('cueName');
                cueNameElement.value = payload['cueName'];
            }

            var payload_cueMode = payload["cueMode"];
            var cueModeElement = document.getElementsByName('cueMode');
            if( payload_cueMode == null ) {
                if( cueModeElement = null ) 
                    setChecked(cueModeElement, "cueMode_Play");
            }
            else {
                if( payload_cueMode == 0  ) {
                    setChecked(cueModeElement, "cueMode_Play");
                }
                else if( payload_cueMode == 1 ) {
                    setChecked(cueModeElement, "cueMode_Pause");
                }
                else {
                    setChecked(cueModeElement, "cueMode_Stop");
                }
            }

            var status_payload = payload['status'];
            if( status_payload != null ) {
                statusElement = document.getElementById('status');
                statusElement.innerText = status_payload;
            }
        }
    };
}

// return the value of the radio button that is checked
// return an empty string if none are checked, or
// there are no radio buttons
function getChecked(radioObj) {
	if(!radioObj)
		return "";
	var radioLength = radioObj.length;
	if(radioLength == undefined)
		if(radioObj.checked)
			return radioObj.value;
		else
			return "";
	for(var i = 0; i < radioLength; i++) {
		if(radioObj[i].checked) {
			return radioObj[i].id;
		}
	}
	return "";
}

// set the radio button with the given value as being checked
// do nothing if there are no radio buttons
// if the given value does not exist, all the radio buttons
// are reset to unchecked
function setChecked(radioObj, newValue) {
	if(!radioObj)
		return;
	var radioLength = radioObj.length;
	if(radioLength == undefined) {
		radioObj.checked = (radioObj.value == newValue.toString());
		return;
	}
	for(var i = 0; i < radioLength; i++) {
		radioObj[i].checked = false;
		if(radioObj[i].id == newValue.toString()) {
			radioObj[i].checked = true;
		}
	}
}

function updateSettings() {
    var ipAddressElement = document.getElementById('ipAddress');
    var portElement = document.getElementById('port');
    var presetNameElement = document.getElementById('presetName');
    var presetModeElement = document.getElementsByName('presetMode');
    var cueNameElement = document.getElementById('cueName');
    var cueModeElement = document.getElementsByName('cueMode');
    
    
    var payload = {};

    payload.property_inspector = 'updateSettings';

    if( ipAddressElement != null )
        payload.ipAddress = ipAddress.value;
    
    if( portElement != null )
        payload.port = port.value;
    
    if( presetNameElement != null)
        payload.presetName = presetName.value

    if( presetModeElement != null ) {
        var presetMode=getChecked(presetModeElement);
        payload.presetMode = 0;
        if( presetMode && presetMode.length>0 ) { 
            if (presetMode == "presetMode_toProgram")
                payload.presetMode = 1;                
        }
    }

    if( cueNameElement != null)
        payload.cueName = cueName.value

    if( cueModeElement != null ) {
        var cueMode=getChecked(cueModeElement);
        payload.cueMode = 0;
        if( cueMode && cueMode.length>0 ) { 
            if (cueMode == "cueMode_Pause")
                payload.cueMode = 1;                
            else if( cueMode == "cueMode_Stop")  
                payload.cueMode = 2;
        }
    }
    
    
    sendPayloadToPlugin(payload);
}

function sendPayloadToPlugin(payload) {
    if (websocket && (websocket.readyState === 1)) {
        const json = {
            'action': actionInfo['action'],
            'event': 'sendToPlugin',
            'context': uuid,
            'payload': payload
        };
        websocket.send(JSON.stringify(json));
    }
}

// our method to pass values to the plugin
function sendValueToPlugin(value, param) {
    if (websocket && (websocket.readyState === 1)) {
        const json = {
            'action': actionInfo['action'],
            'event': 'sendToPlugin',
            'context': uuid,
            'payload': {
                [param]: value
            }
        };
        websocket.send(JSON.stringify(json));
    }
}


if (!isQT) {
    document.addEventListener('DOMContentLoaded', function () {
        initPropertyInspector();
    });
}

window.addEventListener('beforeunload', function (e) {
    e.preventDefault();

    // Notify the plugin we are about to leave
    sendValueToPlugin('propertyInspectorWillDisappear', 'property_inspector');

    // Don't set a returnValue to the event, otherwise Chromium with throw an error.
});

function initPropertyInspector() {
    // Place to add functions
}


function addDynamicStyles(clrs) {
    const node = document.getElementById('#sdpi-dynamic-styles') || document.createElement('style');
    if (!clrs.mouseDownColor) clrs.mouseDownColor = fadeColor(clrs.highlightColor, -100);
    const clr = clrs.highlightColor.slice(0, 7);
    const clr1 = fadeColor(clr, 100);
    const clr2 = fadeColor(clr, 60);
    const metersActiveColor = fadeColor(clr, -60);

    node.setAttribute('id', 'sdpi-dynamic-styles');
    node.innerHTML = `

    input[type="radio"]:checked + label span,
    input[type="checkbox"]:checked + label span {
        background-color: ${clrs.highlightColor};
    }

    input[type="radio"]:active:checked + label span,
    input[type="radio"]:active + label span,
    input[type="checkbox"]:active:checked + label span,
    input[type="checkbox"]:active + label span {
      background-color: ${clrs.mouseDownColor};
    }

    input[type="radio"]:active + label span,
    input[type="checkbox"]:active + label span {
      background-color: ${clrs.buttonPressedBorderColor};
    }

    td.selected,
    td.selected:hover,
    li.selected:hover,
    li.selected {
      color: white;
      background-color: ${clrs.highlightColor};
    }

    .sdpi-file-label > label:active,
    .sdpi-file-label.file:active,
    label.sdpi-file-label:active,
    label.sdpi-file-info:active,
    input[type="file"]::-webkit-file-upload-button:active,
    button:active {
      background-color: ${clrs.buttonPressedBackgroundColor};
      color: ${clrs.buttonPressedTextColor};
      border-color: ${clrs.buttonPressedBorderColor};
    }

    ::-webkit-progress-value,
    meter::-webkit-meter-optimum-value {
        background: linear-gradient(${clr2}, ${clr1} 20%, ${clr} 45%, ${clr} 55%, ${clr2})
    }

    ::-webkit-progress-value:active,
    meter::-webkit-meter-optimum-value:active {
        background: linear-gradient(${clr}, ${clr2} 20%, ${metersActiveColor} 45%, ${metersActiveColor} 55%, ${clr})
    }
    `;
    document.body.appendChild(node);
};

/** UTILITIES */

/*
    Quick utility to lighten or darken a color (doesn't take color-drifting, etc. into account)
    Usage:
    fadeColor('#061261', 100); // will lighten the color
    fadeColor('#200867'), -100); // will darken the color
*/
function fadeColor(col, amt) {
    const min = Math.min, max = Math.max;
    const num = parseInt(col.replace(/#/g, ''), 16);
    const r = min(255, max((num >> 16) + amt, 0));
    const g = min(255, max((num & 0x0000FF) + amt, 0));
    const b = min(255, max(((num >> 8) & 0x00FF) + amt, 0));
    return '#' + (g | (b << 8) | (r << 16)).toString(16).padStart(6, 0);
}
