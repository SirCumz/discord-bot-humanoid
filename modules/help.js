'use strict';

const Module = require('../lib/Module.js');


class help extends Module {

    constructor( bot ) 
    {
        super(bot);

        // Help command
        this.command({
            name: 'help',
            //regex: '^help(?:\\s+(.+))?',
            description: 'This Message.',
            DM: true,
            args: [
                //{name: 'command', description: 'The command you need help for', required: false}
            ]
        });        
    }


    run( message, command )
    {
        var cats = [];

        for(var moduleName in this.bot.moduleManager().modules) {
            var module = this.bot.moduleManager().modules[moduleName];

            var commands = module.commands;
            var fields = [];

            if(!cats[module.catagory])
            {
                cats[module.catagory] = [];
            }

            commands.forEach( (command, commandIndex) => {
                var cmdargs = "";
                var cmdargsdesc = "";

                for(var i = 0; i < command.args.length; i++)
                {
                    var argument = command.args[i];

                    var argname = "<" + argument.name + ">";
                    
                    cmdargsdesc = cmdargsdesc + "\n" + (argument.required ? "Required" : "Optional") + " " + argname + ": " + argument.description;

                    cmdargs = cmdargs + " " + argname;                   
                }  

                cats[module.catagory].push({name: this.bot.config.prefix + command.name + cmdargs, value: command.description + "\n\n" +(cmdargsdesc.length ? "```xml" + cmdargsdesc + "```" : "") + "\n\n"});                    
               
            } );            
         }   

         for( var catName in cats )
         {
            this.SendPrivateMessage(message.author, "", {
                  color: this.bot.ColorWarning,
                  //thumbnail: {url: "http://files.softicons.com/download/application-icons/help-icons-by-kyo-tux/png/128/Red.png"},
                  title: catName,
                  thumbnail: {url: "http://www.freeiconspng.com/uploads/help-icon-26.png" },
                  fields: cats[catName]
            }); 
         }

        if(message.guild) {
            message.delete().then(msg => {}, reason => {}).catch(error => {});
        }           
    }

}

module.exports = help;
