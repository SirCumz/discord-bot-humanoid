'use strict';

const Module = require('../lib/Module.js');


class invite extends Module {

    constructor( bot ) {
        super(bot, 
             'invite', [], 
             'Display the invitation link to authorize Bot to join a server.'
        );

        // Invite command
        this.command({
            name: 'invite',
            description: 'Display the invitation link to authorize Bot to join a server.',
            DM: true,
            args: []
        });    
    }

    run( message, command )
    {
        this.SendPrivateMessage(message.author, "", {
              color: this.bot.ColorPrimary,
              fields: [
                {name: "Invite me to your Guild.", value: "https://discordapp.com/oauth2/authorize?client_id="+this.bot.client().User.id+"&scope=bot&permissions=326495350"}
              ]
        });         
    }
}

module.exports = invite;
