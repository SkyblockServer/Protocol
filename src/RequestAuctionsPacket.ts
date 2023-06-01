import { BufWrapper } from './BufWrapper';

import Packet from './Packet';

export default class RequestAuctionsPacket extends Packet<RequestAuctions> {
  public static readonly id = 4;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: RequestAuctions): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(RequestAuctionsPacket.id); // Packet ID
    
    this.buf.writeVarInt(data.filters.length);
    for (const i of data.filters) {
      this.buf.writeString(i.type);
      this.buf.writeString(i.value);
    }
    
    this.buf.writeString(data.query);
    
    this.buf.writeShort(OrdersEnum[data.order]);
    
    this.buf.writeShort(data.start);
    
    this.buf.writeShort(data.amount);

    this.buf.finish();
  }

  public read(): RequestAuctions {
    this.data = {} as any;
    
    this.data.filters = [];
    const filtersLength = this.buf.readVarInt();
    for (let filtersIndex = 0; filtersIndex < filtersLength; filtersIndex++) {
      this.data.filters[filtersIndex] = {} as any;
      this.data.filters[filtersIndex].type = this.buf.readString();
      this.data.filters[filtersIndex].value = this.buf.readString();
    }
    
    this.data.query = this.buf.readString();
    
    this.data.order = OrdersEnum[this.buf.readShort()] as any;
    
    this.data.start = this.buf.readShort();
    
    this.data.amount = this.buf.readShort();

    return this.data;
  }
}

export interface RequestAuctions {
  filters: {
    type: string;
    value: string;
  }[];
  query: string;
  order: "high_price" | "low_price" | "end_near" | "end_far" | "random";
  start: number;
  amount: number;
}

export enum OrdersEnum {
  high_price = 0,
  low_price = 1,
  end_near = 2,
  end_far = 3,
  random = 4,
}