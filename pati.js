"use strict";
const {
  Client,
  GatewayIntentBits,
  Guild,
  ClientUser,
  ChannelType,
  ActivityType,
  Collection,
  Events,
  MessageFlags,
} = require("discord.js");
require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// command loader

client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith("js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection
    // with the key as the command name
    // and the value as the exported module
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// functions n variables n stuf

let profileData = fs.readFileSync("userprofiles.json");
let profile = JSON.parse(profileData);
profile[0].aura = Infinity;
profile[1].aura = Infinity;
let wordleData = fs.readFileSync("wordle.json");
let wordle = JSON.parse(wordleData);

// variable being the parsed json object and file being the target json file
function fileExport(variable, file) {
  let data = JSON.stringify(variable);
  fs.writeFileSync(file, data);
}

// used when someone has absolutely no data collected
function newProfile(id, aura, patiCount) {
  profile.push({ id: id, aura: aura, pati: patiCount });
  fileExport(profile, "userprofiles.json");
}
const newAura = (id, aura) => newProfile(id, aura, 0);
const newPati = (id) => newProfile(id, 0, 1);

// add/subtract aura
function incAura(id, n) {
  let i = profile.findIndex((p) => p.id == id);
  if (i != -1) {
    profile[i].aura += n;
    fileExport(profile, "userprofiles.json");
  } else newAura(id, n);
}

// command cooldown stuf
let idRegex = /\d{18}\d?/;
let mentionRegex = /<@\d{18}\d?>/;
let cooldowns = [];
function isCooldown(id) {
  if (cooldowns.find((user) => user == id)) {
    return true;
  } else return false;
}
async function cooldownTrue(message) {
  const reply = await message.reply({
    content: "Please wait 10 minutes between each use of this command!",
    ephemeral: true,
  });
  setTimeout(() => {
    reply.delete().catch((err) => {
      // DiscordAPIError: Unknown Message
      if (err.code === 10008) {
        message.channel.send("🗿");
      } else console.error("an error occured:", err);
    });
    // if the trigger message doesn't contain a mention, delete it
    if (!mentionRegex.test(message.content)) {
      message.delete().catch((err) => {
        // DiscordAPIError: Unknown Message
        if (err.code === 10008) {
          message.channel.send("🗿");
        } else console.error("An error occurred:", err);
      });
    }
  }, 10000);
}
function cooldownFalse(id) {
  cooldowns.push(id);
  setTimeout(() => {
    cooldowns = cooldowns.filter((user) => user != id);
  }, 600000);
}

let ids = {
    testServer: process.env.testServer,
    mainServer: process.env.mainServer,
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
  ],
  pati = "<:pati:1379700481089339392>",
  totalPati = profile.reduce((acc, curr) => acc + curr.pati, 0);

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

client.on("messageCreate", async (message) => {
  // automated response w
  if (!message.author.bot) {
    // if someone says pati
    if (triggers[triggers.length - 1][0].test(message.content)) {
      // checks if their score has been stored
      let i = profile.findIndex((p) => p.id == message.author.id);
      let userPati;
      const response = (count) => {
        return `mrow\n-# you have said my name ${count} time`;
      };
      if (i != -1) {
        profile[i].pati++;
        userPati = profile[i].pati;
        fileExport(profile, "userprofiles.json");
        totalPati++;
        userPati == 1
          ? // I'm planning on making these reply lines less look horrendous
            message.reply(
              `${response(userPati)}\n-# ${totalPati} total ${pati}`
            )
          : message.reply(
              `${response(userPati)}s\n-# ${totalPati} total ${pati}`
            );
      } else {
        newPati(message.author.id);
        userPati = profile[profile.length - 1].pati;
        totalPati++;
        userPati == 1
          ? // I'm planning on making these reply lines less look horrendous
            message.reply(
              `${response(userPati)}\n-# ${totalPati} total ${pati}`
            )
          : message.reply(
              `${response(userPati)}s\n-# ${totalPati} total ${pati}`
            );
      }
      if (totalPati.toString().endsWith("0"))
        console.log(`${totalPati} total pati`);
    }
    // checks the rest of the autoresponses
    for (let i = 0; i < triggers.length - 1; i++) {
      if (triggers[i][0].test(message.content)) message.reply(triggers[i][1]);
    }
    let id = undefined;
    if (message.content.startsWith("+aura")) {
      if (message.content.match(idRegex) == message.author.id) {
        message.reply("<:pointlaugh:1406771789182533796> -1 aura");
        incAura(message.author.id, -1)
        if (isCooldown(message.author.id)) {
          cooldownTrue(message);
          return;
        } else cooldownFalse(message.author.id);
      } else {
        message.react("1383119559313195190");
        if (idRegex.test(message.content)) {
          id = message.content.match(idRegex)[0];
        }
        if (id) {
          if (isCooldown(message.author.id)) {
            cooldownTrue(message);
            return;
          } else cooldownFalse(message.author.id);
          incAura(id, 1);
          let i = profile.findIndex((p) => p.id == id);
          message.reply({
            content: `+1 aura\n<@${id}> has ${profile[i].aura} aura`,
            allowedMentions: { users: [message.author.id] },
          });
        }
      }
    } else if (message.content.startsWith("-aura")) {
      message.react("1393512157630697472");
      if (idRegex.test(message.content)) {
        id = message.content.match(idRegex)[0];
      }
      if (id) {
        if (isCooldown(message.author.id)) {
          cooldownTrue(message);
          return;
        } else cooldownFalse(message.author.id);
        incAura(id, -1);
        let i = profile.findIndex((p) => p.id == id);
        message.reply({
          content: `-1 aura\n<@${id}> has ${profile[i].aura} aura`,
          allowedMentions: { users: [message.author.id] },
        });
      }
    } else if (message.content.startsWith("aura")) {
      if (idRegex.test(message.content)) {
        id = message.content.match(idRegex)[0];
      }
      if (id) {
        let i = profile.findIndex((p) => p.id == id);
        if (i == -1) {
          newAura(id, 0);
          i = profile.length - 1;
        }
        message.react(
          profile[i].aura == Infinity
            ? "1379998042488569856"
            : profile[i].aura < 0
            ? "1400326349754728518"
            : profile[i].aura > 0
            ? "1400326245387866224"
            : "1379998170435551403"
        );
        message.reply({
          content: `<@${id}> has ${profile[i].aura} aura`,
          allowedMentions: { users: [message.author.id] },
        });
      }
    }
  }
  // makes sure some things only happen in some servers
  switch (message.guildId) {
    case ids.testServer:
      break;
    case ids.mainServer:
      if (message.author.id == ids.wordle) {
        // this is where the string containing the wordle # and result is ¯\_(ツ)_/¯
        const shareContent = message.components[0]?.components[0].data.content;
        // if the share command was sent
        if (shareContent) {
          console.log(
            `${message.interactionMetadata.user.username} shared ${shareContent}`
          );
          // looks for the i in "i/6"
          let wordleResult = shareContent.charAt(12);
          if (wordleResult == "X") wordleResult = 7;
          // react to the message depending on how they did
          message.react(emojis[wordleResult - 1]);
          // cycles through every stored wordle
          const wordleIndex = Number(shareContent.substring(7, 11)); // ex. Wordle #1505
          let i = wordle.findIndex((w) => w.number == wordleIndex);
          // (1) if the wordle is stored, adds them to it
          if (i != -1) {
            const thread = await message.channel.threads.fetch(
              wordle[i].threadId
            );
            await thread.members.add(message.interactionMetadata.user.id);
            message.forward(thread);
            console.log(
              `Added ${message.interactionMetadata.user.username} to the thread`
            );
            // (2) if it's not, makes a new thread
          } else {
            const thread = await message.channel.threads.create({
              name: `Wordle #${wordleIndex}`,
              autoArchiveDuration: 1440,
              type: ChannelType.PrivateThread,
              invitable: false,
              reason: "wordle",
            });
            console.log(`Created thread: ${thread.name}`);
            // adds them to it
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
          }
        } else if (message.content.includes("is playing")) {
          if (message.channel.id != ids.mainChat) {
            message.reply("wrong channel dumbass");
            break;
          }
          message.reply(
            "Use </share:1354514123479711745> when you're done to get added to the discussion thread!"
          );
        }
      }
      break;
  }
});
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

client.login(process.env.TOKEN);
