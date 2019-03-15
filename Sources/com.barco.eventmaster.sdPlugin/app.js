
var websocket = null;
var pluginUUID = null;
var settingsCache = {};
var jrpc = null;

var deleteThisVar=null;
       
var DestinationEnum = Object.freeze({ "HARDWARE_AND_SOFTWARE": 0, "HARDWARE_ONLY": 1, "SOFTWARE_ONLY": 2 })

function isEmpty( obj ) {
    for (var key in obj) {
        if( obj.hasOwnProperty(key))
            return false;
    }

    return true;
}

var eventMasterAction = {
    
    onPropertyInspectorDidAppear: function (action, context, settings, coordinates) {
        // send notification to property_inspector to load saved settings
       if( settingsCache != null && !isEmpty(settingsCache[context]) )  {

            var json = {
                "event": "sendToPropertyInspector",
                "context": context,
                "payload": settingsCache[context]
            };

            websocket.send(JSON.stringify(json));
        }
    },
    onKeyDown: function (action, context, settings, coordinates, userDesiredState) {
        
        jrpc = new simple_jsonrpc();

        jrpc.host=settings.ipAddress +":"+ settings.port;
        var params = ["presetNo:1.0"];
      
        if( action == "com.barco.eventmaster.alltrans" ) {
           jrpc.call("allTrans", params).then(function (result) {
                settings.status(result);
           });
        }
        else if (action == "com.barco.eventmaster.cut") {
            jrpc.call("cut", []).then(function (result) {
                settings.status(result);
            });
        }
        else if (action == "com.barco.eventmaster.recallnextpreset") {
            jrpc.call("recallNextPreset", []).then(function (result) {
                settings.status(result);
            });
        }
        else if (action == "com.barco.eventmaster.recallpreset") {
            jrpc.call("activtatePreset", ["PresetName:"+settings.presetName, "type:"+settings.presetMode]).then(function (result) {
                settings.status(result);
            });
        }
        else if (action == "com.barco.eventmaster.recallcue"){
            jrpc.call("activtateCue", ["cueName:"+settings.cueName, "type:"+settings.cueMode]).then(function (result) {
                settings.status(result);
            });
        }
        
        
    },

    onKeyUp: function (action, context, settings, coordinates, userDesiredState) {

    },

    onWillAppear: function (action, context, settings, coordinates) {
        if(settings != null ){
            settingsCache[context] = settings;
        }
    },

    SetTitle: function (action, context, keyPressCounter) {
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

    AddToSettings: function (context, newSettings) {
        settingsCache[context]
    }
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
            
            if( changed  ) {
                eventMasterAction.SetSettings(context, updatedSettings);

                var coordinates = jsonPayload['coordinates'];
                eventMasterAction.onPropertyInspectorDidAppear(action, context, updatedSettings, coordinates);
            }
            
        }
        
    };

    websocket.onclose = function () {
        // Websocket is closed
    };
};


