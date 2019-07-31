

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

    
        if (jsonObj.event === 'didReceiveSettings') {
            var payload = jsonObj.payload;
            var action = jsonObj.action;

            // per instance
            var context = jsonObj.context;
        
        }

        else if (jsonObj.event === 'sendToPropertyInspector') {
            var payload = jsonObj.payload;
            var action = jsonObj.action;
            var context = jsonObj.context;

            // populate the html lists..
            //  - freeze/unfreeze the object list (inputs, BGs, screen and aux dests)
            //  - transLayer (input, screen destination and layer (preview / program))

            var ipAddress_payload = payload['ipAddress'];
            if( ipAddress_payload != null ) {
                var ipAddresElement = document.getElementById('ipAddress');
                ipAddresElement.value = ipAddress_payload;
            }

            var status = payload['status'];
            if( status != null ) {
                var statusElement = document.getElementById('status');
                if( statusElement ) {
                    statusElement.innerText = status;
                }
            }
            
            var sources = payload["sources"];
            var backgrounds = payload["backgrounds"];
            var screenDestinations = payload["screenDestinations"];
            var auxDestinations = payload["auxDestinations"];
            var destContent = payload["destinationContent"];
            
            if( action == "com.barco.eventmaster.recallPreset"){
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
            }
            else if( action == "com.barco.eventmaster.recallCue") {
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
            }
            else if( action == "com.barco.eventmaster.freeze") {
                var freeze_payload = payload['freeze'];
                var freezelist_Element = document.getElementById("freeze_list");

                if( freezelist_Element != null ) {

                    while(freezelist_Element.length)
                        freezelist_Element.remove(0);

                    if( sources ) {

                        if( freeze_payload == null ) {
                            freeze_payload = {id: sources[0].id, name: sources[0].Name}
                        }

                        for(var i=0; i<sources.length; i++) {
                            var name = sources[i].Name;
                            if( sources[i].SrcType  == 0 ) {
                                var sourceElement = freezelist_Element.appendChild( new Option(name) );
                                var id = sourceElement.value = sources[i].id;

                                if( freeze_payload && freeze_payload.id == id)
                                    sourceElement.selected=true;
                            }
                        }
                    }       
                }
            }
            else if( action == "com.barco.eventmaster.unfreeze"){
                var unfreeze_payload = payload['unfreeze'];
                var unfreezelist_Element = document.getElementById("unfreeze_list");
                if( unfreezelist_Element != null ) {

                    while (unfreezelist_Element.length)
                        unfreezelist_Element.remove(0);

                    if( sources ) {

                        if( unfreeze_payload == null ) {
                            unfreeze_payload = {id: sources[0].id, name: sources[0].Name}
                        }

                        for(var i=0; i<sources.length; i++) {
                            var name = sources[i].Name;
                            if( sources[i].SrcType  == 0 ) {
                                var sourceElement = unfreezelist_Element.appendChild( new Option(name) );
                                var id = sourceElement.value = sources[i].id;

                                if( unfreeze_payload && unfreeze_payload.id == id)
                                    sourceElement.selected=true;
                            }
                        }
                    }       
                } 
            }
            else if( action == "com.barco.eventmaster.transLayer") {
                //
                // Clear list, repopulate, and check selected item towards the end of this conditional
                //
                // The currenytly selected the GUI element
                var transLayer_payload = payload["transLayer"];
                                
                // selected information
                var destInfo = transLayer_payload.destInfo;
                var layerInfo = transLayer_payload.layerInfo;
                var srcInfo = transLayer_payload.srcInfo;
              
                // ---------------- dest refresh Gui elements ------------------------------------------------- 
                // Clear old ones
                var transLayer_dest_list_Element = document.getElementById("transLayer_dest_list");
                while (transLayer_dest_list_Element.length)
                    transLayer_dest_list_Element.remove(0);
                
                // populate with new ones
                var screenDestinations = payload["screenDestinations"];
                if( screenDestinations ) {
                
                    if( destInfo == null ) {
                        destInfo = {id: -1, name: null};

                        // grab the first one..
                        destInfo.name = screenDestinations[0].Name;
                        destInfo.id = screenDestinations[0].id;
                    }

                    for(var i=0; i<screenDestinations.length; i++) {
                        var name = screenDestinations[i].Name;
                        var destElement = transLayer_dest_list_Element.appendChild( new Option(name) );
                        var id = destElement.value = screenDestinations[i].id;

                        // if already selected
                        if( destInfo && id==destInfo.id) {
                            console.log("sendToPropertyInspector: found:. "+id);
                            destElement.selected = true;
                        }
                    }
                }

                // ---------------- layer refresh of GUI elements ------------------------------------------------- 
                // clear the old onext
                var transLayer_layer_list_Element = document.getElementById("transLayer_layer_list");
                while( transLayer_layer_list_Element.length )
                    transLayer_layer_list_Element.remove(0);

                // populate with new ones..
                // if there is a selected destination.. 
                var destinationContents = payload.destinationContents; // from listContents..
                if( destinationContents && destInfo) {
                
                    // for the selected destination, populate all the layers for that destiantion
                    for(var i=0; i<destinationContents.length; i++) {
                        if( destinationContents[i].id == destInfo.id ) {
                            if( destinationContents[i].Layers ) {
                                if( layerInfo == null ) {
                                    layerInfo = {id: -1, name: null};
            
                                    // grab the first one..
                                    layerInfo.name = destinationContents[i].Layers[0].Name;
                                    layerInfo.id = destinationContents[i].Layers[0].id;
                                }
            
                                for( var j=0; j<destinationContents[i].Layers.length; j++ ) {
                                    var layerName = destinationContents[i].Layers[j].Name;
                                    var layerElement = transLayer_layer_list_Element.appendChild(new Option(layerName) );
                                    var id = layerElement.value = destinationContents[i].Layers[j].id;

                                    // if already selected
                                    if( layerInfo && id == layerInfo.id)
                                    {
                                        console.log("sendToPropertyInspector: found:. "+id);
                                        layerElement.selected = true;
                                    }
                                }
                            }
                        }
                    }
                }
                
                // --------------- sources------------------------------------------
                var transLayer_source_list_Element = document.getElementById("transLayer_source_list");
                if( transLayer_source_list_Element != null ) {

                    var options = transLayer_source_list_Element.getElementsByTagName("option");
                    while (options.length)
                        transLayer_source_list_Element.remove(0);
                    
                    // Inputs
                    if( sources ) {
                        var inputs_optG = document.getElementById('translayer_source_input');
                        var stills_optG = document.getElementById('translayer_source_still');
                        var destinations_optG = document.getElementById('translayer_source_screen');
                        var backgrounds_optG = document.getElementById('translayer_source_backgrounds');

                        if( srcInfo == null )
                            srcInfo = {id: sources[0].id, name: sources[0].Name};

                        for(var i=0; i<sources.length; i++) {
                            if( sources[i].SrcType  == 0 ) {
                                var sourceElement = inputs_optG.appendChild( new Option(sources[i].Name) );
                                sourceElement.value = sources[i].id;
                            }
                            else if( sources[i].SrcType == 1 ) {
                                var sourceElement = stills_optG.appendChild( new Option(sources[i].Name) );
                                sourceElement.value = sources[i].id;
                            }
                            else if( sources[i].SrcType == 2 ) { 
                                var screenElement = destinations_optG.appendChild( new Option(sources[i].Name) );
                                sourceElement.parentNode.value = sources[i].id;
                            }
                            else if( sources[i].SrcType == 3 ) { 
                                var screenElement = backgrounds_optG.appendChild( new Option(sources[i].Name) );
                                sourceElement.value = sources[i].id;
                            }
                        }

                        // select the previously selected item (from the plugin)
                        for( var i=0; i<transLayer_source_list_Element.options.length; i++ ){
                            if(transLayer_source_list_Element.options[i].value == srcInfo.id )
                                transLayer_source_list_Element.options[i].selected = true;
                        }
                    }
                }
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
    var payload = {};

    payload.property_inspector = 'updateSettings';

    /** ipaddress **/
    var ipAddressElement = document.getElementById('ipAddress');
    if( ipAddressElement != null )
        payload.ipAddress = ipAddress.value;

    /** activatePreset */
    var activatePreset_presetNameElement = document.getElementById('presetName');
    var activatePreset_presetModeElement = document.getElementsByName('presetMode');
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

    /** activateCue **/
    var activateCue_cueNameElement = document.getElementById('cueName');
    var activateCue_cueModeElement = document.getElementsByName('cueMode');
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
 
    /** Freeze **/
    var freeze_listElement = document.getElementById('freeze_list');
    if( freeze_listElement != null && freeze_listElement.selectedIndex > 0) {

        // determine which group (set the type based on the optgroup //
        var selectedIndex = freeze_listElement.selectedIndex;
        var op = freeze_listElement.options[selectedIndex];
        var optGroup = op.parentNode;
        
        var freeze = { id: freeze_listElement.options[selectedIndex].value, name: freeze_listElement.options[selectedIndex].label};
        payload.freeze = freeze;
    }
    
    /** UnFreeze **/
    var unfreeze_listElement = document.getElementById('unfreeze_list');
    if( unfreeze_listElement != null && unfreeze_listElement.selectedIndex > 0) {

        // determine which group (set the type based on the optgroup //
        var selectedIndex = unfreeze_listElement.selectedIndex;
        var op = unfreeze_listElement.options[selectedIndex];
        
        var unfreeze = { id: unfreeze_listElement.options[selectedIndex].value, name: unfreeze_listElement.options[selectedIndex].label};
        payload.unfreeze = unfreeze;
    }

    /** transLayer **/
    var destInfo = {id: -1, name: ""};
    var srcInfo = {id: -1, name: ""};
    var layerInfo = {id: -1, name: ""};
    var transLayer = { destInfo: null, srcInfo: null,layerInfo: null};

    var transLayer_destElement = document.getElementById('transLayer_dest_list');
    if( transLayer_destElement != null ) {
        var selectedIndex = transLayer_destElement.selectedIndex;
        if( selectedIndex >= 0 ){
            destInfo.id = transLayer_destElement.options[selectedIndex].value;
            destInfo.name = transLayer_destElement.options[selectedIndex].label;
            transLayer.destInfo = destInfo;
        } 
    }
    
    var transLayer_layerElement = document.getElementById('transLayer_layer_list');
    if( transLayer_layerElement != null ) {
        var selectedIndex = transLayer_layerElement.selectedIndex;
        if( selectedIndex >= 0 ){
            layerInfo.id = transLayer_layerElement.options[selectedIndex].value;
            layerInfo.name = transLayer_layerElement.options[selectedIndex].label;
            transLayer.layerInfo = layerInfo;
        }
    }
    
    var transLayer_sourceElement = document.getElementById('transLayer_source_list');
    if( transLayer_sourceElement != null ) {
        var selectedIndex = transLayer_sourceElement.selectedIndex;
        if( selectedIndex >= 0 ){
            srcInfo.id = transLayer_sourceElement.options[selectedIndex].value;
            srcInfo.name = transLayer_sourceElement.options[selectedIndex].label;
            transLayer.srcInfo = srcInfo;
        }
    }
    
    payload.transLayer = transLayer;
    
        
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
