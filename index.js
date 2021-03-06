var request = require("request");
var htmlparser = require("htmlparser2");

var APPID_ANDROID = 2890984;
var APPID_IOS = 3087106;
var APPID_WP = 3502561;
var DEFAULT_APP_ID = APPID_ANDROID;

function sendAuthRequest(formAction, inputs, callback){
	//console.log("inputs = " + JSON.stringify(inputs));
	//send form with all fields
	// console.log("Sending form");
	request({   url: formAction, 
			    method: 'POST',
				form: inputs,
				jar: true
			}, function(error, response, body){
			    if(error) {
			        if (callback)
				    	callback(error, null, response);
			    } else {
			    	//handle vk redirect
			    	if (response.statusCode == 302){
				    	//console.log(response.headers.location);
				    	//go on redirect
				    	request({   
				    		url: response.headers.location, 
						    jar: true
						}, function(error, response, body){
						    if(error) {
			        			if (callback)
									callback(error, null, response);
						    } else {
						    	//console.log(JSON.stringify(response), body);
						    	//find form with access confirmation
						    	var grantAccess = null;
						    	var parser = new htmlparser.Parser({
								    onopentag: function(name, attribs){
								        if(name === "form"){
								            grantAccess = attribs.action;
								        }
								    }
								});
								parser.write(body);
								parser.end();
								//console.log("granter: " + grantAccess);
								//confirm access
								request({   url: grantAccess, 
								    jar: true
								}, function(error, response, body){
								    if(error) { 
			        					if (callback)
				    						callback(error, null, response);
								    } else {
								    	//console.log(JSON.stringify(response), body);
								    	//parse access token
								    	// console.log(response.request.uri.hash);
								    	var token = response.request.uri.hash.split('&')[0].split('=')[1];
								    	//console.log("token: " + token);
								    	if (callback)
				    						callback(error, token, response);
								    }
								});
						    }
						});
					} else {
						if (callback)
				    		callback("wrong status code!");
					}
			        //console.log(JSON.stringify(response), body);
			    }
			});
}

function accessToken(login, password, callback, appid, scope){
		var aid = DEFAULT_APP_ID; // default is android
		if (appid){
			if (typeof appid === 'string'){
				if (appid.toLowerCase() === 'android'){
					aid = APPID_ANDROID;
				} else if (appid.toLowerCase() === 'ios'){
					aid = APPID_IOS;
				} else if (appid.toLowerCase() === 'wp'){
					aid = APPID_WP;
				}
			} else {
				aid = appid;
			}
		}
		var scopes = 'notify,friends,photos,audio,video,docs,notes,pages,status,offers,questions,wall,groups,messages,notifications,stats,ads,offline'; //Ful scope
		if (scope){
			if (Array.isArray(scope)){
				scopes = scope.join(',');
			} else {
				scopes = scope;
			}
		}
		var inputs = {};	
		var formAction = null;
		var request_link = 'http://oauth.vk.com/oauth/authorize?redirect_uri=http://oauth.vk.com/blank.html&response_type=token&client_id=' + aid + '&scope=' + scopes + '&display=wap';
		// console.log("Auth page");
		request({   url: request_link,
				    jar: true	
				}, 
				function (error, response, body) {
					// console.log("  in response: " + error + " " + response.statusCode);
					// console.log(request_link);
				    if (!error && response.statusCode == 200) {
				    	var parser = new htmlparser.Parser({
						    onopentag: function(name, attribs){
						        if(name === "form"){
						            // console.log("forma.action: "+attribs.action);
						            formAction = attribs.action;
						        }
						        if (name === "input"){
						        	if (attribs.type === "hidden" || attribs.type === "text" || attribs.type === "password"){
						        		inputs[attribs.name] = attribs.value || "";
						        	}
						        }
						    }
						});
						parser.write(body); // parse all input fields
						parser.end();
						inputs["email"] = login; // change login and password input fields
						inputs["pass"] = password;
						sendAuthRequest(formAction, inputs, callback); // make request
				    } else {
				    	if (callback)
				    		callback(error, null, response);
				    }
				}
		);
	}	


module.exports = {getAccessToken: accessToken};