/*
1.注册
ykrouter.map('/index',function(transition){
	ykrouter.async('./index.js',function(transition){transition.next()})	
});
2.初始化 
ykrouter.init();
3.前后切片
ykrouter.beforeEach(function(){});
ykrouter.afterEach(function(){});

SPA_RESOLVE_INIT用来作为类似jsonp的回调
transition用来处理页面跳转状态，暂存to next，方便链式调用
 */
!function(window){
	var util = {
		getParams : function() {
			var hashDetail,url,allparams,params={};
			hashDetail = location.hash.split('?');
			url = hashDetail[0].split('#')[1];
			allparams = hashDetail[1]?hashDetail[1].split('&'):[];
			for(var i = 0; i < allparams.length; i++) {
				params[allparams[i].split('=')[0]] = allparams[i].split('=')[1];
			}
			return {
				url: url,
				params: params
			}
		}
	}
	function ykrouter() {
		this.routers = {};
		this.beforeFunc = null;
		this.afterFunc = null;
		window.SPA_RESOLVE_INIT = null;
	}
	ykrouter.prototype.init = function() {
		var self = this;
		window.addEventListener('load',function() {
			self.urlChange();
		})
		window.addEventListener('hashchange',function() {
			console.log("123");
			self.urlChange();
		});
	}
	ykrouter.prototype.refresh = function(url) {
		var self = this;
		if(self.beforeFunc) {
			self.beforeFunc({
				to:{
					path:util.getParams().url,
					query:util.getParams().params
				},
				next:function(){
					self.routers[url].callback.call(self,util.getParams(url));
				}
			});
		}
		else {
			this.routers[url].callback.call(self,util.getParams(url));
		}
	}
	ykrouter.prototype.urlChange = function() {
		var url = util.getParams().url;
		var param = util.getParams().parmas;
		if(this.routers[url]) {
			this.refresh(url);
		}
		else {
			location.hash = '/index';
		}
	}
	ykrouter.prototype.async = function(targetJs,transition) {
		var self = this;
		if(self.routers[transition.url].fn) {
			self.afterFunc && self.afterFunc(transition);
			self.routers[transition.url].fn(transition);
		}
		else {
			var enteryPoint = document.getElementsByTagName('body')[0];
			var ele = document.createElement('script');
			ele.type= 'text/javascript';
			ele.async = true;
			ele.src = targetJs;
			SPA_RESOLVE_INIT = null;
			ele.onload = function() {
				self.afterFunc && self.afterFunc(transition);
				self.routers[transition.url].fn = SPA_RESOLVE_INIT;
				self.routers[transition.url].fn(transition);
			}
			enteryPoint.appendChild(ele);
		}
		
	}
	ykrouter.prototype.sync = function(targetJs,transition) {
		var self = this;
		if(self.routers[transition.url].fn) {
			self.afterFunc && self.afterFunc(transition);
			self.routers[transition.url].fn(transition);
		}
		else {
			var enteryPoint = document.getElementsByTagName('body')[0];
			var ele = document.createElement('script');
			ele.type= 'text/javascript';
			ele.src = targetJs;
			SPA_RESOLVE_INIT = null;
			ele.onload = function() {
				self.afterFunc && self.afterFunc(transition);
				self.routers[transition.url].fn = SPA_RESOLVE_INIT;
				self.routers[transition.url].fn(transition);
			}
			enteryPoint.appendChild(ele);
		}
	}
	ykrouter.prototype.map = function(index,cb) {
		var path = index.replace(/\s*/g,'');
		if(cb && Object.prototype.toString.call(cb) === "[object Function]") {
			this.routers[index] = {
				callback: cb,
				fn:null //存储异步js的执行
			}
		}
	}
	ykrouter.prototype.beforeEach = function(cb) {
		if(cb && Object.prototype.toString.call(cb) === "[object Function]") {
			this.beforeFunc = cb;	
		}
	}
	ykrouter.prototype.afterEach = function(cb) {
		if(cb && Object.prototype.toString.call(cb) === "[object Function]") {
			this.afterFunc = cb;
		}
	}
	window.router = new ykrouter();
}(window)