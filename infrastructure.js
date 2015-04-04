var http      = require('http');
var express = require('express');
var httpProxy = require('http-proxy');
var exec = require('child_process').exec;
var request = require("request");
var redis = require('redis');

var blueClient = redis.createClient(6380, '127.0.0.1', {});
var greenClient = redis.createClient(6379, '127.0.0.1', {});

var GREEN = 'http://127.0.0.1:5060';
var BLUE  = 'http://127.0.0.1:9090';

var app = express();

var targetServers = [blueClient, greenClient];
var targets = [BLUE, GREEN];
var num = 0;
var TARGET = targets[num];

var mirrorFlag = true



var infrastructure ={
  setup: function(){
    // Proxy.
    var options = {};
    var proxy   = httpProxy.createProxyServer(options);

    var server  = app.listen(8080, function(){
      
    });

    app.use(function(req, res, next){
        console.log("stuff");
        console.log(req.path);
        if(req.path === '/switch'){
            targetServers[num].lrange('image', 0, -1, function(err, value){
              console.log(value);
              num = 1 - num;
              TARGET = targets[num];
              for(var i = 0; i < value.length; i++){
                targetServers[num].lpush('image', value[i]);
              }
              console.log('target is ' + TARGET);
              proxy.web( req, res, {target: TARGET } );
            });
        }else if(req.path === '/upload' && mirrorFlag){
          proxy.web( req, res, {target: TARGET } );
        }else{
          console.log('target is ' + TARGET);
          proxy.web( req, res, {target: TARGET } );

        }        
    });

    if(mirrorFlag){
      // Launch green slice
      exec('forever -w --watchDirectory deploy/blue-www start deploy/blue-www/server.js 9090 6380 6379');
      console.log("blue slice");

      // Launch blue slice
      exec('forever -w --watchDirectory deploy/green-www start deploy/green-www/server.js 5060 6379 6380');
      console.log("green slice");
    }else{
      // Launch green slice
      exec('forever -w --watchDirectory deploy/blue-www start deploy/blue-www/server.js 9090 6380');
      console.log("blue slice");

      // Launch blue slice
      exec('forever -w --watchDirectory deploy/green-www start deploy/green-www/server.js 5060 6379');
      console.log("green slice");
    }

  },

  teardown: function(){
    exec('forever stopall', function(){
      console.log("infrastructure shutdown");
      process.exit();
    });
  },
}

infrastructure.setup();

// Make sure to clean up.
process.on('exit', function(){infrastructure.teardown();} );
process.on('SIGINT', function(){infrastructure.teardown();} );
process.on('uncaughtException', function(err){
  console.log(err);
  infrastructure.teardown();} );