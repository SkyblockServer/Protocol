import { BufWrapper } from './BufWrapper';

import Packet from './Packet';

export default class HeartbeatPacket extends Packet<Heartbeat> {
  public static readonly id = 2;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: Heartbeat): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(HeartbeatPacket.id); // Packet ID

  }

  public read(): Heartbeat {
    this.data = {} as any;

    return this.data;
  }
}

interface Heartbeat {

}