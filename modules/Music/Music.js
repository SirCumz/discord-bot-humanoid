const Humanoid = require("../../lib/Bot");
const DL       = require('youtube-dl');
var url        = require('url');
var google     = require ('googleapis');
var config     = require("../../config");

google.options ({ auth: config.youtube.apiKey });
var youtubeAPI = google.youtube ('v3');

var isYouTubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
var isUrlRegex = /^(https?:\/\/)/;


var Music = {
    Playlist: [],
    DL: DL,
    youtubeAPI: youtubeAPI,
    userVoiceChannel: userVoiceChannel,
    botVoiceChannel: botVoiceChannel,
    next: play_next,
    prev: play_prev,
    repeat: repeat_current,
    queue: queue_next,
    queue_first: queue_first,
    queue_clear: queue_clear,
    shuffle: shuffle_playlist,
    start_play_and_notify: start_play_and_notify,
    play: play_song,
    stop: stop,
    Bot: Humanoid,
    Icon: "http://icons.iconarchive.com/icons/tsukasa-tux/daft-punks/128/Guyman-Helmet-Music-icon.png"
};


function isUrl( url )
{
    return isUrlRegex.test(url);   
}

function isYoutubeLink( video )
{
    return isYouTubeRegex.test(video);   
}


function getYoutubeLinkInfo( video )
{
    var info = { youtube: false, id: null, list: null, listOnly: false, search:null, stream: false }

    if( isYoutubeLink( video ) )
    {
        info.youtube = true;

        var details = url.parse(video, true);

        if(details.query.v || details.query.list) {
            info.id = details.query.v || null;

            if(details.query.list) {
                info.list = details.query.list;

                if(!info.id) {
                    info.listOnly = true;
                }
            }
        } 
        else {
          // Get possible IDs for youtu.be from urladdr.
          id = details.pathname.slice(1).replace(/^v\//, '');
          
          if (id) {
            if ((id === 'playlist')) { console.log("youtu.be playlist url: "+video)  }
            info.id = id;
            //args.unshift('-i');
          }            
        }
    }
    else if( !isUrl( video ) )
    {
        info.search = video;
        info.youtube = true;
    }
    else
    {
        info.stream = video;
    }

    return info;
}

function secondstotime(duration)
{
  var match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)

  var hours = (parseInt(match[1]) || 0);
  var minutes = (parseInt(match[2]) || 0);
  var seconds = (parseInt(match[3]) || 0);

  secs = hours * 3600 + minutes * 60 + seconds;    
    var t = new Date(1970,0,1);
    t.setSeconds(secs);
    var s = t.toTimeString().substr(0,8);
    if(secs > 86399)
        s = Math.floor((t - Date.parse("1/1/70")) / 3600000) + s.substr(2);
    return s;
}

