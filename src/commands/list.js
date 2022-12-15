// List command
const BotFunctions = require("../bot_functions.js");
const Errors = require("../messages/errors.js");
const Colors = require("../messages/colors.js");

const { EmbedBuilder } = require("discord.js");

function Run(client, msg)
{
    const server_id = msg.guild.id;
    const msgParams = BotFunctions.GetCommandParamaters(msg.content);
    const channel_id = BotFunctions.GetMessageChannelID(msgParams[2]);

    // They want to list all channel stickies 
    if (channel_id == null)
    {
        const stickyList = global.stickies.GetStickies(server_id, null);
        if (typeof(stickyList) == "string")
            return BotFunctions.SimpleMessage(msg.channel, stickyList, "Error listing stickies", Colors["error"]);

        const listEmbed = new EmbedBuilder();
        listEmbed.setColor(Colors["info"]);
        listEmbed.title = global.discordApplication.name;

        if (stickyList != null && stickyList != false)
        {
            let bStickiesExist = false;
            let bEmbedHasFields = false;
            let szChannelList = "";
            stickyList.forEach((val, index, array) => {
                bStickiesExist = true;
                client.channels.fetch(val["server_id"]).then(channel => {
                    if (val.count > 0)
                    {
                        szChannelList = "";
                        szChannelList += `
                            ${channel.toString()}
                            Count: ${val.count}
                        `;

                        listEmbed.addFields({name: "Stickies", value: szChannelList});  
                        bEmbedHasFields = true;
                    }
                    else 
                        bEmbedHasFields = false;

                    if (array.length - 1 == index)
                    {
                        if (!bEmbedHasFields)
                            BotFunctions.SimpleMessage(msg.channel, Errors["no_stickies"], "Error listing stickies", Colors["error"]);
                        else
                            msg.channel.send({embeds: [listEmbed]});

                        //if (listEmbed.fields.length <= 0)
                        //    BotFunctions.SimpleMessage(msg.channel, Errors["no_stickies"], "Error listing stickies", Colors["error"]);
                        //else
                        //msg.channel.send({embeds: [listEmbed]});
                    }
                }).catch(err => {
                    console.error(err);
                });
            });

            if (!bStickiesExist)
                BotFunctions.SimpleMessage(msg.channel, Errors["no_stickies"], "Error listing stickies", Colors["error"]);
        }
        else
            BotFunctions.SimpleMessage(msg.channel, Errors["no_stickies"], "Error listing stickies", Colors["error"]);
    }
    
    // They want to list a specific channel's stickies
    client.channels.fetch(channel_id).then(channel => {
        console.log(`Fetching channel with no error ${channel_id}`)
        BotFunctions.ShowChannelStickies(server_id, channel, msg.channel);
    }).catch(_ => {
        if (channel_id != null)
            return BotFunctions.SimpleMessage(msg.channel, Errors["invalid_channel"], "Error getting channel ID", Colors["error"]);
    }); 
}

module.exports = {Run};
