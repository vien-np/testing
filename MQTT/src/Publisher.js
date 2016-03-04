var config = require('./config');
var mqtt = require('mqtt');
var async = require('async');
var macAddress = null, v = null, ip = config.ip, user = null, group = null, tenant = null, value = '', data = '';
var client = null;
function random(low, high) {
	return Math.random() * (high - low) + low;
}
async.series([ function(callback) {

	require('getmac').getMac(function(err, macAdrs) {
		if (err) {
			throw err;
		}
		callback(null, macAdrs);
	});
}
],
function(err, results) {
	macAddress = results.toString();
	var options = {
		username : config.username,
		password : config.password,
		keepalive : 0,
		will : {
			topic : 'mydevice/offline',
			payload : macAddress
		}
	};

	client = mqtt.connect(config.gateway, options);
	client.on('connect', function() {

		// subscribe to receive config from gateway
		client.subscribe('config/' + macAddress);
		// publish into config channel to generate config info
		
		data = {
			macAddress : macAddress,
			type : config.type,
			ip : ip,
			user : user,
			group : group,
			tenant : tenant,
			title : config.title,
			value : value
		};
		console.log(data);
		client.publish('config/init', JSON.stringify(data));

		client.on('message', function(topic, message) {
			
			user = JSON.parse(message).user;
			group = JSON.parse(message).group;
			tenant = JSON.parse(message).tenant;

			setInterval(function() {
				value = Math.round(random(10, 40)).toString();
				// ip = Math.round(random(1,99));
				data = ({
					macAddress : macAddress,
					type : config.type,
					ip : ip,
					user : user,
					group : group,
					tenant : tenant,
					title : config.title,
					value : value
				});

				client.publish(group, JSON.stringify(data));
			}, config.time);
		});

	});
});
