#!/usr/bin/env node
'use strict';

var title = "JSONRPC over http";

function add(x, y){
    console.log("adding " + x + "and " + y);
    return x + y;
}

function powerStatus() {
    console.log("powerStatus()");
    return 0;
}


function allTrans() {
    console.log("AllTrans()");
    return 0;
}


function cut() {
    console.log("cut()");
    return 0;
}

function activatePreset(presetName, type) {
    console.log("activatePreset(PresetName:"+presetName+", type="+type+")");
    return 0;
}

function activateCue(cueName,type) {
    console.log("activateCue(cueName:"+cueName+", type="+type+")");
    return 0;
}

function recallNextPreset() {
    console.log("recallNextPreset()");
    return 0;
}


//over http
var http = require('http');
var url = require('url');
var JsonRPC = require('../../index');

http.createServer(function(request, response){
    var buffer = '';

    console.log("createServer... request.method= " + request.method);
    if (request.method == 'POST') {

        console.log("if POST...")
        var jrpc = new JsonRPC();

        console.log("jrpc created...")

        jrpc.dispatch('add', ['x', 'y'], add);

        console.log("jrpc add method created...")

        jrpc.dispatch('mul', ['x', 'y'], function(x, y){
            return x*y;
        });

        jrpc.dispatch('view.getTitle', function(){
            return title;
        });

        jrpc.dispatch('powerStatus', [], powerStatus);
        jrpc.dispatch('allTrans', [], allTrans);
        jrpc.dispatch('cut', [], cut);
        jrpc.dispatch('recallNextPreset', [], recallNextPreset);
        jrpc.dispatch('activatePreset', ['presetName', 'type'], activatePreset);
        jrpc.dispatch('activateCue', ['cueName', 'type'], activateCue);

        jrpc.toStream = function(_msg){
            response.writeHead(200, {"Content-Type": "application/json"});
            response.end(_msg);
        };

        request.on('data', function (data) {
            buffer += data;
        });

        request.on('end', function () {
            jrpc.messageHandler(buffer);
        });
    }
    
}).listen(9998);
