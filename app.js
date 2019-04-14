
var websocket = null;
var pluginUUID = null;
var settingsCache = {};
var socket = null;

    
       
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
	
	if( ipAddress ) {
			if( ipAddress.match(ipformat) )
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
            console.error("powerStatus error: settingCache is null!");
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
                            console.log("powerStatus response: "+xhr.response);
                            eventMasterAction.SetStatus(context, "Connection Established");
					}
					else {
                            console.error("powerStatus error: "+xhr.response);
                            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.error("powerStatus error: "+xhr.response);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

					
			var data = JSON.stringify({"params": {}, "method":"powerStatus", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			console.log("url: " + url + " sent: "+data);
        }
        else{
            console.error("powerStatus: Invalid IP Address: " + ipAddress);
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
                console.error("allTrans error: "+xhr.response);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

					
			var data = JSON.stringify({"params": {}, "method":"allTrans", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.error("allTrans: Invalid IP Address: " + ipAddress);
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
                        console.error("cut error: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.error("cut error: "+xhr.response);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

					
			var data = JSON.stringify({"params": {}, "method":"cut", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.error("cut: Invalid IP Address: " + ipAddress);
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
                        console.error("recallNextPreset error: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.error("recallNextPreset error: "+xhr.response);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

					
			var data = JSON.stringify({"params": {}, "method":"recallNextPreset", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.error("recallNextPreset: Invalid IP Address: " + ipAddress);
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
                        console.error("activatePreset error: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.error("activatePreset error: "+xhr.response);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

					
			var data = JSON.stringify({"params": {"presetName": settings.activatePreset.presetName, "type": settings.activatePreset.presetMode}, "method":"activatePreset", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.error("activatePreset: Invalid IP Address: " + ipAddress);
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
                        console.error("activateCue error: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.error("activateCue error: "+xhr.response);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

					
			var data = JSON.stringify({"params":{"cueName":settings.activateCue.cueName, "type":settings.activateCue.cueMode}, "method":"activateCue", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.error("activateCue: Invalid IP Address: " + ipAddress);
        }
	},

	freeze: function(context) {
        
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("freeze error: settingCache is null!");

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
                        console.log("freeze response: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Connection Established");
					}
					else {
                        console.error("freeze error: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.error("freeze error: "+xhr.response);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

					
			var data = JSON.stringify({"params":{"id":sourceId, "type": settings.freezeSourceType, "screengroup": 0, "mode":1 /*freeze*/ }, "method":"freezeDestSource", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.error("freeze: Invalid IP Address: " + ipAddress);
        }
        
	},

	unfreeze: function(context ) {
        
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("unfreeze error: settingCache is null!");
            return;
        }

        ipAddress = ipAddress;
		if( isValidIp( this._ipAddress ) ) {
			var url = "http://"+ipAddress+":9999";
				
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onload = function (e) { 
				if (xhr.readyState === 4 ) {
					if( xhr.status === 200) {
                        var fullResponse = JSON.parse(xhr.response);
                        console.log("unfreeze response: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Connection Established");
					}
					else {
                        console.error("unfreeze error: "+xhr.response);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.error("unfreeze error: "+xhr.response);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

					
			var data = JSON.stringify({"params":{"id":sourceId, "type": settings.freezeSourceType, "screengroup": 0, "mode":0 /*unfreeze*/ }, "method":"freezeDestSource", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.error("unfreeze: Invalid IP Address: " + ipAddress);
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
                            var sources = fullResponse.result.response;
                            this._sourceList = sources;
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

                                    //Do something
                            }
                        }
					}
					else {
                        console.error("getSources error: "+xhr.responseText);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.error("getSources error: "+xhr.responseText);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

		
			var data = JSON.stringify({"params":{"id":"0"}, "method":"listSources", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.error("getSources: Invalid IP Address: " + ipAddress);
        }
	},

	getDestinations: function (contexet) {

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
                            settings.screenDestinationList = fullResponse.result.response.ScreenDestination;
                            var screendestinations = fullResponse.result.response.ScreenDestination;
                            var arrayLength = screendestinations.length;
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
                                    for (var i = 0; i < outMap.length; i++) {
                                        console.log("  DestOutMap #:"+(i+1));
                                        console.log("    id:" + outMap[i].id);
                                        console.log("    Name:" + outMap[i].Name);
                                        console.log("    HPos:"+ outMap[i].HPos);
                                        console.log("    VPos:"+ outMap[i].VPos);
                                        console.log("    HSize:"+ outMap[i].HSize);
                                        console.log("    VSize:"+ outMap[i].VSize);
                                        console.log("    Freeze:"+ outMap[i].Freeze);
                                    }
                            }
                            console.log("AuxDestination:");
                            settings.auxDestinationList = fullResponse.result.response.AuxDestination;
                            var auxDestinations = fullResponse.result.response.AuxDestination;
                            for (var i = 0; i < auxDestinations.length; i++) {
                                console.log("  AuxDestination #:"+(i+1));
                                console.log("    id:" + auxDestinations[i].id);
                                console.log("    AuxStreamMode:" + auxDestinations[i].AuxStreamMode);
                            }
                                    
                            console.log("--------------------------------------------------------");

                        }
					}
					else {
                        console.error("getDestinations error: "+xhr.responseText);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.error("getDestinations error: "+xhr.responseText);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

			var data = JSON.stringify({"params":{"id":"0"}, "method":"listDestinations", "id":"1234", "jsonrpc":"2.0"});
			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.error("getDestinations: Invalid IP Address: " + ipAddress);
        }
	
	},

	listContent: function( context ) {

        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("listContent error: settingCache is null!");
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
                        console.log("listContent response: "+xhr.response);

                        if (fullResponse.result.success == 0 ) {
                            var destContent = fullResponse.result.response;
                            settings.destinationContents[destContent.id] = destContent;
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
                        }
					}
					else {
                        console.error("listContent error: "+xhr.responseText);
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
					}
				}
			};

			xhr.onerror = function (e) {
                console.error("listContent error: "+xhr.responseText);
                eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
			};

			var data = JSON.stringify({"params":{"id":destinationId}, "method":"listContent", "id":"1234", "jsonrpc":"2.0"});

			xhr.send(data);
			console.log("sent: "+data);
        }
        else{
            console.error("listContent: Invalid IP Address: " + ipAddress);
        }
    },
    
    changeContent: function(context) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            console.error("changeContent error: settingCache is null!");
            return;
        }

        
        if( isValidIp( this._ipAddress ) ) {
    
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
    
            var data = JSON.stringify({"params":{"id":settings.changeLayerSource.destId, "Layers": [{"id": settings.changeLayerSource.layerId,"LastSrcIdx":settings.changeLayerSource.sourceId}]}, "method":"changeContent", "id":"1234", "jsonrpc":"2.0"});

            xhr.send(data);
            console.log("sent: "+data);
        }
        else{
            console.error("changeContent: Invalid IP Address: " + ipAddress);
        }
    },

	getAllDestinationContent: function(context) {
        var settings = settingsCache[context];
        if( settings == null ) {
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            return;
        }
        
        
        ipAddress = settings.ipAddress;
		if( isValidIp( ipAddress ) ) {		
			var url = "http://"+ipAddress+":9999";

			for(var i=0; i<this._destinationList.length; i++ )
				listContent(context);
		
		}
	},

	updateCache: function(context) {
		this.getSources(context);
		this.getDestinations(context);
		this.getAllDestinationContent(context);
	}
};


var eventMasterAction = {

    testEventMasterConnection: function ( context ) {

        if( isEmpty(settingsCache) )
            return;
        
        EventMasterRPC.powerStatus(context);
    },

    onPropertyInspectorDidAppear: function (action, context, settings, coordinates) {
        // send notification to property_inspector to load saved settings
       if( settingsCache != null && !isEmpty(settingsCache[context]) )  {

            eventMasterAction.testEventMasterConnection( context )
            
            var json = {
                "event": "sendToPropertyInspector",
                "context": context,
                "payload": settingsCache[context]
            };

            websocket.send(JSON.stringify(json));
        }
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
            else if( action == "com.barco.eventmaster.transLayer") {
                EventMasterRPC.transLayer(context);
            }
        }
    },
    
    onKeyUp: function (action, context, settings, coordinates, userDesiredState) {

    },

    onWillAppear: function (action, context, settings, coordinates) {
        if(settings != null ){
            settingsCache[context] = settings;
        }

        eventMasterAction.testEventMasterConnection( context )
    },

    SetTitle: function (context, title) {
    },
  

    SetStatus: function (context, status) {
        var settings = settingsCache[context];
        if( settings ) {
            settings.status = status;
            eventMasterAction.SetSettings(context, settings);
        
            var json = {
                "event": "sendToPropertyInspector",
                "context": context,
                "payload": settingsCache[context]
            };
    
            websocket.send(JSON.stringify(json));
        }
    },

    SetSettings: function (context, settings) {
        
        settingsCache[context] = settings;
        
        var json = {
            "event": "setSettings",
            "context": context,
            "payload": settings
        };

        websocket.send(JSON.stringify(json));
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
        var jsonPayload = jsonObj['payload'] || {};
        
        if(event == "keyDown") {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];
            var userDesiredState = jsonPayload['userDesiredState'];
            eventMasterAction.onKeyDown(action, context, settings, coordinates, userDesiredState);
        }
        else if(event == "keyUp") {
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
        else if (event == "propertyInspectorDidAppear")  {
            var coordinates = jsonPayload['coordinates'];
            eventMasterAction.onPropertyInspectorDidAppear(action, context, settings, coordinates);
        }
        else if (event == "didReceiveSettings") {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];
            eventMasterAction.onDidReceiveSettings(action, context, settings, coordinates);
        }
        else if (event == "sendToPlugin") {

            var updatedSettings = {};
            var changed = false;

            // event coming from the property inspector..
            if (jsonPayload.hasOwnProperty('ipAddress')) {

                var ipAddress = jsonPayload.ipAddress;
                changed = true;
                updatedSettings["ipAddress"] = ipAddress;
            }
            if (jsonPayload.hasOwnProperty('activatePreset')) {

                changed = true;
                var activatePreset = jsonPayload.activatePreset;
                updatedSettings["activatePreset"] = activatePreset;
            }
           if (jsonPayload.hasOwnProperty('activateCue')) {

                changed = true;
                var activateCue = jsonPayload.activateCue;
                updatedSettings["activateCue"] = activateCue;
            }
            
            if( changed  ) {
                eventMasterAction.SetSettings(context, updatedSettings);
                eventMasterAction.testEventMasterConnection( context )
            }
        }
    };
    websocket.onclose = function()
    { 
           // Websocket is closed
    };
};
