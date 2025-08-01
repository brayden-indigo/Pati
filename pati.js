"use strict";
const {
  Client,
  GatewayIntentBits,
  Guild,
  ClientUser,
  ChannelType,
  ActivityType,
} = require("discord.js");
require("dotenv").config();
const fs = require("fs");
// loads the wordle data
let data = fs.readFileSync("wordle.json");
let wordle = JSON.parse(data);
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// rotates between rules in its status
function setRuleStatus(i) {
  let rules = [
    "always boss up",
    "never forget ya homies",
    "get outdoors",
    "take time 4 urself",
    "keep ur promises",
    "no one gets left behind",
    "love is always the answer",
  ];
  client.user.setPresence({
    activities: [
      {
        name: `rule #${i + 1}: ${rules[i]}`,
        type: ActivityType.Custom,
      },
    ],
  });
  setTimeout(() => {
    i++;
    if (i == rules.length) i = 0;
    setRuleStatus(i);
  }, 30000);
}
client.on("ready", () => {
  console.log("Connected as " + client.user.tag);
  setRuleStatus(0);
});

let id = {
    testServer: "946959817170378803",
    mainServer: "1379699654836617260",
    adminRole: "1379706399084380200",
    wordle: "1211781489931452447",
    mainChat: "1379708536291983460",
  },
  replies = {
    ping: "pong",
    pati: "mrow",
    ily: "ily2",
    "i love you": "i love you too",
  },
  emojis = [
    "1381729943268098068",
    "1379998170435551403",
    "1383858281604452413",
    "1381730018316521624",
    "1400326245387866224",
    "1400326349754728518",
    "1400326563144274050",
  ];

// when a message is created
client.on("messageCreate", async (message) => {
  const channel = message.channel;
  // makes sure some things only happen in some servers
  switch (message.guildId) {
    case id.testServer:
      break;
    case id.mainServer:
      let lastWordle = wordle[wordle.length - 1];
      let currentNumber = lastWordle.number;
      if (message.author.id == id.wordle) {
        const shareContent = message.components[0]?.components[0].data.content;
        // when the wordle results are sent at the end of the day
        if (message.content.includes("streak")) {
          console.log(`Wordle #${currentNumber + 1}`);
          // make a thread
          const thread = await channel.threads.create({
            name: `Wordle #${currentNumber + 1}`,
            autoArchiveDuration: 1440,
            type: ChannelType.PrivateThread,
            invitable: false,
            reason: "wordle",
          });
          console.log(`Created thread: ${thread.name}`);
          // add today's wordle
          wordle.push({
            number: currentNumber + 1,
            threadId: `${thread.id}`,
          });
          let jsonWordle = JSON.stringify(wordle);
          fs.writeFileSync("wordle.json", jsonWordle);
          console.log(`Added wordle #${currentNumber} to wordle.json`);
          // when someone shares their wordle, add them to the thread
        } else if (
          shareContent != undefined &&
          shareContent.includes(currentNumber)
        ) {
          console.log(`Shared ${shareContent}`);
          let wordleResult = shareContent.charAt(12);
          if (wordleResult == "X") wordleResult = 7;
          // react to the message depending on how they did
          message.react(emojis[wordleResult - 1]);
          const thread = message.channel.threads.cache.get(lastWordle.threadId);
          thread.members.add(message.interactionMetadata.user.id);
          console.log(
            `Added ${message.interactionMetadata.user.username} to thread`
          );
        } else
          outer: if (message.content.includes("is playing")) {
            if (message.channelId != id.mainChat) {
              message.reply("wrong channel dumbass");
              break outer;
            }
            console.log(message.content);
            message.reply(
              "Use </share:1354514123479711745> when you're done to get added to the discussion thread!"
            );
          }
      }
      break;
  }
  // run this code for every variable in replies
  for (let trigger in replies) {
    // if the message matches any of the triggers
    if (
      !message.author.bot &&
      message.content.toLowerCase().includes(trigger)
    ) {
      // reply with the response
      // message.reply(replies[trigger]);
    }
  }
});

client.login(process.env.TOKEN);
