import { BufWrapper } from './BufWrapper';

import Packet from './Packet';

export default class AuctionsPacket extends Packet<Auctions> {
  public static readonly id = 5;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: Auctions): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(AuctionsPacket.id); // Packet ID
    
    this.buf.writeVarInt(data.auctions.length);
    for (const SK of data.auctions) {
      this.buf.writeString(SK.auction_id);
      this.buf.writeString(SK.seller);
      this.buf.writeString(SK.seller_profile);
      this.buf.writeString(SK.itemData);
        this.buf.writeLong(SK.timestamps.start);
        this.buf.writeLong(SK.timestamps.end);
      this.buf.writeBoolean(SK.claimed);
      this.buf.writeBoolean(SK.ended);
      this.buf.writeLong(SK.startingBid);
      this.buf.writeLong(SK.highestBid);
      this.buf.writeLong(SK.lastUpdated);
      this.buf.writeVarInt(SK.bids.length);
      for (const YO of SK.bids) {
        this.buf.writeString(YO.bidder);
        this.buf.writeString(YO.bidder_profile);
        this.buf.writeLong(YO.amount);
        this.buf.writeLong(YO.timestamp);
      }
    }
  }

  public read(): Auctions {
    
    this.data.auctions = [];
    const auctionsLength = this.buf.readVarInt();
    for (let auctionsIndex = 0; auctionsIndex < auctionsLength; auctionsIndex++) {
      this.data.auctions[auctionsIndex] = {} as any;
      this.data.auctions[auctionsIndex].auction_id = this.buf.readString();
      this.data.auctions[auctionsIndex].seller = this.buf.readString();
      this.data.auctions[auctionsIndex].seller_profile = this.buf.readString();
      this.data.auctions[auctionsIndex].itemData = this.buf.readString();
        this.data.auctions[auctionsIndex].timestamps = {} as any;
        this.data.auctions[auctionsIndex].timestamps.start = this.buf.readLong();
        this.data.auctions[auctionsIndex].timestamps.end = this.buf.readLong();
      this.data.auctions[auctionsIndex].claimed = this.buf.readBoolean();
      this.data.auctions[auctionsIndex].ended = this.buf.readBoolean();
      this.data.auctions[auctionsIndex].startingBid = this.buf.readLong();
      this.data.auctions[auctionsIndex].highestBid = this.buf.readLong();
      this.data.auctions[auctionsIndex].lastUpdated = this.buf.readLong();
      this.data.auctions[auctionsIndex].bids = [];
      const bidsLength = this.buf.readVarInt();
      for (let bidsIndex = 0; bidsIndex < bidsLength; bidsIndex++) {
        this.data.auctions[auctionsIndex].bids[bidsIndex] = {} as any;
        this.data.auctions[auctionsIndex].bids[bidsIndex].bidder = this.buf.readString();
        this.data.auctions[auctionsIndex].bids[bidsIndex].bidder_profile = this.buf.readString();
        this.data.auctions[auctionsIndex].bids[bidsIndex].amount = this.buf.readLong();
        this.data.auctions[auctionsIndex].bids[bidsIndex].timestamp = this.buf.readLong();
      }
    }

    return this.data;
  }
}

interface Auctions {
  auctions: {
    auction_id: string;
    seller: string;
    seller_profile: string;
    itemData: string;
    timestamps: {
      start: number;
      end: number;
    };
    claimed: boolean;
    ended: boolean;
    startingBid: number;
    highestBid: number;
    lastUpdated: number;
    bids: {
      bidder: string;
      bidder_profile: string;
      amount: number;
      timestamp: number;
    }[];
  }[];
}