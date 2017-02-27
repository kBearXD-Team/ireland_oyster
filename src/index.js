//API calls
var apiUrl = "http://hschueh.ddns.net:3001/api"
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
	/* User */
	createUser : function(username, password, facebookId) {
		return m.request({
			url : apiUrl + "/users/", 
			method : "POST",
			data : {
			    username: username,
			    password: password,
			    facebook_id: facebookId
			}
		});
	},
	getUser : function(userId) {
		return m.request({
			url : apiUrl + "/users/" + ((undefined == userId)?"":userId),
			method : "GET"
		});
	},
	updateUser : function(userId, username, facebookId, description) {
		return m.request({
			url : apiUrl + "/users/" + userId,
			method : "PUT",
			data : {
				username : username,
				facebook_id : facebookId,
				description : description
			}
		});
	},
	deleteUser : function(userId) {
		return m.request({
			url : apiUrl + "/users/" + userId,
			method : "DELETE"
		});
	},
	/* Novels */
	createNovel : function(title) {
		return m.request({
			url : apiUrl + "/novels/", 
			method : "POST",
			data : {
				title : title
			}
		});
	},
	listNovel : function() {
		return m.request({
			url : apiUrl + "/novels/", 
			method : "GET"
		});
	},
	submitTask : function(novelId, chapterId) {
		return m.request({
			url : apiUrl + "/novels/submit/" + novelId,
			method : "POST",
			data : {
				chapter : chapterId
			}
		});
	},
	takeTask : function(authorId, novelId) {
		return m.request({
			url : apiUrl + "/novels/take/" + novelId, 
			method : "PUT",
			data : {
				user : authorId
			}
		});		
	},
	getNovel : function(novelId) {
		return m.request({
			url : apiUrl + "/novels/get/" + novelId, 
			method : "GET"
		});
	},
	deleteNovel : function(novelId) {
		return m.request({
			url : apiUrl + "/novels/delete/" + novelId,
			method : "DELETE"
		});
	},
	/* Chapters */
	getChapter : function(chapterId) {
		return m.request({
			url : apiUrl + "/chapters/" + ((undefined == chapterId)?"":chapterId),
			method : "GET"
		});
	},
	createChapter : function(authorId, novelId, content) {
		return m.request({
			url : apiUrl + "/chapters/",
			method : "POST",
			data : {
				author : authorId,
				novel : novelId,
				content : content
			}
		});
	},
	updateChapter : function(chapterId, authorId, content, rate) {
		return m.request({
			url : apiUrl + "/chapters/" + chapterId,
			method : "PUT",
			data : {
				author : authorId,
				content : content,
				rate : rate
			}
		});
	},
	deleteChapter : function(chapterId) {
		return m.request({
			url : apiUrl + "/chapters/" + chapterId,
			method : "DELETE"
		});
	},
	login : function(){
		FB.login(function(response) {
		    if (response.authResponse) {
		     console.log('Welcome!  Fetching your information.... ');
		     fbId = response.authResponse.userID;
		     isLogin = true;
		     FB.api('/me', function(response) {
		       fbName = response.name;
		       console.log('Good to see you, ' + response.name + '.');
		       m.redraw();
		     });
		     FB.api('/'+fbId+'/picture?width=800', function(response) {
		       picUrl = response.data.url;
		       m.redraw();
		     });
		    } else {
		     console.log('User cancelled login or did not fully authorize.');
		    }
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
		]),
		loginButton()
	];
};

var isLogin = false;
var picUrl = "";
var fbId = "";
var fbName = "";
var loginButton = function() {
	if(isLogin && picUrl != ""){
		return m("img[alt='User Pic'][src='" + picUrl + "']",
			{style: {"width": "128px", "height": "128px"}
		}
		);
	}
	else {
		return m("button", {
			onclick: api.login
			}, 
	    	"Login by facebook"
		);	
	}
};

//HOME COMPONENT
// Views
// Post textarea
/*var newThread = function(ctrl) {
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
};*/

var createNovelForm = function(ctrl) {
	return m("form", {
			onsubmit: ctrl.createNovel
		}, [
			m("textarea", {
				value : ctrl.newText,
				oninput : function(e) {
					ctrl.newText = e.currentTarget.value;
				}
			}),
			m("input", {
				type:"submit",
				value: "CreateNovel!"
			})
		]
	);
};

/*var threadListItemView = function(thread) {
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
};*/

