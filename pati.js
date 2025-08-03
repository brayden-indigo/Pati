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
let data1 = fs.readFileSync("aura.json");
let aura = JSON.parse(data1);
aura[0].aura = Infinity;
aura[1].aura = Infinity;
let data2 = fs.readFileSync("wordle.json");
let wordle = JSON.parse(data2);
let data3 = fs.readFileSync("patiCount.json");
let patiCount = JSON.parse(data3);
function fileExport(variable, file) {
  let data = JSON.stringify(variable);
  fs.writeFileSync(file, data);
}
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

function posAura(id) {
  let hasAura = true;
  for (let i = 0; i < aura.length; i++) {
    id == aura[i].user ? aura[i].aura++ : (hasAura = false);
  }
  if (!hasAura) {
    aura.push({
      user: `${id}`,
      aura: 1,
    });
  }
  aura[0].aura = "Infinity";
  aura[1].aura = "Infinity";
  let data = JSON.stringify(aura);
  fs.writeFileSync("aura.json", data);
}
function negAura(id) {
  let hasAura = true;
  for (let i = 0; i < aura.length; i++) {
    id == aura[i].user ? aura[i].aura-- : (hasAura = false);
  }
  if (!hasAura) {
    aura.push({
      user: `${id}`,
      aura: -1,
    });
  }
  aura[0].aura = "Infinity";
  aura[1].aura = "Infinity";
  let data = JSON.stringify(aura);
  fs.writeFileSync("aura.json", data);
}

let id = {
    testServer: "946959817170378803",
    mainServer: "1379699654836617260",
    wordle: "1211781489931452447",
    mainChat: "1379708536291983460",
  },
  triggers = [
    [/^ping/gi, "pong"],
    [/i+ *l+(o+v+e+|u+v+) *(y+o+)*u/gi, "i love you too"],
    [/\bi *l *y/gi, "ily2"],
    [/\bp\W*a+\W*t\W*i+\b/gi, "mrow"],
  ],
  emojis = [
    "1381729943268098068",
    "1379998170435551403",
    "1383858281604452413",
    "1381730018316521624",
    "1400326245387866224",
    "1400326349754728518",
    "1400326563144274050",
  ];
let pati = "<:pati:1379700481089339392>";

