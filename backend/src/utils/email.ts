import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../config/logger';

export function createMailTransporter() {
  return nodemailer.createTransport({
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: config.email.smtp.secure,
    auth: {
      user: config.email.smtp.user,
      pass: config.email.smtp.pass,
    },
  });
}

export async function sendTargetPriceAlertEmail(
  email: string,
  symbol: string,
  targetPrice: number,
  currentPrice: number,
  alertType: 'TAKE_PROFIT' | 'STOP_LOSS'
) {
  const isDev = config.server.nodeEnv === 'development';

  if (isDev && (!config.email.smtp.user || config.email.smtp.user.includes('your-email'))) {
    logger.info({ email, symbol, targetPrice, currentPrice, alertType }, '📧 [DEV MODE] Alert Email (no email sent)');
    console.log('\n=========================================');
    console.log(`📧 Target Alert for ${symbol}: ${alertType} hit at $${currentPrice} (Target was $${targetPrice})`);
    console.log('=========================================\n');
    return;
  }

  const transporter = createMailTransporter();
  const title = alertType === 'TAKE_PROFIT' ? 'Take Profit Alert' : 'Stop Loss Alert';
  const color = alertType === 'TAKE_PROFIT' ? '#10b981' : '#ef4444'; // emerald vs red

  await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: `[Portfolio Alert] ${symbol} ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
        <h2 style="color: #1e1b4b; margin-bottom: 8px;">${title}: ${symbol}</h2>
        <p style="color: #6b7280; margin-bottom: 24px;">Your stock position has reached the target price.</p>
        <div style="background: ${color}; color: white; font-size: 24px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px;">
          Current Price: $${currentPrice.toFixed(2)}
        </div>
        <p style="color: #374151; font-size: 16px; margin-top: 24px;">
          <strong>Target Price Configured:</strong> $${targetPrice.toFixed(2)}
        </p>
        <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">
          Visit your dashboard to review your portfolio or adjust your targets.
        </p>
      </div>
    `,
  });
}
