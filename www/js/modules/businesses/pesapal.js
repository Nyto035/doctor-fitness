'use strict';
(function(){
	window.pesapal = {
		get : function(url, params, then){
			url = url.indexOf("?") > -1 ? url : url + "?" + params;
			var xhr = new XMLHttpRequest();
			xhr.open("GET", url, true);
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhr.onreadystatechange = function(){
				console.log(xhr);
				if (this.readyState == 4 && this.status == 200 && "function" == typeof then) then(xhr.responseText);
			};
			xhr.send();
		},
		post : function(url, params, then){
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url, true);
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhr.onreadystatechange = function(){
				if (this.readyState == 4 && this.status == 200 && "function" == typeof then) then(xhr.responseText);
			};
			xhr.send(params);
		},
		serializeObject : function(object, prepend){
			var serial = "";
			var p = function(k, v){
				if ("undefined" !== typeof prepend && prepend !== null) k = prepend + "[" + k + "]";
				if ("object" === typeof v && v !== null) return serial.trim().length < 1 ? mySerialize(v, k) : "&" + mySerialize(v, k);
				v = v !== null ? encodeURIComponent(v) : "";
				v = "undefined" !== typeof k && k !== null ? v = k + "=" + v : v;
				return serial.trim().length < 1 ? v : "&" + v;
			};
			if ("number" === typeof object.length && object.length < 1){
				var key = prepend;
				prepend = undefined;
				serial += p(key, "");
			}
			else if ("object" === typeof object && object != null){
				for (var key in object) if (object.hasOwnProperty(key)) serial += p(key, object[key]);
			}
			else {
				serial += p(prepend, object);
			}
			return serial;
		},
		trackTransaction : function(type, tracking_id, merchant_reference){
			this.get(this.server, pesapal.serializeObject({
				pesapal_notification_type : type,
				pesapal_transaction_tracking_id : tracking_id,
				pesapal_merchant_reference : merchant_reference
			}), function(response){
				console.log("trackTransaction: ", response);
			});
		},
		isElement : function(obj){
			try {
				return obj instanceof HTMLElement;
			}
			catch(e){
				return (typeof obj==="object") && (obj.nodeType===1) && (typeof obj.style === "object") && (typeof obj.ownerDocument ==="object");
			}
		},
		animateFunc : function(opts){
			var start = new Date;
			var id = setInterval(function(){
				var timePassed = new Date - start;
				var progress = timePassed / opts.duration;
				if (progress > 1) progress = 1;
				var delta = opts.delta(progress);
				opts.step(delta);
				if (progress == 1) clearInterval(id);
			}, opts.delay || 10)
		},
		animate : function(to, duration, easing, delay, update){
			this.animateFunc({
				delay: delay || 10,
				duration: duration || 1000,
				delta: easing,
				step: function(delta){
					if ("function" === typeof update) update(to * delta);
				}
			});
		},
		spinner_gif : "data:image/gif;base64,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",
		spinner : function(parent){
			if (!this.isElement(parent)) return;
			var gif = this.spinner_gif;
			var spinner_wrapper = document.createElement("div");
			spinner_wrapper.id = "pesapal_spinner_wrapper";
			spinner_wrapper.className = "pesapal_spinner_wrapper";
			spinner_wrapper.style = "border-radius: 5px;position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: block;";
			var spinner = document.createElement("div");
			spinner.id = "pesapal_spinner";
			spinner.className = "pesapal_spinner";
			spinner.style = "border-radius: 5px; margin: 20% auto; max-width: 150px; background: #fff; padding: 10px; text-align: left; box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5); font-size: 12px; font-family: Helvetica, Arial;";
			spinner.innerHTML = "<div style=\"padding: 10px;\"><img style=\"margin: 0 10px -5px 0;\" src=\"" + gif + "\" /> Please wait...</div>";
			spinner_wrapper.appendChild(spinner);
			return {
				gone : false,
				dismiss : false,
				spinner : spinner,
				pos : parent.style.position,
				error : function(title, message){
					spinner.style.maxWidth = "250px";
					spinner.innerHTML = "<div style=\"padding: 5px 5px 2px;font-weight: bold; font-size: 14px;\">" + title + "</div><div style=\"font-size: 14px; padding: 2px 5px 5px;\">" + message + "</div>";
					var it = this; it.dismiss = true; setTimeout(function(){ it.hide(); }, 3000);
				},
				hideSlow : function(){
					var it = this;
					it.dismiss = false;
					var easing = function (t) { return t*(2-t) };
					pesapal.animate(1, 500, easing, 10, function(d){
						spinner_wrapper.style.opacity = (1 - d);
						if (d >= 1){
							it.dismiss = true;
							it.hide();
						}
					});
				},
				show : function(){
					var it = this;
					parent.style.position = "relative";
					parent.appendChild(spinner_wrapper); 
					spinner_wrapper.addEventListener("click", function(){
						if (it.dismiss) it.hideSlow();
					});
				},
				hide : function(){
					if (this.gone || !this.dismiss) return;
					parent.removeChild(spinner_wrapper);
					parent.style.position = this.pos;
					this.gone = true;
				}
			}
		},
		createIframe : function(parent, iframe_data_url){
			var gif = this.spinner_gif;
			try {
				if (this.isElement(parent) && "string" === typeof iframe_data_url && iframe_data_url.length > 0){
					var iframe_wrapper = document.createElement("div");
					iframe_wrapper.id = "pesapal_iframe_wrapper";
					iframe_wrapper.className = "pesapal_iframe_wrapper";
					iframe_wrapper.style = "overflow-y: auto; overflow-x: hidden; z-index: 100; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: block;";
					var iframe_container = document.createElement("div");
					iframe_container.id = "pesapal_main_iframe_container";
					iframe_container.className = "pesapal_main_iframe_container";
					iframe_container.style = "border-radius: 4px; background: transparent; padding: 10px; margin: 100px auto; max-width: 800px; min-height: 100px;";
					var iframe_container_loading = document.createElement("div");
					iframe_container_loading.id = "pesapal_iframe_loading";
					iframe_container_loading.style = "padding: 20px;font-size: 12px;font-family: Helvetica, Arial;background: #fff;width: 250px;border-radius: 5px; margin: 100px auto;";
					iframe_container_loading.innerHTML = "<img style=\"margin: 0 10px -5px 0;\" src=\"" + gif + "\" /> Preparing checkout. Please wait...";
					iframe_container.appendChild(iframe_container_loading);
					var iframe_container_data = document.createElement("div");
					iframe_container_data.id = "iframe_container_data";
					iframe_container_data.className = "iframe_container_data";
					iframe_container_data.style.display = "none";				
					var main_iframe = document.createElement("iframe");
					main_iframe.id = "pesapal_iframe";
					main_iframe.src = iframe_data_url;
					main_iframe.width = "100%";
					main_iframe.height = "540px";
					main_iframe.frameBorder = "0";
					main_iframe.addEventListener("load", function(e){
						var iframeLoading = document.getElementById("pesapal_iframe_loading");
						if (pesapal.isElement(iframeLoading)){
							iframeLoading.style.display = "none";
							iframeLoading.parentElement.removeChild(iframeLoading);
						}
						document.getElementById("iframe_container_dismiss_button").style.display = "inline-block";
						document.getElementById("pesapal_main_iframe_container").style.margin = "10px auto";
						document.getElementById("pesapal_main_iframe_container").style.background = "#fff";
						document.getElementById("iframe_container_data").style.display = "block";					
					});				
					iframe_container_data.appendChild(main_iframe);
					iframe_container.appendChild(iframe_container_data);
					var iframe_container_dismiss = document.createElement("div");
					iframe_container_dismiss.style = "text-align: right";
					var iframe_container_dismiss_button = document.createElement("button");
					iframe_container_dismiss_button.id = "iframe_container_dismiss_button";
					iframe_container_dismiss_button.className = "iframe_container_dismiss_button";
					iframe_container_dismiss_button.style = "display: none; border-radius: 4px; font-size: 11px; padding: 7px 10px; min-width: 50px; background: #555; color: #fff; border: none;";
					iframe_container_dismiss_button.innerHTML = "Close Window";
					iframe_container_dismiss_button.addEventListener("click", function(){
						iframe_container_dismiss_button.disabled = true;
						var iframe_dismiss_confirm = document.createElement("div");
						iframe_dismiss_confirm.style = "padding: 10px;background: rgb(255, 255, 255);width: 300px;position: absolute;left: calc(50% - 160px);top: 200px;box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.59);border-radius: 4px;font-family: Helvetica, Arial;font-size: 14px;font-weight: bold;";
						var iframe_dismiss_confirm_text = document.createElement("div");
						iframe_dismiss_confirm_text.style = "padding-bottom: 30px;padding-top: 10px;";
						iframe_dismiss_confirm_text.innerHTML = "Are you sure you want to close?";
						iframe_dismiss_confirm.appendChild(iframe_dismiss_confirm_text);
						var iframe_dismiss_confirm_buttons = document.createElement("div");
						iframe_dismiss_confirm_buttons.style = "text-align: right;";
						var iframe_dismiss_confirm_button_close = document.createElement("button");
						iframe_dismiss_confirm_button_close.style = "padding: 5px 10px;min-width: 80px;margin-left: 10px;background: #a81414;border: none;border-radius: 4px;color: #fff;";
						iframe_dismiss_confirm_button_close.innerHTML = "Close";
						iframe_dismiss_confirm_button_close.className = "pesapal_dismiss_confirm_button";
						iframe_dismiss_confirm_button_close.addEventListener("click", function(){
							var parent = iframe_dismiss_confirm.parentElement;
							parent.parentElement.removeChild(parent);
						});
						iframe_dismiss_confirm_buttons.appendChild(iframe_dismiss_confirm_button_close);
						var iframe_dismiss_confirm_button_cancel = document.createElement("button");
						iframe_dismiss_confirm_button_cancel.style = "padding: 5px 10px;min-width: 80px;margin-left: 10px;background: #9E9E9E;border: none;border-radius: 4px;color: #fff;";
						iframe_dismiss_confirm_button_cancel.className = "pesapal_dismiss_confirm_button";
						iframe_dismiss_confirm_button_cancel.innerHTML = "Cancel";
						iframe_dismiss_confirm_button_cancel.addEventListener("click", function(){
							iframe_dismiss_confirm.parentElement.removeChild(iframe_dismiss_confirm);
							iframe_container_dismiss_button.disabled = false;
						});
						iframe_dismiss_confirm_buttons.appendChild(iframe_dismiss_confirm_button_cancel);
						iframe_dismiss_confirm.appendChild(iframe_dismiss_confirm_buttons);
						iframe_wrapper.appendChild(iframe_dismiss_confirm);
					});
					iframe_container_dismiss.appendChild(iframe_container_dismiss_button);			
					iframe_container.appendChild(iframe_container_dismiss);
					var iframe_container_style = document.createElement("style");
					iframe_container_style.innerHTML = ".iframe_container_dismiss_button:hover,.iframe_container_dismiss_button:focus { background: #a81414 !important; cursor: pointer; }.pesapal_dismiss_confirm_button:hover,.pesapal_dismiss_confirm_button:focus { cursor: pointer; background: #444 !important; color: #fff !important; }";
					iframe_container.appendChild(iframe_container_style);			
					iframe_wrapper.appendChild(iframe_container);
					return {
						show : function(){
							parent.appendChild(iframe_wrapper);
						},
						hide : function(){
							parent.removeChild(iframe_wrapper);
						}
					}
				}
				else throw "Invalid internal iframe creation arguments";
			}
			catch (e){
				console.error(e);
				var error_callback = function(){ console.error("Error: pesapal iframe was not successfully loaded"); };
				return {
					hide : error_callback,
					show : error_callback
				}
			}
		},
		getFrame : function(){
			var frame =  document.getElementById("iframe_container_data").querySelector("iframe");
			console.log(frame);
			return frame;
		},
		server : "pesapal.php",
		init : function(options){
			var defaults = {
				server : "pesapal.php",
				paymentHTML : "",
				formPreHTML : "",
				container : document.querySelector("body"),
				beforeCreate : function(e){},
				beforeSubmit : function(form, event){},
                                setPesapalFrameParam : function(){ return 1; },
				inputNode : "input",
				buttonNode : "button",
				inputColor : "#0382bb",
				inputLabelColor : "#555",
				placeholderColor : "#cacaca",
				textColor : "#000",
				inputNames : true,
				inputEmail : true,
				inputPhone : true,
				namesRequired : false,
				emailRequired : true,
				phoneRequired : true,
				checkoutButtonHTML : "Proceed Checkout",
				checkoutButtonClassName : "pesapal_input_button",
				setFirstName : "",
				setLastName : "",
				setEmail : "",
				setPhone : ""
			};
			var settings = Object.assign({}, defaults, options);
			this.server = settings.server;
			var container = this.isElement(settings.container) ? settings.container : document.querySelector("body");
			if ("string" === typeof settings.container && settings.container.length > 0) container = document.querySelector(settings.container);
			if (!this.isElement(container)) container = document.querySelector("body");
			if (this.isElement(container)){
				var form = document.createElement("form");
				var divContents = [settings.paymentHTML, settings.formPreHTML];
				for (var key in divContents){
					if (divContents.hasOwnProperty(key) && divContents[key].trim().length > 0){
						var div = document.createElement("div");
						div.style = "margin-top: 10px;";
						div.innerHTML = divContents[key];
						form.appendChild(div);
					}				
				}
				if (!settings.inputNames && !settings.inputEmail && !settings.inputPhone){
					console.error("Pesapal.js Error:", "Invalid settings. Input for phone number or email address is required!");
					return;
				}
				var inputs = {};
				if (settings.inputNames){
					inputs.first_name = "First Name";
					inputs.last_name = "Last Name";
				}
				if (settings.inputEmail) inputs.email = "Email Address";
				if (settings.inputPhone) inputs.phone_number = "Phone Number";
				var requiredNames = [];
				if (settings.namesRequired) requiredNames = ["first_name","last_name"];
				if (settings.emailRequired) requiredNames.push("email");
				if (settings.phoneRequired) requiredNames.push("phone_number");
				for (var key in inputs){
					if (inputs.hasOwnProperty(key)){
						var input = document.createElement(settings.inputNode);
						var input_text = inputs[key];
						if (requiredNames.constructor === Array && requiredNames.length > 0 && requiredNames.indexOf(key) > -1){
							input_text += " <span style='color: red'>*</span>";
						}
						var input_value = "";
						if (key == "first_name") input_value = settings.setFirstName;
						if (key == "last_name") input_value = settings.setLastName;
						if (key == "email") input_value = settings.setEmail;
						if (key == "phone_number") input_value = settings.setPhone;
						input.value = input_value;
						input.id = "pesapal_input_" + key;
						input.className = "pesapal_input_" + key;
						input.name = key;
						input.type = "text";
						input.placeholder = inputs[key];
						input.style = "color: " + settings.inputColor + "; width: calc(100% - 20px); padding: 5px; margin-top: 2px; border: 1px solid #eee;";
						var div = document.createElement("div");
						div.className = "pesapal_input";
						div.style = "margin-top: 10px;";
						div.innerHTML = "<span class=\"pesapal_input_label\" style=\"color: " + settings.inputLabelColor + "; font-weight: bold;\">" + input_text + "</span><br>";
						div.appendChild(input);
						form.appendChild(div);
					}
				}
				var button = document.createElement(settings.buttonNode);
				button.id = "pesapal_input_button"
				button.className = settings.checkoutButtonClassName;
				button.type = "submit";
				button.style = "margin-top: 20px; min-width: 100px; padding: 10px;";
				button.innerHTML = settings.checkoutButtonHTML;
				var div = document.createElement("div");
				div.className = "pesapal_input";
				div.style = "text-align: right;"
				div.appendChild(button);
				form.appendChild(div);
				if (settings.namesRequired || settings.emailRequired || settings.phoneRequired){
					var info = document.createElement("div");
					info.innerHTML = "<span style='color: red'>*</span> Ensure to fill in one of these fields";
					info.style = "margin: 10px 0; font-size: 12px; font-style: italics; font-weight: bold;";
					form.appendChild(info);
				}			
				var placeholderColor = settings.placeholderColor;
				var placeholderStyles = document.createElement("style");
				placeholderStyles.innerHTML = ".pesapal_input>input::-webkit-input-placeholder {color: " + placeholderColor + ";}" +
					".pesapal_input>input:-moz-placeholder {color: " + placeholderColor + ";}" +
					".pesapal_input>input::-moz-placeholder {color: " + placeholderColor + ";}" +
					".pesapal_input>input:-ms-input-placeholder {color: " + placeholderColor + ";}";
				form.appendChild(placeholderStyles);
				form.method = "post";
				form.id = "pesapal_form";
				form.className = "pesapal_form";
				form.style = "color: " + settings.textColor + "; relative: relative; margin: 0; width: calc(100% - 20px); padding: 10px; background: #fff; font-family: Helvetica, Arial; font-size: 12px;";
				form.onsubmit = function(event){
					var formElement = this;
					if ("function" === typeof settings.beforeSubmit) settings.beforeSubmit(this, event);
					var inputs = formElement.querySelectorAll(settings.inputNode);
					var data = { pesapal_frame : settings.setPesapalFrameParam() };
					for (var i = 0; i < inputs.length; i++){
						var input = inputs[i];
						var name = input.name;
						var value = input.value;
						data[name] = value;
					}
					var formParent = formElement.parentElement;
					if (formParent == null) formParent = formElement;
					var spinner = pesapal.spinner(formElement);
					spinner.show();
					pesapal.post(pesapal.server, pesapal.serializeObject(data), function(responseText){
						spinner.dismiss = true;
						try {
							var iframe_data = JSON.parse(responseText);							
							if (iframe_data.hasOwnProperty("response") && iframe_data.hasOwnProperty("data")){
								var iframe_data_response = iframe_data.response;
								var iframe_data_text = iframe_data.data;
								console.log(iframe_data_response, iframe_data_text);
								if (iframe_data_response == "success"){
									spinner.hide();
									var superParent = formParent;
									while (superParent.parentElement != null && superParent.parentElement.parentElement != null) superParent = superParent.parentElement;
									var iframe_show = pesapal.createIframe(superParent, iframe_data_text);
									iframe_show.show();
								}
								else spinner.error("Error!", iframe_data_text);						
							}
							else spinner.error("Response Error!", responseText);
						}
						catch (e){
							console.error(e);
							console.info("Server response before error: ", responseText);
							spinner.error("Internal Error!", "Pesapal frame error!");
						}
					});
					return false;
				}
				if ("function" === typeof settings.beforeCreate) settings.beforeCreate(form);
				container.appendChild(form);
			}
		}
	};
})();