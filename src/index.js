//API calls
var api = {
	home : function() {
		return m.request({
			method : "GET",
			url : T.apiUrl + "/threads/"
		});
	}, 
	thread : function(id) {
		return m.request({
			method : "GET",
			url : T.apiUrl + "/comments/" + id
		}).then(T.transformResponse);
	},
	newThread : function(text) {
		return m.request({
			method: "POST", 
			url : T.apiUrl + "/threads/create",
			data : { text: text }
		});
	},
	newComment : function(text, id) {
		return m.request({
			url : T.apiUrl + "/comments/create", 
			method : "POST",
			data : {
				text : text,
				parent : id
			}
		});
	},
	//Our api//
	createUser : function(email, nickName) {
		return m.request({
			url : T.apiUrl + "/user/create", 
			method : "POST",
			data : {
				email : email,
				nickName : nickName
			}
		});
	},
	submitTask : function(done, authorID, content, novelId) {
		return m.request({
			url : T.apiUrl + "/task/submit", 
			method : "POST",
			data : {
				state : done,
				authorID : authorID,
				content : content,
				novelId : novelId
			}
		});
	},
	takeTask : function() {
		return m.request({
			url : T.apiUrl + "/task/take", 
			method : "POST",
			data : {
				authorID : authorID,
				novelId : novelId
			}
		});		
	},
	getNovel : function(novelId) {
		return m.request({
			url : T.apiUrl + "/novel/get", 
			method : "GET",
			data : {
				novelId : novelId
			}
		});
	},
	listNovel : function() {
		return m.request({
			url : T.apiUrl + "/novels/", 
			method : "GET"
		});
	}
};

//Shared Views
var header = function() {
	return [
		m("h2", 
			[m("a", {
				href: "/", config:m.route
			}, "TheScholarSwordsman")
		])
	];
};

//HOME COMPONENT
// Views
// Post textarea
var newThread = function(ctrl) {
	return m("form", {
			onsubmit: ctrl.newThread
		}, [
			m("textarea", {
				value : ctrl.newText,
				oninput : function(e) {
					ctrl.newText = e.currentTarget.value;
				}
			}),
			m("input", {
				type:"submit",
				value: "Post!"
			})
		]
	);
};

var threadListItemView = function(thread) {
	return [
		m("p", [
			m("a", {
				href : "/thread/" + thread.id,
				config : m.route
			},
			m.trust(T.trimTitle(thread.text)))
		]),
		m("p.comment_count", thread.comment_count + " comment(s)"),
		m("hr") 
	];
};

//Actual component
var home = {
	controller : function() {
		var self = this;

		this.newThread = function(event) {
			api.newThread(self.newText)
				.then(function(response) {
					self.newText = "";
					var newThreads = self.threads();
					newThreads.push(response.data);
					self.threads(newThreads);
			});
			
			event.preventDefault();
		};
		
		this.loading = true;
		this.newText = "";
		this.threads = api.home();

		this.threads.then(function(response) {
			document.title = "ThreaditJS: Mithril | Home";
			self.loading = false;
			self.threads(response.data);
		}, function(response) {
			self.loading = false;
			self.error = true;
		});
	},
	view : function(ctrl, model) {
		var main; 
		if(ctrl.loading) {
			main = m("h2", "Loading");
		}
		else if(ctrl.error) {
			main = m("h2", "Error!  Try refreshing.");
		}
		else if(ctrl.notFound) {
			main = m("h2", "Not found!  Don't try refreshing!");
		}
		else {
			main = [
					ctrl.threads().map(threadListItemView),
					newThread(ctrl)
			];
		}

		return [
			header(),
			m("div.main", main)
		];
	}
};

//THREAD COMPONENT
//Views 
var replyView = function(ctrl) {
	//If the user has clicked 'reply', show the reply form
	if(ctrl.replying) {
		return m("form", {onsubmit : ctrl.submitComment}, [
			m("textarea", {
				value : ctrl.newComment,
				oninput : function(e) {
					ctrl.newComment = e.currentTarget.value;
				}
			}),
			m("input", {
				type :"submit",
				value : "Reply!"
			}),
			m("div.preview", m.trust(T.previewComment(ctrl.newComment)))
		]);
	}
	else {
		return m("a",{
			onclick: ctrl.showReplying
		},
		"Reply!");
	}
};

var threadNode = {
	controller : function(options) {
		var self = this;
		this.replying = false;
		this.newComment = "";
		this.submitComment = function(event) {
			api.newComment(self.newComment, options.node.id)
				.then(function(response) {
					self.newComment = "";
					self.replying = false;
					options.node.children.push(response.data);
			});

			event.preventDefault();
		};

		this.showReplying = function(event) {
			self.replying = true;
			self.newComment = "";
			event.preventDefault();
		};
	},
	view : function(ctrl, options) {
		return m("div.comment", [		
			m("p", m.trust(options.node.text)),
			m("div.reply", [replyView(ctrl, options.node)]),
			m("div.children", [
				options.node.children.map(
					function(child) {
						return m.component(threadNode, {node: child});
					}
				)
			])
		]);
	}
};
//Actual component
var thread = {
	controller : function(){
		var self = this;  
		this.thread = api.thread(m.route.param("id"));
		this.loading = true;

		this.thread.then(function(response) {
			document.title = "ThreaditJS: Mithril | " + T.trimTitle(response.root.text);
			self.loading = false;
			return response;
		}, 
		function(response) {
			self.loading = false;
			if(response.status==404) {
				self.notFound = true;
			}
			else {
				self.error = true;
			}
		});
	},
	view : function(ctrl) {
		T.time("Thread render");
		var node = ctrl.thread().root;
		return [
			header(), 
			m("div.main", {
				config : function() {
					T.timeEnd("Thread render");
				}
			},
			m.component(threadNode, {node: node}))];
	}
};

//Router
m.route.mode = "pathname";
m.route(document.body, "", {
	"/thread/:id" : thread,
	"" : home
});