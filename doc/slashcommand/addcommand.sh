BOT_API_ID=1235600023065202718
BOT_TOKEN=

curl -X POST -H "Authorization: Bot ${BOT_TOKEN}" \
    -H "Content-Type: application/json" \
    --data-binary @$1.json \
    https://discord.com/api/v10/applications/${BOT_API_ID}/commands
