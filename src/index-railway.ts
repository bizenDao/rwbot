import { CONST } from "./common/const.js";
import utils from "./common/util.js";
import controller from "./controller/controller.js";
import ethController from "./controller/etherium.js";
import getDonate from "./connect/getDonate.js";
import getOwn from "./connect/getOwn.js";
import contentsConnect from "./connect/contents.js";
import discordConnect from "./connect/discord.js";
import memberModel from "./model/members.js";
import shopModel from "./model/shops.js";
import itemModel from "./model/items.js";
import contentModel from "./model/content.js";
import express from "express";
import {
  verifyKeyMiddleware,
  InteractionType,
  InteractionResponseType,
} from "discord-interactions";

const roleNumbers = {
  "": "0",
  Admin: "1143943645205102632",
  Engineer: "1144649703712104639",
  member: "1206600859962834954",
  "Holder &Fan": "1206603253580701726",
  Potter: "1206865922950955028",
  CommunityManager: "1206867833292722236",
  Supporter: "1210764298280902656",
  "Soul Binder": "1287453818853789787",
};

if (CONST.API_ENV == undefined) {
  console.log("bizenAPI SETTING ERROR: API_ENV is not defined");
  console.log(
    "Available environment variables:",
    Object.keys(process.env).filter((key) => !key.includes("SECRET"))
  );
  process.exit(1);
}
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// /interactions以外のルートにのみjsonミドルウェアを適用
app.use((req, res, next) => {
  if (req.path === '/interactions') {
    // /interactionsエンドポイントはraw bodyが必要
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.get("/", async (_, res) => {
  const buildTime = CONST.BUILD_TIME || new Date().toISOString();
  const result = `
    <h1>${CONST.API_NAME || "Bizen API"}</h1>
    <h2>System Information</h2>
    <ul>
      <li><strong>Environment:</strong> ${CONST.API_ENV || "Not Set"}</li>
      <li><strong>Build Time:</strong> ${buildTime}</li>
    </ul>

    <h2>Connection Status</h2>
    <ul>
      <li><strong>DynamoDB Region:</strong> ${
        CONST.DYNAMO_REGION || "Not Set"
      }</li>
      <li><strong>DynamoDB Table Prefix:</strong> ${
        CONST.DYNAMO_TABLE_PREFIX || "Not Set"
      }</li>
      <li><strong>DynamoDB Master Prefix:</strong> ${
        CONST.DYNAMO_TABLE_PREFIX_MASTER || "Not Set"
      }</li>
      <li><strong>DynamoDB Soft Delete:</strong> ${
        CONST.DYNAMO_SOFT_DELETE || "false"
      }</li>
    </ul>

    <h2>Discord Configuration</h2>
    <ul>
      <li><strong>Guild ID:</strong> ${CONST.DISCORD_GUILD_ID || "Not Set"}</li>
      <li><strong>Channel ID:</strong> ${
        CONST.DISCORD_CHANNEL_ID || "Not Set"
      }</li>
      <li><strong>Admin User ID:</strong> ${
        CONST.DISCORD_ADMIN_USER_ID || "Not Set"
      }</li>
      <li><strong>Public Key Status:</strong> ${
        CONST.DISCORD_PUB_KEY ? "✓ Configured" : "✗ Not Configured"
      }</li>
      <li><strong>Bot Token Status:</strong> ${
        CONST.DISCORD_BOT_KEY ? "✓ Configured" : "✗ Not Configured"
      }</li>
    </ul>

    <h2>External Services</h2>
    <ul>
      <li><strong>Notion API Status:</strong> ${
        CONST.NOTION_API_KEY ? "✓ Configured" : "✗ Not Configured"
      }</li>
      <li><strong>Notion Database ID:</strong> ${
        CONST.NOTION_DATABASE_ID || "Not Set"
      }</li>
      <li><strong>Provider URL:</strong> ${CONST.PROVIDER_URL || "Not Set"}</li>
      <li><strong>AES Encryption:</strong> ${
        process.env.AES_SECRET_KEY ? "✓ Configured" : "✗ Not Configured"
      }</li>
    </ul>

    <h2>Ethereum Configuration</h2>
    <ul>
      <li><strong>RPC URL:</strong> ${CONST.RPC_URL || "Not Set"}</li>
      <li><strong>Manager Contract:</strong> ${
        CONST.MANAGER_CA || "Not Set"
      }</li>
      <li><strong>Donate Contract:</strong> ${CONST.DONATE_CA || "Not Set"}</li>
    </ul>

    <h2>Endpoints</h2>
    <ul>
      <li><a href="/member">/member</a> - Member list</li>
      <li><a href="/shop">/shop</a> - Shop items</li>
      <li><a href="/item">/item</a> - Items</li>
      <li><a href="/discord">/discord</a> - Discord info</li>
      <li><a href="/notion">/notion</a> - Notion sync</li>
      <li><a href="/init">/init</a> - Initialize database</li>
    </ul>
  `;
  res.send(result);
});

app.get("/init", async (_, res) => {
  const buildTime = CONST.BUILD_TIME || new Date().toISOString();
  const result = `<h1>BIZBOT API init</h1><p>Build Time: ${buildTime}</p>`;
  const member = await controller.memberList();
  const shop = await controller.shopList();
  const item = await controller.itemList();
  const content = await contentModel.getItems("count");
  await controller.sendMessage({
    function: "discord-direct-message",
    params: {
      message: "initialized dynamo setup",
      userId: CONST.DISCORD_ADMIN_USER_ID,
    },
  });
  res.send({
    message: result,
    member: member,
    shop: shop,
    item: item,
    content: content,
  });
});

app.get("/membersync", async (_, res) => {
  if (CONST.API_ENV != "PRD") {
    const masterTarget = CONST.DYNAMO_TABLE_PREFIX_MASTER + "_member";
    const replicaTarget = CONST.DYNAMO_TABLE_PREFIX + "_member";
    const title = masterTarget + " => " + replicaTarget;
    const org_member = await memberModel.getMemberList(masterTarget);
    let result = "sync data :";
    for (let key in org_member.Items) {
      const repMember = org_member.Items[key];
      repMember.Roles = Array.from(repMember.Roles);
      try {
        await memberModel.memberCreate(repMember);
        result += "name : " + repMember.Name + "\n";
      } catch (error) {
        console.error("Try-Catch error index 83 :", error);
      }
    }
    res.send({
      message: title,
      result: result,
    });
  } else {
    res.send({ message: CONST.API_ENV + "PRD利用不可" });
  }
});

app.get("/message", async (_, res) => {
  const result = "<h1>hello discord</h1>";
  controller.discordMessage("hello discord", CONST.DISCORD_CHANNEL_ID);
  res.send(result);
});

app.get("/notion", async (_, res) => {
  const result = "<h1>notionList</h1>";
  const list = await controller.notionList();
  res.send(result + list);
});

app.get("/shop", async (_, res) => {
  const response = await controller.shopList();
  res.send(response);
});

app.get("/shop/dump", async (_, res) => {
  const response = await shopModel.getAllItems();
  const shop = utils.dynamoDbToJson(response);
  res.send(shop);
});

app.get("/shop/id/:id", async (req, res) => {
  const response = await shopModel.getItem(req.params.id);
  res.send(response);
});

app.get("/shop/eoa/:eoa", async (req, res) => {
  const response = await shopModel.getItemByEoa(req.params.eoa);
  res.send(response);
});

app.post("/shop/add", async (req, res) => {
  let body = req.body;
  body.id = await shopModel.getNewId();
  await shopModel.createItem(body);
  res.send(body);
});

app.post("/shop/delete", async (req, res) => {
  const body = req.body;
  if (CONST.DYNAMO_SOFT_DELETE == "true") {
    await shopModel.softDeleteItem(body.id);
  } else {
    await shopModel.deleteItem(body.id);
  }
  res.send(body);
});

app.post("/shop/update/:id", async (req, res) => {
  const body = req.body;
  body.id = req.params.id;
  const result = await shopModel.createItem(body);
  res.send(result);
});

app.get("/item", async (_, res) => {
  const response = await controller.itemList();
  res.send(response);
});

app.get("/item/id/:id", async (req, res) => {
  const response = await itemModel.getItem(req.params.id);
  res.send(response);
});

app.get("/item/eoa/:eoa", async (req, res) => {
  const response = await itemModel.getItemByEoa(req.params.eoa);
  res.send(response);
});

app.post("/item/add", async (req, res) => {
  let body = req.body;
  body.id = await itemModel.getNewId();
  const result = await itemModel.createItem(body);
  res.send(body);
});

app.post("/item/delete", async (req, res) => {
  const body = req.body;
  if (CONST.DYNAMO_SOFT_DELETE == "true") {
    await itemModel.softDeleteItem(body.id);
  } else {
    await itemModel.deleteItem(body.id);
  }
  res.send(body);
});

app.post("/item/update/:id", async (req, res) => {
  const body = req.body;
  body.id = req.params.id;
  const result = await itemModel.createItem(body);
  res.send(result);
});

app.get("/member", async (_, res) => {
  const result = "<h1>memberList</h1>";
  const list = await controller.memberList();
  res.send(result + list);
});

app.get("/member/dump", async (_, res) => {
  const response = await memberModel.getAllList();
  const members = utils.dynamoDbToJson(response);
  for (let key in members) {
    let roles = members[key].Roles;
    for (let no in roles) {
      roles[no] = roleNumbers[roles[no]];
    }
    members[key].Roles = roles;
  }
  res.send(members);
});

app.get("/member/:eoa", async (req, res) => {
  const detail = await memberModel.getMemberByEoa(req.params.eoa);
  res.setHeader("Content-Type", "application/json");
  res.send(utils.safeJsonStringify(detail));
});

app.get("/dynamo", async (_, res) => {
  const result = "<h1>dynamoList</h1>";
  const list = await controller.dynamoList();
  res.send(result + list);
});

app.get("/dynamo/member/:id", async (req, res) => {
  const result = "<h1>dynamoList</h1>";
  const detail = await memberModel.getDisplayMember(req);
  res.send(result + detail);
});

app.get("/dynamosync", async (_, res) => {
  if (CONST.API_ENV != "PRD") {
    await controller.sendMessage({
      function: "dynamo-sync",
      params: {
        user_id: "1142658556609450065",
        user_name: "administrator",
      },
    });
    res.send({ message: CONST.API_ENV + "更新します" });
  }
  res.send({ message: CONST.API_ENV + "PRD利用不可" });
});

app.get("/eoalist", async (_, res) => {
  const result = "<h1>eoaList</h1>";
  const list = await controller.eoaList();
  res.send(result + list);
});

app.get("/metadata/member/:id", async (req, res) => {
  const member = await memberModel.getMember(req.params.id);
  const donateBalance = await getDonate.getDonate("balance", member.Eoa);
  const totalDonate = await getDonate.getDonate("totaldonations", member.Eoa);
  const result = {
    id: req.params.id,
    name: member.Name,
    eoa: member.Eoa,
    roles: Array.from(member.Roles),
    icon: member.Icon,
    donate: donateBalance,
    totaldonate: totalDonate,
  };
  res.send(result);
});

app.get("/token/:method/:ca", async (req, res) => {
  let result = "<h1>Get Token</h1>";
  const detail = await ethController.getTokenInfo(req);
  result = result + "<p>CA:" + req.params.ca + "</p>";
  result = result + "<p>method:" + req.params.method + "</p>";
  res.send(result + detail);
});

app.get("/token/:method/:ca/:id", async (req, res) => {
  const detail = await ethController.getTokenInfo(req);
  let result = "<h1>Get Token</h1>";
  result = result + "<p>CA:" + req.params.ca + "</p>";
  result = result + "<p>ID:" + req.params.ca + "</p>";
  result = result + "<p>method:" + req.params.method + "</p>";
  res.send(result + JSON.stringify(detail));
});

app.get("/manager/:method", async (req, res) => {
  const detail = await ethController.getManager(req);
  res.send(detail);
});

app.post("/regist", async (req, res) => {
  const body = req.body;
  const result = await memberModel.memberSetEoa(
    body.discordId,
    body.eoa,
    body.secret
  );
  res.setHeader("Content-Type", "application/json");
  res.send(utils.safeJsonStringify(result));
});

app.post("/disconnect", async (req, res) => {
  const body = req.body;
  const result = await memberModel.memberDisconnect(body.discordId, body.eoa);
  res.setHeader("Content-Type", "application/json");
  res.send(utils.safeJsonStringify(result));
});

app.get("/tba/:rca/:aca/:chainId/:ca/:id/:salt", async (req, res) => {
  const detail = await ethController.getTbaInfo(req);
  res.send(detail);
});

app.get("/own/:eoa/:ca", async (req, res) => {
  const list = await ethController.getOwnInfo(req);
  let result = "";
  for (let key in list) {
    result += list[key].tokenURI + "<br />";
  }
  res.send(result);
});

app.get("/ownlist/:eoa", async (req, res) => {
  const ownlist = await getOwn.getOwnByEoa(req.params.eoa);
  let responseMes = "";
  if (ownlist.nftList.length > 0) {
    responseMes += "NFT LIST\n";
    for (let key in ownlist.nftList) {
      responseMes +=
        ownlist.nftList[key][0] + ":" + ownlist.nftList[key][1] + " tokens\n";
    }
  }
  if (ownlist.nftList.length > 0) {
    responseMes += "SBT LIST\n";
    for (let key in ownlist.nftList) {
      responseMes +=
        ownlist.nftList[key][0] + ":" + ownlist.nftList[key][1] + " tokens\n";
    }
  }
  res.send({ message: responseMes, list: ownlist });
});

app.get("/contents", async (req, res) => {
  const detail = await contentModel.getItems("count");
  res.send(detail);
});

app.get("/contents/path", async (req, res) => {
  const detail = await contentModel.getItems("path");
  res.send(detail);
});

app.get("/contents/get/:lang", async (req, res) => {
  const detail = await contentModel.beginWithScan(req.params.lang, "count");
  res.send(detail);
});

app.get("/contents/new/:lang", async (req, res) => {
  const detail = await contentModel.beginWithScan(req.params.lang, "created");
  res.send(detail);
});

app.get("/contents/path/:lang", async (req, res) => {
  const detail = await contentModel.beginWithScan(req.params.lang, "path");
  res.send(detail);
});

app.get("/contents/get/:lang/:dir/", async (req, res) => {
  const detail = await contentModel.beginWithScan(
    req.params.lang + "/" + req.params.dir,
    "count"
  );
  res.send(detail);
});

app.get("/contents/new/:lang/:dir/", async (req, res) => {
  const detail = await contentModel.beginWithScan(
    req.params.lang + "/" + req.params.dir,
    "created"
  );
  res.send(detail);
});

app.get("/contents/path/:lang/:dir/", async (req, res) => {
  const detail = await contentModel.beginWithScan(
    req.params.lang + "/" + req.params.dir,
    "path"
  );
  res.send(detail);
});

app.get("/contents/delete/:lang/:dir/:md", async (req, res) => {
  const detail = await contentsConnect.deleteContent(
    req.params.lang + "/" + req.params.dir + "/" + req.params.md
  );
  res.send(detail);
});

app.get("/contents/get/:lang/:dir/:md", async (req, res) => {
  const detail = await contentsConnect.getContent(req.params);
  res.send(detail);
});

app.get("/contents/create/:title", async (req, res) => {
  const params = {
    path: "ja/common/" + req.params.title,
    title: req.params.title,
    imgurl: CONST.PROVIDER_URL + "/img/dummy.jpg",
  };
  const detail = await contentModel.createItem(params);
  res.send(detail);
});

app.get("/contents/get/:id", async (req, res) => {
  const detail = await contentModel.getItem(req.params.id);
  res.send(detail);
});

app.get("/discord", async (_, res) => {
  const result = "<h1>discordList</h1>";
  const list = await controller.discordList();
  res.send(result + list);
});

app.get("/discord/:id", async (req, res) => {
  const detail = await memberModel.discordId2eoa(req.params.id);
  res.send(detail);
});

app.get("/sendMember/:id/:mes", async (req, res) => {
  const message = "sendMessage for member:";
  await controller.sendMessage({
    function: "discord-direct-message",
    params: {
      message: req.params.mes,
      userId: req.params.id,
    },
  });
  res.send({ message: message + req.params.mes + " to " + req.params.id });
});

app.post("/transrequest", async (req, res) => {
  let body = req.body;
  const hashInfo = await utils.getShortHash(body.ca + "/" + body.id);
  if (hashInfo.shortHash == body.secret) {
    const buyerDiscord = await memberModel.getMemberByEoa(body.eoa);
    const ownerDiscord = await memberModel.getMemberByEoa(hashInfo.owner);
    let BuyerId = body.eoa;
    let OwnerId = hashInfo.owner;
    let ChannelId = CONST.DISCORD_CHANNEL_ID;
    let messageSend = false;

    if (buyerDiscord.DiscordId) {
      BuyerId = "<@" + buyerDiscord.DiscordId + ">";
      messageSend = true;
    }
    if (ownerDiscord.DiscordId) {
      OwnerId = "<@" + ownerDiscord.DiscordId + ">";
    }
    if (hashInfo.channelId) {
      ChannelId = hashInfo.channelId;
    }

    const message =
      OwnerId +
      " さん。\n" +
      BuyerId +
      " さんのNFT購入[ " +
      hashInfo.name +
      " ]が認証されました。\n以下のURLよりこちらのNFTを\n" +
      body.eoa +
      "\nにお送りください。\n" +
      CONST.PROVIDER_URL +
      "/donate/" +
      body.eoa +
      "/" +
      body.ca +
      "/" +
      body.id;

    await controller.sendMessage({
      function: "discord-message",
      params: {
        message: message,
        channelId: ChannelId,
      },
    });

    if (messageSend) {
      await controller.sendMessage({
        function: "discord-direct-message",
        params: {
          message: message,
          userId: buyerDiscord.DiscordId,
        },
      });
    } else {
      await controller.sendMessage({
        function: "discord-message",
        params: {
          message: message,
          channelId: CONST.DISCORD_CHANNEL_ID,
        },
      });
    }

    return res.send({
      message: "APPROVED",
      requestInfo: {
        ca: body.ca,
        id: body.id,
        name: hashInfo.name,
        image: hashInfo.image,
        owner: body.eoa,
        creator: hashInfo.creator,
      },
    });
  }
  return res.send({ message: "NOT_APPROVED" });
});

// Discord interactionsは専用の処理が必要
app.post(
  "/interactions",
  express.raw({ type: "application/json" }),
  verifyKeyMiddleware(CONST.DISCORD_PUB_KEY),
  async (req, res) => {
    // req.bodyをパース（verifyKeyMiddlewareがraw bodyを検証後、自動的にパースする）
    const message = req.body;

    if (message === 1) {
      return res.send({ type: 1 });
    }

    if (message.type === InteractionType.APPLICATION_COMMAND) {
      console.log("slash command request" + JSON.stringify(message));

      if (message.data.name === "gm") {
        await controller.sendMessage({
          function: "discord-message",
          params: {
            message: `${message.member.user.global_name}さんGM!`,
            channelId: message.channel_id,
          },
        });
        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "GM!",
            flags: 64,
          },
        });
      }

      if (message.data.name === "regist") {
        // 即座にレスポンスを返す
        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "ウォレット登録を処理中です。DMで詳細をお送りします。",
            flags: 64,
          },
        });

        // 非同期で処理を実行
        (async () => {
          try {
            let sendMessage = "";
            const member = await discordConnect.memberInfo(message.member.user.id);
            const eoa = message.data.options[0].value;
            const exist = await memberModel.getMemberByEoa(eoa);
            const nowMember = await memberModel.getMember(message.member.user.id);
            const isEOA = await getDonate.isEOA(eoa);
            
            if (!isEOA) {
              sendMessage = "こちらのアドレスはEOAではありません。 \n EOA:" + eoa;
            } else if (
              exist.DiscordId != undefined &&
              exist.DiscordId != message.member.user.id
            ) {
              sendMessage =
                "こちらのEOAは " + exist.Name + " に利用されています \n EOA:" + eoa;
            } else if (
              exist.message == "member not found" &&
              (nowMember == undefined ||
                nowMember.Eoa == undefined ||
                nowMember.Eoa == "")
            ) {
              // 新規メンバーの場合は先に作成
              await memberModel.memberCreate({
                DiscordId: message.member.user.id,
                Name: member.Name || message.member.user.global_name,
                Username: member.Username,
                Globalname: member.Globalname,
                Roles: member.Roles,
                Icon: member.Icon,
                Join: member.Join,
                Eoa: "", // 一時的に空
                TmpEoa: eoa,
              });
              
              const secret = utils.generateRandomString(12);
              await memberModel.memberSetSecret(
                message.member.user.id,
                message.data.options[0].value,
                secret,
                message.member.roles
              );
              sendMessage =
                message.member.user.global_name +
                "のアカウントを以下のウォレットアドレスに紐づけます \n EOA:" +
                eoa +
                "\n" +
                "\n<ご注意>:" +
                "\n登録されたウォレットアドレスに入っているトークンによりロールが付与されます。" +
                "\nウォレットアドレスを変更すると別の人とみなされますのでご注意ください" +
                "\n" +
                "\n以下のURLにメタマスクをインストールしたブラウザでアクセスし、ウォレットを接続して登録を完了してください。" +
                "\nURL : " +
                CONST.PROVIDER_URL +
                "/regist/" +
                message.member.user.id +
                "/" +
                secret +
                "\n SECRET : " +
                secret;
            } else if (eoa == nowMember.Eoa) {
              await memberModel.memberUpdate(member);
              sendMessage = "メンバー情報をアップデートしました。 \n EOA:" + eoa;
            } else {
              sendMessage =
                "あなたのDiscordには既に\n" +
                nowMember.Eoa +
                "が紐づいています" +
                "\n解除するには以下のURLにメタマスクをインストールしたブラウザでアクセスしてください。" +
                CONST.PROVIDER_URL +
                "/disconnect/";
            }

            await controller.sendMessage({
              function: "discord-direct-message",
              params: {
                message: sendMessage,
                userId: message.member.user.id,
              },
            });
          } catch (error) {
            console.error("Error in regist command:", error);
            await controller.sendMessage({
              function: "discord-direct-message",
              params: {
                message: "エラーが発生しました。しばらく待ってから再度お試しください。",
                userId: message.member.user.id,
              },
            });
          }
        })();
      }

      if (message.data.name === "member-sbt") {
        if (!message.member.roles.includes(CONST.DISCORD_HOLDER_ROLE)) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "会員証の発行にはHolder ＆FAN ロールが必要です。",
              flags: 64,
            },
          });
        }
        const eoa = await memberModel.discordId2eoa(message.member.user.id);
        const secret = utils.generateRandomString(12);
        await memberModel.memberSetSecret(
          message.member.user.id,
          eoa,
          secret,
          message.member.roles
        );

        const sendMes =
          "会員証SBT発行はこちらから \n EOA : " +
          eoa +
          "\n\n以下のURLにメタマスクをインストールしたブラウザでアクセスし、ウォレットを接続して会員証を発行してください。" +
          "\nURL: " +
          CONST.PROVIDER_URL +
          "/membersbt/" +
          message.member.user.id +
          "/" +
          secret;

        await controller.sendMessage({
          function: "discord-direct-message",
          params: {
            message: sendMes,
            userId: message.member.user.id,
          },
        });

        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: sendMes,
            flags: 64,
          },
        });
      }

      if (message.data.name === "editor") {
        const eoa = await memberModel.discordId2eoa(message.member.user.id);
        const secret = utils.generateRandomString(12);
        await memberModel.memberSetSecret(
          message.member.user.id,
          eoa,
          secret,
          message.member.roles
        );

        const sendMes =
          "記事の執筆は以下のサイトで行ってください \n EOA : " +
          eoa +
          "\n\n以下のURLにメタマスクをインストールしたブラウザでアクセスしウォレットを接続してログインしてください。" +
          "\nURL: " +
          CONST.PROVIDER_URL +
          "/editor/" +
          message.member.user.id +
          "/" +
          secret;
        await controller.sendMessage({
          function: "discord-direct-message",
          params: {
            message: sendMes,
            userId: message.member.user.id,
          },
        });

        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: sendMes,
            flags: 64,
          },
        });
      }

      if (message.data.name === "apply") {
        console.log("apply");

        // 即座にレスポンスを返す
        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "NFT所有状況を確認中です。結果はDMでお知らせします。",
            flags: 64,
          },
        });

        // 非同期で処理を実行
        (async () => {
          try {
            const eoa = await memberModel.discordId2eoa(message.member.user.id);

            // Ethereum設定の確認
            if (!CONST.MANAGER_CA || !CONST.RPC_URL) {
              await controller.sendMessage({
                function: "discord-direct-message",
                params: {
                  message:
                    "申し訳ございません。システムの設定が完了していません。管理者にお問い合わせください。",
                  userId: message.member.user.id,
                },
              });
              return;
            }

            const ownlist = await getOwn.getOwnByEoa(eoa);
            let responseMes = "";
            let tokenCount = 0;

            if (ownlist.nftList.length > 0) {
              responseMes = responseMes + "NFT LIST\n";
              for (let key in ownlist.nftList) {
                tokenCount++;
                responseMes =
                  responseMes +
                  ownlist.nftList[key][0] +
                  ":" +
                  ownlist.nftList[key][1] +
                  " tokens\n";
              }
            }

            if (ownlist.sbtList.length > 0) {
              responseMes = responseMes + "SBT LIST\n";
              for (let key in ownlist.sbtList) {
                tokenCount++;
                responseMes =
                  responseMes +
                  ownlist.sbtList[key][0] +
                  ":" +
                  ownlist.sbtList[key][1] +
                  " tokens\n";
              }
            }

            if (tokenCount > 0) {
              await discordConnect.setRoleId(
                message.member.user.id,
                "Holder &Fan"
              );
              responseMes =
                "あなたは有効なNFTの所有者です。\n" +
                "Holder & FAN ロールが付与されました。\n" +
                "あなたの持っているNFT\n" +
                responseMes;
            } else {
              responseMes = "あなたは有効なNFTを持っていません";
            }

            await controller.sendMessage({
              function: "discord-direct-message",
              params: {
                message: responseMes,
                userId: message.member.user.id,
              },
            });
          } catch (error) {
            console.error("Error in apply command:", error);
            await controller.sendMessage({
              function: "discord-direct-message",
              params: {
                message:
                  "エラーが発生しました。しばらく待ってから再度お試しください。",
                userId: message.member.user.id,
              },
            });
          }
        })();
      }

      if (message.data.name === "sync") {
        if (message.member.roles.includes(CONST.DISCORD_SYNC_ROLE)) {
          let synctype = message.data.options[0].value ?? "";
          let returnmes = "";
          switch (synctype) {
            case "notion":
              await controller.sendMessage({
                function: "notion-sync",
                params: {
                  user_id: message.member.user.id,
                  user_name: message.member.user.global_name,
                },
              });
              returnmes = "メンバーをnotionに連携しました。";
              break;
            case "dynamo":
              await controller.sendMessage({
                function: "dynamo-sync",
                params: {
                  user_id: message.member.user.id,
                  user_name: message.member.user.global_name,
                },
              });
              returnmes = "メンバーをdynamoに連携しました。";
              break;
            default:
              returnmes = "指定タイプが不明です:" + synctype;
          }
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: returnmes, flags: 64 },
          });
        } else {
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: "syncの権限がありません。", flags: 64 },
          });
        }
      }
      if (message.data.name === "getkey") {
        const hashInfo = await utils.getShortHash(
          message.data.options[0].value
        );
        const eoa = await memberModel.discordId2eoa(message.member.user.id);
        if (hashInfo.owner == eoa) {
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content:
                "secretkey : " +
                hashInfo.shortHash +
                "\ngallaryName : " +
                hashInfo.gallaryName +
                "\nNFT contract : " +
                hashInfo.contractInfo +
                " #" +
                hashInfo.pathInfo +
                "\nNFT path : " +
                hashInfo.pathInfo +
                message.data.options[0].value +
                "\nNFT name : " +
                hashInfo.name +
                "\n" +
                hashInfo.image +
                "\n" +
                message.data.options[0].value,
              flags: 64,
            },
          });
        } else {
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content:
                "NFT:" +
                hashInfo.name +
                "のsecretKeyを取得する権限がありません。",
              flags: 64,
            },
          });
        }
      }
      console.log("slash command requested" + JSON.stringify(message));
    }
  }
);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${CONST.API_ENV}`);
  console.log(`API Name: ${CONST.API_NAME}`);
  console.log(`Build Time: ${CONST.BUILD_TIME}`);
  console.log("Server started successfully. Ready to accept connections.");
});
