import { v4 as uuid } from "uuid";

export default class AuctionRepository {
  constructor(db, tableName = process.env.AUCTIONS_TABLE_NAME) {
    this._db = db;
    this._tableName = tableName;
  }

  async getAuctionById(id) {
    const result = await this._db
      .get({
        TableName: this._tableName,
        Key: { id },
      })
      .promise();
    return result.Item;
  }

  async getAuctionsByStatus(status) {
    const params = {
      TableName: this._tableName,
      IndexName: "statusAndEndDate",
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeValues: {
        ":status": status,
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };

    const result = await this._db.query(params).promise();
    return result.Items;
  }

  async getEndedAuctions() {
    const params = {
      TableName: this._tableName,
      IndexName: "statusAndEndDate",
      KeyConditionExpression: "#status = :status AND endingAt <= :now",
      ExpressionAttributeValues: {
        ":status": "OPEN",
        ":now": new Date().toISOString(),
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };

    const result = await this._db.query(params).promise();
    return result.Items;
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

  async setAuctionPictureUrl(id, pictureUrl) {
    const params = {
      TableName: this._tableName,
      Key: { id },
      UpdateExpression: "set pictureUrl = :pictureUrl",
      ExpressionAttributeValues: {
        ":pictureUrl": pictureUrl,
      },
      ReturnValues: "ALL_NEW",
    };

    const result = await this._db.update(params).promise();
    return result.Attributes;
  }

  async updateHighestBid({ id, email, amount }) {
    const params = {
      TableName: this._tableName,
      Key: { id },
      UpdateExpression:
        "set highestBid.amount = :amount, highestBid.bidder = :bidder",
      ExpressionAttributeValues: {
        ":amount": amount,
        ":bidder": email,
      },
      ReturnValues: "ALL_NEW",
    };
    const result = await this._db.update(params).promise();

    return result.Attributes;
  }

  async closeAuction(id) {
    const params = {
      TableName: this._tableName,
      Key: { id: id },
      UpdateExpression: "set #status = :status",
      ExpressionAttributeValues: {
        ":status": "CLOSED",
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };
    await this._db.update(params).promise();
  }
}
