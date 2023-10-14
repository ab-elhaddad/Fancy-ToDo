import { config } from './../configuration/config';
import jwt from 'jsonwebtoken';
import transporter from '../lib/transporter';

/**
 * Sends an email with a confirmation link to the account's email address.
 * @param userID
 * @param userEmail
 */
const sendConfirmationEmail = async (userID: number, userEmail: string) => {
	// Genertes a token based only on the id.
	const token = jwt.sign(String(userID), config.jwtSecretKey);
	const url = `http://localhost:3000/confirm/${token}`;

	await transporter.sendMail({
		from: 'Fancy To-Do',
		to: userEmail,
		subject: 'Email confirmation',
		html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`
	});
};

export default sendConfirmationEmail;
