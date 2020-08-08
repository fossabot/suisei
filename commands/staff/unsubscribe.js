// Models
const Subscription = require("$/models/subscription");

// Local files
const config = require("$/config.json"),
    {confirmRequest} = require("$/util/functions");

exports.run = (client, message, args, pubSubSubscriber) => {
    if (!args[0] || !args[1]) return message.channel.send(`**USAGE:** ${config.discord.staffprefix}unsubscribe [YT channel id] [text channel id]`)
        .then(msg => {
            message.delete({timeout: 4000, reason: "Automated"});
            msg.delete({timeout: 4000, reason: "Automated"});
        });
    Subscription.findById(args[0], (err, subscription) => {
        if (err) message.channel.send("Something went wrong, try again later.")
            .then(msg => {
                message.delete({timeout: 4000, reason: "Automated"});
                msg.delete({timeout: 4000, reason: "Automated"});
            });

        if (!subscription) message.channel.send("That channel doesn't exist in the database.")
            .then(msg => {
                message.delete({timeout: 4000, reason: "Automated"});
                msg.delete({timeout: 4000, reason: "Automated"});
            });

        let index = subscription.channels.findIndex(channel => channel === args[1]);
        if (index === -1) return message.channel.send("That text channel isn't subscribed to this YouTube channel.")
            .then(msg => {
                message.delete({timeout: 4000, reason: "Automated"});
                msg.delete({timeout: 4000, reason: "Automated"});
            });

        subscription.channels.splice(index, 1);
        message.channel.send(`Are you sure you want to remove ${args[0]} from ${args[1]}?`)
            .then(msg => {
                confirmRequest(msg, message.author.id)
                    .then(result => {
                        msg.delete({reason: "Automated"});
                        if (result === true) {
                            if (subscription.channels.length === 0) {
                                Subscription.findByIdAndDelete(subscription._id, (err) => {
                                    if (err) message.channel.send("Something went wrong during deletion, try again later.")
                                        .then(msg => {
                                            message.delete({timeout: 4000, reason: "Automated"});
                                            msg.delete({timeout: 4000, reason: "Automated"});
                                        });
                                    else pubSubSubscriber.unsubscribe(
                                        `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${subscription._id}`,
                                        "https://pubsubhubbub.appspot.com",
                                        (err) => {
                                            if (err) message.channel.send("Something went wrong during unsubscription, notifications won't be sent anymore but do notify the Website Team of this issue.")
                                                .then(msg => {
                                                    message.delete({timeout: 4000, reason: "Automated"});
                                                    msg.delete({timeout: 4000, reason: "Automated"});
                                                });
                                            else message.channel.send("Subscription removal successful.")
                                                .then(msg2 => {
                                                    message.delete({timeout: 4000, reason: "Automated"});
                                                    msg2.delete({timeout: 4000, reason: "Automated"});
                                                });
                                        });
                                });
                            } else {
                                subscription.save((err) => {
                                    if (err) message.channel.send("Something went wrong during the subscription removal, try again later.")
                                        .then(msg2 => {
                                            message.delete({timeout: 4000, reason: "Automated"});
                                            msg2.delete({timeout: 4000, reason: "Automated"});
                                        });
                                    else message.channel.send("Subscription removal successful.")
                                        .then(msg2 => {
                                            message.delete({timeout: 4000, reason: "Automated"});
                                            msg2.delete({timeout: 4000, reason: "Automated"});
                                        });
                                })
                            }
                        }
                    });
            });
    });
}

module.exports.config = {
    command: "unsubscribe"
}
