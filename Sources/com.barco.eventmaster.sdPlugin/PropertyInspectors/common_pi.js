
  const OPERATOR = {
    ALL: -2,
    SUPER: -1,
    ONE: 0,
    TWO: 1,
    THREE: 2
}

const FREEZE_SRC_TYPE = {
    INPUT: 0,
    BACKGROUND: 1,
    SCREEN_DEST: 2,
    AUX_DEST : 3
}

var kNUM_TESTPATTERNS = 21;
const kTESTPATTERNS = [ 
{
    id: 0,
    name: "Off"
},
{
    id: 1,
    name: "Horizontal Ramp"
},
{
    id: 2,
    name: "Vertical Ramp"
},
{
    id: 3,
    name: "100% Color Bars"
},
{
    id: 4,
    name: "16x16 Grid"
},
{
    id: 5,
    name: "32x32 Grid"
},
{
    id: 6,
    name: "Burst"
},
{
    id: 7,
    name: "75% Color Bars"
},
{
    id: 8,
    name: "50% Gray"
},
{
    id: 9,
    name: "Horizonal Steps"
},
{
    id: 10,
    name: "Vertical Steps"
},
{
    id: 11,
    name: "White"
},
{
    id: 12,
    name: "Black"
},
{
    id: 13,
    name: "SMPTE Bars"
},
{
    id: 14,
    name: "H Alignment"
},
{
    id: 15,
    name: "V Aligment"
},
{
    id: 16,
    name: "HV Alignment"
},
{
    id: 17,
    name: "Circle Alignment"
},
{
    id: 18,
    name: "Red"
},
{
    id: 19,
    name: "Green"
},
{
    id: 20,
    name: "Blue"
}
];


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

            // vars from plugin used by most actions.
            var inputs = payload["inputs"];
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
            var sourceBackups = payload['sourceBackups'];
            var frameSettings = payload['frameSettings'];
            
          
            
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

                        console.log("operator is null!");
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
                       
                        var passwordElement = document.getElementById("password");
                        if( passwordElement ) {
                            passwordElement.value = operator.password
                        }
                    } 
                    else {
                        passwordDivElement.style.display = "none";
                        var passwordElement = document.getElementById("password");
                        if( passwordElement ) {
                            passwordElement.value = "";
                        }
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
                                        (presets[i].presetSno >= (operator.StartRange-1) && presets[i].presetSno <= (operator.EndRange-1) ) ) {
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

            else if( action == "com.barco.eventmaster.resetsourcebackup"){
                //
                // Clear list, repopulate, and check selected item towards the end of this conditional
                //
                // The currenytly selected the GUI element
                if( payload["resetSourceBackup"] == null)
                {
                    payload["resetSourceBackup"] = {id: -1, "name":""};
                }
                var resetSourceBackup_payload = payload["resetSourceBackup"];
                                
                // selected information
                var srcInfo = resetSourceBackup_payload.srcInfo;
              
                // --------------- sources------------------------------------------
                var reset_sourcebackup_list_Element = document.getElementById("reset_sourcebackup_list");
                if( reset_sourcebackup_list_Element != null ) {

                    while (reset_sourcebackup_list_Element.length)
                       reset_sourcebackup_list_Element.remove(0);
                    
                    // Sources
                    if( sources ) {
                        var sourceElement = reset_sourcebackup_list_Element.appendChild( new Option("") );
                        sourceElement.value = -1;

                        if( srcInfo == null ) {
                            srcInfo = {id: -1, name: ""};
                            sourceElement.selected = true;
                        }

                        for(var i=0; i<sources.length; i++) {
                            if( sources[i].InputCfgIndex != -1 ) {
                                var sourceElement = reset_sourcebackup_list_Element.appendChild( new Option(sources[i].Name) );
                                sourceElement.value = sources[i].InputCfgIndex;
                            }   
                        }
                    }

                    if( srcInfo ) {
                        // select the previously selected item (from the plugin)
                        for( var i=0; i<reset_sourcebackup_list_Element.length; i++ ){
                            if(reset_sourcebackup_list_Element[i].value == srcInfo.id ){
                                reset_sourcebackup_list_Element[i].selected = true;
                                break;
                            }
                        }
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

                    var sourceElement = freezelist_Element.appendChild( new Option("") );
                    sourceElement.value = -1;

                    // SrcType = 0 -> Input Source
                    //         = 1 -> Background Source 
                    //         = 2 -> Screen Destination
                    //         = 3 -> Aux Destination 
                    if( freeze_payload == null ) {
                        freeze_payload = {id: -1, srcType: FREEZE_SRC_TYPE.INPUT, name: ""};
                        sourceElement.selected = true;
                    }

                    if( sources ) {
                     var inputs_optG = document.getElementById('freeze_source_input');
                        for(var i=0; i<sources.length; i++) {
                            if( sources[i].SrcType == 0) {
                                var sourceElement = inputs_optG.appendChild( new Option(sources[i].Name) );
                                sourceElement.value = sources[i].id;
                            }
                        }
                    }

                    if( backgrounds ) {
                        var backgrounds_optG = document.getElementById('freeze_source_background');
                        for(var i=0; i<backgrounds.length; i++) {
                        
                            if( backgrounds[i].BGSrcType == 0 ){
                                var sourceElement = backgrounds_optG.appendChild( new Option(backgrounds[i].Name) );
                                sourceElement.value = backgrounds[i].id;
                            }
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
            else if( action == "com.barco.eventmaster.unfreeze"){

                var unfreeze_payload = payload['unfreeze'];
                
                var unfreezelist_Element = document.getElementById("unfreeze_source_list");
                if( unfreezelist_Element != null ) {

                    while (unfreezelist_Element.length)
                        unfreezelist_Element.remove(0);

                    var sourceElement = unfreezelist_Element.appendChild( new Option("") );
                    sourceElement.value = -1;
                    sourceElement.selected = true;

                    if( unfreeze_payload == null ) {
                        unfreeze_payload = {id: -1, SrcType: FREEZE_SRC_TYPE.INPUT, name: ""};
                    }

                    if( sources ) {
                        var inputs_optG = document.getElementById('unfreeze_source_input');
                        for(var i=0; i<sources.length; i++) {
                            if( sources[i].SrcType == 0) {
                                var sourceElement = inputs_optG.appendChild( new Option(sources[i].Name) );
                                sourceElement.value = sources[i].id;
                            }
                        }
                    }

                    if( backgrounds ) {
                        var backgrounds_optG = document.getElementById('unfreeze_source_background');
                        for(var i=0; i<backgrounds.length; i++) {
                            if( backgrounds[i].BGSrcType == 0 ){
                                var sourceElement = backgrounds_optG.appendChild( new Option(backgrounds[i].Name) );
                                sourceElement.value = backgrounds[i].id;
                            }
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
                                var sourceElement = destinations_optG.appendChild( new Option(sources[i].Name) );
                                sourceElement.parentNode.value = sources[i].id;
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
                                var sourceElement = destinations_optG.appendChild( new Option(sources[i].Name) );
                                sourceElement.parentNode.value = sources[i].id;
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

            // mvrLayoutChange ----------------------------------------------------------------
            else if( action == "com.barco.eventmaster.mvrlayoutchange" ){

                var mvrLayoutChange = payload['mvrLayoutChange'];
                var mvrLayoutChangeFrame_Element = document.getElementById('mvrlayoutchange_frame');
                var mvrLayoutChangeMVRLayout_Element = document.getElementById('mvrlayoutchange_mvrlayout');

                if( mvrLayoutChange) {
                    mvrLayoutChangeFrame_Element.value = mvrLayoutChange.frameUnitId;
                    mvrLayoutChangeMVRLayout_Element.value = mvrLayoutChange.mvrLayoutId;
                }
            }

            // recalltestpatternscreen --------------------------------------------------------------
            else if( action == "com.barco.eventmaster.recalltestpatternscreen"){

                var recallTestPatternScreen_payload = payload['recallTestPatternScreen'];
                
                var recallTestPattern_Element = document.getElementById("recall_testpattern_destination_list");
                if( recallTestPattern_Element != null ) {

                    // ---------------- dest refresh Gui elements ------------------------------------------------- 
                    // Clear old ones
                    var recallTestPattern_dest_list_Element = document.getElementById("recall_testpattern_destination_list");
                    while (recallTestPattern_dest_list_Element.length)
                        recallTestPattern_dest_list_Element.remove(0);
                
                    // populate with new screens
                    var screenDestinations = payload["screenDestinations"];
                    if( screenDestinations ) {
                    
                        var destElement = recallTestPattern_dest_list_Element.appendChild( new Option("") );
                        destElement.value = -1;

                        if( destInfo == null ) {
                            destInfo = {id: -1, name: ""};
                            destElement.selected = true;
                        }
                        
                        for(var i=0; i<screenDestinations.length; i++) {
                            destElement = recallTestPattern_dest_list_Element.appendChild( new Option(screenDestinations[i].Name) );
                            var id = destElement.value = auxDestinations[i].id;

                            // if already selected
                            if( destInfo && id==destInfo.id) {
                                destElement.selected = true;
                            }
                        }
                        if( recallTestPatternScreen_payload ){
                            // select the previously selected destination (from the plugin)
                            for( var i=0; i<recallTestPattern_Element.options.length; i++ ){
                                if(recallTestPattern_Element.options[i].value == recallTestPatternScreen_payload.dest_id ) {
                                    recallTestPattern_Element.options[i].selected = true;
                                }
                            }
                        }
                       
                    }

                    // Add the test patterns to the drop
                    var testPatterns = kTESTPATTERNS;
                    if( testPatterns){
                        var testPattern_optG = document.getElementById('recall_testpattern_list');

                         // Clear old ones
                        while (testPattern_optG.length)
                            testPattern_optG.remove(0);
     
                        for(var i=0; i<testPatterns.length; i++) {
                            var testPatternElement = testPattern_optG.appendChild( new Option(testPatterns[i].name) );
                            testPatternElement.value = testPatterns[i].id;
                        }
                    }          

                    if( recallTestPatternScreen_payload ){
                        var testPatternElement = document.getElementById('recall_testpattern_list');
                        // select the previously selected test pattern (from the plugin)
                        for( var i=0; i<testPatternElement.options.length; i++ ){
                            if(testPatternElement.options[i].value == recallTestPatternScreen_payload.testpattern_id ) {
                                testPatternElement.options[i].selected = true;
                            }
                        }  
                    }     
                } 
            }
        
            else if( action == "com.barco.eventmaster.recalltestpatternaux"){

                var recallTestPatternAux_payload = payload['recallTestPatternAux'];
                
                var recallTestPattern_Element = document.getElementById("recall_testpatternaux_destination_list");
                if( recallTestPattern_Element != null ) {

                    // ---------------- dest refresh Gui elements ------------------------------------------------- 
                    // Clear old ones
                    var recallTestPattern_dest_list_Element = document.getElementById("recall_testpatternaux_destination_list");
                    while (recallTestPattern_dest_list_Element.length)
                        recallTestPattern_dest_list_Element.remove(0);
                
                    // populate with new screens
                    var screenDestinations = payload["auxDestinations"];
                    if( screenDestinations ) {
                    
                        var destElement = recallTestPattern_dest_list_Element.appendChild( new Option("") );
                        destElement.value = -1;

                        if( destInfo == null ) {
                            destInfo = {id: -1, name: ""};
                            destElement.selected = true;
                        }
                        
                        for(var i=0; i<auxDestinations.length; i++) {
                            destElement = recallTestPattern_dest_list_Element.appendChild( new Option(auxDestinations[i].Name) );
                            var id = destElement.value = auxDestinations[i].id;

                            // if already selected
                            if( destInfo && id==destInfo.id) {
                                destElement.selected = true;
                            }
                        }
                        if( recallTestPatternAux_payload ){
                            // select the previously selected destination (from the plugin)
                            for( var i=0; i<recallTestPattern_Element.options.length; i++ ){
                                if(recallTestPattern_Element.options[i].value == recallTestPatternAux_payload.dest_id ) {
                                    recallTestPattern_Element.options[i].selected = true;
                                }
                            }
                        }
                       
                    }

                    // Add the test patterns to the drop
                    var testPatterns = kTESTPATTERNS;
                    if( testPatterns){
                        var testPattern_optG = document.getElementById('recall_testpatternaux_list');

                        // Clear old ones
                        while (testPattern_optG.length)
                            testPattern_optG.remove(0);
        
                        for(var i=0; i<testPatterns.length; i++) {
                            var testPatternElement = testPattern_optG.appendChild( new Option(testPatterns[i].name) );
                            testPatternElement.value = testPatterns[i].id;
                        }
                    }          

                    if(recallTestPatternAux_payload){
                        var testPatternElement = document.getElementById('recall_testpatternaux_list');
                        // select the previously selected test pattern (from the plugin)
                        for( var i=0; i<testPatternElement.options.length; i++ ){
                            if(testPatternElement.options[i].value == recallTestPatternAux_payload.testpattern_id ) {
                                testPatternElement.options[i].selected = true;
                            }
                        }       
                    }
                }
            }
            else if( action == "com.barco.eventmaster.recallsourcebackup"){

                var recallBackupSource_payload = payload['recallBackupSource'];
                var inputBackups_payload = payload['inputBackups'];

                // initialize the backupSource settings daya
                if( recallBackupSource_payload == null ) {
                    var backup1_Obj = {"SrcType":0, "SourceId":-1};
                
                    recallBackupSource_payload = {  "inputId": -1, 
                                                    "Backup1": backup1_Obj, 
                                                    "Backup2": backup1_Obj, 
                                                    "Backup3": backup1_Obj,
                                                    "BackupState":-1};
                }
        
                var recallBackupSourceInput_Element = document.getElementById("backup_inputList");
                if( recallBackupSourceInput_Element != null ) {
                 
                    // ---------------- input refresh Gui elements ------------------------------------------------- 
                    // Clear old input list
                    while (recallBackupSourceInput_Element.length)
                        recallBackupSourceInput_Element.remove(0);

                    // populate with new inputs
                    if( inputBackups_payload ) {
                    
                        // create an empty row in the list (no selection)
                        var inputBackupsInputElement = recallBackupSourceInput_Element.appendChild( new Option("") );
                        inputBackupsInputElement.value = -1;

                        for(var i=0; i<inputBackups_payload.length; i++ ){
                            inputBackupsInputElement = recallBackupSourceInput_Element.appendChild( new Option(inputBackups_payload[i].Name) );
                            inputBackupsInputElement.value = inputBackups_payload[i].id;
                        }
                        // select the previously selected input (from the plugin)
                        if( recallBackupSource_payload ){
                            for( var i=0; i<recallBackupSourceInput_Element.options.length; i++ ){
                                if(recallBackupSourceInput_Element.options[i].value == recallBackupSource_payload.inputId ) {
                                    recallBackupSourceInput_Element.options[i].selected = true;

                                    // initialize the Backup1-3 fields to indicate the name of the input for each backup for the selected input
                                    // This data is coming from listSourceMainBackup..
                                    /* Backup { 
                                        "id": 2,
                                        "inputId": 24,
                                        "stillId": null,
                                        "destId": null,
                                        "Name": "SDIInput25",
                                        "VideoStatus": 4}
                                    */
                                    if( inputBackups_payload ){
                                        for( var i=0; i<inputBackups_payload.length; i++ ){
                                            if(inputBackups_payload[i].id == recallBackupSource_payload.inputId ) {

                                                // Backup 1 -----------------------------------------------------------------
                                                var backupElement = document.getElementById('source_name_backup1');
                                                if( backupElement ) {
                                                    backupElement.innerText = inputBackups_payload[i].Backup[0].Name;;
                                                }
                                                var sourcebackupElement = document.getElementById('source_backup1');
                                                if( sourcebackupElement ){
                                                    // inputId != null
                                                    if(inputBackups_payload[i].Backup[0].inputId!=null )
                                                        sourcebackupElement.value = inputBackups_payload[i].Backup[0].inputId;
                                                    else if(inputBackups_payload[i].Backup[0].stillId !=null )
                                                        sourcebackupElement.value =inputBackups_payload[i].Backup[0].stillId;
                                                    else if(inputBackups_payload[i].Backup[0].destId !=null )
                                                        sourcebackupElement.value =inputBackups_payload[i].Backup[0].destId;
                                                }

                                                // Backup 2 ---------------------------------------------------------------------------
                                                backupElement = document.getElementById('source_name_backup2');
                                                if( backupElement ) {
                                                    backupElement.innerText = inputBackups_payload[i].Backup[1].Name;
                                                }
                                                var sourcebackupElement = document.getElementById('source_backup2');
                                                if( sourcebackupElement ){
                                                // inputId != null
                                                    if(inputBackups_payload[i].Backup[1].inputId!=null )
                                                        sourcebackupElement.value = inputBackups_payload[i].Backup[1].inputId;
                                                    else if(inputBackups_payload[i].Backup[0].stillId !=null )
                                                        sourcebackupElement.value = inputBackups_payload[i].Backup[1].stillId;
                                                    else if(inputBackups_payload[i].Backup[0].destId !=null )
                                                        sourcebackupElement.value = inputBackups_payload[i].Backup[1].destId;
                                                }

                                                 // Backup 3 ---------------------------------------------------------------------------
                                                 backupElement = document.getElementById('source_name_backup3');
                                                 if( backupElement ) {
                                                     backupElement.innerText = inputBackups_payload[i].Backup[2].Name;
                                                 }
                                                 var sourcebackupElement = document.getElementById('source_backup3');
                                                 if( sourcebackupElement ){
                                                    // inputId != null
                                                    if(inputBackups_payload[i].Backup[2].inputId!=null )
                                                        sourcebackupElement.value = inputBackups_payload[i].Backup[2].inputId;
                                                    else if(inputBackups_payload[i].Backup[0].stillId !=null )
                                                        sourcebackupElement.value = inputBackups_payload[i].Backup[2].stillId;
                                                    else if(inputBackups_payload[i].Backup[0].destId !=null )
                                                        sourcebackupElement.value = inputBackups_payload[i].Backup[2].destId;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }   
                    }
                }
                var recallBackupSourceActiveInput_Element = document.getElementById("backup_activeinputList");
                if( recallBackupSourceActiveInput_Element != null ) {
                 
                    // ---------------- input refresh Gui elements ------------------------------------------------- 
                    // if the list hasn't been initialized, do it now
                    if (recallBackupSourceActiveInput_Element.length == 0){
                        var inputBackupsActiveInputElement = recallBackupSourceActiveInput_Element.appendChild( new Option("Primary") );
                        inputBackupsActiveInputElement.value = -1;

                        for(var i=0; i<3; i++ ){
                            inputBackupsActiveInputElement = recallBackupSourceActiveInput_Element.appendChild( new Option("Backup"+(i+1) ));
                            inputBackupsActiveInputElement.value = i;
                        }
                    }
                    // select the previously selected destination (from the plugin)
                    if( recallBackupSource_payload ){
                        for( var i=0; i<recallBackupSourceActiveInput_Element.options.length; i++ ){
                            if(recallBackupSourceActiveInput_Element.options[i].value == recallBackupSource_payload.BackUpState ) {
                                recallBackupSourceActiveInput_Element.options[i].selected = true;
                            }
                        }
                    }  
                }
            }
         }
    };
}

function frameHasMVR(frame) {

    if( frame && frame.Slot.length > 0 ) {
        for( var cardSlot=0; cardSlot< frame.Slot.length; cardSlot++ ) {
            if( frame.Slot[cardSlot].Card &&
                frame.Slot[cardSlot].Card.CardTypeLabel &&
                frame.Slot[cardSlot].Card.CardTypeLabel.includes("MVR Gen2") ){
                return true;
            }
        }
    }
    
    return false;
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
    if( ipAddressElement != null ){
        payload.ipAddress = ipAddress.value;
    }

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
    var freeze = { id: -1, type:  FREEZE_SRC_TYPE.INPUT, name:""};
    var freeze_listElement = document.getElementById('freeze_source_list');
    if( freeze_listElement != null && freeze_listElement.selectedIndex >= 0) {

        // determine which group (set the type based on the optgroup //
        var selectedIndex = freeze_listElement.selectedIndex;
              
        freeze.id = freeze_listElement.options[selectedIndex].value;
        freeze.name = freeze_listElement.options[selectedIndex].label;
        var parentId = freeze_listElement.options[selectedIndex].parentElement.id;
        if ( parentId == "freeze_source_input"){
            freeze.type = FREEZE_SRC_TYPE.INPUT;
        }
        else if (parentId == "freeze_source_background") {
            freeze.type = FREEZE_SRC_TYPE.BACKGROUND;
        }
        else if(parentId == "freeze_source_destination") {
            freeze.type = FREEZE_SRC_TYPE.SCREEN_DEST;
        }
        else if(parentId == "freeze_source_aux"){
            freeze.type = FREEZE_SRC_TYPE.AUX_DEST;
        }
        
        payload.freeze = freeze;
    }
    
    /** UnFreeze **/
    var unfreeze = { id: -1, type: FREEZE_SRC_TYPE.INPUT, name:""};
    var unfreeze_listElement = document.getElementById('unfreeze_source_list');
    if( unfreeze_listElement != null && unfreeze_listElement.selectedIndex >= 0) {

        // determine which group (set the type based on the optgroup //
        var selectedIndex = unfreeze_listElement.selectedIndex;
        unfreeze.id = unfreeze_listElement.options[selectedIndex].value;
        unfreeze.name = unfreeze_listElement.options[selectedIndex].label;

        var parentId = unfreeze_listElement.options[selectedIndex].parentElement.id;
        if ( parentId == "unfreeze_source_input"){
            freeze.type = FREEZE_SRC_TYPE.INPUT;
        }
        else if (parentId == "unfreeze_source_background") {
            freeze.type = FREEZE_SRC_TYPE.BACKGROUND;
        }
        else if(parentId == "unfreeze_source_destination") {
            freeze.type = FREEZE_SRC_TYPE.SCREEN_DEST;
        }
        else if(parentId == "freeze_source_aux"){
            freeze.type = FREEZE_SRC_TYPE.AUX_DEST;
        }
        
        
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

      
    // resetSourceBackup ---------------------------------------------------------------
    var resetSourceBackup = { srcInfo: null};
 
    var resetSourceBackupElement = document.getElementById('reset_sourcebackup_list');
    if( resetSourceBackupElement != null ) {
        var selectedIndex = resetSourceBackupElement.selectedIndex;
        if( selectedIndex >= 0 ){
            srcInfo.id = resetSourceBackupElement.options[selectedIndex].value;
            srcInfo.name = resetSourceBackupElement.options[selectedIndex].label;
            resetSourceBackup.srcInfo = srcInfo;
        }
    }
    payload.resetSourceBackup = resetSourceBackup;

    // FreezeDest  ---------------------------------------------------------------
    var freezeDest = { id: -1, name:""};
    var freezeDest_listElement = document.getElementById('freezedest_source_list');
    if( freezeDest_listElement != null && freezeDest_listElement.selectedIndex >= 0) {

        // determine which group (set the type based on the optgroup //
        var selectedIndex = freezeDest_listElement.selectedIndex;
              
        freezeDest.id = freezeDest_listElement.options[selectedIndex].value;
        freezeDest.name = freezeDest_listElement.options[selectedIndex].label;
    }
    payload.freezeDest = freezeDest;

    // UnFreezeDest  ---------------------------------------------------------------
    var unfreezeDest = { id: -1, name:""};
    var unfreezeDest_listElement = document.getElementById('unfreezedest_source_list');
    if( unfreezeDest_listElement != null && freezeDest_listElement.selectedIndex >= 0) {

        // determine which group (set the type based on the optgroup //
        var selectedIndex = freezeDest_listElement.selectedIndex;
              
        unfreezeDest.id = unfreezeDest_listElement.options[selectedIndex].value;
        unfreezeDest.name = unfreezeDest_listElement.options[selectedIndex].label;
    }
    payload.unfreezeDest = unfreezeDest;
   
    // mvrLayoutChange ----------------------------------------------------------------
    var mvrLayoutChange = {"frameUnitId": -1, "mvrLayoutId":-1 };
    var mvrLayoutChangeFrameElement = document.getElementById('mvrlayoutchange_frame');
    if( mvrLayoutChangeFrameElement ){
        mvrLayoutChange.frameUnitId = parseInt(mvrLayoutChangeFrameElement.value);
    }

    var mvrLayoutChangeFrame_LayoutElement = document.getElementById('mvrlayoutchange_mvrlayout');
    if( mvrLayoutChangeFrame_LayoutElement ){
        mvrLayoutChange.mvrLayoutId = parseInt(mvrLayoutChangeFrame_LayoutElement.value);
    }
    payload.mvrLayoutChange = mvrLayoutChange;

    // recallTestPatternScreen ----------------------------------------------------------------
    var recallTestPatternScreen = {"dest_id": -1, "testpattern_id":-1 };
    var recallTestPatternScreenDestElement = document.getElementById('recall_testpattern_destination_list');
    if( recallTestPatternScreenDestElement ){
        recallTestPatternScreen.dest_id = parseInt(recallTestPatternScreenDestElement.value);
    }

    var recallTestPatternScreenElement = document.getElementById('recall_testpattern_list');
    if( recallTestPatternScreenElement ){
        recallTestPatternScreen.testpattern_id = parseInt(recallTestPatternScreenElement.value);
    }
    payload.recallTestPatternScreen = recallTestPatternScreen;

    // recallTestPatternAux ----------------------------------------------------------------
    var recallTestPatternAux = {"dest_id": -1, "testpattern_id":-1 };
    var recallTestPatternAuxDestElement = document.getElementById('recall_testpatternaux_destination_list');
    if( recallTestPatternAuxDestElement ){
        recallTestPatternAux.dest_id = parseInt(recallTestPatternAuxDestElement.value);
    }

    var recallTestPatternAuxElement = document.getElementById('recall_testpatternaux_list');
    if( recallTestPatternAuxElement ){
        recallTestPatternAux.testpattern_id = parseInt(recallTestPatternAuxElement.value);
    }
    payload.recallTestPatternAux = recallTestPatternAux;
   
    // recallBackupSource --------------------------------------------------------------------
    var Backup1 = {"SrcType":0, "SourceId":-1};
    var Backup2 = {"SrcType":0, "SourceId":-1};
    var Backup3 = {"SrcType":0, "SourceId":-1};
    var recallBackupSource = {"inputId": -1, "Backup1":Backup1, "Backup2":Backup2, "Backup3":Backup3, "BackUpState":-1 };

    var recallBackupSourceInputElement= document.getElementById('backup_inputList');
    if( recallBackupSourceInputElement ){
        recallBackupSource.inputId = parseInt(recallBackupSourceInputElement.value);
    }
    var recallBackupSourceBackup1Element = document.getElementById('source_backup1');
    if( recallBackupSourceBackup1Element ){
        recallBackupSource.Backup1.SourceId=parseInt(recallBackupSourceBackup1Element.value);;
    }
    var recallBackupSourceBackup2Element = document.getElementById('source_backup2');
    if( recallBackupSourceBackup2Element ){
        recallBackupSource.Backup2.SourceId=parseInt( recallBackupSourceBackup2Element.value);
    }
    var recallBackupSourceBackup3Element = document.getElementById('source_backup3');
    if( recallBackupSourceBackup3Element ){
        recallBackupSource.Backup3.SourceId=parseInt( recallBackupSourceBackup3Element.value);
    }

    var recallBackupSourceBackupStateElement = document.getElementById('backup_activeinputList');
    if( recallBackupSourceBackupStateElement ){
        recallBackupSource.BackUpState = parseInt( recallBackupSourceBackupStateElement.value);
    }
    
    payload.recallBackupSource = recallBackupSource;


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
