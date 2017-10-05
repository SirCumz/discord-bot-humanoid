'use strict';

class Module {

    constructor( bot ) 
    {
        this.bot = bot;

        this.commands = [];

        this.catagory = "Basic";

        this.icon = null;

        this.color = bot.ColorSuccess;        
    }


    command( command  )
    {
        //this.regex = new RegExp(`^${call}s?$`, 'i');
        command = Object.assign({
            name: null, 
            regex: `^${command.name}$`,         
            description: null,
            args: [],
            DM: false,
            module: this
        }, command);

        this.commands.push( command );
    }


    run( message, command )
    {
        //
    }


    SendPrivateMessage(user, message, embed, tts) {
        user.openDM().then(c => {
            c.sendMessage(message, tts, embed);                    
        }).catch(err => {

        });   
    }       

}

module.exports = Module;