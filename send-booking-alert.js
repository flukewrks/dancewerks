// netlify/functions/send-booking-alert.js

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // ดึงค่า Channel Token และ User ID จาก Environment Variables
  const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const ADMIN_USER_ID = process.env.LINE_ADMIN_USER_ID;

  if (!CHANNEL_ACCESS_TOKEN || !ADMIN_USER_ID) {
    return { statusCode: 500, body: "Server configuration error." };
  }

  try {
    const fields = JSON.parse(event.body);

    // จัดรูปแบบข้อความที่จะส่ง (เหมือนเดิม)
    const textMessage = `
🔔 มีการจองคลาส Private ใหม่!
-------------------------
ชื่อเล่น: ${fields.customer_nickname || 'N/A'}
ชื่อผู้ชำระเงิน: ${fields.customer_payer_name || 'N/A'}
เบอร์โทร: ${fields.customer_phone || 'N/A'}
อีเมล: ${fields.customer_email || 'N/A'}
-------------------------
รายละเอียดการจอง:
${fields.booking_request_summary || 'N/A'}
-------------------------
กรุณาตรวจสอบสลิปและยืนยันการจอง
    `.trim();

    // สร้าง Body สำหรับส่ง Push Message
    const payload = {
      to: ADMIN_USER_ID, // ระบุ ID ผู้รับ (คุณ)
      messages: [
        {
          type: "text",
          text: textMessage,
        },
      ],
    };

    // ส่ง Request ไปยัง LINE Messaging API
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('LINE API Error:', errorBody);
      throw new Error(`LINE API error: ${response.statusText}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message sent successfully!" })
    };

  } catch (error) {
    console.error('Error sending message:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send message." })
    };
  }
};