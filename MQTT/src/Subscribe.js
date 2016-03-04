var mqtt = require('mqtt');
var http_post = require('http-post');
var gw_config = require('./gw_config');
//var http = require('http');
var http_post = require('http-post');

var client = mqtt.connect(gw_config.gateway, {
	username : gw_config.username,
	password : gw_config.password
});
var macAddress = null;
var data = null;
var topic ='sensor';
client.on('connect', function() {
	client.subscribe('config/init');
	client.subscribe('mydevice/offline');
	client.on('message', function(topic, message) {
		//Generating config for sensor
		if('config/init'===topic){
			macAddress = JSON.parse(message).macAddress;
			
			data = {
				macAddress : macAddress,
				type : JSON.parse(message).type,
				ip : JSON.parse(message).ip,
				user : gw_config.user,
				group : gw_config.group,
				tenant : gw_config.tenant,
				title : JSON.parse(message).title,
				value : JSON.parse(message).value,
				isActive: 1
			};

			//Check and publish to sensor...
			if(null !== macAddress){
				http_post("http://localhost:3000/checkMacAddress",data, function(res){
				    res.setEncoding('utf8');
				    res.on('data', function(chunk) {
//				        console.log(chunk);
				    });
				});
				client.publish('config/' + macAddress.toString(), JSON.stringify(data));			
			}
			client.subscribe(gw_config.group);
			
		}
//		console.log(message);
		if ('mydevice/offline' === topic) {
			console.log(message+' has gone!');
			var dt = {macAddress:macAddress};
			http_post("http://localhost:3000/setInActive", dt, function(res){
//				console.log(dt);
			    res.setEncoding('utf8');
			    res.on('data', function(chunk) {
			        console.log(chunk);
			    });
			});
        }
		if('workplace' === topic){
			data = {
					macAddress : macAddress,
					type : JSON.parse(message).type,
					ip : JSON.parse(message).ip,
					user : gw_config.user,
					group : gw_config.group,
					tenant : gw_config.tenant,
					title : JSON.parse(message).title,
					value : JSON.parse(message).value
				};
			http_post("http://localhost:3000/recordData",data, function(res){
			    res.setEncoding('utf8');
			    res.on('data', function(chunk) {
//			        console.log(chunk);
			    });
			});
			console.log(message);
		}
	});


});

