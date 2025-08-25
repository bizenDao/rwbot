BOT_API_ID=1235600023065202718
BOT_TOKEN=

curl -X GET -H "Authorization: Bot ${BOT_TOKEN}" \
    https://discord.com/api/v10/applications/${BOT_API_ID}/commands
