import AWS from "aws-sdk";
import createError from "http-errors";
import AuctionRepository from "../lib/repositories/AuctionRepository";
import QueueService from "../lib/services/QueueService";

const auctionRepository = new AuctionRepository(
  new AWS.DynamoDB.DocumentClient()
);

const queueService = new QueueService(
  new AWS.SQS(),
  process.env.MAIL_QUEUE_URL
);

async function processAuctions(_, __) {
  try {
    const auctionsToClose = await auctionRepository.getEndedAuctions();
    const closePromises = auctionsToClose.map((auction) =>
      closeAuction(auction)
    );
    await Promise.all(closePromises);
    return { closed: closePromises.length };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}

async function closeAuction(auction) {
  await auctionRepository.closeAuction(auction.id);
  await notify(auction);
}

async function notify(auction) {
  if (auction.highestBid.amount === 0) {
    return notifyNoBids(auction);
  }
  return Promise.all([notifySeller(), notifyBidder()]);
}

async function notifyNoBids(auction) {
  const { title, seller } = auction;

  return queueService.sendMessage({
    subject: "No bids on your auction item",
    recipient: seller,
    body: `Sorry! Your item "${title}" didn't get any bids. Better luck next time!`,
  });
}

async function notifySeller(auction) {
  const { title, seller, highestBid } = auction;
  const { amount } = highestBid;
  return queueService.sendMessage({
    subject: "Your item has been sold!",
    recipient: seller,
    body: `Woohoo! Your item "${title}" has been sold for $${amount}.`,
  });
}

async function notifyBidder(auction) {
  const { title, highestBid } = auction;
  const { amount, bidder } = highestBid;
  return queueService.sendMessage({
    subject: "You won an auction!",
    recipient: bidder,
    body: `What a great deal! You bought a "${title}" for $${amount}.`,
  });
}

export const handler = processAuctions;
