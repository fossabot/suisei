// Imports
// Packages
const { MessageEmbed } = require('discord.js');

// Local files
const moderation = require('$/util/moderation');
const { confirmRequest } = require('$/util/functions');
const config = require('$/config.json');

// Functions
function confirmAndTos(message, member, reason) {
	const embed = new MessageEmbed()
		.setTitle(`Taking action for TOS violation: **${member.user.tag}**`)
		.setDescription(`Reason: ${reason}`);

	message.channel.send(embed)
		.then((msg) => {
			confirmRequest(msg, message.author.id)
				.then((result) => {
					if (result === true) {
						moderation.tosviolation(member, reason, message.member)
							.then((status) => {
								if (status.info) message.channel.send(`TOS violation action succeeded, but ${status.info}`);
								else message.channel.send(`TOS violation action succeeded, **${member.user.tag}**`);
							})
							.catch(() => message.channel.send('Something went wrong, please try again.'));
					} else {
						msg.edit('Cancelled.');
					}
				});
		});
}

// Command
exports.run = async (client, message, args) => {
	if (args.length < 2) return message.channel.send(`**USAGE:** ${config.discord.prefix}tosviolation <user> <reason>`);

	const reason = await args.slice(1).join(' ');
	if (reason.length === 0) return message.channel.send("Error: Reason can't be empty");
	if (reason.length > 1000) return message.channel.send('Error: Reason is over 1000 characters');

	moderation.getMemberFromMessage(message, args)
		.then((member) => confirmAndTos(message, member, reason))
		.catch((err) => message.channel.send(err));
};

exports.config = {
	command: 'tosviolation',
};