function getSongInfo( url, then, onError  )
{
    var info = getYoutubeLinkInfo( url );

    var songInfo = {
        title: url,
        url: url,
        duration: 'Stream',
        thumbnail: Music.Icon
    }

    songInfo = Object.assign(songInfo, info);

    // Other Stream/Radio
    if( songInfo.stream )
    {
        then([songInfo]);
    }

    // Youtube Search
    else if( songInfo.search )
    {
          var searchParams = {
            part:             'snippet',
            type:             'video',
            q:                songInfo.search,
            maxResults:       1,
            order:            'relevance',
            safeSearch:       'moderate',
            videoEmbeddable:  true,
            //videoCategoryId:  "UC-9-kyTW8ZkZNDHQJ6FgpwQ"
          };     

            youtubeAPI.search.list (searchParams, function (err2, data) {
                if (err2) {
                  if(onError) 
                    onError(err2);

                  return;
                }

                if (data.items.length) 
                {
                    var vid = data.items[0];

                    var listParams = {
                        part: 'snippet,contentDetails',
                        id: vid.id.videoId,
                    };

                    youtubeAPI.videos.list (listParams, function (err2, data) {

                        if (err2) {
                          if(onError)
                             onError(err2);

                          return;
                        }

                        if (data.items.length) 
                        {
                            var arr = [];

                            for(var i in data.items)
                            {                         
                                arr.push( Object.assign({}, songInfo, {
                                    id: data.items[i].id,
                                    url: "https://www.youtube.com/watch?v=" + data.items[i].id,
                                    title: data.items[i].snippet.title,
                                    duration: secondstotime(data.items[i].contentDetails.duration),
                                    thumbnail: data.items[i].snippet.thumbnails.default.url 
                                }) );
                            }
       
                            then(arr);
                        }
                    });                    
                }
            });           
    }    

    // Youtube playlist
    else if( songInfo.listOnly )
    {
        var listParams = {
            part: 'snippet,contentDetails',
            playlistId: songInfo.list,
            maxResults: 50,
        }

        youtubeAPI.playlistItems.list (listParams, function (err2, data) {
            if (err2) {
              if(onError) 
                onError(err2);

              return;
            }

            if (data.items.length) 
            {
                var videIDS = [];

                for(var i in data.items)
                {
                    videIDS.push( data.items[i].contentDetails.videoId );
                }

                var listParams = {
                    part: 'snippet,contentDetails',
                    id: videIDS.join(','),
                };

                youtubeAPI.videos.list (listParams, function (err2, data) {

                    if (err2) {
                      if(onError)
                         onError(err2);

                      return;
                    }

                    if (data.items.length) 
                    {
                        var arr = [];

                        for(var i in data.items)
                        {                         
                            arr.push( Object.assign({}, songInfo, {
                                id: data.items[i].id,
                                url: "https://www.youtube.com/watch?v=" + data.items[i].id,
                                title: data.items[i].snippet.title,
                                duration: secondstotime(data.items[i].contentDetails.duration),
                                thumbnail: data.items[i].snippet.thumbnails.default.url 
                            }) );
                        }
                        
                        then(arr);
                    }
                });
            }
        });
    }

    // Youtube ID
    else if( songInfo.id )
    {
            var listParams = {
                part: 'snippet,contentDetails',
                id: songInfo.id,
            };

            youtubeAPI.videos.list (listParams, function (err2, data) {

                if (err2) {
                  if(onError)
                     onError(err2);

                  return;
                }

                if (data.items.length) 
                {
                    var arr = [];

                    for(var i in data.items)
                    {
                        arr.push( Object.assign(songInfo, {
                            url: "https://www.youtube.com/watch?v=" + data.items[i].id,
                            title: data.items[i].snippet.title,
                            duration: secondstotime(data.items[i].contentDetails.duration),
                            thumbnail: data.items[i].snippet.thumbnails.default.url 
                        }) );
                    }
                    
                    then(arr);
                }
            });        
    }
    else
    {
          if(onError)
          {
             onError({Error: "Invalid Source"});
          }
    }
}


function userVoiceChannel( message )
{
    return message.author.getVoiceChannel(message.channel.guild);
}


function botVoiceChannel( message )
{
    return Humanoid.client().User.getVoiceChannel(message.channel.guild)
}


function getNextSong( message )
{
    return getSongByIndex(message, getIndex( message ) + 1 );
}

function getPrevSong( message )
{
    return getSongByIndex(message, getIndex( message ) - 1 );
}

function getCurrentSong( message )
{
    return getSongByIndex(message, getIndex( message ) );
}

function getPlaylist( message )
{
    if( !Music.Playlist[message.channel.guild.id] ) {
        Music.Playlist[message.channel.guild.id] = {
            player: null,
            list: [],
            index: 0,
            repeat_current: false
        };
    } 
    
    return Music.Playlist[message.channel.guild.id];   
}

function getIndex( message )
{
    return getPlaylist( message ).index;
}


function getSongByIndex(message, index)
{
    var playlist = getPlaylist( message );

    if( playlist.list.length )
    {
        if(playlist.list[index])
        {
            return playlist.list[index];
        }
    }

    return null;   
}


function stop(message)
{
    var playlist = getPlaylist( message );

    if(playlist.player)
    {
        playlist.player.stop();
        playlist.player.destroy();            
    }

    playlist.player = null;
    playlist.index = 0;
    playlist.repeat_current = false;
    playlist.list = [];
 

    var c = botVoiceChannel( message );

    if(c) {
        c.leave();
    }      
}

function play_next( message )
{
    var nextsong = getNextSong( message );
    
    var playlist = getPlaylist(message);
    
    playlist.repeat_current = false;

    if(nextsong)
    {
        playlist.index++;
        play_song( message );
    }
    else
    {
        playlist.index = 0;
        play_song( message );
    }
}