var novelListItemView = function(novel) {
	return [
		m("p", [
			m("a", {
				href : "/novel/" + novel._id,
				config : m.route
			},
			m.trust(T.trimTitle(novel.title)))
		]),
		m("p.chapter_count", novel.chapters.length + " chapter(s)"),
		m("hr") 
	];
};

//Actual component
var home = {
	controller : function() {
		var self = this;

		this.createNovel = function(event) {
			api.createNovel(self.newText)
				.then(function(response) {
					self.newText = "";
					var newNovels = self.novels();
					newNovels.unshift(response);
					self.novels(newNovels);
			});
			
			event.preventDefault();
		};
		
		this.loading = true;
		this.newText = "";
		this.novels = api.listNovel();

		this.novels.then(function(response) {
			document.title = "ThreaditJS: Mithril | Home";
			self.loading = false;
			self.novels(response);
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
					ctrl.novels().map(novelListItemView),
					createNovelForm(ctrl)
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
/*var replyView = function(ctrl) {
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
};*/

var takeTaskBtn = function(ctrl) {
	if(ctrl.novel().status == "open") {
		return m("button", {
			onclick: ctrl.takeTask
			}, 
	    	"Take task!"
		);
	}
	else {
		return m("button", {
			onclick: ctrl.submitTask
			}, 
	    	"Submit task without content"
		);
	}
};

var chapterSubmitForm = function(ctrl) {
	if(ctrl.inEdit == true) {
		return m("form", {
				onsubmit: ctrl.updateChapter
			}, [
				m("textarea", {
					value : ctrl.chapter().content,
					oninput : function(e) {
						ctrl.newText = e.currentTarget.value;
					}
				}),
				m("input", {
					type:"submit",
					value: "SubmitChapter!"
				})
			]
		);
	}
};

var fbLoginBtn = function(){
	return m(".fb-login-button[data-auto-logout-link='true'][data-max-rows='1'][data-show-faces='false'][data-size='xlarge']");
}

/*var threadNode = {
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
};*/
//Actual component
/*var thread = {
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
};*/

var novel = {
	controller : function(){
		var self = this;  

		this.takeTask = function(event) {
			api.takeTask("58b052eb8e6019201f0eb1c7", self.novel()._id)
				.then(function(response) {
    				self.novel(response);
    				
    				if (true) {
    					api.createChapter("58b052eb8e6019201f0eb1c7", self.novel()._id, "test")
	    					.then(function(response) {
		    					self.chapter = api.getChapter(response._id);
		    					self.inEdit = true;
		    					self.newText = response.content;
	    					}
    					);
    				}
    				
			});
			
			event.preventDefault();
		};

		this.submitTask = function(event) {
			api.submitTask(self.novel()._id, self.chapter()._id)
				.then(function(response) {
    			self.novel(response);	
			});
			
			event.preventDefault();
		};

		this.updateChapter = function(event) {
			api.updateChapter(self.chapter()._id, "58b052eb8e6019201f0eb1c7", self.newText, "0")
				.then(function(response) {
						inEdit = false;
						if (true) {
							api.submitTask(this.novel()._id, this.chapter()._id);
						}
					}, 
					function(response) {
						self.loading = false;
						if(response.status==404) {
							self.notFound = true;
						}
						else {
							self.error = true;
						}
					}
				);
				
			event.preventDefault();
		}

		this.novel = api.getNovel(m.route.param("id"));
		this.loading = true;
		this.inEdit = false;

		this.novel.then(function(response) {
			document.title = response.title;
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
		return [
			header(),
			m("h2", ctrl.novel().title),
			takeTaskBtn(ctrl),
			chapterSubmitForm(ctrl)
			];
	}
};
var chapter = {
	controller : function(){
		var self = this;  

		this.createChapter = function(event) {
			api.createChapter("58b052eb8e6019201f0eb1c7", self.novel()._id)
				.then(function(response) {
    				self.novel(response);
			});
			
			event.preventDefault();
		};

		this.novel = api.getNovel(m.route.param("id"));
		this.loading = true;

		this.novel.then(function(response) {
			document.title = response.title;
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
		return [
			header(),
			m("h2", ctrl.novel().title),
			takeTaskBtn(ctrl)
			];
	}
};


//Router
m.route.mode = "pathname";
m.route(document.body, "", {
	//"/thread/:id" : thread,
	"/novel/:id" : novel,
	"/chapter/:id" : chapter,
	"" : home
});

