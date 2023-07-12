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


const ERROR_LEVEL = {
    ERROR: 1,
    WARN: 2,
    INFO: 3
}

var websocket = null;
var pluginUUID = null;
var settingsCache = {};
var socket = null;
var debug = true;

    
       
var DestinationEnum = Object.freeze({ "HARDWARE_AND_SOFTWARE": 0, "HARDWARE_ONLY": 1, "SOFTWARE_ONLY": 2 })

function isEmpty( obj ) {
    for (var key in obj) {
        if( obj.hasOwnProperty(key))
            return false;
    }

    return true;
}



function isValidIp(ipAddress) {
    
	var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
	    
	if( ipAddress && ipAddress.match(ipformat) ) {
		return true;
	}
	
	return false;
}


function validateNum (input, min, max) {
    var num = +input;
    return num >= min && num <= max && input === num.toString();
}


var EventMasterRPC = {

    //code before the pause
    
        
	powerStatus: function(context) {
        
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage( context, "powerStatus error: settingCache is null!", 1);
            return;
        }

        ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {
			var url = "http://"+ipAddress+":9999";
				
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
						
							var fullResponse = JSON.parse(xhr.response);
                            
                            var txt = "powerStatus response: "+xhr.response;
                            eventMasterAction.logMessage(context, txt, ERROR_LEVEL.INFO)
                            eventMasterAction.SetStatus(context, "Connection Established");
					}
					else {
                            var txt = "powerStatus: "+xhr.response;
                            eventMasterAction.logMessage(context, txt, ERROR_LEVEL.WARN)
                            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                var txt = "powerStatus: "+xhr.response;
                eventMasterAction.logMessage(context, txt, ERROR_LEVEL.ERROR)
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

					
			var data = JSON.stringify({"params": {}, "method":"powerStatus", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);

			var txt = "url: " + url + " sent: "+data;
            eventMasterAction.logMessage(context, txt, ERROR_LEVEL.INFO)
        }
        else{
            var txt = "powerStatus: Invalid IP Address: " + ipAddress;
            eventMasterAction.logMessage(context, txt, ERROR_LEVEL.WARN)
        }
	},


	allTrans: function(context) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("allTrans error: settingCache is null!");

            return;
        }

        ipAddress = settings.ipAddress;

        if( isValidIp(ipAddress ) ) {
			
			var url = "http://"+ipAddress+":9999";
				
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
						
						var fullResponse = JSON.parse(xhr.response);
                        console.log("allTrans response: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Connection Established");
					}
					else {
                        console.error("allTrans error: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.warn("allTrans error: "+xhr.response);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

            var data;

            // if super operator, send password instead of id.
            if( settings.operator )
            {
                if( settings.operator.id <= OPERATOR.SUPER ) {
                    data = JSON.stringify({"params": {"password": settings.operator.password}, "method":"allTrans", "id":"1234", "jsonrpc":"2.0"});
                }
                else {
                    data = JSON.stringify({"params": {"operatorId": settings.operator.id,}, "method":"allTrans", "id":"1234", "jsonrpc":"2.0"});
                }
            } 
            else {
                data = JSON.stringify({"params": {}, "method":"allTrans", "id":"1234", "jsonrpc":"2.0"});
            }
			
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.warn("allTrans: Invalid IP Address: " + ipAddress);
        }
	},

	
	cut: function(context) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("cut error: settingCache is null!");
            return;
        }

        ipAddress = settings.ipAddress;
        
        if( isValidIp( ipAddress ) ) {
			var url = "http://"+ipAddress+":9999";
				
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
						
						var fullResponse = JSON.parse(xhr.response);
                        console.log("cut response: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Connection Established");
					}
					else {
                        console.warn("cut error: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.warn("cut error: "+xhr.response);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

            var data;

            // if super operator, send password instead of id.
            if( settings.operator )
            {
                if( settings.operator.id <= OPERATOR.SUPER ) {
                    data = JSON.stringify({"params": {"password": settings.operator.password}, "method":"cut", "id":"1234", "jsonrpc":"2.0"});
                }
                else {
                    data = JSON.stringify({"params": {"operatorId": settings.operator.id,}, "method":"cut", "id":"1234", "jsonrpc":"2.0"});
                }
            } 
            else {
                data = JSON.stringify({"params": {}, "method":"cut", "id":"1234", "jsonrpc":"2.0"});
            }
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.warn("cut: Invalid IP Address: " + ipAddress);
        }
	},

	recallNextPreset: function(context) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("recallNextPreset error: settingCache is null!");
            return;
        }

        ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {
			var url = "http://"+ipAddress+":9999";
				
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
						var fullResponse = JSON.parse(xhr.response);
                        console.log("recallNextPreset response: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Connection Established");
					}
					else {
                        console.warn("recallNextPreset error: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.warn("recallNextPreset error: "+xhr.response);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

            var data;

            // if super operator, send password instead of id.
            if( settings.operator )
            {
                if( settings.operator.id <= OPERATOR.SUPER ) {
                    data = JSON.stringify({"params": {"password": settings.operator.password}, "method":"recallNextPreset", "id":"1234", "jsonrpc":"2.0"});
                }
                else {
                    data = JSON.stringify({"params": {"operatorId": settings.operator.id,}, "method":"recallNextPreset", "id":"1234", "jsonrpc":"2.0"});
                }
            } 
            else {
                data = JSON.stringify({"params": {}, "method":"recallNextPreset", "id":"1234", "jsonrpc":"2.0"});
            }
					
		
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.warn("recallNextPreset: Invalid IP Address: " + ipAddress);
        }
	},

	activatePreset: function(context) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("activate Preset error: settingCache is null!");

            return;
        }

        ipAddress = settings.ipAddress;

        if( isValidIp( ipAddress ) ) {
			var url = "http://"+ipAddress+":9999";
				
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
						
						var fullResponse = JSON.parse(xhr.response);
                        console.log("activatePreset response: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Connection Established");
					}
					else {
                        console.warn("activatePreset error: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.warn("activatePreset error: "+xhr.response);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

            if ( settings.activatePreset && settings.activatePreset.presetName ){

                var data;
                // if super operator, send password instead of id.
                if( settings.operator )
                {
                    if( settings.operator.id <= OPERATOR.SUPER ) {
                        data = JSON.stringify({"params": {"password": settings.operator.password, "presetName": settings.activatePreset.presetName, "type": settings.activatePreset.presetMode}, "method":"activatePreset", "id":"1234", "jsonrpc":"2.0"});
                    }
                    else {
                        data = JSON.stringify({"params": {"operatorId": settings.operator.id,"presetName": settings.activatePreset.presetName, "type": settings.activatePreset.presetMode}, "method":"activatePreset", "id":"1234", "jsonrpc":"2.0"});
                    }
                } 
                else {
                    data = JSON.stringify({"params": {"presetName": settings.activatePreset.presetName, "type": settings.activatePreset.presetMode}, "method":"activatePreset", "id":"1234", "jsonrpc":"2.0"});
                }
                    
                xhr.send(data);
                console.log("sent: "+data);
            }
            else{
                console.error("activatePreset: Invalid activePreset data or invalid preset name. ");
            }    
        }
        else{
            console.warn("activatePreset: Invalid IP Address: " + ipAddress);
        }
	},

	activateCue: function(context, cueName, cueMode) {
        
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("activateCue error: settingCache is null!");

            return;
        }

        ipAddress = settings.ipAddress;

		if( isValidIp( ipAddress ) ) {
			var url = "http://"+ipAddress+":9999";
				
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        var fullResponse = JSON.parse(xhr.response);
                        console.log("activateCue response: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Connection Established");
					}
					else {
                        console.warn("activateCue error: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.warn("activateCue error: "+xhr.response);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

            if( settings.activateCue && settings.activateCue.cueName ) {
                var data = JSON.stringify({"params":{"cueName":settings.activateCue.cueName, "type":settings.activateCue.cueMode}, "method":"activateCue", "id":"1234", "jsonrpc":"2.0"});
                xhr.send(data);
                console.log("sent: "+data);
            }
            else {
                console.error("activateCue: Invalid activateCue data or cuename. ");    
            }
        }
        else{
            console.warn("activateCue: Invalid IP Address: " + ipAddress);
        }
	},

	freeze: function(context) {
        
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("freezeDestSource error: settingCache is null!");

            return;
        }

        ipAddress = settings.ipAddress;

		if( isValidIp( ipAddress ) ) {
			var url = "http://"+ipAddress+":9999";
				
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
						
                        var fullResponse = JSON.parse(xhr.response);
                        console.log("freezeDestSource response: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Connection Established");
					}
					else {
                        console.warn("freeze error: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.warn("freezeDestSource error: "+xhr.response);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

            var freeze = settings['freeze'];
            if (freeze  &&
                freeze.id && 
                freeze.name && 
                freeze.type ) {

                var id = parseInt(freeze.id);
                var name = freeze.name;
                var type = parseInt(freeze.type);
                
                var data = JSON.stringify({"params":{"id":id, "type": type, "screengroup": 0, "mode":1 /*freeze*/ }, "method":"freezeDestSource", "id":"1234", "jsonrpc":"2.0"});
                xhr.send(data);
                console.log("sent: "+data);
            }
            else{
                console.error( "Error: freeze_unfreeze() is missing some data! " + settings.freeze );
            }
        }
        else{
            console.warn("freezeDestSource: Invalid IP Address: " + ipAddress);
        }
        
	},


    unfreeze: function(context) {
        
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("freezeDestSource error: settingCache is null!");

            return;
        }

        ipAddress = settings.ipAddress;

		if( isValidIp( ipAddress ) ) {
			var url = "http://"+ipAddress+":9999";
				
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
						
                        var fullResponse = JSON.parse(xhr.response);
                        console.log("freezeDestSource response: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Connection Established");
					}
					else {
                        console.warn("freeze error: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.warn("freezeDestSource error: "+xhr.response);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

            var unfreeze = settings['unfreeze'];
            if (unfreeze  &&
                unfreeze.name &&
                unfreeze.type &&
                unfreeze.id ) {

                var id = parseInt(unfreeze.id);
                var name = unfreeze.name;
                var type = parseInt(freeze.type);

                var data = JSON.stringify({"params":{"id":id, "type": type, "screengroup": 0, "mode":0 }, "method":"freezeDestSource", "id":"1234", "jsonrpc":"2.0"});
                xhr.send(data);
                console.log("sent: "+data);
            }
            else{
                console.error( "Error: freeze_unfreeze() is missing some data! " + settings.freeze );
            }
        }
        else{
            console.warn("freezeDestSource: Invalid IP Address: " + ipAddress);
        }
        
	},

    getInputs: function( context ) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("getInputs error: settingCache is null!");
            return;
        }

        ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {
		
			var url = "http://"+ipAddress+":9999";
			
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        
                        eventMasterAction.SetStatus(context, "Connection Established");
						var fullResponse = JSON.parse(xhr.response);
						console.log("getInputs response: "+xhr.response);

                        if (fullResponse.result.success == 0 ) {
                            var inputs = settings.inputs = fullResponse.result.response;
                            var arrayLength = inputs.length;
                            for (var i = 0; i < arrayLength; i++) {
                                console.log("input #"+(i+1))
                                console.log("id:" + inputs[i].id);
                                console.log("Name:" + inputs[i].Name);
                                console.log("SyncStatus:" + inputs[i].SyncStatus);
                                console.log("VideoStatus:" + inputs[i].VideoStatus);
                                console.log("Format:" + inputs[i].Format);
                                console.log("ColorSampleBit:" + inputs[i].ColorSampleBit);
                                console.log("Color_Space:" + inputs[i].Color_Status);
                                console.log("Colorimetry:" + inputs[i].Colorimetry);
                                console.log("GammaFx:" + inputs[i].GammaFx);
                                console.log("ColorDepth:" + inputs[i].ColorDepth);
                                console.log("Capacity:" + inputs[i].Capacity);
                                console.log("--------------------------------------------------------");
                            }
                        }
					}
					else {
                        console.warn("getInputs error: "+xhr.responseText);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.warn("getInputs error: "+xhr.responseText);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

		
			var data = JSON.stringify({"params":{"type":0}, "method":"listInputs", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.warn("getInputs: Invalid IP Address: " + ipAddress);
        }
	},

    getSources: function( context ) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("getSources error: settingCache is null!");
            return;
        }

        ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {
		
			var url = "http://"+ipAddress+":9999";
			
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        
                        eventMasterAction.SetStatus(context, "Connection Established");
						var fullResponse = JSON.parse(xhr.response);
						console.log("getSources response: "+xhr.response);

                        if (fullResponse.result.success == 0 ) {
                            var sources = settings.sources = fullResponse.result.response;
                            var arrayLength = sources.length;
                            for (var i = 0; i < arrayLength; i++) {
                                console.log("source #"+(i+1))
                                console.log("id:" + sources[i].id);
                                console.log("Name:" + sources[i].Name);
                                console.log("HSize:"+ sources[i].HSize);
                                console.log("VSize:"+ sources[i].VSize);
                                console.log("SrcType:"+ sources[i].SrcType);
                                console.log("InputCfgIndex:"+ sources[i].InputCfgIndex);
                                console.log("StillIndex:"+ sources[i].StillIndex);
                                console.log("DestIndex:"+ sources[i].DestIndex);
                                console.log("UserKeyIndex:"+ sources[i].UserKeyIndex);
                                console.log("Mode3D:"+ sources[i].Mode3D);
                                console.log("Freeze:"+ sources[i].Freeze);
                                console.log("Capacity:"+ sources[i].Capacity);
                                console.log("InputCfgVideoStatus:"+ sources[i].InputCfgVideoStatus);
                                console.log("--------------------------------------------------------");
                            }
                        }
					}
					else {
                        console.warn("getSources error: "+xhr.responseText);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.warn("getSources error: "+xhr.responseText);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

		
			var data = JSON.stringify({"params":{"type":0}, "method":"listSources", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.warn("getSources: Invalid IP Address: " + ipAddress);
        }
	},

    getBackgrounds: function( context ) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("getBackgrounds error: settingCache is null!");
            return;
        }

        ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {
		
			var url = "http://"+ipAddress+":9999";
			
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        
                        eventMasterAction.SetStatus(context, "Connection Established");
						var fullResponse = JSON.parse(xhr.response);
						console.log("getBackgrounds response: "+xhr.response);

                        if (fullResponse.result.success == 0 ) {
                            settings.backgrounds = fullResponse.result.response;
                            var arrayLength = settings.backgrounds.length;
                            for (var i = 0; i < arrayLength; i++) {
                                    console.log("source #"+(i+1))
                                    console.log("id:" + settings.backgrounds[i].id);
                                    console.log("Name:" + settings.backgrounds[i].Name);
                                    console.log("HSize:"+ settings.backgrounds[i].HSize);
                                    console.log("VSize:"+ settings.backgrounds[i].VSize);
                                    console.log("SrcType:"+ settings.backgrounds[i].SrcType);
                                    console.log("InputCfgIndex:"+ settings.backgrounds[i].InputCfgIndex);
                                    console.log("StillIndex:"+ settings.backgrounds[i].StillIndex);
                                    console.log("DestIndex:"+ settings.backgrounds[i].DestIndex);
                                    console.log("UserKeyIndex:"+ settings.backgrounds[i].UserKeyIndex);
                                    console.log("Mode3D:"+ settings.backgrounds[i].Mode3D);
                                    console.log("Freeze:"+ settings.backgrounds[i].Freeze);
                                    console.log("Capacity:"+ settings.backgrounds[i].Capacity);
                                    console.log("InputCfgVideoStatus:"+ settings.backgrounds[i].InputCfgVideoStatus);
                                    console.log("--------------------------------------------------------");

                            }
                        }
					}
					else {
                        console.warn("getBackgrounds error: "+xhr.responseText);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.warn("getBackgrounds error: "+xhr.responseText);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

		
			var data = JSON.stringify({"params":{"type":1}, "method":"listSources", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.warn("getBackgrounds: Invalid IP Address: " + ipAddress);
        }
	},

	getDestinations: function (context) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("getDestinations error: settingCache is null!");
            return;
        }

        ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {
		
			var url = "http://"+ipAddress+":9999";

			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        eventMasterAction.SetStatus(context, "Connection Established");

                        // Grab the content info..
                        var fullResponse = JSON.parse(xhr.response);
                        
                        console.log("getDestinations response: "+xhr.response);

                        if (fullResponse.result.success == 0 ) {
                            
                            var screendestinations = settings.screenDestinations = fullResponse.result.response.ScreenDestination;
                            var arrayLength = settings.screenDestinations.length;
                            for (var i = 0; i < arrayLength; i++) {
                                    console.log("screen destinations #"+(i+1));
                                    console.log("  id:" + screendestinations[i].id);
                                    console.log("  Name:" + screendestinations[i].Name);
                                    console.log("  HSize:"+ screendestinations[i].HSize);
                                    console.log("  VSize:"+ screendestinations[i].VSize);
                                    console.log("  Layers:"+ screendestinations[i].Layers);
                                    console.log("  OutMapColl:");
                                    var outMapCol = screendestinations[i].DestOutMapCol;
                                    var outMap = outMapCol.DestOutMap;
                                    for (var j= 0; j < outMap.length; j++) {
                                        console.log("  DestOutMap #:"+(j+1));
                                        console.log("    id:" + outMap[j].id);
                                        console.log("    Name:" + outMap[j].Name);
                                        console.log("    HPos:"+ outMap[j].HPos);
                                        console.log("    VPos:"+ outMap[j].VPos);
                                        console.log("    HSize:"+ outMap[j].HSize);
                                        console.log("    VSize:"+ outMap[j].VSize);
                                        console.log("    Freeze:"+ outMap[j].Freeze);
                                    }
                            }
                            
                            console.log("AuxDestination:");
                            var auxDestinations = settings.auxDestinations = fullResponse.result.response.AuxDestination;
                            for (var i = 0; i < settings.auxDestinations.length; i++) {
                                console.log("  AuxDestination #:"+(i+1));
                                console.log("    id:" + auxDestinations[i].id);
                                console.log("    Name: "+ auxDestinations[i].Name)
                                console.log("    AuxStreamMode:" + auxDestinations[i].AuxStreamMode);

                            }
                                    
                            console.log("--------------------------------------------------------");

                        }
					}
					else {
                        console.warn("getDestinations error: "+xhr.responseText);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.warn("getDestinations error: "+xhr.responseText);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

			var data = JSON.stringify({"params":{"id":"0"}, "method":"listDestinations", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.warn("getDestinations: Invalid IP Address: " + ipAddress);
        }
	
    },

    /**
     * Multi-Operator Mode:
     * – New parameters are introduced to work with multi-operator mode along with the above parameters.
     * – These parameters are used only when one or more operators are enabled.
     * – params: {"presetName": "NewPreset", "operatorId": y} (for normal operator)
     *       “operatorId”— operator index (For current release only 0, 1, 2 are valid indexes). 
             
              If user wants to use “super-operator” mode, its password is required which is passed as a parameter.
                – params: {"presetName": "NewPreset", "password": "xyz"} (for super operator)
                "password"— Super user password saved. When this is passed, actions will be performed as if no operator is enabled
     **/
    getOperators: function (context) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("getPresets error: settingCache is null!");
            return;
        }

        
        ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {
		
			var url = "http://"+ipAddress+":9999";

			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        eventMasterAction.SetStatus(context, "Connection Established");

                        // Grab the content info..
                        var fullResponse = JSON.parse(xhr.response);
                        
                        console.log("getOperators response: "+xhr.response);

                        if (fullResponse.result.success == 0 ) {
                            var operators = fullResponse.result.response;
                            settings.operators = operators;
  
                            if( operators ) {

                                var arrayLength = operators.length;
                                for (var i = 0; i < arrayLength; i++) {
                                        console.log("adding operator #"+(i+1));
                                        console.log("  id:" + operators[i].id);
                                        console.log("  Name:" + operators[i].Name);
                                        console.log("  Enable:" + operators[i].Enable)
                                        console.log("  StartRange:" + operators[i].StartRange);
                                        console.log("  EndRange:" + operators[i].StartRange);
                                        console.log("  InvertColor:"+ operators[i].InvertColor);
                                        console.log("  DestCollection"+ operators[i].DestCollection);
                                }
                                        
                                console.log("--------------------------------------------------------");
                            }
                            else{
                                console.error("getOperators error: system returned empty operator list");
                                settings.operators = null;
                            }
                        }
					}
					else {
                        console.error("getOperators error: "+xhr.responseText);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.warn("getOperators error: "+xhr.responseText);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

			var data = JSON.stringify({"params":{}, "method":"listOperators", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.warn("getOperators: Invalid IP Address: " + ipAddress);
        }
	
	},
    
    getPresets: function (context) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("getPresets error: settingCache is null!");
            return;
        }

        ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {
		
			var url = "http://"+ipAddress+":9999";

			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        eventMasterAction.SetStatus(context, "Connection Established");

                        // Grab the content info..
                        var fullResponse = JSON.parse(xhr.response);
                        
                        console.log("getPresets response: "+xhr.response);

                        if (fullResponse.result.success == 0 ) {
                            
                            var presets = settings.presets = fullResponse.result.response;
                            var arrayLength = settings.presets.length;
                            for (var i = 0; i < arrayLength; i++) {
                                console.log("preset #"+(i+1));
                                console.log("  id:" + presets[i].id);
                                console.log("  Name:" + presets[i].Name);
                                console.log("  LockMode:"+ presets[i].LockMode);
                                console.log("  Preset Number"+ presets[i].presetSno);
                            }
                                    
                            console.log("--------------------------------------------------------");

                        }
					}
					else {
                        console.error("getPresets error: "+xhr.responseText);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.warn("getPresets error: "+xhr.responseText);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

			var data = JSON.stringify({"params":{}, "method":"listPresets", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.warn("getPresets: Invalid IP Address: " + ipAddress);
        }
	
	},

    
    getCues: function (context) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("getPresets error: settingCache is null!");
            return;
        }

        ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {
		
			var url = "http://"+ipAddress+":9999";

			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        eventMasterAction.SetStatus(context, "Connection Established");

                        // Grab the content info..
                        var fullResponse = JSON.parse(xhr.response);
                        
                        console.log("getCues response: "+xhr.response);

                        if (fullResponse.result.success == 0 ) {
                            
                            var cues = settings.cues = fullResponse.result.response;
                            var arrayLength = settings.cues.length;
                            for (var i = 0; i < arrayLength; i++) {
                                console.log("cue #"+(i+1));
                                console.log("  id:" + cues[i].id);
                                console.log("  Name:" + cues[i].Name);
                                console.log("  LockMode:"+ cues[i].LockMode);
                                console.log("  Cue Number"+ cues[i].cueSerialNo);
                            }
                                    
                            console.log("--------------------------------------------------------");

                        }
					}
					else {
                        console.warn("getCues error: "+xhr.responseText);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.warn("getCues error: "+xhr.responseText);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

			var data = JSON.stringify({"params":{}, "method":"listCues", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.warn("getCues: Invalid IP Address: " + ipAddress);
        }
	
    },

    changeContent: function(context, content) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("changeContent error: settingCache is null!");
            return;
        }

        
        if( isValidIp( ipAddress ) ) {
    
            var url = "http://"+ipAddress+":9999";

            var xhr = new XMLHttpRequest();
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-type", "application/json");

            xhr.onload = function (e) { 
                if (xhr.readyState === 4 ) {
                    if( xhr.status === 200) {
                        eventMasterAction.SetStatus(context, "Connection Established");					

                        var fullResponse = JSON.parse(xhr.response);
                        console.log("changeContent response: "+xhr.response);

                        if (fullResponse.result.success == 0 ) {

                        }
                    }
                    else {
                        console.error("changeContent error: "+xhr.responseText);
                    }
                }
            };

            xhr.onerror = function (e) {
                console.error("changeContent error: "+xhr.responseText);
            };
    
            var data = JSON.stringify({"params": content, "method":"changeContent", "id":"1234", "jsonrpc":"2.0"});

            xhr.send(data);
            console.log("sent: "+data);
        }
        else{
            console.warn("changeContent: Invalid IP Address: " + ipAddress);
        }
    },

    changeAuxContent: function(context, content) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("changeContent error: settingCache is null!");
            return;
        }

        
        if( isValidIp( ipAddress ) ) {
    
            var url = "http://"+ipAddress+":9999";

            var xhr = new XMLHttpRequest();
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-type", "application/json");

            xhr.onload = function (e) { 
                if (xhr.readyState === 4 ) {
                    if( xhr.status === 200) {
                        eventMasterAction.SetStatus(context, "Connection Established");					

                        var fullResponse = JSON.parse(xhr.response);
                        console.log("changeAuxContent response: "+xhr.response);

                        if (fullResponse.result.success == 0 ) {

                        }
                    }
                    else {
                        console.error("changeAuxContent error: "+xhr.responseText);
                    }
                }
            };

            xhr.onerror = function (e) {
                console.error("changeAuxContent error: "+xhr.responseText);
            };
    
            var data = JSON.stringify({"params": content, "method":"changeAuxContent", "id":"1234", "jsonrpc":"2.0"});

            xhr.send(data);
            console.log("sent: "+data);
        }
        else{
            console.warn("changeAuxContent: Invalid IP Address: " + ipAddress);
        }
    },

    cutLayer: function( context ) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            return;
        }

        if( settings.cutLayer &&
            ( settings.cutLayer.destInfo && settings.cutLayer.destInfo.id != -1 ) &&
            ( settings.cutLayer.srcInfo && settings.cutLayer.srcInfo.id != -1 ) &&
            ( settings.cutLayer.layerInfo && settings.cutLayer.layerInfo.id != -1 ) ) {
                
            // Look for the layer Id in the destationContents..
            // Check to see whether it is a mix layer
            // if so, check the flag of whether that layer is on preview / program and choose the layer based
            // on the layerMode (preview or program)

            var layerId = -1;
            var destId = settings.cutLayer.destInfo.id;
            if( settings.destinationContents ) {
                for( var i=0; i<settings.destinationContents[destId].Layers.length; i++) {
                    if (settings.destinationContents[destId].Layers[i].id == settings.cutLayer.layerInfo.id ) {
                        var layerName = settings.destinationContents[destId].Layers[i].Name;
                        var onProgram = settings.destinationContents[destId].Layers[i].PgmMode;
                        var onPreview = settings.destinationContents[destId].Layers[i].PvwMode;

                        
                        // If a mix layer 
                        if( layerName.includes ("-A")){
                            // if intended for PVW
                            if( settings.cutLayer.layerMode == 0 ) {
                                
                                
                                if(!onProgram && !onPreview) {
                                    layerId = settings.destinationContents[destId].Layers[i].id;
                                 }
                                 else if( onProgram ) {
                                    layerId = settings.destinationContents[destId].Layers[i].id+1;
                                 }
                                else if( onPreview ) {
                                    layerId = settings.destinationContents[destId].Layers[i].id;
                                }
                                console.log("cutLayer Mix to PVW: LayerId="+layerId+" LayerName="+layerName);
                            }
                            // or is it intended for PGM
                            else if( settings.cutLayer.layerMode == 1) {
                                if(!onProgram && !onPreview) {
                                    layerId = settings.destinationContents[destId].Layers[i].id;
                                }
                                else if( onProgram ) {
                                    layerId = settings.destinationContents[destId].Layers[i].id;
                                }
                                else if( onPreview ) {
                                    layerId = settings.destinationContents[destId].Layers[i].id+1;
                                }
                                console.log("cutLayer Mix to PGM: LayerId="+layerId+" LayerName="+layerName);
                            }
                        }
                        // a non mixing layer
                        else {
                            // nothing to do with non mix layers.
                            layerId = settings.cutLayer.layerInfo.id;
                            console.log("cutLayer SL to PGM: LayerId="+layerId+" LayerName="+layerName);

                        }

                        // break out of the loops.
                        break;
                    }
                }
            }

            var layers;

            //PGM
            if( settings.cutLayer.layerMode == 1 )   {
                layers = [{ "id": parseInt(layerId), "LastSrcIdx": parseInt(settings.cutLayer.srcInfo.id),  "PgmMode":1 }];
            }
                
            //PVW
            else {
                layers = [{ "id": parseInt(layerId), "LastSrcIdx": parseInt(settings.cutLayer.srcInfo.id), "PvwMode": 1 }];
            }
                
            var content = {"id": parseInt(settings.cutLayer.destInfo.id), "Layers": layers};

            this.changeContent(context, content);
        }
        else {
            console.error( "Error: cutLayer() is missing some data! " + settings.cutLayer );
        }
    },

    cutAux: function( context ) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            return;
        }

        if( settings.cutAux &&
            ( settings.cutAux.destInfo && settings.cutAux.destInfo.id != -1 ) &&
            ( settings.cutAux.srcInfo && settings.cutAux.srcInfo.id != -1 ) ) {
                
            var PvwLastSrcIndex = -1;
            var PgmLastSrcIndex = -1;
            var content;

            if (settings.cutAux.auxMode == 0) {
                content = { "id": parseInt(settings.cutAux.destInfo.id), "PvwLastSrcIndex":parseInt(settings.cutAux.srcInfo.id)};
            }
                
            else {
                content = { "id": parseInt(settings.cutAux.destInfo.id), "PgmLastSrcIndex":parseInt(settings.cutAux.srcInfo.id)};
            }

            this.changeAuxContent(context, content);
        }
        else {
            console.error( "Error: cutAux() is missing some data! " + settings.cutAux );
        }
    },
    
	listContent: function( context, destinationId ) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("listContent error: settingCache is null!");
            return;
        }

        var ipAddress = settings.ipAddress;
		if( ipAddress && isValidIp( ipAddress ) ) {		
			var url = "http://"+ipAddress+":9999";

			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        eventMasterAction.SetStatus(context, "Connection Established");					
                        var fullResponse = JSON.parse(xhr.response);
                        console.log("listContent response: "+xhr.response);

                        if (fullResponse.result.success == 0 ) {
                            if( settings.destinationContents == null )
                                settings.destinationContents = [];

                            settings.destinationContents[destinationId] = fullResponse.result.response;
                            var destContent= fullResponse.result.response;
                             
                            console.log("dest Content");
                            console.log("  id:" + destContent.id);
                            console.log("  Name:" + destContent.Name);
                    
                            var transitions = destContent.Transition;
                            for (var i = 0; i < transitions.length; i++) {
                                console.log("   Transition #"+(i+1));
                                console.log("     id:"+transitions[i].id);
                                console.log("     TransTime:"+transitions[i].TransTime);
                                console.log("     TransPos:"+transitions[i].TransPos);
                            }
                            
                            var bGLayers = destContent.BGLyr;
                            for (var i = 0; i < bGLayers.length; i++) {
                                console.log("BGLayer #"+(i+1));
                                console.log("   id:" + bGLayers[i].id);
                                console.log("   LastBGSourceIndex:" + bGLayers[i].LastBGSourceIndex);
                                console.log("   BGShowMatte:" + bGLayers[i].BGShowMatte);
                                
                                var bGColors = bGLayers[i].BGColor;
                                for (var j = 0; j < bGColors.length; j++) {
                                    console.log("BGColor #"+(j+1));
                                    console.log("   id:" + bGColors[j].id);
                                    console.log("   Red:" + bGColors[j].Red);
                                    console.log("   Green:" + bGColors[j].Green);
                                    console.log("   Blue:" + bGColors[j].Blue);
                                }
                            }

                            var layers = destContent.Layers;
                            for (var i = 0; i < layers.length; i++) {
                                console.log("Layer #"+(i+1));
                                console.log("   id:" + layers[i].id);
                                console.log("   Name:"+ layers[i].Name);
                                console.log("   LastSrcIdx:" + layers[i].LastSrcIdx);
                                console.log("   PvwMode:" + layers[i].PvwMode);
                                console.log("   PgmMode:" + layers[i].PgmMode);
                                console.log("   Capacity:" + layers[i].Capacity);
                                console.log("   PvwZOrder:" + layers[i].PvwZOrder);
                                console.log("   PgmZOrder:" + layers[i].PgmZOrder);

                                var windows = layers[i].Window;
                                for (var j = 0; j < windows.length; j++) {
                                    console.log("   Window #:"+(j+1));
                                    console.log("     HPos:" + windows[j].HPos);
                                    console.log("     VPos:" + windows[j].VPos);
                                    console.log("     HSize:" + windows[j].HSize);
                                    console.log("     VSize:" + windows[j].VSize);
                                }

                                var masks = layers[i].Mask;
                                for (var j = 0; j < masks.length; j++) {
                                    console.log("   Mask #"+(j+1));
                                    console.log("   	id:"+masks[j].id);
                                    console.log("   	Top:"+masks[j].Top);
                                    console.log("   	Left:"+masks[j].Left);
                                    console.log("   	Right:"+masks[j].Right);
                                    console.log("   	Bottom:"+masks[j].Bottom);
                                }
                                
                            }								

                            console.log("--------------------------------------------------------");
                            console.log("checking pendingAction state..");
                            
                            if( settings["pendingCutAction"] &&
                                settings["pendingCutAction"].action ==  "com.barco.eventmaster.cutlayer" && 
                                settings["pendingCutAction"].destId == destinationId ) {
                                
                                console.log("pendingCutLayer");
                                
                                settings["pendingCutAction"]="";
                                EventMasterRPC.cutLayer(context);
                                
                            }
                            if( settings["pendingCutAuxAction"] &&
                                settings["pendingCutAuxAction"].action ==  "com.barco.eventmaster.cutaux" && 
                                settings["pendingCutAuxAction"].destId == destinationId ) {

                                console.log("pendingCutAux");
                                
                                settings["pendingCutAuxAction"]="";
                                EventMasterRPC.cutAux(context);
                            }
                        }
					}
					else {
                        console.warn("listContent error: "+xhr.responseText);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.warn("listContent error: "+xhr.responseText);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

			var data = JSON.stringify({"params":{"id":destinationId}, "method":"listContent", "id":"1234", "jsonrpc":"2.0"});

			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.warn("listContent: Invalid IP Address: " + ipAddress);
        }
    },
    


	getAllDestinationContent: function(context) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            return;
        }

        if( settings["screenDestinations"] != null ){
            destList = settings["screenDestinations"];
            if( destList.length==0)
                console.log("getAllDestinationContent:  There are no destinations in the settings");
                
            for(var i=0; i<destList.length; i++ ) {
				this.listContent(context, destList[i].id);
            }
        }
    },

    getFrameSettings: function(context ){
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            return;
        }
         
        
        var ipAddress = settings.ipAddress;
        if( ipAddress && isValidIp( ipAddress ) ) {
    
            var url = "http://"+ipAddress+":9999";

            var xhr = new XMLHttpRequest();
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-type", "application/json");

            xhr.onload = function (e) { 
                if (xhr.readyState === 4 ) {
                    if( xhr.status === 200) {
                        eventMasterAction.SetStatus(context, "Connection Established");					

                        var fullResponse = JSON.parse(xhr.response);
                        console.log("getFrameSettings response: "+xhr.response);

                            if ( fullResponse.result.success == 0 ) {
                                console.log("getFrameSettings response: "+xhr.response);
                                settings.frameSettings = fullResponse.result.response;
                            }
                            else if( fullResponse.result.error ) {
                                console.error("getFrameSettings error: "+fullResponse.result.error);        
                            }
                    }
                    else {
                        console.error("getFrameSettings error: "+xhr.responseText);
                    }
                }
            };

            xhr.onerror = function (e) {
                console.error("getFrameSettings error: "+xhr.responseText);
            };
    
            var data = JSON.stringify({"params":{}, "method":"getFrameSettings", "id":"1234", "jsonrpc":"2.0"});

            xhr.send(data);
            console.log("sent: "+data);
        }
        else {
             console.warn("getFrameSettings: Invalid IP Address: " + ipAddress);
        }
    },

    resetSourceBackup: function( context ) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            return;
        }

        if( settings.resetSourceBackup &&
            ( settings.resetSourceBackup.srcInfo && settings.resetSourceBackup.srcInfo.id != -1 ) ) {
            content = { "id": parseInt(settings.resetSourceBackup.srcInfo.id) };
          
        }
        else {
            console.error( "Error: resetSourceBackup() is missing some data! " + settings.resetSourceBackup );
            return;
        }

        
        if( isValidIp( ipAddress ) ) {
    
            var url = "http://"+ipAddress+":9999";

            var xhr = new XMLHttpRequest();
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-type", "application/json");

            xhr.onload = function (e) { 
                if (xhr.readyState === 4 ) {
                    if( xhr.status === 200) {
                        eventMasterAction.SetStatus(context, "Connection Established");					

                        var fullResponse = JSON.parse(xhr.response);
                        console.log("resetSourceBackup response: "+xhr.response);

                        if (fullResponse.result.success == 0 ) {

                        }
                        else if( fullResponse.result.error ) {
                            console.error("resetSourceBackup error: "+fullResponse.result.error);        
                        }
                    }
                    else {
                        console.error("resetSourceBackup error: "+xhr.responseText);
                    }
                }
            };

            xhr.onerror = function (e) {
                console.error("resetSourceBackup error: "+xhr.responseText);
            };
    
            var data = JSON.stringify({"params":content, "method":"resetSourceMainBackup", "id":"1234", "jsonrpc":"2.0"});

            xhr.send(data);
            console.log("sent: "+data);
        }
        else{
            console.warn("resetSourceBackup: Invalid IP Address: " + ipAddress);
        }
    },

    mvrLayoutChange(context) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            return;
        }
        var content = "";

        if( settings.mvrLayoutChange ) {
            content = {"frameUnitId":settings.mvrLayoutChange.frameUnitId, "mvrLayoutId": parseInt(settings.mvrLayoutChange.mvrLayoutId)-1};
        }
        else {
            console.error( "Error: mvrLayoutChange() is missing some data! " + settings.mvrLayoutChange );
            return;
        }

        
        if( isValidIp( ipAddress ) ) {
    
            var url = "http://"+ipAddress+":9999";

            var xhr = new XMLHttpRequest();
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-type", "application/json");

            xhr.onload = function (e) { 
                if (xhr.readyState === 4 ) {
                    if( xhr.status === 200) {
                        eventMasterAction.SetStatus(context, "Connection Established");					

                        var fullResponse = JSON.parse(xhr.response);
                        console.log("mvrLayoutChange response: "+xhr.response);

                        if (fullResponse.result.success == 0 ) {

                        }
                        else if( fullResponse.result.error ) {
                            console.error("mvrLayoutChange error: "+fullResponse.result.error);        
                        }
                }
                    else {
                        console.error("mvrLayoutChange error: "+xhr.responseText);
                    }
                }
            };

            xhr.onerror = function (e) {
                console.error("mvrLayoutChange error: "+xhr.responseText);
            };
    
            var data = JSON.stringify({"params": content, "method":"mvrLayoutChange", "id":"1234", "jsonrpc":"2.0"});

            xhr.send(data);
            console.log("sent: "+data);
        }
        else{
            console.warn("mvrLayoutChange: Invalid IP Address: " + ipAddress);
        }
    },
    
    updateCache: function(context, action) {
    
        this.getFrameSettings(context);
        this.getDestinations(context);
        this.getInputs(context);
        this.getSources(context);
        this.getBackgrounds(context);
        this.getAllDestinationContent(context);
        this.getPresets(context);
        this.getCues(context);
        this.getOperators(context);
       
        var settings = settingsCache[context];

        if( settings != null ) {

            var pathToFile = null;
                         
            if ( action == "com.barco.eventmaster.recallpreset"){
                if(settings.activatePreset != null ) {
                    
                    if( settings.activatePreset.presetMode == 0 ){
                        pathToFile = "images/activatePresetDefaultImage-PVW.png"    
                    } 
                    else {
                        pathToFile = "images/activatePresetDefaultImage.png"    
                    }
                }
            }
            else if( action == "com.barco.eventmaster.cutlayer") {
                if(settings.cutLayer != null  ) {
                    if( settings.cutLayer.layerMode == 0 ){
                        pathToFile = "images/cutLayerDefaultImage-PVW.png"    
                    } 
                    else {
                        pathToFile = "images/cutLayerDefaultImage.png"    
                    }
                }
            }
            else if( action == "com.barco.eventmaster.cutaux") {
                if(settings.cutAux != null  ) {
                   //PVW
                   if( settings.cutAux.auxMode == 0 ){
                        pathToFile = "images/cutAuxDefaultImage-PVW.png"    
                    } 
                    else {
                        pathToFile = "images/cutAuxDefaultImage.png"    
                    }
                }
            }
            else if( action == "com.barco.eventmaster.recallcue")
            {
                if(settings.activateCue != null  ) {
                    //play
                    if( settings.activateCue.cueMode == 0 ){
                         pathToFile = "images/activateCueDefaultImage.png"    
                     } 
                     else if (settings.activateCue.cueMode == 1 ) {
                         pathToFile = "images/activateCueDefaultImage-Pause.png"    
                     }
                     else if (settings.activateCue.cueMode == 2 ) {
                        pathToFile = "images/activateCueDefaultImage-Stop.png"    
                    }
                 }
            }

            if( pathToFile != null )
                eventMasterAction.loadAndSetImage(context, pathToFile) 
        }
	},
};


