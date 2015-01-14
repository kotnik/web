angular.module(primaryApplicationName).service('user', function($q, $rootScope, apiProxy, LavaboomAPI, co) {
	var self = this;

	this.name = '';

	var token = null;

	var setToken = (_token) => {
		token = _token;
		LavaboomAPI.setAuthToken(_token.id);
	};

	this.singIn = function (username, password) {
		self.name = username;

		return co(function * (){
			try {
				var res = yield apiProxy('tokens', 'create', {
					type: 'auth',
					username: username,
					password: CryptoJS.SHA3(password, { outputLength: 256 }).toString()
				});

				setToken(res.body.token);

				$rootScope.$broadcast('user-authenticated');
			}
			catch (err) {
				$rootScope.$broadcast('user-authentication-error', err);
			}
			finally {
				self.isInboxLoading = false;
			}
		});
	};
});

