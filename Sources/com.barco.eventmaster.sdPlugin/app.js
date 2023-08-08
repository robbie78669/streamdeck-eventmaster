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
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage( context, "powerStatus error: settingCache is null!", ERROR_LEVEL.ERROR);
            return;
        }

        var ipAddress = settings.ipAddress;
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
                            eventMasterAction.setStatus(context, "Connection Established");
					}
					else {
                            var txt = "powerStatus: "+xhr.response;
                            eventMasterAction.logMessage(context, txt, ERROR_LEVEL.WARN)
                            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                var txt = "powerStatus: "+xhr.response;
                eventMasterAction.logMessage(context, txt, ERROR_LEVEL.ERROR)
                eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
			};

					
			var data = JSON.stringify({"params": {}, "method":"powerStatus", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);

			var txt = "url: " + url + " sent: "+data;
            eventMasterAction.logMessage(context, txt, ERROR_LEVEL.INFO)
        }
        else{
            var txt = "powerStatus: Invalid IP Address: ";
            eventMasterAction.logMessage(context, txt, ERROR_LEVEL.WARN);
        }
	},


	allTrans: function(context) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage(context,"allTrans error: settingCache is null!", ERROR_LEVEL.ERROR);

            return;
        }

        var ipAddress = settings.ipAddress;

        if( isValidIp(ipAddress ) ) {
			
			var url = "http://"+ipAddress+":9999";
				
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
						
						var fullResponse = JSON.parse(xhr.response);
                        eventMasterAction.logMessage(context,"allTrans response: "+xhr.response, ERROR_LEVEL.INFO);
                        eventMasterAction.setStatus(context, "Connection Established");
					}
					else {
                        eventMasterAction.logMessage(context,"allTrans error: "+xhr.response, ERROR_LEVEL.ERROR);
                        eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"allTrans error: "+xhr.response, ERROR_LEVEL.WARN);
                eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
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
			eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
        }
        else{
            var txt = "powerStatus: Invalid IP Address: ";
            eventMasterAction.logMessage(context, txt, ERROR_LEVEL.WARN)
        }
	},

	
	cut: function(context) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage(context,"cut error: settingCache is null!", ERROR_LEVEL.ERROR);
            return;
        }

        var ipAddress = settings.ipAddress;
        
        if( isValidIp( ipAddress ) ) {
			var url = "http://"+ipAddress+":9999";
				
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
						
						var fullResponse = JSON.parse(xhr.response);
                        eventMasterAction.logMessage(context,"cut response: "+xhr.response, ERROR_LEVEL.INFO);
                        eventMasterAction.setStatus(context, "Connection Established");
					}
					else {
                        eventMasterAction.logMessage(context,"cut error: "+xhr.response, ERROR_LEVEL.WARN);
                        eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"cut error: "+xhr.response, ERROR_LEVEL.WARN);
                eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
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
			eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
        }
        else{
            var txt = "powerStatus: Invalid IP Address: ";
            eventMasterAction.logMessage(context, txt, ERROR_LEVEL.WARN)
        }
	},

	recallNextPreset: function(context) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage(context,"recallNextPreset error: settingCache is null!", ERROR_LEVEL.ERROR);
            return;
        }

        var ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {
			var url = "http://"+ipAddress+":9999";
				
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
						var fullResponse = JSON.parse(xhr.response);
                        eventMasterAction.logMessage(context,"recallNextPreset response: "+xhr.response, ERROR_LEVEL.INFO);
                        eventMasterAction.setStatus(context, "Connection Established");
					}
					else {
                        eventMasterAction.logMessage(context,"recallNextPreset error: "+xhr.response, ERROR_LEVEL.WARN);
                        eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"recallNextPreset error: "+xhr.response, ERROR_LEVEL.WARN);
                eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
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
			eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
        }
        else{
            if( !ipAddress)
                ipAddress="no entry";
            eventMasterAction.logMessage(context,"recallNextPreset: Invalid IP Address: " + ipAddress, ERROR_LEVEL.WARN);
        }
	},

	activatePreset: function(context) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage(context,"activate Preset error: settingCache is null!", ERROR_LEVEL.ERROR);

            return;
        }

        var ipAddress = settings.ipAddress;

        if( isValidIp( ipAddress ) ) {
			var url = "http://"+ipAddress+":9999";
				
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
						
						var fullResponse = JSON.parse(xhr.response);
                        eventMasterAction.logMessage(context,"activatePreset response: "+xhr.response, ERROR_LEVEL.INFO);
                        eventMasterAction.setStatus(context, "Connection Established");
					}
					else {
                        eventMasterAction.logMessage(context,"activatePreset error: "+xhr.response, ERROR_LEVEL.WARN);
                        eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"activatePreset error: "+xhr.response, ERROR_LEVEL.WARN);
                eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
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
                eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
            }
            else{
                eventMasterAction.logMessage(context,"activatePreset: Invalid activePreset data or invalid preset name. ", ERROR_LEVEL.ERROR);
            }    
        }
        else{
            if( !ipAddress)
                ipAddress="no entry";
            eventMasterAction.logMessage(context,"activatePreset: Invalid IP Address: " + ipAddress, ERROR_LEVEL.WARN);
        }
	},

	activateCue: function(context, cueName, cueMode) {
        
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage(context,"activateCue error: settingCache is null!", ERROR_LEVEL.ERROR);

            return;
        }

        var ipAddress = settings.ipAddress;

		if( isValidIp( ipAddress ) ) {
			var url = "http://"+ipAddress+":9999";
				
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        var fullResponse = JSON.parse(xhr.response);
                        eventMasterAction.logMessage(context,"activateCue response: "+xhr.response, ERROR_LEVEL.INFO);
                        eventMasterAction.setStatus(context, "Connection Established");
					}
					else {
                        eventMasterAction.logMessage(context,"activateCue error: "+xhr.response, ERROR_LEVEL.WARN);
                        eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"activateCue error: "+xhr.response, ERROR_LEVEL.WARN);
                eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
			};

            if( settings.activateCue && settings.activateCue.cueName ) {
                var data = JSON.stringify({"params":{"cueName":settings.activateCue.cueName, "type":settings.activateCue.cueMode}, "method":"activateCue", "id":"1234", "jsonrpc":"2.0"});
                xhr.send(data);
                eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
            }
            else {
                eventMasterAction.logMessage(context,"activateCue: Invalid activateCue data or cuename. ", ERROR_LEVEL.ERROR);    
            }
        }
        else{
            if( !ipAddress)
                ipAddress="no entry";
            eventMasterAction.logMessage(context,"activateCue: Invalid IP Address: " + ipAddress, ERROR_LEVEL.WARN);
        }
	},

	freeze: function(context) {
        
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage(context,"freeze error: settingCache is null!", ERROR_LEVEL.ERROR);

            return;
        }

        var ipAddress = settings.ipAddress;

		if( isValidIp( ipAddress ) ) {
			var url = "http://"+ipAddress+":9999";
				
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
						
                        var fullResponse = JSON.parse(xhr.response);
                        eventMasterAction.logMessage(context,"freeze response: "+xhr.response, ERROR_LEVEL.INFO);
                        eventMasterAction.setStatus(context, "Connection Established");
					}
					else {
                        eventMasterAction.logMessage(context,"freeze error: "+xhr.response, ERROR_LEVEL.WARN);
                        eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"freeze error: "+xhr.response, ERROR_LEVEL.WARN);
                eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
			};

            var freeze = settings['freeze'];
            if (freeze ) {

                var id = parseInt(freeze.id);
                var name = freeze.name;
                var type = parseInt(freeze.type);
                
                var data = JSON.stringify({"params":{"id":id, "type": type, "screengroup": 0, "mode":1 /*freeze*/ }, "method":"freezeDestSource", "id":"1234", "jsonrpc":"2.0"});
                xhr.send(data);
                eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
            }
            else{
                eventMasterAction.logMessage(context, "Error: freeze() is missing some data! " + settings.freeze , ERROR_LEVEL.ERROR);
            }
        }
        else{
            if( !ipAddress)
                ipAddress="no entry";
            eventMasterAction.logMessage(context,"freeze: Invalid IP Address: " + ipAddress, ERROR_LEVEL.WARN);
        }
        
	},


    unfreeze: function(context) {
        
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage(context,"unfreeze error: settingCache is null!", ERROR_LEVEL.ERROR);

            return;
        }

        var ipAddress = settings.ipAddress;

		if( isValidIp( ipAddress ) ) {
			var url = "http://"+ipAddress+":9999";
				
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
						
                        var fullResponse = JSON.parse(xhr.response);
                        eventMasterAction.logMessage(context,"unfreeze response: "+xhr.response, ERROR_LEVEL.INFO);
                        eventMasterAction.setStatus(context, "Connection Established");
					}
					else {
                        eventMasterAction.logMessage(context,"unfreeze error: "+xhr.response, ERROR_LEVEL.WARN);
                        eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"unfreeze error: "+xhr.response, ERROR_LEVEL.WARN);
                eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
			};

            var unfreeze = settings['unfreeze'];
            if ( unfreeze ) {

                var id = parseInt(unfreeze.id);
                var name = unfreeze.name;
                var type = parseInt(unfreeze.type);

                var data = JSON.stringify({"params":{"id":id, "type": type, "screengroup": 0, "mode":0 /*unfreeze*/ }, "method":"freezeDestSource", "id":"1234", "jsonrpc":"2.0"});
                xhr.send(data);
                eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
            }
            else{
                eventMasterAction.logMessage(context, "Error: unfreeze() is missing some data! " + settings.unfreeze, ERROR_LEVEL.ERROR );
            }
        }
        else{
            if( !ipAddress)
                ipAddress="no entry";
            eventMasterAction.logMessage(context,"unfreezeDestSource: Invalid IP Address: " + ipAddress, ERROR_LEVEL.WARN);
        }
        
	},

    getInputs: function( context ) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage(context,"getInputs error: settingCache is null!", ERROR_LEVEL.ERROR);
            return;
        }

        var ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {
		
			var url = "http://"+ipAddress+":9999";
			
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        
                        eventMasterAction.setStatus(context, "Connection Established");
						var fullResponse = JSON.parse(xhr.response);
						eventMasterAction.logMessage(context,"getInputs response: "+xhr.response, ERROR_LEVEL.INFO);

                        if (fullResponse.result.success == 0 ) {
                            var inputs = settings.inputs = fullResponse.result.response;
                            var arrayLength = inputs.length;
                            for (var i = 0; i < arrayLength; i++) {
                                eventMasterAction.logMessage(context,"input #"+(i+1), ERROR_LEVEL.INFO)
                                eventMasterAction.logMessage(context,"id:" + inputs[i].id, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"Name:" + inputs[i].Name, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"SyncStatus:" + inputs[i].SyncStatus, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"VideoStatus:" + inputs[i].VideoStatus, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"Format:" + inputs[i].Format, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"ColorSampleBit:" + inputs[i].ColorSampleBit, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"Color_Space:" + inputs[i].Color_Status, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"Colorimetry:" + inputs[i].Colorimetry, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"GammaFx:" + inputs[i].GammaFx, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"ColorDepth:" + inputs[i].ColorDepth, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"Capacity:" + inputs[i].Capacity, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"--------------------------------------------------------");
                            }
                        }
					}
					else {
                        eventMasterAction.logMessage(context,"getInputs error: "+xhr.responseText, ERROR_LEVEL.WARN);
                        eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"getInputs error: "+xhr.responseText, ERROR_LEVEL.WARN);
                eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
			};

		
			var data = JSON.stringify({"params":{"type":0}, "method":"listInputs", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
        }
        else{
            if( !ipAddress)
                ipAddress="no entry";
            eventMasterAction.logMessage(context,"getInputs: Invalid IP Address: " + ipAddress, ERROR_LEVEL.WARN);
        }
	},

    getInputBackups: function( context ) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage(context,"getInputs error: settingCache is null!", ERROR_LEVEL.ERROR);
            return;
        }

        var ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {
		
			var url = "http://"+ipAddress+":9999";
			
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        
                        eventMasterAction.setStatus(context, "Connection Established");
						var fullResponse = JSON.parse(xhr.response);
						eventMasterAction.logMessage(context,"getInputBackups response: "+xhr.response), ERROR_LEVEL.INFO;

                        if (fullResponse.result.success == 0 ) {
                            var inputBackups = settings.inputBackups = fullResponse.result.response;
                            var arrayLength = inputBackups.length;
                            for (var i = 0; i < arrayLength; i++) {
                                eventMasterAction.logMessage(context,"input #"+(i+1), ERROR_LEVEL.INFO)
                                eventMasterAction.logMessage(context,"id:" + inputBackups[i].id, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"Name:" + inputBackups[i].Name, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"VideoStatus:" + inputBackups[i].VideoStatus, ERROR_LEVEL.INFO);
                               
                                for( var j =0; j<inputBackups[i].Backup.length; j++) {
                                    eventMasterAction.logMessage(context,"id:" + inputBackups[i].Backup[j].id, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"inputId:"+ inputBackups[i].Backup[j].inputId, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"stillId:"+ inputBackups[i].Backup[j].stillId, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"destId:"+ inputBackups[i].Backup[j].destId, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"Name:" + inputBackups[i].Backup[j].Name, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"VideoStatus:" + inputBackups[i].Backup[j].VideoStatus, ERROR_LEVEL.INFO);
                                }
                                eventMasterAction.logMessage(context,"--------------------------------------------------------", ERROR_LEVEL.INFO);
                            }
                        }
					}
					else {
                        eventMasterAction.logMessage(context,"getInputBackups error: "+xhr.responseText, ERROR_LEVEL.WARN);
                        eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"getInputBackups error: "+xhr.responseText, ERROR_LEVEL.WARN);
                eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
			};

		
			var data = JSON.stringify({"params":{"type":-1}, "method":"listSourceMainBackup", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
        }
        else{
            if( !ipAddress)
                ipAddress="no entry";
            eventMasterAction.logMessage(context,"getInputs: Invalid IP Address: " + ipAddress, ERROR_LEVEL.WARN);
        }
	},


    getSources: function( context ) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage(context,"getSources error: settingCache is null!", ERROR_LEVEL.ERROR);
            return;
        }

        var ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {
		
			var url = "http://"+ipAddress+":9999";
			
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        
                        eventMasterAction.setStatus(context, "Connection Established");
						var fullResponse = JSON.parse(xhr.response);
						eventMasterAction.logMessage(context,"getSources response: "+xhr.response), ERROR_LEVEL.INFO;

                        if (fullResponse.result.success == 0 ) {
                            var sources = settings.sources = fullResponse.result.response;
                            var arrayLength = sources.length;
                            for (var i = 0; i < arrayLength; i++) {
                                eventMasterAction.logMessage(context,"source #"+(i+1), ERROR_LEVEL.INFO)
                                eventMasterAction.logMessage(context,"id:" + sources[i].id, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"Name:" + sources[i].Name, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"HSize:"+ sources[i].HSize, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"VSize:"+ sources[i].VSize, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"SrcType:"+ sources[i].SrcType, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"InputCfgIndex:"+ sources[i].InputCfgIndex, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"StillIndex:"+ sources[i].StillIndex, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"DestIndex:"+ sources[i].DestIndex, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"UserKeyIndex:"+ sources[i].UserKeyIndex, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"Mode3D:"+ sources[i].Mode3D, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"Freeze:"+ sources[i].Freeze, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"Capacity:"+ sources[i].Capacity, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"InputCfgVideoStatus:"+ sources[i].InputCfgVideoStatus, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"--------------------------------------------------------", ERROR_LEVEL.INFO);
                            }
                        }
					}
					else {
                        eventMasterAction.logMessage(context,"getSources error: "+xhr.responseText, ERROR_LEVEL.WARN);
                        eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"getSources error: "+xhr.responseText, ERROR_LEVEL.WARN);
                eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
			};

		
			var data = JSON.stringify({"params":{"type":0}, "method":"listSources", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
        }
        else{
            if( !ipAddress)
                ipAddress="no entry";
            eventMasterAction.logMessage(context,"getSources: Invalid IP Address: " + ipAddress, ERROR_LEVEL.WARN);
        }
	},

    getBackgrounds: function( context ) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage(context,"getBackgrounds error: settingCache is null!", ERROR_LEVEL.ERROR);
            return;
        }

        var ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {
		
			var url = "http://"+ipAddress+":9999";
			
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        
                        eventMasterAction.setStatus(context, "Connection Established");
						var fullResponse = JSON.parse(xhr.response);
						eventMasterAction.logMessage(context,"getBackgrounds response: "+xhr.response, ERROR_LEVEL.INFO);

                        if (fullResponse.result.success == 0 ) {
                            settings.backgrounds = fullResponse.result.response;
                            var arrayLength = settings.backgrounds.length;
                            for (var i = 0; i < arrayLength; i++) {
                                    eventMasterAction.logMessage(context,"source #"+(i+1), ERROR_LEVEL.INFO)
                                    eventMasterAction.logMessage(context,"id:" + settings.backgrounds[i].id, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"Name:" + settings.backgrounds[i].Name, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"HSize:"+ settings.backgrounds[i].HSize, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"VSize:"+ settings.backgrounds[i].VSize, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"SrcType:"+ settings.backgrounds[i].SrcType, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"InputCfgIndex:"+ settings.backgrounds[i].InputCfgIndex, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"StillIndex:"+ settings.backgrounds[i].StillIndex, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"DestIndex:"+ settings.backgrounds[i].DestIndex, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"UserKeyIndex:"+ settings.backgrounds[i].UserKeyIndex, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"Mode3D:"+ settings.backgrounds[i].Mode3D, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"Freeze:"+ settings.backgrounds[i].Freeze, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"Capacity:"+ settings.backgrounds[i].Capacity, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"InputCfgVideoStatus:"+ settings.backgrounds[i].InputCfgVideoStatus, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"--------------------------------------------------------", ERROR_LEVEL.INFO);

                            }
                        }
					}
					else {
                        eventMasterAction.logMessage(context,"getBackgrounds error: "+xhr.responseText, ERROR_LEVEL.WARN);
                        eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"getBackgrounds error: "+xhr.responseText, ERROR_LEVEL.WARN);
                eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
			};

		
			var data = JSON.stringify({"params":{"type":1}, "method":"listSources", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
        }
        else{
            if( !ipAddress)
                ipAddress="no entry";
            eventMasterAction.logMessage(context,"getBackgrounds: Invalid IP Address: " + ipAddress, ERROR_LEVEL.WARN);
        }
	},

	getDestinations: function (context) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage(context,"getDestinations error: settingCache is null!", ERROR_LEVEL.ERROR);
            return;
        }

        var ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {
		
			var url = "http://"+ipAddress+":9999";

			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        eventMasterAction.setStatus(context, "Connection Established");

                        // Grab the content info..
                        var fullResponse = JSON.parse(xhr.response);
                        
                        eventMasterAction.logMessage(context,"getDestinations response: "+xhr.response, ERROR_LEVEL.INFO);

                        if (fullResponse.result.success == 0 ) {
                            
                            var screendestinations = settings.screenDestinations = fullResponse.result.response.ScreenDestination;
                            var arrayLength = settings.screenDestinations.length;
                            for (var i = 0; i < arrayLength; i++) {
                                    eventMasterAction.logMessage(context,"screen destinations #"+(i+1), ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"  id:" + screendestinations[i].id, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"  Name:" + screendestinations[i].Name, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"  HSize:"+ screendestinations[i].HSize, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"  VSize:"+ screendestinations[i].VSize, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"  Layers:"+ screendestinations[i].Layers, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"  OutMapColl:", ERROR_LEVEL.INFO);
                                    var outMapCol = screendestinations[i].DestOutMapCol;
                                    var outMap = outMapCol.DestOutMap;
                                    for (var j= 0; j < outMap.length; j++) {
                                        eventMasterAction.logMessage(context,"  DestOutMap #:"+(j+1), ERROR_LEVEL.INFO);
                                        eventMasterAction.logMessage(context,"    id:" + outMap[j].id, ERROR_LEVEL.INFO);
                                        eventMasterAction.logMessage(context,"    Name:" + outMap[j].Name, ERROR_LEVEL.INFO);
                                        eventMasterAction.logMessage(context,"    HPos:"+ outMap[j].HPos, ERROR_LEVEL.INFO);
                                        eventMasterAction.logMessage(context,"    VPos:"+ outMap[j].VPos, ERROR_LEVEL.INFO);
                                        eventMasterAction.logMessage(context,"    HSize:"+ outMap[j].HSize, ERROR_LEVEL.INFO);
                                        eventMasterAction.logMessage(context,"    VSize:"+ outMap[j].VSize, ERROR_LEVEL.INFO);
                                        eventMasterAction.logMessage(context,"    Freeze:"+ outMap[j].Freeze, ERROR_LEVEL.INFO);
                                    }
                            }
                            
                            eventMasterAction.logMessage(context,"AuxDestination:", ERROR_LEVEL.INFO);
                            var auxDestinations = settings.auxDestinations = fullResponse.result.response.AuxDestination;
                            for (var i = 0; i < settings.auxDestinations.length; i++) {
                                eventMasterAction.logMessage(context,"  AuxDestination #:"+(i+1), ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"    id:" + auxDestinations[i].id, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"    Name: "+ auxDestinations[i].Name, ERROR_LEVEL.INFO)
                                eventMasterAction.logMessage(context,"    AuxStreamMode:" + auxDestinations[i].AuxStreamMode, ERROR_LEVEL.INFO);

                            }
                                    
                            eventMasterAction.logMessage(context,"--------------------------------------------------------", ERROR_LEVEL.INFO);

                        }
					}
					else {
                        eventMasterAction.logMessage(context,"getDestinations error: "+xhr.responseText, ERROR_LEVEL.WARN);
                        eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"getDestinations error: "+xhr.responseText, ERROR_LEVEL.WARN);
                eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
			};

			var data = JSON.stringify({"params":{"id":"0"}, "method":"listDestinations", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
        }
        else{
            if( !ipAddress)
                ipAddress="no entry";
            eventMasterAction.logMessage(context,"getDestinations: Invalid IP Address: " + ipAddress, ERROR_LEVEL.WARN);
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
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage(context,"getPresets error: settingCache is null!", ERROR_LEVEL.ERROR);
            return;
        }

        
        var ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {
		
			var url = "http://"+ipAddress+":9999";

			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        eventMasterAction.setStatus(context, "Connection Established");

                        // Grab the content info..
                        var fullResponse = JSON.parse(xhr.response);
                        
                        eventMasterAction.logMessage(context,"getOperators response: "+xhr.response, ERROR_LEVEL.INFO);

                        if (fullResponse.result.success == 0 ) {
                            var operators = fullResponse.result.response;
                            settings.operators = operators;
  
                            if( operators ) {

                                var arrayLength = operators.length;
                                for (var i = 0; i < arrayLength; i++) {
                                        eventMasterAction.logMessage(context,"adding operator #"+(i+1), ERROR_LEVEL.INFO);
                                        eventMasterAction.logMessage(context,"  id:" + operators[i].id, ERROR_LEVEL.INFO);
                                        eventMasterAction.logMessage(context,"  Name:" + operators[i].Name, ERROR_LEVEL.INFO);
                                        eventMasterAction.logMessage(context,"  Enable:" + operators[i].Enable, ERROR_LEVEL.INFO);
                                        eventMasterAction.logMessage(context,"  StartRange:" + operators[i].StartRange, ERROR_LEVEL.INFO);
                                        eventMasterAction.logMessage(context,"  EndRange:" + operators[i].EndRange, ERROR_LEVEL.INFO);
                                        eventMasterAction.logMessage(context,"  InvertColor:"+ operators[i].InvertColor, ERROR_LEVEL.INFO);
                                        eventMasterAction.logMessage(context,"  DestCollection"+ operators[i].DestCollection, ERROR_LEVEL.INFO);
                                }
                                        
                                eventMasterAction.logMessage(context,"--------------------------------------------------------", ERROR_LEVEL.INFO);
                            }
                            else{
                                eventMasterAction.logMessage(context,"getOperators error: system returned empty operator list, ERROR_LEVEL.ERROR", ERROR_LEVEL.ERROR);
                                settings.operators = null;
                            }
                        }
					}
					else {
                        eventMasterAction.logMessage(context,"getOperators error: "+xhr.responseText, ERROR_LEVEL.ERROR);
                        eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"getOperators error: "+xhr.responseText, ERROR_LEVEL.WARN);
                eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
			};

			var data = JSON.stringify({"params":{}, "method":"listOperators", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
        }
        else{
            if( !ipAddress)
                ipAddress="no entry";
            eventMasterAction.logMessage(context,"getOperators: Invalid IP Address: " + ipAddress, ERROR_LEVEL.WARN);
        }
	
	},
    
    getPresets: function (context) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage(context,"getPresets error: settingCache is null!", ERROR_LEVEL.ERROR);
            return;
        }

        var ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {
		
			var url = "http://"+ipAddress+":9999";

			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        eventMasterAction.setStatus(context, "Connection Established");

                        // Grab the content info..
                        var fullResponse = JSON.parse(xhr.response);
                        
                        eventMasterAction.logMessage(context,"getPresets response: "+xhr.response, ERROR_LEVEL.INFO);

                        if (fullResponse.result.success == 0 ) {
                            
                            var presets = settings.presets = fullResponse.result.response;
                            var arrayLength = settings.presets.length;
                            for (var i = 0; i < arrayLength; i++) {
                                eventMasterAction.logMessage(context,"preset #"+(i+1), ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"  id:" + presets[i].id, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"  Name:" + presets[i].Name, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"  LockMode:"+ presets[i].LockMode, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"  Preset Number"+ presets[i].presetSno, ERROR_LEVEL.INFO);
                            }
                                    
                            eventMasterAction.logMessage(context,"--------------------------------------------------------", ERROR_LEVEL.INFO);

                        }
					}
					else {
                        eventMasterAction.logMessage(context,"getPresets error: "+xhr.responseText, ERROR_LEVEL.ERROR);
                        eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"getPresets error: "+xhr.responseText, ERROR_LEVEL.WARN);
                eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
			};

			var data = JSON.stringify({"params":{}, "method":"listPresets", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
        }
        else{
            if( !ipAddress)
                ipAddress="no entry";
            eventMasterAction.logMessage(context,"getPresets: Invalid IP Address: " + ipAddress, ERROR_LEVEL.WARN);
        }
	
	},

    
    getCues: function (context) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage(context,"getPresets error: settingCache is null!", ERROR_LEVEL.ERROR);
            return;
        }

        var ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {
		
			var url = "http://"+ipAddress+":9999";

			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        eventMasterAction.setStatus(context, "Connection Established");

                        // Grab the content info..
                        var fullResponse = JSON.parse(xhr.response);
                        
                        eventMasterAction.logMessage(context,"getCues response: "+xhr.response, ERROR_LEVEL.INFO);

                        if (fullResponse.result.success == 0 ) {
                            
                            var cues = settings.cues = fullResponse.result.response;
                            var arrayLength = settings.cues.length;
                            for (var i = 0; i < arrayLength; i++) {
                                eventMasterAction.logMessage(context,"cue #"+(i+1), ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"  id:" + cues[i].id, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"  Name:" + cues[i].Name, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"  LockMode:"+ cues[i].LockMode, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"  Cue Number"+ cues[i].cueSerialNo, ERROR_LEVEL.INFO);
                            }
                                    
                            eventMasterAction.logMessage(context,"--------------------------------------------------------", ERROR_LEVEL.INFO);

                        }
					}
					else {
                        eventMasterAction.logMessage(context,"getCues error: "+xhr.responseText, ERROR_LEVEL.WARN);
                        eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"getCues error: "+xhr.responseText, ERROR_LEVEL.WARN);
                eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
			};

			var data = JSON.stringify({"params":{}, "method":"listCues", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
        }
        else{
            if( !ipAddress)
                ipAddress="no entry";
            eventMasterAction.logMessage(context,"getCues: Invalid IP Address: " + ipAddress, ERROR_LEVEL.WARN);
        }
	
    },

    changeContent: function(context, content) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage(context,"changeContent error: settingCache is null!", ERROR_LEVEL.ERROR);
            return;
        }
        
        var ipAddress = settings.ipAddress; 
        
        if( isValidIp( ipAddress ) ) {
    
            var url = "http://"+ipAddress+":9999";

            var xhr = new XMLHttpRequest();
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-type", "application/json");

            xhr.onload = function (e) { 
                if (xhr.readyState === 4 ) {
                    if( xhr.status === 200) {
                        eventMasterAction.setStatus(context, "Connection Established");					

                        var fullResponse = JSON.parse(xhr.response);
                        eventMasterAction.logMessage(context,"changeContent response: "+xhr.response, ERROR_LEVEL.INFO);

                        if (fullResponse.result.success == 0 ) {

                        }
                    }
                    else {
                        eventMasterAction.logMessage(context,"changeContent error: "+xhr.responseText, ERROR_LEVEL.ERROR);
                    }
                }
            };

            xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"changeContent error: "+xhr.responseText, ERROR_LEVEL.ERROR);
            };
    
            var data = JSON.stringify({"params": content, "method":"changeContent", "id":"1234", "jsonrpc":"2.0"});

            xhr.send(data);
            eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
        }
        else{
            if( !ipAddress)
                ipAddress="no entry";
            eventMasterAction.logMessage(context,"changeContent: Invalid IP Address: " + ipAddress, ERROR_LEVEL.WARN);
        }
    },

    changeAuxContent: function(context, content) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage(context,"changeContent error: settingCache is null!", ERROR_LEVEL.ERROR);
            return;
        }

        var ipAddress = settings.ipAddress;
        
        if( isValidIp( ipAddress ) ) {
    
            var url = "http://"+ipAddress+":9999";

            var xhr = new XMLHttpRequest();
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-type", "application/json");

            xhr.onload = function (e) { 
                if (xhr.readyState === 4 ) {
                    if( xhr.status === 200) {
                        eventMasterAction.setStatus(context, "Connection Established");					

                        var fullResponse = JSON.parse(xhr.response);
                        eventMasterAction.logMessage(context,"changeAuxContent response: "+xhr.response, ERROR_LEVEL.INFO);

                        if (fullResponse.result.success == 0 ) {

                        }
                    }
                    else {
                        eventMasterAction.logMessage(context,"changeAuxContent error: "+xhr.responseText, ERROR_LEVEL.ERROR);
                    }
                }
            };

            xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"changeAuxContent error: "+xhr.responseText, ERROR_LEVEL.ERROR);
            };
    
            var data = JSON.stringify({"params": content, "method":"changeAuxContent", "id":"1234", "jsonrpc":"2.0"});

            xhr.send(data);
            eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
        }
        else{
            
            eventMasterAction.logMessage(context,"changeAuxContent: Invalid IP Address: " + ipAddress, ERROR_LEVEL.WARN);
        }
    },

    cutLayer: function( context ) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
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
                                eventMasterAction.logMessage(context,"cutLayer Mix to PVW: LayerId="+layerId+" LayerName="+layerName, ERROR_LEVEL.INFO);
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
                                eventMasterAction.logMessage(context,"cutLayer Mix to PGM: LayerId="+layerId+" LayerName="+layerName, ERROR_LEVEL.INFO);
                            }
                        }
                        // a non mixing layer
                        else {
                            // nothing to do with non mix layers.
                            layerId = settings.cutLayer.layerInfo.id;
                            eventMasterAction.logMessage(context,"cutLayer SL to PGM: LayerId="+layerId+" LayerName="+layerName, ERROR_LEVEL.INFO);

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
            eventMasterAction.logMessage(context, "Error: cutLayer() is missing some data! " + settings.cutLayer , ERROR_LEVEL.ERROR);
        }
    },

    cutAux: function( context ) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
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
            eventMasterAction.logMessage(context, "Error: cutAux() is missing some data! " + settings.cutAux, ERROR_LEVEL.ERROR );
        }
    },
    
	listContent: function( context, destinationId ) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            eventMasterAction.logMessage(context,"listContent error: settingCache is null!", ERROR_LEVEL.ERROR);
            return;
        }

        var ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {		
			var url = "http://"+ipAddress+":9999";

			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        eventMasterAction.setStatus(context, "Connection Established");					
                        var fullResponse = JSON.parse(xhr.response);
                        eventMasterAction.logMessage(context,"listContent response: "+xhr.response, ERROR_LEVEL.INFO);

                        if (fullResponse.result.success == 0 ) {
                            if( settings.destinationContents == null )
                                settings.destinationContents = [];

                            settings.destinationContents[destinationId] = fullResponse.result.response;
                            var destContent= fullResponse.result.response;
                             
                            eventMasterAction.logMessage(context,"dest Content", ERROR_LEVEL.INFO);
                            eventMasterAction.logMessage(context,"  id:" + destContent.id, ERROR_LEVEL.INFO);
                            eventMasterAction.logMessage(context,"  Name:" + destContent.Name, ERROR_LEVEL.INFO);
                    
                            var transitions = destContent.Transition;
                            for (var i = 0; i < transitions.length; i++) {
                                eventMasterAction.logMessage(context,"   Transition #"+(i+1), ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"     id:"+transitions[i].id, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"     TransTime:"+transitions[i].TransTime, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"     TransPos:"+transitions[i].TransPos, ERROR_LEVEL.INFO);
                            }
                            
                            var bGLayers = destContent.BGLyr;
                            for (var i = 0; i < bGLayers.length; i++) {
                                eventMasterAction.logMessage(context,"BGLayer #"+(i+1));
                                eventMasterAction.logMessage(context,"   id:" + bGLayers[i].id, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"   LastBGSourceIndex:" + bGLayers[i].LastBGSourceIndex, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"   BGShowMatte:" + bGLayers[i].BGShowMatte, ERROR_LEVEL.INFO);
                                
                                var bGColors = bGLayers[i].BGColor;
                                for (var j = 0; j < bGColors.length; j++) {
                                    eventMasterAction.logMessage(context,"BGColor #"+(j+1), ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"   id:" + bGColors[j].id, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"   Red:" + bGColors[j].Red, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"   Green:" + bGColors[j].Green, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"   Blue:" + bGColors[j].Blue, ERROR_LEVEL.INFO);
                                }
                            }

                            var layers = destContent.Layers;
                            for (var i = 0; i < layers.length; i++) {
                                eventMasterAction.logMessage(context,"Layer #"+(i+1), ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"   id:" + layers[i].id, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"   Name:"+ layers[i].Name, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"   LastSrcIdx:" + layers[i].LastSrcIdx, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"   PvwMode:" + layers[i].PvwMode, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"   PgmMode:" + layers[i].PgmMode, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"   Capacity:" + layers[i].Capacity, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"   PvwZOrder:" + layers[i].PvwZOrder, ERROR_LEVEL.INFO);
                                eventMasterAction.logMessage(context,"   PgmZOrder:" + layers[i].PgmZOrder, ERROR_LEVEL.INFO);

                                var windows = layers[i].Window;
                                for (var j = 0; j < windows.length; j++) {
                                    eventMasterAction.logMessage(context,"   Window #:"+(j+1));
                                    eventMasterAction.logMessage(context,"     HPos:" + windows[j].HPos, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"     VPos:" + windows[j].VPos, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"     HSize:" + windows[j].HSize, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"     VSize:" + windows[j].VSize, ERROR_LEVEL.INFO);
                                }

                                var masks = layers[i].Mask;
                                for (var j = 0; j < masks.length; j++) {
                                    eventMasterAction.logMessage(context,"   Mask #"+(j+1), ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"   	id:"+masks[j].id, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"   	Top:"+masks[j].Top, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"   	Left:"+masks[j].Left, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"   	Right:"+masks[j].Right, ERROR_LEVEL.INFO);
                                    eventMasterAction.logMessage(context,"   	Bottom:"+masks[j].Bottom, ERROR_LEVEL.INFO);
                                }
                                
                            }								

                            eventMasterAction.logMessage(context,"--------------------------------------------------------", ERROR_LEVEL.INFO);
                            eventMasterAction.logMessage(context,"checking pendingAction state..", ERROR_LEVEL.INFO);
                            
                            if( settings["pendingCutAction"] &&
                                settings["pendingCutAction"].action ==  "com.barco.eventmaster.cutlayer" && 
                                settings["pendingCutAction"].destId == destinationId ) {
                                
                                eventMasterAction.logMessage(context,"pendingCutLayer", ERROR_LEVEL.INFO);
                                
                                settings["pendingCutAction"]="";
                                EventMasterRPC.cutLayer(context);
                                
                            }
                            if( settings["pendingCutAuxAction"] &&
                                settings["pendingCutAuxAction"].action ==  "com.barco.eventmaster.cutaux" && 
                                settings["pendingCutAuxAction"].destId == destinationId ) {

                                eventMasterAction.logMessage(context,"pendingCutAux", ERROR_LEVEL.INFO);
                                
                                settings["pendingCutAuxAction"]="";
                                EventMasterRPC.cutAux(context);
                            }
                        }
					}
					else {
                        eventMasterAction.logMessage(context,"listContent error: "+xhr.responseText, ERROR_LEVEL.WARN);
                        eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"listContent error: "+xhr.responseText, ERROR_LEVEL.WARN);
                eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
			};

			var data = JSON.stringify({"params":{"id":destinationId}, "method":"listContent", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
        }
        else{
            
            eventMasterAction.logMessage(context,"listContent: Invalid IP Address: ", ERROR_LEVEL.WARN);
        }
    },
    


	getAllDestinationContent: function(context) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            return;
        }

        if( settings["screenDestinations"] != null ){
            destList = settings["screenDestinations"];
            if( destList.length==0)
                eventMasterAction.logMessage(context,"getAllDestinationContent:  There are no destinations in the settings", ERROR_LEVEL.INFO);
                
            for(var i=0; i<destList.length; i++ ) {
				this.listContent(context, destList[i].id);
            }
        }
    },

    getFrameSettings: function(context ){
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            return;
        }
         
        
        var ipAddress = settings.ipAddress;
        if( isValidIp( ipAddress ) ) {
    
            var url = "http://"+ipAddress+":9999";

            var xhr = new XMLHttpRequest();
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-type", "application/json");

            xhr.onload = function (e) { 
                if (xhr.readyState === 4 ) {
                    if( xhr.status === 200) {
                        eventMasterAction.setStatus(context, "Connection Established");					

                        var fullResponse = JSON.parse(xhr.response);
                        eventMasterAction.logMessage(context,"getFrameSettings response: "+xhr.response, ERROR_LEVEL.INFO);

                            if ( fullResponse.result.success == 0 ) {
                                eventMasterAction.logMessage(context,"getFrameSettings response: "+xhr.response, ERROR_LEVEL.INFO);
                                settings.frameSettings = fullResponse.result.response;
                            }
                            else if( fullResponse.result.error ) {
                                eventMasterAction.logMessage(context,"getFrameSettings error: "+fullResponse.result.error, ERROR_LEVEL.ERROR);        
                            }
                    }
                    else {
                        eventMasterAction.logMessage(context,"getFrameSettings error: "+xhr.responseText, ERROR_LEVEL.ERROR);
                    }
                }
            };

            xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"getFrameSettings error: "+xhr.responseText, ERROR_LEVEL.ERROR);
            };
    
            var data = JSON.stringify({"params":{}, "method":"getFrameSettings", "id":"1234", "jsonrpc":"2.0"});

            xhr.send(data);
            eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
        }
        else {
            if( !ipAddress)
                ipAddress="no entry";
            eventMasterAction.logMessage(context,"getFrameSettings: Invalid IP Address: " + ipAddress, ERROR_LEVEL.WARN);
        }
    },

    resetSourceBackup: function( context ) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            return;
        }

        if( settings.resetSourceBackup &&
            ( settings.resetSourceBackup.srcInfo && settings.resetSourceBackup.srcInfo.id != -1 ) ) {
            content = { "id": parseInt(settings.resetSourceBackup.srcInfo.id) };
          
        }
        else {
            eventMasterAction.logMessage(context, "Error: resetSourceBackup() is missing some data! " + settings.resetSourceBackup, ERROR_LEVEL.ERROR );
            return;
        }

        
        var ipAddress = settings.ipAddress;
        if( isValidIp( ipAddress ) ) {
    
            var url = "http://"+ipAddress+":9999";

            var xhr = new XMLHttpRequest();
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-type", "application/json");

            xhr.onload = function (e) { 
                if (xhr.readyState === 4 ) {
                    if( xhr.status === 200) {
                        eventMasterAction.setStatus(context, "Connection Established");					

                        var fullResponse = JSON.parse(xhr.response);
                        eventMasterAction.logMessage(context,"resetSourceBackup response: "+xhr.response, ERROR_LEVEL.INFO);

                        if (fullResponse.result.success == 0 ) {

                        }
                        else if( fullResponse.result.error ) {
                            eventMasterAction.logMessage(context,"resetSourceBackup error: "+fullResponse.result.error, ERROR_LEVEL.ERROR);        
                        }
                    }
                    else {
                        eventMasterAction.logMessage(context,"resetSourceBackup error: "+xhr.responseText, ERROR_LEVEL.ERROR);
                    }
                }
            };

            xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"resetSourceBackup error: "+xhr.responseText), ERROR_LEVEL.ERROR;
            };
    
            var data = JSON.stringify({"params":content, "method":"resetSourceMainBackup", "id":"1234", "jsonrpc":"2.0"});

            xhr.send(data);
            eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
        }
        else{
       
            eventMasterAction.logMessage(context,"resetSourceBackup: Invalid IP Address: ", ERROR_LEVEL.WARN);
        }
    },

    mvrLayoutChange(context) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            return;
        }
        var content = "";

        if( settings.mvrLayoutChange ) {
            content = {"frameUnitId":settings.mvrLayoutChange.frameUnitId, "mvrLayoutId": parseInt(settings.mvrLayoutChange.mvrLayoutId)-1};
        }
        else {
            eventMasterAction.logMessage(context, "Error: mvrLayoutChange() is missing some data! " + settings.mvrLayoutChange, ERROR_LEVEL.ERROR );
            return;
        }

        
        var ipAddress = settings.ipAddress;
        if( isValidIp( ipAddress ) ) {
    
            var url = "http://"+ipAddress+":9999";

            var xhr = new XMLHttpRequest();
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-type", "application/json");

            xhr.onload = function (e) { 
                if (xhr.readyState === 4 ) {
                    if( xhr.status === 200) {
                        eventMasterAction.setStatus(context, "Connection Established");					

                        var fullResponse = JSON.parse(xhr.response);
                        eventMasterAction.logMessage(context,"mvrLayoutChange response: "+xhr.response, ERROR_LEVEL.INFO);

                        if (fullResponse.result.success == 0 ) {

                        }
                        else if( fullResponse.result.error ) {
                            eventMasterAction.logMessage(context,"mvrLayoutChange error: "+fullResponse.result.error, ERROR_LEVEL.ERROR);        
                        }
                }
                    else {
                        eventMasterAction.logMessage(context,"mvrLayoutChange error: "+xhr.responseText, ERROR_LEVEL.ERROR);
                    }
                }
            };

            xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"mvrLayoutChange error: "+xhr.responseText, ERROR_LEVEL.ERROR);
            };
    
            var data = JSON.stringify({"params": content, "method":"mvrLayoutChange", "id":"1234", "jsonrpc":"2.0"});

            xhr.send(data);
            eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
        }
        else{
           
            eventMasterAction.logMessage(context,"mvrLayoutChange: Invalid IP Address: ", ERROR_LEVEL.WARN);
        }
    },

    recallTestPattern(context, destinationType) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            return;
        }
        var content = "";
        if(destinationType == 0 ){//screen
            if( settings.recallTestPatternScreen ) {
                content = {"id":settings.recallTestPatternScreen.dest_id, "TestPattern": parseInt(settings.recallTestPatternScreen.testpattern_id)};
            }
            else {
                eventMasterAction.logMessage(context, "Error: recallTestPattern() is missing some data! " + settings.recallTestPatternScreen, ERROR_LEVEL.ERROR );
                return;
            }
        }
        else{//aux
            if( settings.recallTestPatternAux ) {
                content = {"id":settings.recallTestPatternAux.dest_id, "TestPattern": parseInt(settings.recallTestPatternAux.testpattern_id)};
            }
            else {
                eventMasterAction.logMessage(context, "Error: recallTestPattern() is missing some data! " + settings.recallTestPatternAux, ERROR_LEVEL.ERROR );
                return;
            }
        }
        
       
        var ipAddress = settings.ipAddress;
        if( isValidIp( ipAddress ) ) {
    
            var url = "http://"+ipAddress+":9999";

            var xhr = new XMLHttpRequest();
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-type", "application/json");

            xhr.onload = function (e) { 
                if (xhr.readyState === 4 ) {
                    if( xhr.status === 200) {
                        eventMasterAction.setStatus(context, "Connection Established");					

                        var fullResponse = JSON.parse(xhr.response);
                        eventMasterAction.logMessage(context,"recallTestPattern response: "+xhr.response, ERROR_LEVEL.INFO);

                        if (fullResponse.result.success == 0 ) {

                        }
                        else if( fullResponse.result.error ) {
                            eventMasterAction.logMessage(context,"recallTestPattern error: "+fullResponse.result.error, ERROR_LEVEL.ERROR);        
                        }
                }
                    else {
                        eventMasterAction.logMessage(context,"recallTestPattern error: "+xhr.responseText, ERROR_LEVEL.ERROR);
                    }
                }
            };

            xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"recallTestPattern error: "+xhr.responseText, ERROR_LEVEL.ERROR);
            };
    
            if( destinationType == 0 /*screen*/){
                this.changeContent(context, content);
            }
            else{//aux
                this.changeAuxContent(context, content);
            }
        }
        else{
            if( !ipAddress)
                ipAddress="no entry";
            eventMasterAction.logMessage(context,"recallTestPattern: Invalid IP Address: " + ipAddress, ERROR_LEVEL.WARN);
        }
    },

    recallBackupSource(context) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.setStatus(context, "Cannot detect Event Master on the the network");
            return;
        }
        var content = "";
    
        if( settings.recallBackupSource &&
            settings.recallBackupSource.Backup1 &&
            settings.recallBackupSource.Backup2 &&
            settings.recallBackupSource.Backup3 ) {
                
            var Backup1 = {"SrcType":0, "SourceId":-1};
            Backup1.SourceId = settings.recallBackupSource.Backup1.SourceId;

            var Backup2 = {"SrcType":0, "SourceId":-1};
            Backup2.SourceId = settings.recallBackupSource.Backup2.SourceId;
            
            var Backup3 = {"SrcType":0, "SourceId":-1};
            Backup3.SourceId = settings.recallBackupSource.Backup3.SourceId;

            // Set the payload data including the Source Type -
            // This API is not done well requiring me to look into the data to determine the source type
            //
            if( settings.inputBackups ){
                for( var i=0; i<settings.inputBackups.length; i++){
                    for(var j=0; j<3; j++){
                        if( j==0 ){
                            if( settings.inputBackups[i].Backup[j].inputId == Backup1.SourceId)
                                settings.recallBackupSource.Backup1.SrcType=0;//input

                            else if( settings.inputBackups[i].Backup[j].stillId == Backup1.SourceId)
                                settings.recallBackupSource.Backup1.SrcType=1;//still

                            else if( settings.inputBackups[i].Backup[j].destId == Backup1.SourceId)
                                settings.recallBackupSource.Backup1.SrcType=2;//dest
                        }
                        else if( j==1 ){
                            if( settings.inputBackups[i].Backup[j].inputId == Backup2.SourceId)
                                settings.recallBackupSource.Backup2.SrcType=0;//input

                            else if( settings.inputBackups[i].Backup[j].stillId == Backup2.SourceId)
                                settings.recallBackupSource.Backup2.SrcType=1;//still

                            else if( settings.inputBackups[i].Backup[j].destId == Backup2.SourceId)
                                settings.recallBackupSource.Backup2.SrcType=2;//dest
                        }
                        else if( j==2 ){
                            if( settings.inputBackups[i].Backup[j].inputId == Backup3.SourceId)
                                settings.recallBackupSource.Backup3.SrcType=0;//input

                            else if( settings.inputBackups[i].Backup[j].stillId == Backup3.SourceId)
                                settings.recallBackupSource.Backup3.SrcType=1;//still

                            else if( settings.inputBackups[i].Backup[j].destId == Backup3.SourceId)
                                settings.recallBackupSource.Backup3.SrcType=2;//dest

                        }
                    }
                }
            }
            content = { "inputId":settings.recallBackupSource.inputId, 
                        "Backup1": Backup1,
                        "Backup2": Backup2,
                        "Backup3": Backup3,
                        "BackUpState": settings.recallBackupSource.BackUpState};


        }
        else {
            eventMasterAction.logMessage(context, "Error: recallBackupSource() is missing some data! " + settings.recallBackupSource, ERROR_LEVEL.ERROR );
            return;
        }
        
       
        var ipAddress = settings.ipAddress;
        if( isValidIp( ipAddress ) ) {
    
            var url = "http://"+ipAddress+":9999";

            var xhr = new XMLHttpRequest();
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-type", "application/json");

            xhr.onload = function (e) { 
                if (xhr.readyState === 4 ) {
                    if( xhr.status === 200) {
                        eventMasterAction.setStatus(context, "Connection Established");					

                        var fullResponse = JSON.parse(xhr.response);
                        eventMasterAction.logMessage(context,"recallBackupSource response: "+xhr.response, ERROR_LEVEL.INFO);

                        if (fullResponse.result.success == 0 ) {

                        }
                    }
                    else {
                        eventMasterAction.logMessage(context,"recallBackupSource error: "+xhr.responseText, ERROR_LEVEL.ERROR);
                    }
                }
            };

            xhr.onerror = function (e) {
                eventMasterAction.logMessage(context,"recallBackupSource error: "+xhr.responseText, ERROR_LEVEL.ERROR);
            };
    
            var data = JSON.stringify({"params": content, "method":"activateSourceMainBackup", "id":"1234", "jsonrpc":"2.0"});

            xhr.send(data);
            eventMasterAction.logMessage(context,"sent: "+data, ERROR_LEVEL.INFO);
        }
        else{
            if( !ipAddress)
                ipAddress="no entry";
            eventMasterAction.logMessage(context,"recallBackupSource: Invalid IP Address: " + ipAddress, ERROR_LEVEL.WARN);
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
        this.getInputBackups(context);
        
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
            else if( action == "com.barco.eventmaster.recalltestpatternscreen" )
            {
                if( settings.recallTestPatternScreen && settings.recallTestPatternScreen.testpattern_id >=0){
                   pathToFile = "images/screen_test_patterns/testpattern_screen_" + (settings.recallTestPatternScreen.testpattern_id+1) + ".png";    
                } 
            }
            else if( action == "com.barco.eventmaster.recalltestpatternaux" )
            {
                if( settings.recallTestPatternAux && settings.recallTestPatternAux.testpattern_id >=0 ){
                   pathToFile = "images/backup_icons/Backup" + (settings.recallTestPatternAux.testpattern_id+1) + ".png";    
                } 
            }

            else if( action == "com.barco.eventmaster.recallsourcebackup" )
            {
                if( settings.recallBackupSource && settings.recallBackupSource.BackUpState >=0 ){
                   pathToFile = "images/backup_icons/Backup" + (settings.recallBackupSource.BackUpState+1) + ".png";    
                } 
                else{
                    pathToFile = "images/activateSourceBackUp@2x.png";
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
                eventMasterAction.logMessage(context,"Qeueing pendingCutLayer", ERROR_LEVEL.INFO);
 
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
                eventMasterAction.logMessage(context,"Qeueing pendingCutAux", ERROR_LEVEL.INFO);

                if( settings.cutAux &&
                    ( settings.cutAux.destInfo && settings.cutAux.destInfo.id != -1 ) &&
                    ( settings.cutAux.srcInfo && settings.cutAux.srcInfo.id != -1 ) ) {
                        
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
            else if( action == "com.barco.eventmaster.recalltestpatternscreen" ){
                EventMasterRPC.recallTestPattern(context,0);
            }
            else if( action == "com.barco.eventmaster.recalltestpatternaux" ){
                EventMasterRPC.recallTestPattern(context,1);
            }
            else if( action == "com.barco.eventmaster.recallsourcebackup" ){
                EventMasterRPC.recallBackupSource(context);
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

    setStatus: function (context, status) {
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
     
        var textStr;
        var errorLevelStr;
        if (errorLevel == ERROR_LEVEL.ERROR ) {
            errorLevelStr = "ERROR";
            textStr = "Event Master ["+context+"]["+errorLevelStr+"]"+messageStr
            console.error(textStr);
        }
        else if (debug==true && errorLevel == ERROR_LEVEL.WARN ) {
            errorLevelStr = "WARN";
            textStr = "Event Master ["+context+"]["+errorLevelStr+"]"+messageStr
            console.warn(textStr);
        }
        else if (debug ==true) {
            errorLevelStr = "INFO";
            textStr = messageStr;
            console.log(textStr);
        }

        if(errorLevel == ERROR_LEVEL.ERROR) {
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
                            eventMasterAction.logMessage(context,imgCache[e], imgCache, ERROR_LEVEL.WARN);
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
                if( jsonPayload.hasOwnProperty('recallTestPatternScreen')) {
                    changed = true;
                    settings["recallTestPatternScreen"] = jsonPayload.recallTestPatternScreen;
                }
                if( jsonPayload.hasOwnProperty('recallTestPatternAux')) {
                    changed = true;
                    settings["recallTestPatternAux"] = jsonPayload.recallTestPatternAux;
                }
                if( jsonPayload.hasOwnProperty('recallBackupSource')) {
                    changed = true;
                    settings["recallBackupSource"] = jsonPayload.recallBackupSource;
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
