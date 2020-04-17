'use strict';

const {dialogflow} = require('actions-on-google');
const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion, QuickReplies } = require('dialogflow-fulfillment');
const axios = require('axios');
const admin = require('firebase-admin');
const rp = require('request');
const url = "https://soa.actcorp.in/api/chatbot/getOptions";
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
const app = dialogflow({debug: true});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
	const agent = new WebhookClient({ request: request, response: response });
	console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
	console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

	function checkContext(){
		var parameter=request.body.queryResult.parameters;
		var contexts={};
		var con ={};
		var verifotp={};
		if(parameter.input_param == ''){
			console.log('no params');
		} else{
			con = agent.getContext('account_no');
			console.log('find here');
			console.log(con);
			//if(1){
			if(con==null || con==''  || !(con.parameters.value)){ 
				var acc=  request.body.queryResult.queryText;
			
				return new Promise(function (resolve, reject) {
					secondapi(agent); 
				});
				
			} else {
				console.log('call multi action api');  

			}

		}

	}

	function fallback(agent) {
		//checkContext();
		return new Promise(function (resolve, reject) {
			checkContext(agent); 
		});
	}


	function firstapi(agent) { 
		if (request.body.originalDetectIntentRequest.source == 'facebook') {
			// if(1){
			var params = { source: request.body.originalDetectIntentRequest.source };
			return new Promise(function (resolve, reject) {
				axios.post(`https://soa.actcorp.in/api/chatbot/getOptions`, params).then((result) => {
					console.log(result.headers);
					var cookieValue = result.headers['set-cookie']; 
					let cookiee=[];
					 cookieValue.forEach(element => {
		                
		                 var cookieValue_array = element.split(";"); 
		                 console.log(cookieValue_array );
		                 var ciValue = cookieValue_array[0];
		                 console.log(ciValue);
		                 var cicookieValue_array = ciValue.split("="); 
		                 console.log(cicookieValue_array); 
		                var cicookieValue = cicookieValue_array[1];
		                 console.log(cicookieValue);
		             // agent.setContext({name: 'ci_session', lifespan: 4, parameters: {'ci_cookie': cicookieValue}});
		              cookiee.push(cicookieValue);
  
		                 
		                 
		                });
		              console.log('below');
		             		console.log(cookiee);
		             		 
		                    var ci_seesion=cookiee.toString(); 
		                    console.log('above');
		                      console.log('below');
		                    console.log(ci_seesion); 
		                      console.log('above');
                  
					var resultarray = result.data;   
					
					if (resultarray.code == 200 && !(resultarray.authenticate)) {
						var fullfilment = resultarray.fulfillment;
						fullfilment.forEach(element => {
							var messages = element.messages;
							messages.forEach(element => { 
								var r = {
										"messages": [
											{
												"platform": "FACEBOOK",
												"quickReplies": {
													"quickReplies": element.replies,
													"title": element.title
												}
											}
											]
								};

								let responseJson = {};
								responseJson.fulfillmentMessages = r.messages;
								responseJson.fulfillmentMessages = r.messages;
								console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
								response.json(responseJson);
							});
						});
					}
				}).catch(error => {
					console.log(`Api is not working`); 
					//agent.add(`Api is not working`);
				});
			});

		}

		else if (request.body.originalDetectIntentRequest.source == 'google') {
			console.log(`Hey, Im your Act Google Assistant`);
			//agent.add(`Hey, Im your Act Google Assistant`);
		} 
	}

	function secondapi(agent) {  	
			return new Promise(function (resolve, reject) {
				if (request.body.originalDetectIntentRequest.source == 'facebook') {
					var accno=request.body.queryResult.parameters.input_param;
					console.log('check');
					console.log(accno);
					if(!(accno)){
					    accno=request.body.queryResult.queryText; 
					} 
					console.log(accno);
					var params={};  
					console.log(request.body);
					params = { source: request.body.originalDetectIntentRequest.source,data:[{input_param:accno}] };
					console.log(params);
					
					/*var config = {
							  headers: { 'Content-Type': 'application/json;charset=utf-8' },
							  Cookie: 'blob' 
							}; */
					axios.defaults.headers = {
					        'Content-Type': 'application/json', 
					        'Cookie': 'abcdrashmi' 
					    };
				axios.post(`https://soa.actcorp.in/api/chatbot/authCustomer`, params).then((result) => {
					
					console.log(result.headers);
					 console.log(result.headers['set-cookie']);
					 var cookiee = [];
		             var cookieValue = result.headers['set-cookie']; 
		             console.log(cookieValue); 
		             
		            
					
					var rr={};
					var resultarray = result.data;
					console.log(resultarray);  
					var fullfilment = resultarray.fulfillment;
					if (resultarray.code == 200 && (resultarray.status)) {
						fullfilment.forEach(element => {
							var messages = element.messages;

							messages.forEach(element => { 
								var rr = {
										"messages": [
											{
												"platform": "FACEBOOK",
												"quickReplies": {
													"quickReplies": element.replies,
													"title": element.title
												}
											}
											]	
								};

								let responseJson = {};
								responseJson.fulfillmentMessages = rr.messages;
								console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
								response.json(responseJson);
							});
						});

					} else if (resultarray.code == 200 && (!resultarray.status) ){
						var r={};
						agent.setContext({name: 'account_no', lifespan: 2, parameters: { value: false }});
						fullfilment.forEach(element => { 
							var messages = element.messages;
							messages.forEach(element => {
								/*var r = {
										"messages": [
											{
												"text": { 
													"text": [
														element.speech
														]
												},
												"platform": "FACEBOOK"
											}
											]      
								};*/

								var r = [
									{
										"text": { 
											"text": [
												element.speech
												]
										},
										"platform": "FACEBOOK"
									}
									] ;
								let responseJson = {};
								responseJson = { fulfillmentMessages: r }; 
								console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
								response.json(responseJson);


							});

						});

					}
					else{
						//agent.add('something went wrong');
                      console.log('something went wrong');
					}
				}).catch(error => {
					//agent.add(`Api is not working`);
				});
			} else if (request.body.originalDetectIntentRequest.source == 'google') {
				//agent.add(`Hey, Im your Act Google Assistant`);
	            console.log('Hey, Im your Act Google Assistant');
			}
		}); 
		



	}

	function welcome(agent) { 
		return new Promise(function (resolve, reject) {
			firstapi();
		});

	}

	function internet(agent) {

		var parameter=request.body.queryResult.parameters;
		var params={};
		if(parameter.input_param == ''){
			agent.setContext({name: 'account_no', lifespan: 2, parameters: { value: false }});
			agent.add('Please enter your account number/username/registered mobile number');
		}else{
			var acc=  parameter.input_param;
			var accno=acc.toString();
			params = { source: request.body.originalDetectIntentRequest.source,data:[{input_param:accno}] };
			return new Promise(function (resolve, reject) {
				secondapi(agent);
			});

		}


	}
	

	function slowspeed(agent){  
		
		agent.setContext({name: 'ci_session', lifespan: 4, parameters: {value: 'nnnnn'}});
			var r= [
					{
						"text": { 
							"text": [ 
								'iiiiiiiiiiiiiiiiiiiiiiiiiiii'
								]
						},
						"platform": "FACEBOOK"
					}
					]    ;  
			
			
		 

		let responseJson = {};
		responseJson = { fulfillmentMessages: r };
		console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
		response.json(responseJson);
	}
	
	

		

	function sendResponse(responseToUser) {
		if (typeof responseToUser === 'string') {
			let responseJson = { fulfillmentText: responseToUser }; // displayed
			// response
			response.json(responseJson); // Send response to Dialogflow

		} else { 
			let responseJson = {};
			// Define the text response
			responseJson.fulfillmentText = responseToUser.fulfillmentText;

			if (responseToUser.messages) {
				responseJson.fulfillmentMessages = responseToUser.messages;
			}

			if (responseToUser.outputContexts) {
				responseJson.outputContexts = responseToUser.outputContexts;
				// agent.setContext(responseToUser.outputContexts);
			}
			console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
			response.json(responseJson);
		}
 
	}


	let intentMap = new Map();
	intentMap.set('Default Welcome Intent', welcome);
	intentMap.set('Default Fallback Intent', fallback);
	intentMap.set('Internet not working', internet); 
	intentMap.set('SlowSpeed', slowspeed);  

	agent.handleRequest(intentMap);
});
