'use strict';

const Module = require('../../lib/Module.js');
const VoidGlitch = require('./VoidGlitch.js');
const AsciiTable = require('ascii-table');

class VoidGlitchModule extends Module {

    constructor( bot ) 
    {
        super(bot);

        this.catagory = "Void Glitch";

        // relic command
        this.command({
            name: 'relic',
            regex: '^relic\\s+(.+)',
            description: 'Displays the best drop location for the given relic',
            DM: true,
            args: [
                {name: 'relic', description: 'The relic to find eg: NEO V5', required: true} 
            ]
        });

        // Queue command
        this.command({
            name: 'node',
            regex: '^node\\s+(.+)',
            description: 'Find out which relics drop on the selected node.',
            DM: true,
            args: [
                {name: 'node', description: 'Name of the Node eg: Despina.', required: true} 
            ]
        });

        this.command({
            name: 'find',
            regex: '^(?:where|find)\\s+(.+)',
            description: 'Search for an item (relics, prime parts, mods, nodes etc..)',
            DM: true,
            args: [
                {name: 'item', description: 'The item to find eg: synthula, vitality etc', required: true} 
            ]
        });  
    }


    run( message, command )
    {
        //
    }

    runFind( message, item )
    {
        item = item.toLowerCase();
        var items = [];
        var relics = [];
        var search = item;

        if(search.length < 3)
        {
            message.channel.sendMessage( "", false, {
                 color: this.bot.ColorError,
                 description: "Your search term is to short! (it should be at least 3 characters long)",
            }).then(message => {
              message.addReaction("💩"); 
            });   

            return;            
        }

        if(VoidGlitch.relics[item])
        {
            return this.runRelic(message, item);
        }

        if(VoidGlitch.nodes[item])
        {
            return this.runNode(message, item);
        }

        if(!VoidGlitch.wheres[item])
        {
            // try to find in the wheres array
            for(var key in VoidGlitch.wheres){
                if( key.match( new RegExp('^' + item, 'gi') ) )
                {
                    items.push(VoidGlitch.wheres[key]);
                }
            }
        }
        else
        {
            items = [VoidGlitch.wheres[item]];
        }


        // try to find a prime part
        for(var key in VoidGlitch.primeparts) {
            if( key.match( new RegExp('^' + item, 'gi') ) )
            {
                relics.push({
                    name: key,
                    relics: VoidGlitch.primeparts[key]
                });
            }
        }   

        // if there are any prime parts (relics)
        if(relics.length)
        {
            var fields = [];

            fields.push({name: "Find ("+search+"):", value: "Humanoid found: **" + relics.length +" items**"});

            relics.forEach((item) => {
            
                var table = new AsciiTable();  

                table.setAlignLeft(0).setAlignLeft(1).setAlignLeft(2).setHeadingAlignLeft().setHeading('Relic','Rarity','Vaulted');

                for( var i = 0; i < item.relics.length; i++ )
                {
                    var relic = VoidGlitch.relics[item.relics[i]];
                    var part = relic.rewards[item.name];
                    table.addRow(item.relics[i].toUpperCase(), part.rare.ucfirst(), (relic.vaulted) ? 'True' : 'False');
                }
          
                fields.push({name: part.item.ucfirst(), value: "```haskell\n" + table.toString() + "```"});          
            });

            message.channel.sendMessage( "", false, {
                color: this.bot.ColorSuccess,
                fields: fields
            });               
        }

        // if the are any "wheres"
        if(items.length)
        {
            items.forEach((item) => {

                var fields = [];
                
                var locations = [];

                fields.push({name: "Where is ("+search+"):", value: "Humanoid found: **" + item.name+"**"});

                item.locations.forEach(function(loc, index)
                {      
                    if(index > 12)
                        return;

                    var node = VoidGlitch.nodes[loc.node];   

                    if(!locations[loc.node])
                    {
                        locations[loc.node] = {
                            node: node,
                            items: []
                        };
                    }

                    locations[loc.node].items.push(loc);
                });  

                for( var index in locations ) 
                {    
                    var data = locations[index];
                    var table = new AsciiTable();
                    table.setAlignRight(0).setAlignRight(1).setAlignCenter(2).setHeading('Amount','Chance','Rotation');

                    data.items.forEach(function(item, index_item){
                        table.addRow(item.amount, item.chance + "%", item.rotation);
                    });
                    
                    fields.push({name: data.node.name + " (" + data.node.planet + ") | " + VoidGlitch.MissionTypes[data.node.mission_type].value + " | " + VoidGlitch.Factions[data.node.faction].value, value: "```haskell\n" + table.toString() + "```"});
                };  

                message.channel.sendMessage( "", false, {
                    color: this.bot.ColorSuccess,
                    fields: fields
                });             
            });
        }
        


        if(!relics.length && !items.length)
        {
            message.channel.sendMessage( "", false, {
                 color: this.bot.ColorError,
                 description: "**" + search + "** not found.",
            }).then(message => {
              message.addReaction("💩"); 
            });   
        }
    }


