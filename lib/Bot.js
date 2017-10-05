String.prototype.padLeft = function(char, length) { 
    return char.repeat(Math.max(0, length - this.length)) + this;
}

String.prototype.padRight = function(char, length) { 
    return  this + char.repeat(Math.max(0, length - this.length));
}

String.prototype.ucfirst = function() { 
    return  this.replace(/\b[a-z]/g, function(letter) {
        return letter.toUpperCase();
    });
}


function Bot()
{
    var Discordie = require("discordie");
    var request = require("request");
    var _ModuleManager = require("./ModuleManager");

    const Events = Discordie.Events;
    const client = new Discordie();
    const ModuleManager = new _ModuleManager(this, client, Events, request);

    this.ColorError = 0xDD4A68;
    this.ColorPrimary = 0x3498db;
    this.ColorSuccess = 0x34d058;
    this.ColorWarning = 0xf1e05a;

    this.config = require("../config");

    // Start the bot
    // @scope: public
    this.start = function()
    {
        client.connect({
            "token": this.config.token,
            autoReconnect: true, 
        });


        client.Dispatcher.on(Events.GATEWAY_READY, e => {
            console.log("connected as: " + client.User.username);
           
            client.User.setGame(this.config.prefix + this.config.game);

            this.config.modules.forEach( (module, index) => { this.module(module); } );
        });


        client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
           
            ModuleManager.parse(e.message);
        });        
        
        process.title = this.config.botname;
        
        process.stdin.resume();//so the program will not close instantly

        function exitHandler(options, err) {
            if(err) console.log(err);

            client.disconnect();
            process.exit();
        }

        //do something when app is closing
        process.on('exit', exitHandler.bind(null,{exit:true}));

        //catches ctrl+c event
        process.on('SIGINT', exitHandler.bind(null, {exit:true}));

        //catches uncaught exceptions
        process.on('uncaughtException', exitHandler.bind(null, {exit:true}));        
    }


    this.moduleManager = function()
    {
        return ModuleManager;
    }

    this.client = function()
    {
        return client;
    }


    this.Events = function()
    {
        return Events;
    }


    this.request = function(data, handler)
    {
        request(data, handler);
    }


    this.module = function( name  )
    {
        ModuleManager.register( name );
    }

}

const Humanoid = new Bot();

module.exports = Humanoid;