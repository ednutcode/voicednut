const { getUserList, getUser } = require('../db/db');

module.exports = (bot) => {
    bot.command('users', async (ctx) => {
        try {
            // Check authorization first
            const user = await new Promise((resolve, reject) => {
                getUser(ctx.from.id, (err, result) => {
                    if (err) {
                        console.error('Database error in getUser:', err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });

            if (!user) {
                await ctx.reply('❌ You are not authorized to use this bot.');
                return;
            }

            if (user.role !== 'ADMIN') {
                await ctx.reply('❌ This command is for administrators only.');
                return;
            }

            // Get users list with proper error handling
            const users = await new Promise((resolve, reject) => {
                getUserList((err, result) => {
                    if (err) {
                        console.error('Database error in getUserList:', err);
                        resolve([]); // Resolve with empty array instead of rejecting
                    } else {
                        resolve(result || []); // Ensure we always resolve with an array
                    }
                });
            });

            if (!users || users.length === 0) {
                await ctx.reply('📋 No users found in the system.');
                return;
            }

            // Format users list safely - use plain text to avoid markdown issues
            let message = `📋 USERS LIST (${users.length}):\n\n`;
            
            users.forEach((user, index) => {
                const roleIcon = user.role === 'ADMIN' ? '🛡️' : '👤';
                const username = user.username || 'no_username';
                const joinDate = new Date(user.timestamp).toLocaleDateString();
                message += `${index + 1}. ${roleIcon} @${username}\n`;
                message += `   ID: ${user.telegram_id}\n`;
                message += `   Role: ${user.role}\n`;
                message += `   Joined: ${joinDate}\n\n`;
            });

            // Send without parse_mode to avoid markdown parsing errors
            await ctx.reply(message);

        } catch (error) {
            console.error('Users command error:', error);
            await ctx.reply('❌ Error fetching users list. Please try again.');
        }
    });
};