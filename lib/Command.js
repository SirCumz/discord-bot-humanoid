'use strict';

class Command {

    constructor( bot, command, args, description ) 
    {
        this.bot = bot;

        this.DM = false; 

        this.description = description;

        this.commands = [];

        this.args = args;
    }


    run( message )
    {

    }

}

module.exports = Command;