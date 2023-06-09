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
    for (const i of data.auctions) {
      this.buf.writeString(i.auction_id);
      this.buf.writeString(i.seller);
      this.buf.writeString(i.seller_profile);
      this.buf.writeString(i.itemBytes);
      this.buf.writeString(i.itemData);
        this.buf.writeString(i.data.name);
        this.buf.writeStringArray(i.data.lore);
        this.buf.writeShort(AuctionCategoriesEnum[i.data.category]);
        this.buf.writeShort(ItemRaritiesEnum[i.data.rarity]);
        this.buf.writeLong(i.timestamps.start);
        this.buf.writeLong(i.timestamps.end);
      this.buf.writeBoolean(i.claimed);
      this.buf.writeBoolean(i.ended);
      this.buf.writeBoolean(i.bin);
      this.buf.writeLong(i.startingBid);
      this.buf.writeLong(i.highestBid);
      this.buf.writeLong(i.lastUpdated);
      this.buf.writeVarInt(i.bids.length);
      for (const e of i.bids) {
        this.buf.writeString(e.bidder);
        this.buf.writeString(e.bidder_profile);
        this.buf.writeLong(e.amount);
        this.buf.writeLong(e.timestamp);
      }
    }

    this.buf.finish();
  }

  public read(): Auctions {
    this.data = {} as any;
    
    this.data.auctions = [];
    const auctionsLength = this.buf.readVarInt();
    for (let auctionsIndex = 0; auctionsIndex < auctionsLength; auctionsIndex++) {
      this.data.auctions[auctionsIndex] = {} as any;
      this.data.auctions[auctionsIndex].auction_id = this.buf.readString();
      this.data.auctions[auctionsIndex].seller = this.buf.readString();
      this.data.auctions[auctionsIndex].seller_profile = this.buf.readString();
      this.data.auctions[auctionsIndex].itemBytes = this.buf.readString();
      this.data.auctions[auctionsIndex].itemData = this.buf.readString();
        this.data.auctions[auctionsIndex].data = {} as any;
        this.data.auctions[auctionsIndex].data.name = this.buf.readString();
        this.data.auctions[auctionsIndex].data.lore = this.buf.readStringArray();
        this.data.auctions[auctionsIndex].data.category = AuctionCategoriesEnum[this.buf.readShort()] as any;
        this.data.auctions[auctionsIndex].data.rarity = ItemRaritiesEnum[this.buf.readShort()] as any;
        this.data.auctions[auctionsIndex].timestamps = {} as any;
        this.data.auctions[auctionsIndex].timestamps.start = this.buf.readLong();
        this.data.auctions[auctionsIndex].timestamps.end = this.buf.readLong();
      this.data.auctions[auctionsIndex].claimed = this.buf.readBoolean();
      this.data.auctions[auctionsIndex].ended = this.buf.readBoolean();
      this.data.auctions[auctionsIndex].bin = this.buf.readBoolean();
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

export interface Auctions {
  auctions: {
    auction_id: string;
    seller: string;
    seller_profile: string;
    itemBytes: string;
    itemData: string;
    data: {
      name: string;
      lore: string[];
      category: "weapon" | "armor" | "accessories" | "consumables" | "blocks" | "misc";
      rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC" | "DIVINE" | "SPECIAL" | "VERY_SPECIAL";
    };
    timestamps: {
      start: number;
      end: number;
    };
    claimed: boolean;
    ended: boolean;
    bin: boolean;
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

export enum AuctionCategoriesEnum {
  weapon = 0,
  armor = 1,
  accessories = 2,
  consumables = 3,
  blocks = 4,
  misc = 5,
}

export enum ItemRaritiesEnum {
  COMMON = 0,
  UNCOMMON = 1,
  RARE = 2,
  EPIC = 3,
  LEGENDARY = 4,
  MYTHIC = 5,
  DIVINE = 6,
  SPECIAL = 7,
  VERY_SPECIAL = 8,
}