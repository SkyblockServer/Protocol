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
    for (const Mw of data.auctions) {
      this.buf.writeString(Mw.auction_id);
      this.buf.writeString(Mw.seller);
      this.buf.writeString(Mw.seller_profile);
      this.buf.writeString(Mw.itemData);
        this.buf.writeLong(Mw.timestamps.start);
        this.buf.writeLong(Mw.timestamps.end);
      this.buf.writeBoolean(Mw.claimed);
      this.buf.writeBoolean(Mw.ended);
      this.buf.writeLong(Mw.startingBid);
      this.buf.writeLong(Mw.highestBid);
      this.buf.writeLong(Mw.lastUpdated);
      this.buf.writeVarInt(Mw.bids.length);
      for (const kb of Mw.bids) {
        this.buf.writeString(kb.bidder);
        this.buf.writeString(kb.bidder_profile);
        this.buf.writeLong(kb.amount);
        this.buf.writeLong(kb.timestamp);
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