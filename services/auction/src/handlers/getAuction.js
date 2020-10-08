import AWS from "aws-sdk";
import AuctionRepository from "../lib/repositories/AuctionRepository";
import commonMiddleware from "../lib/middlewares/commonMiddleware";
import createError from "http-errors";

const auctionRepository = new AuctionRepository(
  new AWS.DynamoDB.DocumentClient()
);

export async function getAuctionById(id) {
  try {
    const auction = await auctionRepository.getAuctionById(id);
    if (!auction) {
      throw new createError.NotFound(`Auction with ID "${id}" not found!`);
    }
    return auction;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}

async function getAuction(event, _) {
  const { id } = event.pathParameters;
  const auction = await getAuctionById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(getAuction);
