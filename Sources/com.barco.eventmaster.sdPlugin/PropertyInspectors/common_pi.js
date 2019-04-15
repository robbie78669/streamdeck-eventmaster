
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

    
        if (jsonObj.event === 'sendToPropertyInspector') {
            var payload = jsonObj.payload;

            var ipAddress_payload = payload['ipAddress'];
            if( ipAddress_payload != null ) {
                var ipAddresElement = document.getElementById('ipAddress');
                ipAddresElement.value = payload['ipAddress'];
            }
            
            var preset_payload = payload['activatePreset'];
            if( preset_payload != null ) {
                var presetNameElement = document.getElementById('presetName');
                presetNameElement.value = preset_payload.presetName;
                
                var presetModeElement = document.getElementsByName('presetMode');
                if( preset_payload.presetMode == null ) {
                    if( presetModeElement != null ) 
                        setChecked(presetModeElement, "presetMode_toPreview");
                }
                else {
                    if( preset_payload.presetMode == 0  ) {
                        setChecked(presetModeElement, "presetMode_toPreview");
                    }
                    else {
                        setChecked(presetModeElement, "presetMode_toProgram");
                    }
                }
            }

            var cue_payload = payload['activateCue'];
            if( cue_payload != null ) {
                var cueNameElement = document.getElementById('cueName');
                cueNameElement.value = cue_payload.cueName;
         
                var cueModeElement = document.getElementsByName('cueMode');
                if( cue_payload.cueMode == null ) {
                    if( cueModeElement = null ) 
                        setChecked(cueModeElement, "cueMode_Play");
                }
                else {
                    if( cue_payload.cueMode == 0  ) {
                        setChecked(cueModeElement, "cueMode_Play");
                    }
                    else if( cue_payload.cueMode == 1 ) {
                        setChecked(cueModeElement, "cueMode_Pause");
                    }
                    else {
                        setChecked(cueModeElement, "cueMode_Stop");
                    }
                }
            }

            /*  Freeze */
            var freeze_payload = payload['freeze'];
            if( freeze_payload != null ){
                var freezelist_Element = document.getElementById("freeze_list");
                var optgroupElements = freezelist_Element.options;
                
                var id = freeze_payload.id;
                var type = freeze_payload.type;
                var label = freeze_payload.label;

                console.log("sendToPropertyInspector: freeze_payload.id="+id+", type="+type+", group="+label);

                for (var i=0; i<optgroupElements.length; i++)
                {
                    console.log("sendToPropertyInspector: comparing OPTGROUP: "+optgroupElements[i].parentNode.label);
                    if( optgroupElements[i].parentNode.label==label)
                    {
                        console.log("sendToPropertyInspector: found:. "+optgroupElements[i].parentNode.label);
                        optgroupElements[i].selected = true;
                    }
                }
            }

            /*unfreeze */
            var unfreeze_payload = payload['unfreeze'];
            if( unfreeze_payload != null ){
                var unfreezelist_Element = document.getElementById("unfreeze_list");
                var optgroupElements = unfreezelist_Element.options;
                
                var id = unfreeze_payload.id;
                var type = unfreeze_payload.type;
                var label = unfreeze_payload.label;

                console.log("sendToPropertyInspector: unfreeze_payload.id="+id+", type="+type+", group="+label);

                for (var i=0; i<optgroupElements.length; i++)
                {
                    console.log("sendToPropertyInspector: comparing OPTGROUP: "+optgroupElements[i].parentNode.label);
                    if( optgroupElements[i].parentNode.label==label)
                    {
                        console.log("sendToPropertyInspector: found:. "+optgroupElements[i].parentNode.label);
                        optgroupElements[i].selected = true;
                    }
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
    
    var activatePreset_presetNameElement = document.getElementById('presetName');
    var activatePreset_presetModeElement = document.getElementsByName('presetMode');
    
    var activateCue_cueNameElement = document.getElementById('cueName');
    var activateCue_cueModeElement = document.getElementsByName('cueMode');
    
    var freeze_listElement = document.getElementById('freeze_list');
    var unfreeze_listElement = document.getElementById('unfreeze_list');
           
    var changeLayerSource_destNameElement = document.getElementById('destName');
    var changeLayerSource_sourceNameElement = document.getElementById('sourceName');
    var changeLayerSource_layerNameElement = document.getElementById('layerName');
    
    
    var payload = {};

    payload.property_inspector = 'updateSettings';

    if( ipAddressElement != null )
        payload.ipAddress = ipAddress.value;

    /** activatePreset */
    if( activatePreset_presetNameElement != null){
        var activatePreset = {presetName: "null", presetMode: 0};

        activatePreset.presetName = activatePreset_presetNameElement.value;

        if( activatePreset_presetModeElement != null ) {
            var presetMode=getChecked(activatePreset_presetModeElement);
            if( presetMode && presetMode.length>0 ) { 
                if (presetMode == "presetMode_toProgram")
                    activatePreset.presetMode = 1;                
            }
        }

        payload.activatePreset = activatePreset;
    }

    /* activateCue */
    if( activateCue_cueNameElement != null) {
        var activateCue = {cueName: "null", cueMode: 0 };

        activateCue.cueName = activateCue_cueNameElement.value

        if( activateCue_cueModeElement != null ) {
            var cueMode=getChecked(activateCue_cueModeElement);
            if( cueMode && cueMode.length>0 ) { 
                if (cueMode == "cueMode_Pause")
                    activateCue.cueMode = 1;                
                else if( cueMode == "cueMode_Stop")  
                    activateCue.cueMode = 2;
            }
        }

        payload.activateCue = activateCue;
    }
 
    /* Freeze */
    if( freeze_listElement != null && freeze_listElement.selectedIndex > 0) {

        // determine which group (set the type based on the optgroup //
        var selectedIndex = freeze_listElement.selectedIndex;
        var op = freeze_listElement.options[selectedIndex];
        var optGroup = op.parentNode;

        console.log( "freeze_listElement: group= "+optGroup.label+", name="+op.text+" ,id="+op.value);
        
        if( optGroup.label == "Inputs") {
            var freeze = { type: 0, id: -1, label: optGroup.label};
            freeze.id = optGroup.value;
            
            payload.freeze = freeze;
        }
        else if (optGroup.label == "Backgrounds" ){
            var freeze = { type: 1, id: -1, label: optGroup.label};
            freeze.id = op.value;
            
            payload.freeze = freeze;
        }
        else if (optGroup.label == "ScreenDestinations") {
            var freeze = { type: 2, id: -1, label: optGroup.label};
            freeze.id = op.value;
            
            payload.freeze = freeze;
        }
        else if( optGroup.label == "AuxDestinations"){
            var freeze = { type: 3, id: -1, label: optGroup.label};
            freeze.id = op.value;
            
            payload.freeze = freeze;
        }
    }
    
    /* UnFreeze */
    if( unfreeze_listElement != null && unfreeze_listElement.selectedIndex > 0) {

        // determine which group (set the type based on the optgroup //
        var selectedIndex = unfreeze_listElement.selectedIndex;
        var op = unfreeze_listElement.options[selectedIndex];
        var optGroup = op.parentNode;

        console.log( "unfreeze_listElement: group= "+optGroup.label+", name="+op.text+" ,id="+op.value);

        if( optGroup.label == "Inputs") {
            var unfreeze = { type: 0, id: -1, label: optGroup.label};
            unfreeze.id = optGroup.value;
            
            payload.unfreeze = unfreeze;
        }
        else if (optGroup.label == "Backgrounds" ){
            var unfreeze = { type: 1, id: -1, label: optGroup.label};
            unfreeze.id = op.value;
            
            payload.unfreeze = unfreeze;
        }
        else if (optGroup.label == "ScreenDestinations") {
            var unfreeze = { type: 2, id: -1, label: optGroup.label};
            unfreeze.id = op.value;
            
            payload.unfreeze = unfreeze;
        }
        else if( optGroup.label == "AuxDestinations"){
            var unfreeze = { type: 3, id: -1, label: optGroup.label};
            unfreeze.id = op.value;
            
            payload.unfreeze = unfreeze;
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
