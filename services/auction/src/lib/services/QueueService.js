export default class QueueService {
  constructor(queue, url) {
    this._queue = queue;
    this._url = url;
  }
  async sendMessage({ subject, recipient, body }) {
    return this._queue
      .sendMessage({
        QueueUrl: this._url,
        MessageBody: JSON.stringify({
          subject: subject,
          recipient: recipient,
          body: body,
        }),
      })
      .promise();
  }
}
