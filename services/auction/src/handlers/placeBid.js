import AWS from "aws-sdk";
import createError from "http-errors";
import validator from "@middy/validator";
import { getAuctionById } from "./getAuction";
import AuctionRepository from "../lib/repositories/AuctionRepository";
import commonMiddleware from "../lib/middlewares/commonMiddleware";
import placeBidSchema from "../lib/schemas/placeBidSchema";

const auctionRepository = new AuctionRepository(
  new AWS.DynamoDB.DocumentClient()
);

function verifyBid(auction, bid) {
  // Bid identity validation
  if (bid.email === auction.seller) {
    throw new createError.Forbidden(`You cannot bid on your own auctions!`);
  }

  // Avoid double bidding
  if (bid.email === auction.highestBid.bidder) {
    throw new createError.Forbidden(`You are already the highest bidder`);
  }

  // Auction status validation
  if (auction.status !== "OPEN") {
    throw new createError.Forbidden(`You cannot bid on closed auctions!`);
  }

  // Bid amount validation
  if (bid.amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(
      `Your bid must be higher than ${auction.highestBid.amount}!`
    );
  }
}

async function placeBid(event, _) {
  const bid = {
    id: event.pathParameters,
    amount: event.body,
    email: event.requestContext.authorizer,
  };

  try {
    const auction = await getAuctionById(bid.id);
    verifyBid(auction, bid);
    const updatedAuction = await auctionRepository.updateHighestBid(bid);
    return {
      statusCode: 200,
      body: JSON.stringify(updatedAuction),
    };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(placeBid).use(
  validator({ inputSchema: placeBidSchema })
);
