export interface ISearchEmailOptions {
  id: string;
  subject: string;
  from: string;
  date: string;
  body: string;
}

function createRawEmail({ to, subject, message }: any) {
  const email = [
    `To: ${to}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    message,
  ].join("\n");

  return Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}



export const sendEmail = async (
  gmail: any,
  { receiver_email, cc, bcc, subject, text }: any
): Promise<any> => {
  const rawMessage = createRawEmail({
    to: receiver_email,
    subject,
    message: text,
  });

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: rawMessage,
    },
  });

  return res;
};




export const searchEmail = async (
  gmail: any,
  { query, maxResults }: any
): Promise<ISearchEmailOptions[]> => {
  const response = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: maxResults || 10,
  });

  const messages = response.data.messages || [];

  return await Promise.all(
    messages.map(async (msg: any) => {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "full",
      });

      const headers = detail.data.payload?.headers || [];
      const payload = detail.data.payload;
      let body = "";

      if (payload?.parts?.length) {
        const plainPart = payload.parts.find(
          (p: any) => p.mimeType === "text/plain"
        );
        const data = plainPart?.body?.data;
        if (data) {
          body = Buffer.from(data, "base64").toString("utf-8");
        }
      } else if (payload?.body?.data) {
        body = Buffer.from(payload.body.data, "base64").toString("utf-8");
      }

      return {
        id: msg.id,
        subject: headers.find((h: any) => h.name === "Subject")?.value || "",
        from: headers.find((h: any) => h.name === "From")?.value || "",
        date: headers.find((h: any) => h.name === "Date")?.value || "",
        body,
      };
    })
  );
};
