import { CONST } from "../common/const.js";
import { Client, GatewayIntentBits } from "discord.js";
import memberModel from "../model/members.js";

let client = null;
const TOKEN = CONST.DISCORD_BOT_KEY;
const GUILD_ID = CONST.DISCORD_GUILD_ID;

// Discord Clientの初期化を遅延実行
const initializeClient = async () => {
  if (client) return client;
  
  if (!TOKEN) {
    console.warn("Discord bot token is not set. Discord features will be disabled.");
    return null;
  }
  
  client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  });
  
  try {
    await client.login(TOKEN);
    console.log("Discord client initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Discord client:", error);
    client = null;
  }
  
  return client;
};

const memberInfo = async (id) => {
  const discordClient = await initializeClient();
  if (!discordClient) {
    return {
      DiscordId: id,
      Name: "Unknown",
      Username: "Unknown",
      Globalname: "Unknown",
      Roles: [],
      Icon: "",
      Join: null,
    };
  }
  
  const guild = await discordClient.guilds.fetch(GUILD_ID);
  const member = await guild.members.fetch(id);
  const roles = member.roles.cache;
  let roleList = [];
  roles.forEach((role) => {
    if (role.name != "@everyone") {
      roleList.push(role.name);
    }
  });

  const username = member.user.username;
  const globalName = member.user.tag;
  const name = member.nickname || username;
  const avatarUrl = member.user.displayAvatarURL();
  const joinedAt = member.joinedAt;

  return {
    DiscordId: member.id,
    Name: name,
    Username: username,
    Globalname: globalName,
    Roles: roleList,
    Icon: avatarUrl,
    Join: joinedAt,
  };
};

const setRoleId = async (memberId, roleName) => {
  const discordClient = await initializeClient();
  if (!discordClient) {
    console.warn("Discord client not available");
    return false;
  }
  
  const guild = await discordClient.guilds.fetch(GUILD_ID);
  const member = await guild.members.fetch(memberId);
  const roles = await guild.roles.fetch();
  roles.forEach((role) => {
    if (role.name == roleName) {
      member.roles.add(role.id);
    }
  });
  memberInfo(memberId).then((member) => {
    memberModel.memberUpdate(member);
  });
};

const discordConnect = {
  memberInfo,
  setRoleId,
};

export default discordConnect;
