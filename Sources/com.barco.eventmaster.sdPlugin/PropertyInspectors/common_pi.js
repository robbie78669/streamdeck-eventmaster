
  const OPERATOR = {
    ALL: -2,
    SUPER: -1,
    ONE: 0,
    TWO: 1,
    THREE: 2
}

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

    
        if (jsonObj.event === 'sendToPropertyInspector' ||
            jsonObj.event === 'didReceiveSettings') {
            
            var payload = jsonObj.payload;
            var action = jsonObj.action;
            var context = jsonObj.context;

            var sources = payload["sources"];
            var backgrounds = payload["backgrounds"];
            var screenDestinations = payload["screenDestinations"];
            var auxDestinations = payload["auxDestinations"];
            var destContent = payload["destinationContent"];
            var presets = payload["presets"];
            var cues = payload["cues"]
            var operators = payload["operators"];
            var operator = payload["operator"];
            var ipAddress = payload['ipAddress'];
            var status = payload['status'];
          
            
            // Global html properties
            // these 2 are used in every action
            if( ipAddress != null ) {
                var ipAddresElement = document.getElementById('ipAddress');
                ipAddresElement.value = ipAddress;
            }
            
            if( status != null ) {
                var statusElement = document.getElementById('status');
                if( statusElement ) {
                    statusElement.innerText = status;
                }
            }
            
            var operatorsNameElement = document.getElementById('operator');
            if( operatorsNameElement != null ) {
                while (operatorsNameElement.length)
                    operatorsNameElement.remove(0);

                // if no operator enabled, then add "all" value with no other choices
                if( operators == null ) {   
                    var operatorElement = operatorsNameElement.appendChild( new Option("All") )
                    operatorElement.value = OPERATOR.ALL;
                    operatorElement.selected = true;
                }
                else {

                    // there is a list of operators available to choose from
                    // if there is no selected operator then auto select the super and show the password field
                    
                    var operatorElement = operatorsNameElement.appendChild( new Option("Super Operator") );
                    operatorElement.value = OPERATOR.SUPER;
                        
                    if( operator == null ) {
                        // set selected to super
                        operator = {"id": OPERATOR.SUPER, 
                                    "password": "",
                                    "Name": "Super Operator",
                                    "Enable": 1, 
                                    "StartRange": 0,
                                    "EndRange": 10000,
                                    "InvertColor": 0, 
                                    "DestCollection": [] };
                    }
                    
                     
                    // go through each operator that is enabled in the frame and add it to the list
                    // the plugin filters out disabled operators.
                    for(var i=0; i<operators.length; i++) {
                        var operatorElement = operatorsNameElement.appendChild( new Option(operators[i].Name) );
                        operatorElement.value = operators[i].id;
                    }

                    // select the previously selected item (from the plugin)
                    for( var i=0; i<operatorsNameElement.length; i++ ){
                        if(operatorsNameElement[i].value == operator.id ) {
                            operatorsNameElement[i].selected = true;
                        }
                    }    
                }
                var passwordDivElement = document.getElementById("password_div");
                if( passwordDivElement ) {
                    if( operator && operator.id == OPERATOR.SUPER ) {
                        passwordDivElement.style.display = "flex";
                        passwordDivElement.style.flexDirection = "row" ;
                        passwordDivElement.style.minHeight = "32px";
                        passwordDivElement.style.alignItems = "center";
                        passwordDivElement.style.marginTop = "2px";
                        passwordDivElement.style.maxWidth ="344px";
                       
                        passwordDivElement.value = operator.password;
                    } 
                    else {
                        passwordDivElement.style.display = "none";
                        passwordDivElement.value = "";
                    }
                }
            }


            if( action == "com.barco.eventmaster.recallpreset"){

                var activatePreset_payload = payload['activatePreset'];
                if( activatePreset_payload == null ) {
                    activatePreset_payload = {id: -1, name: ""};
                }

                // load operators into the dropdown first, select the operator, then filter presets based on preset no range settings
                // 
                var presetNameElement = document.getElementById('presetName');
                if( presetNameElement != null ) {

                    while (presetNameElement.length)
                      presetNameElement.remove(0);

                    if( presets ) {

                        var presetElement = presetNameElement.appendChild( new Option("") );
                        presetElement.value = -1;
                        presetElement.selected = true;

                        if( operator && operators){
                            for( var i=0; i<operators.length; i++ ) {
                                if( operators[i].id == operator.id) {
                                    // it's one of the configured operators on the frame as opposed to
                                    // Super or All..
                                    //
                                    // We need to get the preset ranges for the logic below.
                                    operator = operators[i];        
                                    break;
                                }
                            }

                            for(var i=0; i<presets.length; i++) {
                                if( operator.id <= OPERATOR.SUPER || 
                                        (presets[i].id >= (operator.StartRange-1) && presets[i].id <= (operator.EndRange-1) ) ) {
                                    var presetElement = presetNameElement.appendChild( new Option(presets[i].Name) );
                                    presetElement.value = presets[i].id;
                                }
                            }    
                        }
                        
                        // select the previously selected item (from the plugin)
                        for( var i=0; i<presetNameElement.length; i++ ){
                            if(presetNameElement[i].value == activatePreset_payload.id ) {
                                presetNameElement[i].selected = true;
                            }
                        }
                    }       
                } 
                
                var presetModeElement = document.getElementsByName('presetMode');
                if( activatePreset_payload.presetMode == null ) {
                    if( presetModeElement != null ) 
                        setChecked(presetModeElement, "presetMode_toPreview");
                }
                else {
                    if( activatePreset_payload.presetMode == 0  ) {
                        setChecked(presetModeElement, "presetMode_toPreview");
                    }
                    else {
                        setChecked(presetModeElement, "presetMode_toProgram");
                    }
                }
            }

            else if( action == "com.barco.eventmaster.recallcue") {
                var cue_payload = payload['activateCue'];
                var cueNameElement = document.getElementById('cueName');

                if( cueNameElement != null ) {

                    while (cueNameElement.length)
                      cueNameElement.remove(0);

                    if( cues ) {

                        var cueElement = cueNameElement.appendChild( new Option("") );
                        cueElement.value = -1;
                        cueElement.selected = true;

                        if( cue_payload == null ) {
                            cue_payload = {id: -1, name: ""};
                        }

                        for(var i=0; i<cues.length; i++) {
                            var cueElement = cueNameElement.appendChild( new Option(cues[i].Name) );
                            cueElement.value = cues[i].id;
                        }

                        // select the previously selected item (from the plugin)
                        for( var i=0; i<cueNameElement.length; i++ ){
                            if(cueNameElement[i].value == cue_payload.id ) {
                                cueNameElement[i].selected = true;
                            }
                        }
                    }       
                } 
                
                var cueModeElement = document.getElementsByName('cueMode');
                if( cue_payload ) {
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
                
                var freezelist_Element = document.getElementById("freeze_source_list");
                if( freezelist_Element != null ) {

                    while (freezelist_Element.length)
                        freezelist_Element.remove(0);

                    if( sources ) {

                        var inputs_optG = document.getElementById('freeze_source_input');
                        var backgrounds_optG = document.getElementById('freeze_source_background');

                        var sourceElement = freezelist_Element.appendChild( new Option("") );
                        sourceElement.value = -1;

                        if( freeze_payload == null ) {
                            freeze_payload = {id: -1, name: ""};
                            sourceElement.selected = true;
                        }

                        for(var i=0; i<sources.length; i++) {
                            //inputs
                            if( sources[i].SrcType  == 0 ) {
                                var sourceElement = inputs_optG.appendChild( new Option(sources[i].Name) );
                                sourceElement.value = sources[i].id;
                            }
                            // backgrounds
                            else if( sources[i].SrcType == 3 ) { 
                                var screenElement = backgrounds_optG.appendChild( new Option(sources[i].Name) );
                                sourceElement.value = sources[i].id;
                            }
                        }

                        // select the previously selected item (from the plugin)
                        for( var i=0; i<freezelist_Element.options.length; i++ ){
                            if(freezelist_Element.options[i].value == freeze_payload.id ) {
                                freezelist_Element.options[i].selected = true;
                            }
                        }
                    }       
                } 
            }
            else if( action == "com.barco.eventmaster.unfreeze"){

                var unfreeze_payload = payload['unfreeze'];
                
                var unfreezelist_Element = document.getElementById("unfreeze_source_list");
                if( unfreezelist_Element != null ) {

                    while (unfreezelist_Element.length)
                        unfreezelist_Element.remove(0);

                    if( sources ) {

                        var inputs_optG = document.getElementById('unfreeze_source_input');
                        var backgrounds_optG = document.getElementById('unfreeze_source_background');

                        var sourceElement = unfreezelist_Element.appendChild( new Option("") );
                        sourceElement.value = -1;
                        sourceElement.selected = true;

                        if( unfreeze_payload == null ) {
                            unfreeze_payload = {id: -1, name: ""};
                        }

                        for(var i=0; i<sources.length; i++) {
                            //inputs
                            if( sources[i].SrcType  == 0 ) {
                                var sourceElement = inputs_optG.appendChild( new Option(sources[i].Name) );
                                sourceElement.value = sources[i].id;
                            }
                            // backgrounds
                            else if( sources[i].SrcType == 3 ) { 
                                var screenElement = backgrounds_optG.appendChild( new Option(sources[i].Name) );
                                sourceElement.value = sources[i].id;
                            }
                        }

                        // select the previously selected item (from the plugin)
                        for( var i=0; i<unfreezelist_Element.options.length; i++ ){
                            if(unfreezelist_Element.options[i].value == unfreeze_payload.id ) {
                                unfreezelist_Element.options[i].selected = true;
                            }
                        }
                    }       
                } 
            }
            else if( action == "com.barco.eventmaster.cutlayer") {
                //
                // Clear list, repopulate, and check selected item towards the end of this conditional
                //
                // The currenytly selected the GUI element
                if( payload["cutLayer"] == null)
                {
                    var destInfo = {id: -1, name: ""};
                    var srcInfo = {id: -1, name: ""};
                    var layerInfo = {id: -1, name: ""};
                    var cutLayer = { destInfo: null, srcInfo: null,layerInfo: null, layerMode: 0};
                    payload["cutLayer"] = cutLayer;
                
                }
 
                var cutLayer_payload = payload["cutLayer"];
                               
                // selected information
                var destInfo = cutLayer_payload.destInfo;
                var layerInfo = cutLayer_payload.layerInfo;
                var srcInfo = cutLayer_payload.srcInfo;
              
                // ---------------- dest refresh Gui elements ------------------------------------------------- 
                // Clear old ones
                var cutLayer_dest_list_Element = document.getElementById("cutLayer_dest_list");
                while (cutLayer_dest_list_Element.length)
                    cutLayer_dest_list_Element.remove(0);
                
                // populate with new ones
                var screenDestinations = payload["screenDestinations"];
                if( screenDestinations ) {
                
                    var destElement = cutLayer_dest_list_Element.appendChild( new Option("") );
                    destElement.value = -1;

                    if( destInfo == null ) {
                        destInfo = {id: -1, name: ""};
                        destElement.selected = true;
                    }
                    
                    for(var i=0; i<screenDestinations.length; i++) {
                        destElement = cutLayer_dest_list_Element.appendChild( new Option(screenDestinations[i].Name) );
                        var id = destElement.value = screenDestinations[i].id;

                        // if already selected
                        if( destInfo && id==destInfo.id) {
                            destElement.selected = true;
                        }
                    }
                }

                // ---------------- layer refresh of GUI elements ------------------------------------------------- 
                // clear the old onext
                var cutLayer_layer_list_Element = document.getElementById("cutLayer_layer_list");
                while( cutLayer_layer_list_Element.length ) {
                    cutLayer_layer_list_Element.remove(0);
                }

                // populate with new ones..
                // if there is a selected destination.. 
                var destinationContents = payload.destinationContents; // from listContents..
                if( destinationContents && destInfo) {
                
                    // for the selected destination, populate all the layers for that destiantion
                    for(var i=0; i<destinationContents.length; i++) {
                        if( destinationContents[i].id == destInfo.id ) {
                            if( destinationContents[i].Layers ) {
            
                                var layerElement = cutLayer_layer_list_Element.appendChild( new Option("") );
                                layerElement.value = -1;

                                if( layerInfo == null ) {
                                    layerInfo = {id: -1, name: ""};
                                }

                                for( var j=0; j<destinationContents[i].Layers.length; j++ ) {
                                    var layerName = destinationContents[i].Layers[j].Name;
                                    
                                    
                                    // is it a mix layer..
                                    //
                                    var mix=false;
                                    if( layerName.includes ("-A")){
                                        mix =true;
                                        layerName = layerName.slice( 0, layerName.length-2);
                                        layerName += " (mix)";
                                    }
                                    else {
                                        layerName += " (non mix)";
                                    }
                                    
                                    var layerElement = cutLayer_layer_list_Element.appendChild(new Option(layerName) );
                                    var id = layerElement.value = destinationContents[i].Layers[j].id;

                                    // if already selected
                                    if( layerInfo && id == layerInfo.id)
                                    {
                                        console.log("sendToPropertyInspector: found:. "+id);
                                        layerElement.selected = true;
                                    }
                                    
                                    if (mix == true ) /* skip over layer#-B */
                                        j++;

                                }
                            }
                        }
                    }
                }
                
                // --------------- sources------------------------------------------
                var cutLayer_source_list_Element = document.getElementById("cutLayer_source_list");
                if( cutLayer_source_list_Element != null ) {

                    var options = cutLayer_source_list_Element.getElementsByTagName("option");
                    while (options.length)
                        cutLayer_source_list_Element.remove(0);
                    
                    // Inputs
                    if( sources ) {
                        var inputs_optG = document.getElementById('cutLayer_source_input');
                        var stills_optG = document.getElementById('cutLayer_source_still');
                        var destinations_optG = document.getElementById('cutLayer_source_screen');
                        var backgrounds_optG = document.getElementById('cutLayer_source_backgrounds');

                        var sourceElement = cutLayer_source_list_Element.appendChild( new Option("") );
                        sourceElement.value = -1;

                        if( srcInfo == null ) {
                            srcInfo = {id: -1, name: ""};
                        }

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

                        if( srcInfo ) {
                            // select the previously selected item (from the plugin)
                            for( var i=0; i<cutLayer_source_list_Element.options.length; i++ ){
                                if(cutLayer_source_list_Element.options[i].value == srcInfo.id )
                                    cutLayer_source_list_Element.options[i].selected = true;
                            }
                        }
                    }
                }

                
                var layerModeElement = document.getElementsByName('layerMode');
                if( cutLayer_payload.layerMode == null ) {
                    if( layerModeElement != null ) 
                        setChecked(layerModeElement, "layerMode_toPreview");
                }
                else {
                    if( cutLayer_payload.layerMode  == 0  ) {
                        setChecked(layerModeElement, "layerMode_toPreview");
                    }
                    else {
                        setChecked(layerModeElement, "layerMode_toProgram");
                    }
                }

            }

            else if( action == "com.barco.eventmaster.cutaux") {
                //
                // Clear list, repopulate, and check selected item towards the end of this conditional
                //
                // The currenytly selected the GUI element
                if( payload["cutAux"] == null)
                {
                    var destInfo = {id: -1, name: ""};
                    var srcInfo = {id: -1, name: ""};
                    var cutAux = { destInfo: null, srcInfo: null, auxMode: 0};
                    payload["cutAux"] = cutAux;
                
                }
                var cutAux_payload = payload["cutAux"];
                                
                // selected information
                var destInfo = cutAux_payload.destInfo;
                var srcInfo = cutAux_payload.srcInfo;
              
                // ---------------- dest refresh Gui elements ------------------------------------------------- 
                // Clear old ones
                var cutAux_dest_list_Element = document.getElementById("cutAux_dest_list");
                while (cutAux_dest_list_Element.length)
                    cutAux_dest_list_Element.remove(0);
                
                // populate with new ones
                var auxDestinations = payload["auxDestinations"];
                if( auxDestinations ) {
                
                    var destElement = cutAux_dest_list_Element.appendChild( new Option("") );
                    destElement.value = -1;

                    if( destInfo == null ) {
                        destInfo = {id: -1, name: ""};
                        destElement.selected = true;
                    }
                    
                    for(var i=0; i<auxDestinations.length; i++) {
                        destElement = cutAux_dest_list_Element.appendChild( new Option(auxDestinations[i].Name) );
                        var id = destElement.value = auxDestinations[i].id;

                        // if already selected
                        if( destInfo && id==destInfo.id) {
                            destElement.selected = true;
                        }
                    }
                }

                // --------------- sources------------------------------------------
                var cutAux_source_list_Element = document.getElementById("cutAux_source_list");
                if( cutAux_source_list_Element != null ) {

                    var options = cutAux_source_list_Element.getElementsByTagName("option");
                    while (options.length)
                    cutAux_source_list_Element.remove(0);
                    
                    // Inputs
                    if( sources ) {
                        var inputs_optG = document.getElementById('cutAux_source_input');
                        var stills_optG = document.getElementById('cutAux_source_still');
                        var destinations_optG = document.getElementById('cutAux_source_screen');
                        var backgrounds_optG = document.getElementById('cutAux_source_backgrounds');

                        var sourceElement = cutAux_source_list_Element.appendChild( new Option("") );
                        sourceElement.value = -1;

                        if( srcInfo == null ) {
                            srcInfo = {id: -1, name: ""};
                            sourceElement.selected = true;
                        }

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

                        if( srcInfo ) {
                            // select the previously selected item (from the plugin)
                            for( var i=0; i<cutAux_source_list_Element.options.length; i++ ){
                                if(cutAux_source_list_Element.options[i].value == srcInfo.id )
                                    cutAux_source_list_Element.options[i].selected = true;
                            }
                        }
                    }
                }

                
                var auxModeElement = document.getElementsByName('auxMode');
                if( cutAux_payload.auxMode  == 0  ) {
                    setChecked(auxModeElement, "auxMode_toPreview");
                }
                else {
                    setChecked(auxModeElement, "auxMode_toProgram");
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

    //** operator **/
    var operator = {"id":0, "password": ""};
    var operatorsElement = document.getElementById('operator');
    if( operatorsElement != null ) {
        var selectedOperatorIndex = operatorsElement.selectedIndex;
                    
        if( operatorsElement[selectedOperatorIndex] != null ) {
            operator.id = operatorsElement[selectedOperatorIndex].value;
        }


        // hide the password entry if the user is not super operator
        // these come from the style sheet definition.  Otherwise if you don't
        // set these style elements it will muck up the input field and put
        // it on the next line instead of inline.
        var passwordDivElement = document.getElementById("password_div");
        if( passwordDivElement ) {
            if( operator  && operator.id == OPERATOR.SUPER ) {
                passwordDivElement.style.display = "flex";
                passwordDivElement.style.flexDirection = "row" ;
                passwordDivElement.style.minHeight = "32px";
                passwordDivElement.style.alignItems = "center";
                passwordDivElement.style.marginTop = "2px";
                passwordDivElement.style.maxWidth ="344px";

                var passwordElement = document.getElementById("password");
                if( passwordElement ) {
                    operator.password = passwordElement.value;         
                }

            } 
            else {
                passwordDivElement.style.display = "none";
                operator.password="";
            }
        }
        payload.operator= operator;
    }

    /** activatePreset */
    var activatePreset_presetNameElement = document.getElementById('presetName');
    var activatePreset_presetModeElement = document.getElementsByName('presetMode');
    if( activatePreset_presetNameElement != null &&  activatePreset_presetNameElement.selectedIndex >= 0){
        var activatePreset = {presetName: "null", presetMode: 0, id: -1 };

        var selectedIndex = activatePreset_presetNameElement.selectedIndex;
        activatePreset.presetName = activatePreset_presetNameElement[selectedIndex].label;
        activatePreset.id = activatePreset_presetNameElement[selectedIndex].value;
        

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
    if( activateCue_cueNameElement != null && activateCue_cueNameElement.selectedIndex >= 0) {
        var activateCue = {cueName: "null", cueMode: 0, id: -1 };

        var selectedIndex = activateCue_cueNameElement.selectedIndex;
        activateCue.cueName = activateCue_cueNameElement[selectedIndex].label;
        activateCue.id = activateCue_cueNameElement[selectedIndex].value;

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
    var freeze = { id: -1, name:""};
    var freeze_listElement = document.getElementById('freeze_source_list');
    if( freeze_listElement != null && freeze_listElement.selectedIndex >= 0) {

        // determine which group (set the type based on the optgroup //
        var selectedIndex = freeze_listElement.selectedIndex;
              
        freeze.id = freeze_listElement.options[selectedIndex].value;
        freeze.name = freeze_listElement.options[selectedIndex].label;
        payload.freeze = freeze;
    }
    
    /** UnFreeze **/
    var unfreeze = { id: -1, name:""};
    var unfreeze_listElement = document.getElementById('unfreeze_source_list');
    if( unfreeze_listElement != null && unfreeze_listElement.selectedIndex >= 0) {

        // determine which group (set the type based on the optgroup //
        var selectedIndex = unfreeze_listElement.selectedIndex;
        unfreeze.id = unfreeze_listElement.options[selectedIndex].value;
        unfreeze.name = unfreeze_listElement.options[selectedIndex].label;
        
        payload.unfreeze = unfreeze;
    }

    /** cutLayer **/
    var destInfo = {id: -1, name: ""};
    var srcInfo = {id: -1, name: ""};
    var layerInfo = {id: -1, name: ""};
    var cutLayer = { destInfo: null, srcInfo: null,layerInfo: null, layerMode: 0};

    var cutLayer_destElement = document.getElementById('cutLayer_dest_list');
    if( cutLayer_destElement != null ) {
        var selectedIndex = cutLayer_destElement.selectedIndex;
        if( selectedIndex >= 0 ){
            destInfo.id = cutLayer_destElement.options[selectedIndex].value;
            destInfo.name = cutLayer_destElement.options[selectedIndex].label;
            cutLayer.destInfo = destInfo;
        } 
    }
    
    var cutLayer_layerElement = document.getElementById('cutLayer_layer_list');
    if( cutLayer_layerElement != null ) {
        var selectedIndex = cutLayer_layerElement.selectedIndex;
        if( selectedIndex >= 0 ){
            layerInfo.id = cutLayer_layerElement.options[selectedIndex].value;
            layerInfo.name = cutLayer_layerElement.options[selectedIndex].label;
            cutLayer.layerInfo = layerInfo;
        }
    }

    var cutLayer_layerModeElement = document.getElementsByName('layerMode');
    if( cutLayer_layerModeElement != null ) {
        var layerMode=getChecked(cutLayer_layerModeElement);
        if( layerMode && layerMode.length>0 ) { 
            if (layerMode == "layerMode_toProgram") {
                cutLayer.layerMode = 1;             
            }   
        }
    }
    
    var cutLayer_sourceElement = document.getElementById('cutLayer_source_list');
    if( cutLayer_sourceElement != null ) {
        var selectedIndex = cutLayer_sourceElement.selectedIndex;
        if( selectedIndex >= 0 ){
            srcInfo.id = cutLayer_sourceElement.options[selectedIndex].value;
            srcInfo.name = cutLayer_sourceElement.options[selectedIndex].label;
            cutLayer.srcInfo = srcInfo;
        }
    }
    
    payload.cutLayer = cutLayer;
    
    // cutAux---------------------------------------------------------------
    var cutAux = { destInfo: null, srcInfo: null, auxMode: 0};

    var cutAux_destElement = document.getElementById('cutAux_dest_list');
    if( cutAux_destElement != null ) {
        var selectedIndex = cutAux_destElement.selectedIndex;
        if( selectedIndex >= 0 ){
            destInfo.id = cutAux_destElement.options[selectedIndex].value;
            destInfo.name = cutAux_destElement.options[selectedIndex].label;
            cutAux.destInfo = destInfo;
        } 
    }
    
    var cutAux_auxModeElement = document.getElementsByName('auxMode');
    if( cutAux_auxModeElement != null ) {
        var auxMode=getChecked(cutAux_auxModeElement);
        if( auxMode && auxMode.length>0 ) { 
            if (auxMode == "auxMode_toProgram") {
                cutAux.auxMode = 1;             
            }   
        }
    }
    
    var cutAux_sourceElement = document.getElementById('cutAux_source_list');
    if( cutAux_sourceElement != null ) {
        var selectedIndex = cutAux_sourceElement.selectedIndex;
        if( selectedIndex >= 0 ){
            srcInfo.id = cutAux_sourceElement.options[selectedIndex].value;
            srcInfo.name = cutAux_sourceElement.options[selectedIndex].label;
            cutAux.srcInfo = srcInfo;
        }
    }
    
    payload.cutAux = cutAux;
   
    sendPayloadToPlugin(payload);
}

function setSettings(payload) {
    var json = {
        "event": "setSettings",
        "context": uuid,
        "payload": payload
    };

    websocket.send(JSON.stringify(json));
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
