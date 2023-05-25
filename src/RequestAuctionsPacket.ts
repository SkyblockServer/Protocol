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
    for (const AD of data.filters) {
      this.buf.writeString(AD.type);
      this.buf.writeString(AD.value);
    }
    
    this.buf.writeString(data.query);
    
    this.buf.writeString(data.order);
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
    
    this.data.order = this.buf.readString();

    return this.data;
  }
}

interface RequestAuctions {
  filters: {
    type: string;
    value: string;
  }[];
  query: string;
  order: string;
}