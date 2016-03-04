
//brokerAddress point out ActiveMQ address

/**
 * @param brokerAddress
 * @param sensorType
 */
function sensor(brokerAddress, sensorType,ip){
	var config = require('./config');
	var mqtt = require('mqtt');
	var async = require('async');
	
	var  macAddress = null
		,ip = ip
		,user = null
		,group = null
		,tenant = null
		,value = null
		,data = null
		,sensor = null
		,gateway = null
		,ramdom = null;
	function random(low, high) {
		return Math.random() * (high - low) + low;
	}
	var	value1 = Math.round(random(10, 99)).toString();
	var	value2 = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0,2);
	var	value3 = Math.round(random(10,99)).toString();
	var	value4 = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0,2);
	var	value5 = Math.round(random(10,99)).toString();
	var	value6 = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0,2);

//	macAddress = results.toString()+":"+value4+value3;
	macAddress = value1+":"+value2+":"+value3+":"+value4+":"+value5+":"+value6;
//		ramdom =  ip + Math.round(random(1, 255)).toString();
//		
//		ramdom =	   ['104.236.220.70'
//			          , '183.111.169.205'
//			          , '41.0.181.251'
//			          , '113.255.49.49'
//			          , '203.71.220.140'
//			          , '2.139.222.95'
//			          , '85.17.209.180'
//			          , '115.159.5.247'
//			          , '202.167.248.186'
//			          , '201.219.181.107'
//			          , '118.97.137.150'
//			          , '41.160.223.252'
//			          , '192.99.54.41'
//			          , '91.143.199.80'
//			          ][Math.floor(Math.random() * 14)];
		var options = {
			 username : config.username
			,password : config.password
			,keepalive : 0
			,will : {
				topic : 'mydevice/offline'
				,payload : macAddress
				}
			};
		
		sensor = mqtt.connect(brokerAddress, options);
		sensor.on('connect', function() {
			// subscribe to receive config from gateway
			sensor.subscribe('config');
			// publish into config channel to generate config info
			data = {
				 macAddress : macAddress
				,type : config.type
				,ip : ip
				,user : user
				,group : group
				,tenant : tenant
				,value : value
			};
			sensor.publish('config/init', JSON.stringify(data));
			sensor.on('message', function(topic, message) {
				if('config'===topic){
					if(JSON.parse(message).macAddress === macAddress){
						user = JSON.parse(message).user;
						group = JSON.parse(message).group;
						tenant = JSON.parse(message).tenant;
						console.log("Senser is working..");
						setInterval(function() { 
							if(null!==sensorType && "PIR" === sensorType){
								value = ['-1', '-2'][Math.floor(Math.random() * 2)];
							}else{
							value = Math.round(random(10, 40)).toString();
							}
							data = ({
									 macAddress : macAddress
									,sensorType : sensorType
									,ip : ip
									,user : user
									,group : group
									,tenant : tenant
									,gateway : brokerAddress
									,value : value
								});
							sensor.publish('logstash', JSON.stringify(data));
							}, config.time);
					}
				}	
			});
		});
}
exports.sensor = sensor;


