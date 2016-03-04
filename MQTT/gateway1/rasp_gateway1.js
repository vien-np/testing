var mqtt = require('mqtt');
//var http_post = require('http-post');
var gw_config = require('./gw_config');

var gateway = mqtt.connect(gw_config.gateway, {
	 username : gw_config.username
	,password : gw_config.password
	});
var amqCloud = mqtt.connect(gw_config.amqCloud, {
	 username : gw_config.username
	,password : gw_config.password
	});	
var macAddress = null;
var data = null;
gateway.on('connect', function() {
	gateway.subscribe('config/init');
	gateway.subscribe('mydevice/offline');
	gateway.subscribe('logstash');
	gateway.on('message', function(topic, message) {
		//Generating configuration for sensor
		if('config/init'===topic){
			macAddress = JSON.parse(message).macAddress;
			data = { macAddress : macAddress
					,type : JSON.parse(message).type
					,ip : JSON.parse(message).ip
					,user : gw_config.user
					,group : gw_config.group
					,tenant : gw_config.tenant
					,value : JSON.parse(message).value
					,isActive: 1
					};
		// Check and publish to sensor...
			if(null !== macAddress){
				gateway.publish('config', JSON.stringify(data));			
			}
		}
		if ('mydevice/offline' === topic) {
			console.log(message+' has gone!');
			var dt = {macAddress:macAddress};
        }
		
		if('logstash' === topic){
			 //Send data to ActiveMQ cloud side
			amqCloud.publish('logstash',message);
		}
	});
});