function play_prev( message )
{
    var prevsong = getPrevSong( message );

    var playlist = getPlaylist(message);

    playlist.repeat_current = false;

    if(prevsong)
    {
        playlist.index--;
        play_song( message );
    }
    else
    {
        playlist.index = playlist.list.length - 1;
        play_song( message );
    }    
}


function repeat_current( message )
{
    var cursong = getCurrentSong( message );
    
    var playlist = getPlaylist(message);

    if(cursong)
    {
        if(playlist.repeat_current == true)
        {         
            message.channel.sendMessage( "", false, {
                color: Music.Bot.ColorError,
                thumbnail: {url: cursong.thumbnail},
                title: `${cursong.title} is already on repeat!`,
                url: cursong.url,
                description: `Duration: ${cursong.duration}`                                 
            });  
        }
        else
        {
            playlist.repeat_current = true;
          
            message.channel.sendMessage( "", false, {
                color: Music.Bot.ColorWarning,
                thumbnail: {url: cursong.thumbnail},
                title: `Repeat: ${cursong.title}`,
                url: cursong.url,
                description: `Duration: ${cursong.duration}`                                 
            });              
        }
    }
    else
    {
        message.channel.sendMessage( "", false, {
            color: Music.Bot.ColorError,
            thumbnail: {url: Music.Icon},
            title: 'There is no active song to repeat!',
            //url: song.url,
            description: 'Try to use the "prev" command to play the previous song.'                                 
        });   
    }
}


function queue_clear( message )
{
    var playlist = getPlaylist(message);

    if(playlist.list.length)
    {
        playlist.list = [];
        playlist.index = 0;
        playlist.repeat_current = false;
    }

    message.channel.sendMessage( "", false, {
        color: Music.Bot.ColorSuccess,
        thumbnail: {url: Music.Icon},
        title: "Queue cleared!",
        //url: song.url,
        //description: `Duration: ${song.duration}`,
        //footer: footer
    });
}

function queue_next( message, url )
{
    var playlist = getPlaylist(message);

    getSongInfo( url, function(songs) {
        if(songs.length)
        {
            for( var i in songs)
            {
                playlist.list.push(songs[i]);
            }

            if(songs.length == 1)
            {
                var song = songs[0];

                message.channel.sendMessage( "", false, {
                    color: Music.Bot.ColorWarning,
                    thumbnail: {url: song.thumbnail},
                    title: `Queued: ${song.title}`,
                    url: song.url,
                    description: `Duration: ${song.duration}`                                 
                });                  
            }
            else
            {   
                var nextsong = getNextSong(message);

                message.channel.sendMessage( "", false, {
                    color: Music.Bot.ColorWarning,
                    thumbnail: {url: nextsong.thumbnail},
                    title: `Queued ${songs.length} songs`,
                    description: "Playing next:",
                    fields: [{
                        name: `${nextsong.title}`,
                        value: `Duration: ${nextsong.duration}` 
                    }]                                
                });  
            }      
        }
    } );
}

function queue_first( message, url, then )
{
    var playlist = getPlaylist(message);

    getSongInfo( url, function(songs) {
        if(songs.length)
        {
            var fields = [];

            for( var i in songs)
            {
                fields.push({
                    name: `${songs[i].title}`,
                    value: `Duration: ${songs[i].duration}` 
                });
                
                //playlist.list.splice(playlist.index, 0, songs[i]);               
            }
                  

            // You need to append `[1,0]` so that the 1st 2 arguments to splice are sent
            Array.prototype.splice.apply(playlist.list, [playlist.index + 1, 0].concat(songs));

            // if(playlist.index > playlist.list.length)
            // {
            //     playlist.list = playlist.list.length;
            // }

            if(songs.length == 1)
            {
                var song = songs[0];

                message.channel.sendMessage( "", false, {
                    color: Music.Bot.ColorWarning,
                    thumbnail: {url: song.thumbnail},
                    title: `Queued: ${song.title}`,
                    url: song.url,
                    description: `Duration: ${song.duration}`                                 
                });                  
            }
            else
            {   
                var nextsong = songs[0];

                message.channel.sendMessage( "", false, {
                    color: Music.Bot.ColorWarning,
                    thumbnail: {url: nextsong.thumbnail},
                    title: `Queued ${songs.length} songs`,
                    description: "Playing next:",
                    fields: [{
                        name: `${nextsong.title}`,
                        value: `Duration: ${nextsong.duration}` 
                    }]                                
                });  
            }                
        }
        
        if(then)
        {
            then(playlist.list);
        }
    } );
}

