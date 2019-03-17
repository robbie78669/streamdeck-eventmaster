
var websocket = null;
var pluginUUID = null;
var settingsCache = {};
var socket = null;
var jrpc = new simple_jsonrpc();
    
       
var DestinationEnum = Object.freeze({ "HARDWARE_AND_SOFTWARE": 0, "HARDWARE_ONLY": 1, "SOFTWARE_ONLY": 2 })

function isEmpty( obj ) {
    for (var key in obj) {
        if( obj.hasOwnProperty(key))
            return false;
    }

    return true;
}

function isValidIpAndPort(ipAddress, port) {
    
    var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    if( validateNum(port, 1025, 65535) && ipAddress.match(ipformat) )
        return true;

    return false;
}

function validateNum(input, min, max) {
    var num = +input;
    return num >= min && num <= max && input === num.toString();
}


var eventMasterAction = {
    
    testEventMasterConnection: function ( context ) {

        if( isEmpty(settingsCache) )
            return;

        var settings = settingsCache[context];
        if( settings && isValidIpAndPort(settings.ipAddress, settings.port) ) {
                jrpc.toStream = function(_msg){
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (this.readyState != 4) return;
        
                    try {
                        JSON.parse(this.responseText);
                        jrpc.messageHandler(this.responseText);
                    }
                    catch (e){
                        eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
                    }
                };
        
                try {
                    xhr.open("POST", "http://" + settings.ipAddress + ":" + settings.port, true);
                    xhr.setRequestHeader('Content-type', 'text/plain; charset=utf-8');
                    xhr.send(_msg);
                }
                catch (e){
                    eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
                }
            };

            jrpc.call("powerStatus", []).then(function (result) {
                if( result == 0)
                    eventMasterAction.SetStatus(context, "Connection Established");
                else    
                    eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
            });
        }
        else
            eventMasterAction.SetStatus(context, "Cannot detect Event Master on the the network");
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
        if( settings.ipAddress && settings.port ) {
            jrpc.toStream = function(_msg){
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (this.readyState != 4) return;
        
                    try {
                        JSON.parse(this.responseText);
                        jrpc.messageHandler(this.responseText);
                    }
                    catch (e){
                        eventMasterAction.SetStatus(context, "Error Message received:"+e)
                    }
                };
        
                xhr.open("POST", "http://" + settings.ipAddress + ":" + settings.port, true);
                xhr.setRequestHeader('Content-type', 'text/plain; charset=utf-8');
                xhr.send(_msg);
            };
            
            if( action == "com.barco.eventmaster.alltrans" ) {
                jrpc.call("allTrans", []).then(function (result) {
                if( result == 0)
                    eventMasterAction.SetStatus(context, "Connection Established");
                else    
                    eventMasterAction.SetStatus(context, "Error Message received:"+result);
                });
            }
            else if (action == "com.barco.eventmaster.cut") {
                jrpc.call("cut", []).then(function (result) {
                if( result == 0)
                    eventMasterAction.SetStatus(context, "Connection Established");
                else    
                    eventMasterAction.SetStatus(context, "Error Message received:"+result);
                });
            }
            else if (action == "com.barco.eventmaster.recallnextpreset") {
                jrpc.call("recallNextPreset", []).then(function (result) {
                if( result == 0)
                    eventMasterAction.SetStatus(context, "Connection Established");
                else    
                    eventMasterAction.SetStatus(context, "Error Message received:"+result);
                });
            }
            else if (action == "com.barco.eventmaster.recallpreset") {
                jrpc.call("activatePreset", ["PresetName:"+settings.presetName, "type:"+settings.presetMode]).then(function (result) {
                    if( result == 0)
                    eventMasterAction.SetStatus(context, "Connection Established");
                else    
                    eventMasterAction.SetStatus(context, "Error Message received:"+result);
                });
            }
            else if (action == "com.barco.eventmaster.recallcue"){
                jrpc.call("activateCue", ["cueName:"+settings.cueName, "type:"+settings.cueMode]).then(function (result) {
                    if( result == 0)
                    eventMasterAction.SetStatus(context, "Connection Established");
                else    
                    eventMasterAction.SetStatus(context, "Error Message received:"+result);
                });
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


function connectSocket(inPort, inPluginUUID, inRegisterEvent, inInfo) {
    pluginUUID = inPluginUUID

    // Open the web socket
    websocket = new WebSocket("ws://localhost:" + inPort);

    function registerPlugin(inPluginUUID) {
        var json = {
            "event": inRegisterEvent,
            "uuid": inPluginUUID
        };

        websocket.send(JSON.stringify(json));
    };

    websocket.onopen = function () {
        // WebSocket is connected, send message
        registerPlugin(pluginUUID);
    };

    websocket.onmessage = function (evt) {
        // Received message from Stream Deck
        var jsonObj = JSON.parse(evt.data);
        var event = jsonObj['event'];
        var action = jsonObj['action'];
        var context = jsonObj['context'];
        var jsonPayload = jsonObj['payload'] || {};

        if (event == "keyDown") {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];
            var userDesiredState = jsonPayload['userDesiredState'];
            eventMasterAction.onKeyDown(action, context, settings, coordinates, userDesiredState);
        }
        else if (event == "keyUp") {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];
            var userDesiredState = jsonPayload['userDesiredState'];
            eventMasterAction.onKeyUp(action, context, settings, coordinates, userDesiredState);
        }
        else if (event == "willAppear") {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];
            eventMasterAction.onWillAppear(action, context, settings, coordinates);
        }
        else if (event == "propertyInspectorDidAppear") {
            var settings = jsonPayload['settings'];
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
            if (jsonPayload.hasOwnProperty('port')) {

                changed = true;
                var port = jsonPayload.port;
                updatedSettings["port"] = port;
            }
            if (jsonPayload.hasOwnProperty('presetName')) {

                changed = true;
                var presetName = jsonPayload.presetName;
                updatedSettings["presetName"] = presetName;
            }
            if (jsonPayload.hasOwnProperty('presetMode')) {

                changed = true;
                var presetMode = jsonPayload.presetMode;
                updatedSettings["presetMode"] = presetMode;
            }
            if (jsonPayload.hasOwnProperty('cueName')) {

                changed = true;
                var cueName = jsonPayload.cueName;
                updatedSettings["cueName"] = cueName;
            }
            if (jsonPayload.hasOwnProperty('cueMode')) {

                changed = true;
                var cueMode = jsonPayload.cueMode;
                updatedSettings["cueMode"] = cueMode;
            }
            
            if( changed  ) {
                eventMasterAction.SetSettings(context, updatedSettings);
                eventMasterAction.testEventMasterConnection( context )
            }
            
        }
        
    };

    websocket.onclose = function () {
        // Websocket is closed
    };
};


