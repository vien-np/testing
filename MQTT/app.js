var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mysql = require("mysql");
var path = require('path');
var mqtt = require('mqtt');
var gw_config = require('./gw_config');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var increasement =1;

function Controller(router) {

	this.handleRoutes(router);
}

function dataEmit(gateway){

	
	var server = mqtt.connect(gateway, {
		 username : gw_config.username
		,password : gw_config.password
		});
	server.on('connect', function() {
		server.subscribe('logstash');
		server.on('message', function(topic, message) {
			if('logstash' === topic){
				var data = function() {
					return {
					macAddress : JSON.parse(message).macAddress
					,sensorType : JSON.parse(message).sensorType
					,ip : JSON.parse(message).ip
					,user : JSON.parse(message).user
					,group : JSON.parse(message).group
					,tenant : JSON.parse(message).tenant
					,gateway : JSON.parse(message).gateway.substring(6, 23)
					,value : JSON.parse(message).value
					};
				};
				// send data to webpage
				io.emit('data', data());
				console.log(message);
			}
		});
	});
}
function Server() {
	var self = this;
	self.configureExpress();
}

//Configuration Express and do start server
Server.prototype.configureExpress = function() {
	var self = this;
	app.use(bodyParser.urlencoded({
		extended : true
	}));
	app.use(bodyParser.json());
	var router = express.Router();
	app.use('/', router);
	app.use(express.static(path.join(__dirname, 'public')));
	app.set('view engine', 'ejs');
	var rest_router = new Controller(router);
	self.startServer();
};

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

//Start server at port 3100
Server.prototype.startServer = function() {
	//run 4 gateways as there are 4 gateways simulation, each gateway charge for an activemq broker
	require("./gateway.js").subscribe("tcp://172.16.0.115:1881");
	require("./gateway.js").subscribe("tcp://172.16.0.115:1882");
	require("./gateway.js").subscribe("tcp://172.16.0.115:1883");
	require("./gateway.js").subscribe("tcp://172.16.0.115:1884");
	http.listen(server_port,server_ip_address, function() {
		console.log('Server running on ' + server_ip_address + ':' + server_port );
	});
	//recieve data from a topin in ActiveMQ cloud broker then emit to webpage
	dataEmit("tcp://172.16.0.69:1883");
	dataEmit("tcp://172.16.0.115:1885");
};
//Stop server
Server.prototype.stop = function(err) {

	console.log("ISSUE WITH MYSQL n" + err);
	process.exit(1);
};

Controller.prototype.handleRoutes = function(router) {
	
	
	router.get("/", function(req, res) {
		res.sendFile(__dirname + '/public/index.html');
	});
	
	router.post("/createSensor",function(req, res) {
	var ssQtt = req.body.sensorQuantity;
	var brokerAddr = req.body.brokerAddress;
	var ssType = req.body.sensorType;
	
	var ipList =	   ['104.236.220.70'
			          , '183.111.169.205'
			          , '41.0.181.251'
			          , '113.255.49.49'
			          , '203.71.220.140'
			          , '2.139.222.95'
			          , '85.17.209.180'
			          , '115.159.5.247'
			          , '202.167.248.186'
			          , '201.219.181.107'
			          , '118.97.137.150'
			          , '41.160.223.252'
			          , '192.99.54.41'
			          , '91.143.199.80'
			          ]
	if(null !== ssQtt && brokerAddr==='tcp://172.16.0.117:1883'){
		var count =ipList.length;
		
		for(var i = 0; i < ssQtt; i++){
			if(increasement <= count && i <= count){
				require("./sensor_IpList.js").sensor(brokerAddr,ssType, ipList[i]);
				
			
			}else{
				require("./sensor_IpList.js").sensor(brokerAddr,ssType,"172.16.117."+increasement);
			}
			increasement++;
			
		}
	}
//	console.log(ssQtt + ":"+brokerAddr + ":"+ssType);
	if(null !== ssQtt && brokerAddr!=='tcp://172.16.0.117:1883'){
		for(var i = 1; i <= ssQtt; i++){
			require("./sensor.js").sensor(brokerAddr,ssType,i);
		}
	}
	res.sendFile(__dirname + '/public/index.html');
	});
};
var server = new Server();


