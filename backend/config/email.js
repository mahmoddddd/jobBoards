const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_ID,
    pass: process.env.PASS_MAIL,
  },
});

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML body
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"JobBoard منصة التوظيف" <${process.env.MAIL_ID}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error);
    throw error;
  }
};

/**
 * Password reset email template
 */
const getPasswordResetEmail = (name, resetUrl) => {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Cairo', Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 20px 0; }
        .footer { padding: 20px 30px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 12px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; margin-top: 20px; color: #92400e; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 إعادة تعيين كلمة المرور</h1>
        </div>
        <div class="content">
          <p>مرحباً <strong>${name}</strong>،</p>
          <p>لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بحسابك على منصة <strong>JobBoard</strong>.</p>
          <p>اضغط على الزر أدناه لإعادة تعيين كلمة المرور:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="btn">إعادة تعيين كلمة المرور</a>
          </div>
          <div class="warning">
            ⚠️ هذا الرابط صالح لمدة <strong>10 دقائق</strong> فقط. إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} JobBoard. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Application status change email template
 */
const getApplicationStatusEmail = (name, jobTitle, companyName, status) => {
  const statusMap = {
    'REVIEWING': { label: 'قيد المراجعة', color: '#3b82f6', icon: '👀' },
    'ACCEPTED': { label: 'مقبول', color: '#10b981', icon: '🎉' },
    'REJECTED': { label: 'مرفوض', color: '#ef4444', icon: '😔' },
  };

  const statusInfo = statusMap[status] || { label: status, color: '#6b7280', icon: '📋' };

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Cairo', Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .status-badge { display: inline-block; background: ${statusInfo.color}; color: white; padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 16px; }
        .job-card { background: #f9fafb; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #e5e7eb; }
        .footer { padding: 20px 30px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusInfo.icon} تحديث حالة طلبك</h1>
        </div>
        <div class="content">
          <p>مرحباً <strong>${name}</strong>،</p>
          <p>تم تحديث حالة طلبك للوظيفة التالية:</p>
          <div class="job-card">
            <p style="margin: 0; font-weight: bold; font-size: 18px;">${jobTitle}</p>
            <p style="margin: 4px 0 0; color: #6b7280;">${companyName}</p>
          </div>
          <p>الحالة الجديدة: <span class="status-badge">${statusInfo.label}</span></p>
          ${status === 'ACCEPTED' ? '<p>🎊 تهانينا! يُرجى متابعة بريدك الإلكتروني لمزيد من التفاصيل.</p>' : ''}
          ${status === 'REJECTED' ? '<p>لا تيأس! هناك العديد من الفرص الأخرى المتاحة على منصتنا.</p>' : ''}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} JobBoard. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { sendEmail, getPasswordResetEmail, getApplicationStatusEmail };