var eventMasterAction = {

    testEventMasterConnection: function ( context ) {

        if( isEmpty(settingsCache) )
            return;
        
        EventMasterRPC.powerStatus(context);
    },

    onPropertyInspectorDidAppear: function (action, context, settings ) {
        // send notification to property_inspector to load saved settings
        if( settingsCache != null && !isEmpty(settingsCache[context]) )  {

            EventMasterRPC.updateCache(context, action);            
            var json = {
                "event": "sendToPropertyInspector",
                "context": context,
                "payload": settingsCache[context]
            };

            websocket.send(JSON.stringify(json))
        }
    },

    onPropertyInspectorDidDisappear: function (action, context, settings ) {
       this.setSettings(context);
    },
    
    onKeyDown: function (action, context, settings, coordinates, userDesiredState) {
        var settings = settingsCache[context];
        if( settings ) {
            
            if( action == "com.barco.eventmaster.alltrans" ) {
                EventMasterRPC.allTrans(context);
            }
            else if (action == "com.barco.eventmaster.cut") {
                EventMasterRPC.cut(context);
            }
            else if (action == "com.barco.eventmaster.recallnextpreset") {
                EventMasterRPC.recallNextPreset(context);
            }
            else if (action == "com.barco.eventmaster.recallpreset") {
                EventMasterRPC.activatePreset(context);
            }
            else if (action == "com.barco.eventmaster.recallcue"){
                EventMasterRPC.activateCue(context);
            }   
            else if (action == "com.barco.eventmaster.freeze"){
                EventMasterRPC.freeze(context);
            }    
            else if (action == "com.barco.eventmaster.unfreeze"){
                EventMasterRPC.unfreeze(context);
            } 
            else if( action == "com.barco.eventmaster.cutlayer") {
                // set pending flag - we need current content's state but it is async so must wait for the
                // return of listContents to know which mix layer is on PGM or PVW
                EventMasterRPC.getAllDestinationContent(context);
                console.log("Qeueing pendingCutLayer");
 
                if( settings.cutLayer &&
                    ( settings.cutLayer.destInfo && settings.cutLayer.destInfo.id != -1 ) &&
                    ( settings.cutLayer.srcInfo && settings.cutLayer.srcInfo.id != -1 ) &&
                    ( settings.cutLayer.layerInfo && settings.cutLayer.layerInfo.id != -1 ) ) {
                        
                    // Look for the layer Id in the destationContents..
                    // Check to see whether it is a mix layer
                    // if so, check the flag of whether that layer is on preview / program and choose the layer based
                    // on the layerMode (preview or program)
        
                    var layerId = -1;
                    var destId = settings.cutLayer.destInfo.id;
                    var pendingCutLayerAction = {"action":action,"destId":destId}; 

                    settings["pendingCutAction"] = pendingCutLayerAction;;
                }
            }
            else if( action == "com.barco.eventmaster.cutaux") {
                EventMasterRPC.getAllDestinationContent(context);
                console.log("Qeueing pendingCutAux");

                if( settings.cutAux &&
                    ( settings.cutAux.destInfo && settings.cutAux.destInfo.id != -1 ) &&
                    ( settings.cutAux.srcInfo && settings.cutAux.srcInfo.id != -1 ) &&
                    ( settings.cutAux.layerInfo && settings.cutAux.layerInfo.id != -1 ) ) {
                        
                    // Look for the layer Id in the destationContents..
                    // Check to see whether it is a mix layer
                    // if so, check the flag of whether that layer is on preview / program and choose the layer based
                    // on the layerMode (preview or program)
        
                    var layerId = -1;
                    var destId = settings.cutAux.destInfo.id;
                    var pendingCutAuxAction = {"action":action,"destId":destId}; 

                    settings["pendingCutAuxAction"] = pendingCutAuxAction;
                }
            }
            else if( action == "com.barco.eventmaster.resetsourcebackup" ) {
                EventMasterRPC.resetSourceBackup(context);
            }
            else if( action == "com.barco.eventmaster.mvrlayoutchange" ){
                EventMasterRPC.mvrLayoutChange(context);
            }
        }
    },
    
    onKeyUp: function (action, context, settings, coordinates, userDesiredState) {
        //  empty function
    },

   
    onWillAppear: function (action, context, settings, coordinates) {
        if(settings != null ){
            settingsCache[context] = settings;
        }
        settings["pendingCutAction"]=""
        settings["pendingCutAuxAction"]=""
        
        this.getSettings(context);
    },

    onWillDisappear: function (action, context, settings, coordinates) {
        this.setSettings(context);
    },

    // property inspector saved the settings.
    // should pull out the settings
    // But we are using SendToPlugin to do this.
    //
    // An Actions persistence is handled in the onwillappear/disappear
    // and nowhere else.
    onDidReceiveSettings: function (action, context, settings) {
      this.settingsChanged( action, context, settings)
    },

    settingsChanged: function( action, context, settings ){

        settingsCache[context] = settings;

        EventMasterRPC.updateCache(context, action);
                
        // This will trigger a set setting command (to disk), the propertyinspector will keep the UX up to date
        this.testEventMasterConnection( context );

    },

    getSettings: function (context) {
        var json = {
            "event": "getSettings",
            "context": context,
        };
    
        websocket.send(JSON.stringify(json));
    },

    setSettings: function (context) {
        var settings = settingsCache[context];
        if( settings ) {
        
            var json = {
                "event": "setSettings",
                "context": context,
                "payload": settingsCache[context]
            };
    
            websocket.send(JSON.stringify(json));
        }    
    },

    SetStatus: function (context, status) {
        var settings = settingsCache[context];
        if( settings ) {
            settings.status = status;
            
        
            var json = {
                "event": "sendToPropertyInspector",
                "context": context,
                "payload": settingsCache[context]
            };
        
            websocket.send(JSON.stringify(json));
        }
    },

    setImage: function (context, imgData) {

        var json = {
            'event': 'setImage',
            'context': context,
            'payload': {
                'image': imgData,
                'target': DestinationEnum.HARDWARE_AND_SOFTWARE
            }
        }
        websocket.send(JSON.stringify(json));
    },

    logMessage: function( context, messageStr, errorLevel ) {
     
        if (errorLevel == 1 ) {
            errorLevelStr = "ERROR";
            textStr = "Event Master ["+context+"]["+errorLevelStr+"]"+messageStr
            console.error(textStr);
        }
        else if (errorLevel == 2 ) {
            errorLevelStr = "WARN";
            textStr = "Event Master ["+context+"]["+errorLevelStr+"]"+messageStr
            console.error(textStr);
        }
        else {
            errorLevelStr = "INFO";
            textStr = "Event Master ["+context+"]["+errorLevelStr+"]"+messageStr
            console.log(textStr);
        }

        if( debug == true || errorLevel == 1) {
            var json = {
                'event': 'logMessage',
                'payload': {
                    'mesage': textStr,
                }
            }
            websocket.send(JSON.stringify(json));
        }
    },
        
        

    loadAndSetImage: function (context, imageNameOrArr) {
    
        this.loadImage(imageNameOrArr, function (data) {
            var json = {
                'event': 'setImage',
                'context': context,
                'payload': {
                    'image': data,
                    'target': DestinationEnum.HARDWARE_AND_SOFTWARE
                }
            };
            websocket.send(JSON.stringify(json));
        });
    },

    loadImage: function (inUrl, callback, inCanvas, inFillcolor) {
        /** Convert to array, so we may load multiple images at once */
        const aUrl = !Array.isArray(inUrl) ? [inUrl] : inUrl;
        const canvas = inCanvas && inCanvas instanceof HTMLCanvasElement
            ? inCanvas
            : document.createElement('canvas');
        var imgCount = aUrl.length - 1;
        const imgCache = {};
    
        var ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';
    
        for (let url of aUrl) {
            let image = new Image();
            let cnt = imgCount;
            let w = 144, h = 144;
    
            image.onload = function () {
                imgCache[url] = this;
                // look at the size of the first image
                if (url === aUrl[0]) {
                    canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
                    canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size
                }
                // if (Object.keys(imgCache).length == aUrl.length) {
                if (cnt < 1) {
                    if (inFillcolor) {
                        ctx.fillStyle = inFillcolor;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }
                    // draw in the proper sequence FIFO
                    aUrl.forEach(e => {
                        if (!imgCache[e]) {
                            console.warn(imgCache[e], imgCache);
                        }
    
                        if (imgCache[e]) {
                            ctx.drawImage(imgCache[e], 0, 0);
                            ctx.save();
                        }
                    });
    
                    callback(canvas.toDataURL('image/png'));
                    // or to get raw image data
                    // callback && callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));
                }
            };
    
            imgCount--;
            image.src = url;
        }
    },
};

    

