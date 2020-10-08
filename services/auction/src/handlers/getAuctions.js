import AWS from "aws-sdk";
import createError from "http-errors";
import validator from "@middy/validator";
import AuctionRepository from "../lib/repositories/AuctionRepository";
import commonMiddleware from "../lib/middlewares/commonMiddleware";
import getAuctionsSchema from "../lib/schemas/getAuctionsSchema";

const auctionRepository = new AuctionRepository(
  new AWS.DynamoDB.DocumentClient()
);

async function getAuctions(event, _) {
  const { status } = event.queryStringParameters;
  try {
    const auctions = auctionRepository.getAuctionsByStatus(status);
    return {
      statusCode: 200,
      body: JSON.stringify(auctions),
    };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(getAuctions).use(
  validator({ inputSchema: getAuctionsSchema, useDefaults: true })
);
