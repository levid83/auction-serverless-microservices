import { v4 as uuid } from "uuid";

export default class AuctionRepository {
  constructor(db, tableName = process.env.AUCTIONS_TABLE_NAME) {
    this._db = db;
    this._tableName = tableName;
  }

  async saveAuction({ email, title }) {
    const now = new Date();
    const endDate = new Date();
    endDate.setHours(now.getHours() + 1);

    const auction = {
      id: uuid(),
      title,
      status: "OPEN",
      createdAt: now.toISOString(),
      endingAt: endDate.toISOString(),
      highestBid: {
        amount: 0,
      },
      seller: email,
    };

    await this._db
      .put({
        TableName: this._tableName,
        Item: auction,
      })
      .promise();

    return auction;
  }
}
