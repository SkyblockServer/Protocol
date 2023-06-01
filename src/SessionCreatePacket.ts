import { BufWrapper } from './BufWrapper';

import Packet from './Packet';

export default class SessionCreatePacket extends Packet<SessionCreate> {
  public static readonly id = 4;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: SessionCreate): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(SessionCreatePacket.id); // Packet ID
    
    this.buf.writeString(data.session_id);
    
    this.buf.writeShort(data.seq);

    this.buf.finish();
  }

  public read(): SessionCreate {
    this.data = {} as any;
    
    this.data.session_id = this.buf.readString();
    
    this.data.seq = this.buf.readShort();

    return this.data;
  }
}

export interface SessionCreate {
  session_id: string;
  seq: number;
}