function shuffle_playlist(message)
{
    var playlist = getPlaylist(message);

    if( playlist.list.length ) 
    {
        var a = playlist.list;
        for (let i = a.length; i; i--) {
            let j = Math.floor(Math.random() * i);
            [a[i - 1], a[j]] = [a[j], a[i - 1]];
        }

        playlist.list = a;

        var nextsong = getNextSong(message);

        message.channel.sendMessage( "", false, {
            color: Music.Bot.ColorWarning,
            thumbnail: {url: nextsong.thumbnail},
            title: "Queue Shuffled",
            description: "Playing next:",
            fields: [{
                name: `${nextsong.title}`,
                value: `Duration: ${nextsong.duration}` 
            }]                                
        });          
    }
}


function start_play_and_notify( message, connection )
{
    var channel = message.channel;
    var guild = channel.guild.id;
    var playlist = getPlaylist(message);

    if(playlist.index > playlist.list.length - 1)
    {
        playlist.index = 0;
    }

    var song = getSongByIndex(message, playlist.index);
    //console.log(playlist.index, song)
    if(!song)
    {
        message.channel.sendMessage( "", false, {
             color: Music.Bot.ColorError,
             thumbnail: {url: Music.Icon},
             title: "Queue is empty!",
             description: "add songs to the Queue to start playing music.",
        }).then(message => {
          message.addReaction("💩"); 
        });        
        
        return;    
    }

    if( song.youtube && !song.stream )
    {
            DL.getInfo(song.url, ['--skip-download', '-4'], {maxBuffer: 7000*1024}, (err, info) => {
                
                if (err) {
                    play_next(message)
                } else if (info) {
                    song.stream = info.url;  
                    start_play_and_notify(message, connection);          
                }
            });    
    }
    else
    {
        playlist.player = connection.createExternalEncoder({  
            type: 'ffmpeg',
            format: 'pcm',
            source: song.stream
        });

        playlist.player.play();

        var next = getNextSong(message) || playlist.list[0];

        var footer = {};

        if( next )
        {
            footer = {text: "Next: " + next.title, icon_url: next.thumbnail };
        }

        channel.sendMessage( "", false, {
            color: Music.Bot.ColorSuccess,
            thumbnail: {url: song.thumbnail},
            title: `Playing: ${song.title}`,
            url: song.url,
            description: `Duration: ${song.duration}`,
            footer: footer
        }); 

        playlist.player.once('end', () => {

          if( (playlist.list.length || playlist.repeat_current) ) {
              
              if(playlist.repeat_current )
              {
                 playlist.repeat_current = false;
                 start_play_and_notify( message, connection )
              }
              else
              {
                play_next( message );
              }
             
          } else {
             stop(message);
          }   
        });   
    }
}

function play_song( message, url )
{
    var voice_channel = userVoiceChannel( message );
    var bot_voice_channel = botVoiceChannel( message );
    var playlist = getPlaylist(message);


    if( !voice_channel )
    {
        message.channel.sendMessage( "", false, {
             color: Music.Bot.ColorError,
             thumbnail: {url:Music.Icon},
             description: "Please join a voice channel first then send #play command to start playing.",
        }).then(message => {
          message.addReaction("💩"); 
        });    
    }
    else
    {

        if(url && typeof url === 'string')
        {
            queue_first( message, url, (songs) => {

                    //var next = getNextSong(message);

                    if( !bot_voice_channel ) 
                    {
                        voice_channel.join().then(connection => {
                            playlist.index++;
                            start_play_and_notify( message, connection.voiceConnection);
                        });    
                    }
                    else
                    {
                        playlist.index++;
                        start_play_and_notify( message, bot_voice_channel.getVoiceConnectionInfo().voiceConnection );                              
                    }             
            } );        
        }
        else
        {
            if( !bot_voice_channel ) 
            {
                voice_channel.join().then(connection => {                  
                    start_play_and_notify( message, connection.voiceConnection );
                });    
            }
            else
            {
                start_play_and_notify( message, bot_voice_channel.getVoiceConnectionInfo().voiceConnection );                              
            }              
        }
    } 
}


module.exports = Music;
