// Import the Discord Bot instance
const Humanoid = require("./lib/Bot");

// Start Discord Bot
Humanoid.start();


// var expression = '^(frame(?:\\s?profile)?)(?:\\s+)?(.+)?';
// //var expression = '^where(?:\\s?is)?(?:\\s+([\\w+\\s]+))';
// //expression = expression.replace([':space:', ':any:'], ['(?:\\s+)?', '']);

// var regex = new RegExp(expression, 'i');

// // var tests = [
// //     'where is lol',
// //     'whereis lol',
// //     'where lol',
// //     'where',
// // ];
// var tests = [
//     'frame lol',
//     'frame profile lol',
//     'frameprofile lol',
//     'frame lol',
//     'frame'
// ];
// tests.forEach( (str, index) => {
//     var matches = regex.test(str);
//     console.log( [matches, str.match(regex)] );
// });





//var Pusher = require('pusher-js/node');

// var pusher = new Pusher('afd1325f6181ace6a9ea');
// var channel = pusher.subscribe('Humanoid');

// channel.bind('command',
//   function(data) {

//     var guild = Humanoid.client().Guilds.find(guild => {
//         return (guild.name == data.guild)
//     });

//     if(guild)
//     {
//         //console.log(guild)
//         //console.log(Humanoid.client().User.getVoiceChannel(guild))
//         //console.log(Humanoid.client().User.mention)
//         guild.textChannels.forEach(function(channel, index){
//             console.log(channel.name)
//             if(channel.name == data.channel)
//             {
//                 channel.sendMessage(data.message);
//             }
//         });

//         console.log(data)        
//     }
//   }
// );