function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo)
{
    pluginUUID = inPluginUUID
    
    // Open the web socket
    websocket = new WebSocket("ws://localhost:" + inPort);
    
    function registerPlugin(inPluginUUID)
    {
        var json = {
            "event": inRegisterEvent,
            "uuid": inPluginUUID
        };
    
        websocket.send(JSON.stringify(json));
    };
    
    websocket.onopen = function()
    {
        // WebSocket is connected, send message
        registerPlugin(pluginUUID);
    };
    websocket.onmessage = function (evt)
    { 
        // Received message from Stream Deck
        var jsonObj = JSON.parse(evt.data);
        var event = jsonObj['event'];
        var action = jsonObj['action'];
        var context = jsonObj['context'];
        var device = jsonObj['device'];
        var jsonPayload = jsonObj['payload'] || {};

        
        if(event == "keyDown") {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];
            var userDesiredState = jsonPayload['userDesiredState'];
            
            eventMasterAction.onKeyDown(action, context, settings, coordinates, userDesiredState);
        }
        else if(event == "keyUp") {
            EventMasterRPC.getAllDestinationContent(context);

            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];
            var userDesiredState = jsonPayload['userDesiredState'];
            
            eventMasterAction.onKeyUp(action, context, settings, coordinates, userDesiredState);
        }
        else if(event == "willAppear") {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];
            
            eventMasterAction.onWillAppear(action, context, settings, coordinates);
        }
        else if(event == "willDisappear") {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];
            
            eventMasterAction.onWillDisappear(action, context, settings, coordinates);
        }
        else if (event == "propertyInspectorDidAppear")  {
            EventMasterRPC.getAllDestinationContent(context);

            var settings = jsonPayload['settings'];
            
            eventMasterAction.onPropertyInspectorDidAppear(action, context, settings );
        }
        else if (event == "propertyInspectorDidDisappear")  {
            var settings = jsonPayload['settings'];
            
            eventMasterAction.onPropertyInspectorDidDisappear(action, context, settings );
        }
        else if (event == "didReceiveSettings")  {
            var settings = jsonPayload['settings'];
            eventMasterAction.onDidReceiveSettings(action, context, settings);        
        }
        
        else if (event == "sendToPlugin") {
            var changed = false;
            var settings = settingsCache[context];
    
            if( settings!=null )
            {
                // event coming from the property inspector..
                if (jsonPayload.hasOwnProperty('ipAddress')) {
    
                    changed = true;
                    settings["ipAddress"] = jsonPayload.ipAddress;
                }
                if( jsonPayload.hasOwnProperty('operator')) {
                    changed=true;
                    settings["operator"] = jsonPayload.operator;
                }
                if (jsonPayload.hasOwnProperty('activatePreset')) {
    
                    changed = true;
                    settings["activatePreset"] = jsonPayload.activatePreset;;
                }
                if (jsonPayload.hasOwnProperty('activateCue')) {
    
                    changed = true;
                    settings["activateCue"] = jsonPayload.activateCue;
                }
                if( jsonPayload.hasOwnProperty('freeze')) {
                    changed = true;
                    settings["freeze"] = jsonPayload.freeze;
                }
                if( jsonPayload.hasOwnProperty('unfreeze')) {
                    changed = true;
                    settings["unfreeze"] = jsonPayload.unfreeze;
                }
                if( jsonPayload.hasOwnProperty('cutLayer')) {
                    changed = true;
                    settings["cutLayer"] = jsonPayload.cutLayer;
                }
                if( jsonPayload.hasOwnProperty('cutAux')) {
                    changed = true;
                    settings["cutAux"] = jsonPayload.cutAux;
                }
                if( jsonPayload.hasOwnProperty('resetSourceBackup')) {
                    changed = true;
                    settings["resetSourceBackup"] = jsonPayload.resetSourceBackup;
                }
                if( jsonPayload.hasOwnProperty('mvrLayoutChange')) {
                    changed = true;
                    settings["mvrLayoutChange"] = jsonPayload.mvrLayoutChange;
                }
                            
                if( changed  ) {
                    settingsCache[context] = settings;
    
                    EventMasterRPC.updateCache(context, action);
                    eventMasterAction.testEventMasterConnection( context );
                }                
            }
        }
    };
    websocket.onclose = function()
    { 
           // Websocket is closed
    };
};