// when a message is created
client.on("messageCreate", async (message) => {
  // automated response w
  if (!message.author.bot) {
    // if someone says pati
    patiCount: if (triggers[triggers.length - 1][0].test(message.content)) {
      function calcTotal() {
        patiCount[0].total = 0;
        for (let i = 0; i < patiCount.length; i++) {
          if (i == 0) continue;
          patiCount[0].total += patiCount[i].score;
        }
      }
      // checks if their score has been stored
      for (let i = 0; i < patiCount.length; i++) {
        if (i == 0) continue;
        if (patiCount[i].userId == message.author.id) {
          // (1) if it has, their score increases
          patiCount[i].score++;
          fileExport(patiCount, "patiCount.json");
          calcTotal();
          let response = `mrow\n-# you have said my name ${patiCount[i].score} time`;
          patiCount[i].score == 1
            ? // I'm planning on making these reply lines less look horrendous
              message.reply(
                `${response}\n-# ${patiCount[0].total} total ${pati}`
              )
            : message.reply(
                `${response}s\n-# ${patiCount[0].total} total ${pati}`
              );
          break patiCount;
        }
      }
      // (2) if it hasn't, they're added to the json file for future reference
      patiCount.push({
        userId: `${message.author.id}`,
        score: 1,
      });
      fileExport(patiCount, "patiCount.json");
      let response = `mrow\n-# you have said my name ${
        patiCount[patiCount.length - 1].score
      } time`;
      calcTotal();
      patiCount[patiCount.length - 1].score == 1
        ? // I'm planning on making these reply lines less look horrendous
          message.reply(`${response}\n-# ${patiCount[0].total} total ${pati}`)
        : message.reply(`${response}s\n-# ${patiCount[0].total} total ${pati}`);
    }
    // checks the rest of the autoresponses
    for (let i = 0; i < triggers.length - 1; i++) {
      if (triggers[i][0].test(message.content)) message.reply(triggers[i][1]);
    }
    if (message.content.startsWith("+aura")) {
      let regex = /\d{18}/;
      let id = message.content.match(regex)[0];
      if (id != undefined) {
        posAura(id);
        let x;
        for (let i = 0; i < aura.length; i++) {
          if (aura[i].user == id) x = i;
        }
        message.reply({
          content: `+1 aura\n<@${id}> now has ${aura[x].aura}`,
          allowedMentions: { users: [message.author.id] },
        });
      } else message.reply("invalid command format");
    } else if (message.content.startsWith("-aura")) {
      let regex = /\d{18}/;
      let id = message.content.match(regex)[0];
      if (id != undefined) {
        negAura(id);
        let x;
        for (let i = 0; i < aura.length; i++) {
          if (aura[i].user == id) x = i;
        }
        message.reply({
          content: `-1 aura\n<@${id}> now has ${aura[x].aura}`,
          allowedMentions: { users: [message.author.id] },
        });
      } else message.reply("invalid command format");
    } else if (message.content.startsWith("aura")) {
      let regex = /\d{18}/;
      let id = message.content.match(regex)[0];
      if (id != undefined) {
        let x;
        for (let i = 0; i < aura.length; i++) {
          if (aura[i].user == id) x = i;
        }
        message.reply({
          content: `<@${id}> has ${aura[x].aura}`,
          allowedMentions: { users: [message.author.id] },
        });
      } else message.reply("invalid command format");
    }
  }
  const channel = message.channel;
  // makes sure some things only happen in some servers
  switch (message.guildId) {
    case id.testServer:
      break;
    case id.mainServer:
      if (message.author.id == id.wordle) {
        // this is where the string containing the wordle # and result is ¯\_(ツ)_/¯
        const shareContent = message.components[0]?.components[0].data.content;
        // if the share command was sent
        share: if (shareContent != undefined) {
          // ex. Wordle #1505
          const wordleIndex = Number(shareContent.substring(7, 11));
          console.log(
            `${message.interactionMetadata.user.username} shared ${shareContent}`
          );
          // looks for the i in "i/6"
          let wordleResult = shareContent.charAt(12);
          if (wordleResult == "X") wordleResult = 7;
          // react to the message depending on how they did
          message.react(emojis[wordleResult - 1]);
          // cycles through every stored wordle
          for (let i = 0; i < wordle.length; i++) {
            // (1) if the shared wordle is stored, it adds them to the thread
            if (wordle[i].number != wordleIndex) continue;
            const thread = await message.channel.threads.fetch(
              wordle[i].threadId
            );
            await thread.members.add(message.interactionMetadata.user.id);
            message.forward(thread);
            console.log(
              `Added ${message.interactionMetadata.user.username} to the thread`
            );
            break share;
          }
          // (2) otherwise, a new thread is made
          const thread = await channel.threads.create({
            name: `Wordle #${wordleIndex}`,
            autoArchiveDuration: 1440,
            type: ChannelType.PrivateThread,
            invitable: false,
            reason: "wordle",
          });
          console.log(`Created thread: ${thread.name}`);
          thread.members.add(message.interactionMetadata.user.id);
          message.forward(thread);
          console.log(
            `Added ${message.interactionMetadata.user.username} to thread`
          );
          // store the shared wordle
          wordle.push({
            number: wordleIndex,
            threadId: `${thread.id}`,
          });
          fileExport(wordle, "wordle.json");
          console.log(`Added wordle #${wordleIndex} to wordle.json`);
        } else
          playing: if (message.content.includes("is playing")) {
            if (message.channel.id != id.mainChat) {
              message.reply("wrong channel dumbass");
              break playing;
            }
            console.log(message.content);
            message.reply(
              "Use </share:1354514123479711745> when you're done to get added to the discussion thread!"
            );
          }
      }
      break;
  }
});

client.login(process.env.TOKEN);
