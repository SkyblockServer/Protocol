import { BufWrapper } from './BufWrapper';

import Packet from './Packet';

export default class MetadataPacket extends Packet<Metadata> {
  public static readonly id = 1;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: Metadata): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(MetadataPacket.id); // Packet ID
    
    this.buf.writeInt(data.heartbeat_interval);

    this.buf.finish();
  }

  public read(): Metadata {
    this.data = {} as any;
    
    this.data.heartbeat_interval = this.buf.readInt();

    return this.data;
  }
}

export interface Metadata {
  heartbeat_interval: number;
}

