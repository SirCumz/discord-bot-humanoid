var _ = require('lodash');

function ModuleManager(bot, client, Events, request)
{
    this.bot = bot;
    this.client = client;
    this.Events = Events;
    this.request = request;

    this.modules = [];

    this.parse = function( message )
    {
        if( message.content.startsWith(this.bot.config.prefix) )
        {
            var commandStr = message.content.substr(this.bot.config.prefix.length);  

            root:

            for( var index in this.modules ) 
            {
                var module = this.modules[index];

                for( var cmdIndex in module.commands ) 
                {
                    var command = module.commands[cmdIndex];

                    var matches = commandStr.match( new RegExp(command.regex, 'i') );

                    if( matches ) 
                    {
                        // Check if this command is allowed to run by private message
                        if(!command.DM && !message.channel.guild) 
                        {
                              message.channel.sendMessage( "", false, {
                                   color: this.bot.ColorError,
                                   description: "This command is not allowed by private message.",
                              }).then(message => {
                                message.addReaction("💩"); 
                              });              
                        } 
                        else
                        {                       
                            message.addReaction("✅");

                            var guildstr = (message.channel.guild) ? message.channel.guild.name : "DM";
                            
                            console.log( "Command: " + message.content + " | Author: " + message.author.username + " (" + message.author + ") | Guild: " + guildstr );

                            var func = _.camelCase('run ' + command.name);
                            
                            if( func in module )
                            {
                                matches.shift();
                                matches.unshift(message);                                
                                module[func].apply(module, matches);            
                            }
                            else
                            {
                                matches.shift();
                                matches.unshift(command); 
                                matches.unshift(message);                                      
                                module.run.apply(module, matches);            
                            }                                  
                        } 

                        break root;    
                    }                           
                } 
            }
        }
    }


    this.register = function( moduleName )
    {
        if (!this.modules[moduleName]) 
        {         
           const mod = require('../modules/' + moduleName);

           // new module
           this.modules[moduleName] = new mod(this.bot); 
        }
    }
}

module.exports = ModuleManager;