    runRelic( message, relicToFInd)
    {
        relicToFInd = relicToFInd.toLowerCase().trim();
        var res = relicToFInd.split(" ");
        var relicType = res[0];  
        var relicNr = res[1];       

        if( VoidGlitch.relics[relicToFInd] )
        {
            var relic = VoidGlitch.relics[relicToFInd];
            var rewardStr = "";    
            var locations = [];
            var fields = [];

            if(relic.vaulted)
            {               
                fields.push({name: "_ _", value: "This relic is currently in the [Prime Vault](http://warframe.wikia.com/wiki/Prime_Vault)"});              
            }
            else
            {
                relic.locations.forEach(function(item, index)
                { 
                    if(index > 10)
                        return;  

                    var node = VoidGlitch.nodes[item.node];   

                    if(!locations[item.node])
                    {
                        locations[item.node] = {
                            node: node,
                            items: []
                        };
                    }

                    locations[item.node].items.push(item);
                });       

                for( var index in locations ) 
                {    
                    var data = locations[index];
                    var table = new AsciiTable();
                    table.setAlignRight(0).setAlignCenter(1).setHeading('Chance','Rotation');

                    data.items.forEach(function(item, index_item){                      
                        table.addRow(item.chance + "%", item.rotation);
                    }); 

                    fields.push({name: data.node.name + " (" + data.node.planet + ") | " + VoidGlitch.MissionTypes[data.node.mission_type].value + " | " + VoidGlitch.Factions[data.node.faction].value, value: "```haskell\n" + table.toString() + "```"});                  
                }
            }

            for( var itemname in relic.rewards)
            { 
                var item = relic.rewards[itemname];

                rewardStr+= "\n\n" + "**" +item.item + "** | " + item.rare.ucfirst() + " | **" + item.ducats + "** Ducats";                                    
            }

            fields.push({name: "Relic Rewards:", value: rewardStr});

            message.channel.sendMessage( "", false, {
                color: this.bot.ColorSuccess,
                thumbnail: {url: VoidGlitch.RelicImages[relicType], width: 160, height:107},
                title: relicToFInd.toUpperCase() + " RELIC",
                description: "Drop locations (Top 10):",
                fields: fields
            });    
        } 
        else 
        {      
            message.channel.sendMessage( "", false, {
                 color: this.bot.ColorError,
                 description: "**" + relicToFInd.toUpperCase() + "** is not valid.",
            }).then(message => {
              message.addReaction("💩"); 
            });    
        }      
    }    


    runNode(message, tile)
    {
        tile = tile.toLowerCase();  
        
        if( VoidGlitch.nodes[tile] )
        {            
            var TileSet = VoidGlitch.nodes[tile];

            if(TileSet.relics.length)
            {
                var table = new AsciiTable();
                table.setAlignRight(0).setAlignCenter(1).setAlignLeft(2).setHeading('Chance','Rotation', 'Relic');

                TileSet.relics.forEach(function(item, index)
                {
                    var chance = item.chance + "%";  
                    table.addRow(item.chance + "%", item.rotation, item.relic.toUpperCase());               
                });  
                
                var nodeStr = "```haskell\n" + table.toString() + "```";              
            } 
            else
            {
                var nodeStr = TileSet.name + " ("+TileSet.planet+") does not drop any relics.";
            }


            message.channel.sendMessage( "", false, {
                color: this.bot.ColorSuccess,
                title: (TileSet.name + " ("+TileSet.planet+") - "+VoidGlitch.MissionTypes[TileSet.mission_type].value+" - "+VoidGlitch.Factions[TileSet.faction].value + ( TileSet.archwing ? 'Archwing' + (TileSet.sharkwing ? ' (Submersible)' : '') : '' )),
                description: "The following relics will drop on this location." + TileSet.name + " ("+TileSet.planet+")",
                fields: [
                    {name: "_ _", value: nodeStr},
                ]
            });    
        } 
        else 
        {
            message.channel.sendMessage( "", false, {
                 color: this.bot.ColorError,
                 description: "**" + tile + "** is not valid.",
            }).then(message => {
              message.addReaction("💩"); 
            });    
        }      
    }
}

module.exports = VoidGlitchModule;
