import AWS from "aws-sdk";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import cors from "@middy/http-cors";
import createError from "http-errors";
import { getAuctionById } from "./getAuction";
import uploadAuctionPictureSchmea from "../lib/schemas/uploadAuctionPictureSchema";
import AuctionRepository from "../lib/repositories/AuctionRepository";
import StorageService from "../lib/services/StorageService";

const auctionRepository = new AuctionRepository(
  new AWS.DynamoDB.DocumentClient()
);

const storageService = new StorageService(
  new AWS.S3(),
  process.env.AUCTIONS_BUCKET_NAME
);

export async function uploadAuctionPicture(event) {
  const { id } = event.pathParameters;
  const { email } = event.requestContext.authorizer;
  const image = event.body;
  try {
    const auction = await getAuctionById(id);

    validateAuctionOwnerShip(auction, email);

    const pictureUrl = await storageService.uploadPicture(
      auction.id + ".jpg",
      base64toBuffer(image)
    );
    const updatedAuction = await auctionRepository.setAuctionPictureUrl(
      auction.id,
      pictureUrl
    );
    return {
      statusCode: 200,
      body: JSON.stringify(updatedAuction),
    };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}

function validateAuctionOwnerShip(auction, email) {
  if (auction.seller !== email) {
    throw new createError.Forbidden(`You are not the seller of this auction!`);
  }
}

function base64toBuffer(image) {
  const base64 = image.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64, "base64");
}

export const handler = middy(uploadAuctionPicture)
  .use(httpErrorHandler())
  .use(validator({ inputSchema: uploadAuctionPictureSchmea }))
  .use(cors());
