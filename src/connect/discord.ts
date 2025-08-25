import { CONST } from "../common/const.js";
import { Client, GatewayIntentBits } from "discord.js";
import memberModel from "../model/members.js";
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
const TOKEN = CONST.DISCORD_BOT_KEY;
const GUILD_ID = CONST.DISCORD_GUILD_ID;
client.login(TOKEN);

const memberInfo = async (id) => {
  const guild = await client.guilds.fetch(GUILD_ID);
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
  const guild = await client.guilds.fetch(GUILD_ID);
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
