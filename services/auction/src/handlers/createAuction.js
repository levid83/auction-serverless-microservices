import AWS from "aws-sdk";
import createError from "http-errors";
import validator from "@middy/validator";
import AuctionRepository from "../lib/repositories/AuctionRepository";
import commonMiddleware from "../lib/middlewares/commonMiddleware";
import createAuctionSchema from "../lib/schemas/createAuctionSchema";

const auctionRepository = new AuctionRepository(
  new AWS.DynamoDB.DocumentClient()
);

async function createAuction(event, _) {
  const { title } = event.body;
  const { email } = event.requestContext.authorizer;

  try {
    const auction = await auctionRepository.saveAuction({ title, email });
    return {
      statusCode: 201,
      body: JSON.stringify(auction),
    };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(createAuction).use(
  validator({ inputSchema: createAuctionSchema })
);
