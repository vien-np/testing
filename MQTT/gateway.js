function subscribe(brokerAddress){
var mqtt = require('mqtt');
//var http_post = require('http-post');
var gw_config = require('./gw_config');

var gateway = mqtt.connect(brokerAddress, {
	 username : gw_config.username
	,password : gw_config.password
	});
var amqCloud = mqtt.connect('tcp://172.16.0.115:1885', {
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
		var group = ['workplace1', 'workplace2', 'workplace3','workplace4'][Math.floor(Math.random() * 4)];
		//Generating configuration for sensor
		if('config/init'===topic){
			macAddress = JSON.parse(message).macAddress;
			data = { macAddress : macAddress
					,type : JSON.parse(message).type
					,ip : JSON.parse(message).ip
					,user : gw_config.user
					,group : group
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
			amqCloud.publish('logstash',message,'tcp://172.16.0.115:1885');
		}
	});
});
}
exports.subscribe = subscribe;


