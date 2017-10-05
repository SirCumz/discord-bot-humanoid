'use strict';

const Module = require('../../lib/Module.js');
const MusicPlayer = require('./Music.js');


class Music extends Module {

    constructor( bot ) 
    {
        super(bot);

        this.catagory = "Music";

        this.icon = MusicPlayer.Icon;

        this.color = bot.ColorWarning;

        this.radio = {
            "538": "http://vip-icecast.538.lw.triple-it.nl/RADIO538_MP3",
            "538 dance": "http://vip-icecast.538.lw.triple-it.nl/WEB10_MP3",
            "538 hitzone": "http://vip-icecast.538.lw.triple-it.nl/WEB11_MP3",
            "slam": "http://stream.radiocorp.nl/web10_mp3",
        };

        // Play command
        this.command({
            name: 'play',
            regex: '^play\\s*(.+)?',
            description: 'Play music.',
            DM: false,
            args: [
                {name: 'url|query', description: 'The url to the audio source (youtube, playlist, search term, stream or mp3) if url not specified then it will start playing the first song in the queue', required: false}
            ]
        });



        // Queue command
        this.command({
            name: 'queue first',
            regex: '^queue first(?:\\s+)(.+)',
            description: 'Queue a song or stream in front of the queue.',
            DM: false,
            args: [
                {name: 'url|query', description: 'The url to the audio source (youtube, playlist, search term, stream or mp3)', required: true}
            ]
        });


        // Queue command
        this.command({
            name: 'queue clear',
            regex: '^queue clear',
            description: 'Clear the queue.',
            DM: false,
            args: [
                //{name: 'url|query', description: 'The url to the audio source (youtube, playlist, search term, stream or mp3)', required: true}
            ]
        });

        // Queue command
        this.command({
            name: 'queue',
            regex: '^queue\\s+(?!first|clear)(.+)',
            description: 'Queue a song or stream.',
            DM: false,
            args: [
                {name: 'url|query', description: 'The url to the audio source (youtube, playlist, search term, stream or mp3)', required: true}
            ]
        });


        // Stop command
        this.command({
            name: 'stop',
            description: 'Stops playing music and removes Bot from the voice channel.',
            DM: false,
            args: []
        });


        // Next command
        this.command({
            name: 'next',
            description: 'Play the next song in the queue.',
            DM: false,
            args: []
        });

        // Next command
        this.command({
            name: 'prev',
            description: 'Play the previous song in the queue.',
            DM: false,
            args: []
        });

        // Next command
        this.command({
            name: 'repeat',
            description: 'Repeat the current playing song.',
            DM: false,
            args: []
        });

        // Shuffle command
        this.command({
            name: 'shuffle',
            description: 'Shuffle the queue.',
            DM: false,
            args: []
        });

        // Queue command
        this.command({
            name: 'radio',
            regex: '^radio\\s+(.+)',
            description: 'Play a radio station.',
            DM: false,
            args: [
                {name: 'station', description: 'The name of the radio station. valid options: ' + Object.keys(this.radio).join(', '), required: true}
            ]
        });

    }


    run( message, command )
    {
        //
    }


    runPlay(message, url)
    {
        MusicPlayer.play(message, url); 
    }

    runQueueFirst(message, url)
    {
        MusicPlayer.queue_first(message, url);
    }    


    runQueueClear(message)
    {
        MusicPlayer.queue_clear(message);
    }    

    runQueue(message, url)
    {
        MusicPlayer.queue(message, url);
    }    

    runStop( message )
    {
        MusicPlayer.stop( message );   
    }


    runNext( message )
    {
        MusicPlayer.next(message); 
    }

    runPrev( message )
    {
        MusicPlayer.prev(message); 
    }


    runRepeat( message )
    {
        MusicPlayer.repeat(message); 
    }    

    runShuffle( message )
    {
        MusicPlayer.shuffle(message);
    }

    runRadio(message, station)
    {
        if(this.radio[station])
        {
            MusicPlayer.play(message, this.radio[station]); 
        }
        else
        {
            message.channel.sendMessage( "", false, {
                color: this.bot.ColorError,
                thumbnail: {url: Music.Icon},
                title: 'Invalid radio station!',
                description: 'valid stations: ' + Object.keys(this.radio).join(', ')                                 
            });               
        }   
    }    

}

module.exports = Music;
