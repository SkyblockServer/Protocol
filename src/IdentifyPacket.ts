import { BufWrapper } from './BufWrapper';

import Packet from './Packet';

export default class IdentifyPacket extends Packet<Identify> {
  public static readonly id = 3;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: Identify): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(IdentifyPacket.id); // Packet ID
    
    this.buf.writeString(data.uuid);
    
    this.buf.writeString(data.username);
    
    this.buf.writeString(data.apiKey);

    this.buf.finish();
  }

  public read(): Identify {
    this.data = {} as any;
    
    this.data.uuid = this.buf.readString();
    
    this.data.username = this.buf.readString();
    
    this.data.apiKey = this.buf.readString();

    return this.data;
  }
}

interface Identify {
  uuid: string;
  username: string;
  apiKey: string;
}