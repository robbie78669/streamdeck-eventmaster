
var websocket = null;
var pluginUUID = null;
var settingsCache = {};
var jrpc = null;
       
var DestinationEnum = Object.freeze({ "HARDWARE_AND_SOFTWARE": 0, "HARDWARE_ONLY": 1, "SOFTWARE_ONLY": 2 })

var eventMasterAction = {
    
    onKeyDown: function (action, context, settings, coordinates, userDesiredState) {
        
        var jSON_method = "";
        var jSON_params = "";
        var jSON_host = settings.ipAddress;
        var jSON_port = settings.port;
        var jSON_id = "1234";

        if( action == "com.barco.eventmaster.alltrans" ) {
           jrpc.call("allTrans", []).then(function (result) {
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

        jrpc = new simple_jsonrpc();

        //configure the http request..
        jrpc.toStream = function(_msg){
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState != 4) return;

                try {
                    JSON.parse(this.responseText);
                    jrpc.messageHandler(this.responseText);
                }
                catch (e){
                    console.error(e);
                }
            };

            xhr.open("POST", "http://"+ host + ":" + port, true);
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xhr.send(_msg);
        };
    },

    SetTitle: function (action, context, keyPressCounter) {
    },

    SetSettings: function (context, settings) {
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
        else if (event == "sendToPlugin") {

            /*if (jsonPayload.hasOwnProperty('setValue')) {

                var newValue = jsonPayload.setValue;
                eventMasterAction.SetSettings(context, { "keyPressCounter": newValue });
                eventMasterAction.SetTitle(context, newValue);

            }*/

        }
    };

    websocket.onclose = function () {
        // Websocket is closed
    };
};


