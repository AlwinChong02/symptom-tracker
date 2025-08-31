// Professional email templates for medication reminders

export function createMedicationReminderTemplate(medicationData, userName) {
  const { name, dosage, frequency, times, daysOfWeek, startDate } = medicationData;
  
  const scheduleText = frequency === 'Weekly' && daysOfWeek?.length > 0
    ? `${frequency} on ${daysOfWeek.join(', ')} at ${times?.join(', ') || 'scheduled times'}`
    : `${frequency} at ${times?.join(', ') || 'scheduled times'}`;

  const subject = `Medication Reminder Created: ${name}`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Medication Reminder</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #16a085, #27ae60); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
        .content { padding: 40px 30px; }
        .medication-card { background-color: #f8f9fa; border-left: 4px solid #27ae60; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .medication-name { font-size: 24px; font-weight: 600; color: #2c3e50; margin-bottom: 10px; }
        .detail-row { display: flex; justify-content: space-between; margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #ecf0f1; }
        .detail-label { font-weight: 600; color: #7f8c8d; }
        .detail-value { color: #2c3e50; }
        .schedule-highlight { background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .schedule-highlight strong { color: #27ae60; font-size: 18px; }
        .tips { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0; }
        .tips h3 { color: #856404; margin-top: 0; }
        .tips ul { margin: 10px 0; padding-left: 20px; }
        .tips li { margin: 8px 0; color: #856404; }
        .footer { background-color: #34495e; color: white; padding: 30px; text-align: center; }
        .footer p { margin: 5px 0; }
        .footer a { color: #3498db; text-decoration: none; }
        .btn { display: inline-block; background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .btn:hover { background-color: #219a52; }
        @media (max-width: 600px) {
          .content { padding: 20px 15px; }
          .detail-row { flex-direction: column; }
          .detail-label { margin-bottom: 5px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 Medication Reminder Set</h1>
          <p>Your health companion is ready to help you stay on track</p>
        </div>
        
        <div class="content">
          <p>Hello ${userName || 'there'},</p>
          
          <p>Great news! Your medication reminder has been successfully created in your Symptom Tracker app. We're here to help you maintain consistent medication adherence for better health outcomes.</p>
          
          <div class="medication-card">
            <div class="medication-name">${name}</div>
            <div class="detail-row">
              <span class="detail-label">Dosage:</span>
              <span class="detail-value">${dosage}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Frequency:</span>
              <span class="detail-value">${frequency}</span>
            </div>
            ${times?.length > 0 ? `
            <div class="detail-row">
              <span class="detail-label">Times:</span>
              <span class="detail-value">${times.join(', ')}</span>
            </div>
            ` : ''}
            ${daysOfWeek?.length > 0 ? `
            <div class="detail-row">
              <span class="detail-label">Days:</span>
              <span class="detail-value">${daysOfWeek.join(', ')}</span>
            </div>
            ` : ''}
            ${startDate ? `
            <div class="detail-row">
              <span class="detail-label">Start Date:</span>
              <span class="detail-value">${new Date(startDate).toLocaleDateString()}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="schedule-highlight">
            <strong>📅 Schedule: ${scheduleText}</strong>
          </div>
          
          <div class="tips">
            <h3>💡 Tips for Medication Adherence</h3>
            <ul>
              <li><strong>Set phone alarms</strong> as backup reminders</li>
              <li><strong>Use a pill organizer</strong> to prepare doses in advance</li>
              <li><strong>Keep medications visible</strong> in a safe, accessible place</li>
              <li><strong>Track your symptoms</strong> to monitor medication effectiveness</li>
              <li><strong>Never skip doses</strong> without consulting your healthcare provider</li>
            </ul>
          </div>
          
          <p>Remember, consistent medication adherence is crucial for your treatment success. If you have any questions about your medication or experience side effects, please consult with your healthcare provider.</p>
          
          <center>
            <a href="#" class="btn">📱 Open Symptom Tracker App</a>
          </center>
          
          <p>Stay healthy and take care!</p>
        </div>
        
        <div class="footer">
          <p><strong>Symptom Tracker</strong></p>
          <p>Your personal health companion</p>
          <p style="font-size: 12px; margin-top: 20px; opacity: 0.8;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hello ${userName || 'there'},

Your medication reminder has been successfully created!

Medication Details:
- Name: ${name}
- Dosage: ${dosage}
- Schedule: ${scheduleText}
${startDate ? `- Start Date: ${new Date(startDate).toLocaleDateString()}` : ''}

Tips for Medication Adherence:
• Set phone alarms as backup reminders
• Use a pill organizer to prepare doses in advance
• Keep medications visible in a safe, accessible place
• Track your symptoms to monitor medication effectiveness
• Never skip doses without consulting your healthcare provider

Remember, consistent medication adherence is crucial for your treatment success.

Stay healthy!

Symptom Tracker Team
  `;

  return { subject, html, text };
}

export function createMedicationUpdateTemplate(medicationData, userName) {
  const { name, dosage, frequency, times, daysOfWeek } = medicationData;
  
  const scheduleText = frequency === 'Weekly' && daysOfWeek?.length > 0
    ? `${frequency} on ${daysOfWeek.join(', ')} at ${times?.join(', ') || 'scheduled times'}`
    : `${frequency} at ${times?.join(', ') || 'scheduled times'}`;

  const subject = `Medication Reminder Updated: ${name}`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Medication Reminder Updated</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
        .content { padding: 40px 30px; }
        .medication-card { background-color: #f8f9fa; border-left: 4px solid #3498db; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .medication-name { font-size: 24px; font-weight: 600; color: #2c3e50; margin-bottom: 10px; }
        .schedule-highlight { background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .schedule-highlight strong { color: #1976d2; font-size: 18px; }
        .footer { background-color: #34495e; color: white; padding: 30px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📝 Medication Reminder Updated</h1>
        </div>
        
        <div class="content">
          <p>Hello ${userName || 'there'},</p>
          
          <p>Your medication reminder for <strong>${name}</strong> has been successfully updated.</p>
          
          <div class="schedule-highlight">
            <strong>📅 New Schedule: ${scheduleText}</strong>
          </div>
          
          <p>Please make sure to follow the updated schedule for optimal treatment results.</p>
        </div>
        
        <div class="footer">
          <p><strong>Symptom Tracker</strong></p>
          <p>Your personal health companion</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hello ${userName || 'there'},

Your medication reminder for ${name} has been successfully updated.

New Schedule: ${scheduleText}

Please make sure to follow the updated schedule for optimal treatment results.

Symptom Tracker Team
  `;

  return { subject, html, text };
}
