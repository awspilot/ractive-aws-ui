
var $session;
(function() {
	function session() {
	}
	session.prototype.account_list = function() {
		var accounts = JSON.parse(localStorage.getItem("accounts") || "[]")

		return accounts
	}

	session.prototype.account_add = function( name, key, endpoint ) {

		var new_account = {
			id: id=Math.random().toString().slice(2),
			name: name,
			key: key,
			endpoint: endpoint,
		}
		var account_list = this.account_list();
		account_list.push( new_account )

		localStorage.setItem("accounts", JSON.stringify(account_list))

	}
	session.prototype.account_delete = function( account ) {
		var account_list = this.account_list().filter(function(a) { return a.id !== account.id })
		localStorage.setItem("accounts", JSON.stringify(account_list))
	}

	$session = new session()
})($session)
