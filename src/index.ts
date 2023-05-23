import { BufWrapper } from "./BufWrapper";
import Packet from "./Packet";
  
import IdentifyPacket from "./IdentifyPacket";
  
export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

// Incoming

export const IncomingPackets: (typeof Packet<any>)[] = [

];

export type IncomingPacketTypes = {
  [key in ArrayElement<typeof IncomingPackets>['id']]: Extract<ArrayElement<typeof IncomingPackets>, { id: key }> extends typeof Packet<infer U> ? U : never;
};

export enum IncomingPacketIDs {

};

export function writeIncomingPacket<T extends keyof IncomingPacketTypes>(
  id: T,
  data: IncomingPacketTypes[T]
): Packet {
  const Packet = IncomingPackets.find(p => p.id == id);

  if(!Packet) throw new Error(`${id} is not a valid Incoming Packet ID!`);

  const packet = new Packet();
  packet.write(data as any);

  return packet;
}

export function readIncomingPacket<T extends keyof IncomingPacketTypes>(data: Buffer): {
  id: T,
  packet: Packet<IncomingPacketTypes[T]>,
  data: IncomingPacketTypes[T]
} {
  const buf = new BufWrapper(data);

  const id = buf.readVarInt();
  const Packet = IncomingPackets.find(p => p.id == id);

  if(!Packet) throw new Error(`Could not find Incoming Packet with ID ${id}`);

  const packet = new Packet(buf);
  packet.read();

  return {
    // @ts-expect-error - Some Constraint Stuff
    id: Packet.id,
    packet: packet as any,
    data: packet.data
  };
}

// Outgoing

export const OutgoingPackets = [
  IdentifyPacket,
];

export type OutgoingPacketTypes = {
  [key in ArrayElement<typeof OutgoingPackets>['id']]: Extract<ArrayElement<typeof OutgoingPackets>, { id: key }> extends typeof Packet<infer U> ? U : never;
};

export enum OutgoingPacketIDs {
  Identify = 1,
};

export function writeOutgoingPacket<T extends keyof OutgoingPacketTypes>(
  id: T,
  data: OutgoingPacketTypes[T]
): Packet {
  const Packet = OutgoingPackets.find(p => p.id == id);

  if(!Packet) throw new Error(`${id} is not a valid Outgoing Packet ID!`);

  const packet = new Packet();
  packet.write(data as any);

  return packet;
}

export function readOutgoingPacket<T extends keyof OutgoingPacketTypes>(data: Buffer): {
  id: T,
  packet: Packet<OutgoingPacketTypes[T]>,
  data: OutgoingPacketTypes[T]
} {
  const buf = new BufWrapper(data);

  const id = buf.readVarInt();
  const Packet = OutgoingPackets.find(p => p.id == id);

  if(!Packet) throw new Error(`Could not find Outgoing Packet with ID ${id}`);

  const packet = new Packet(buf);
  packet.read();

  return {
    // @ts-expect-error - Some Constraint Stuff
    id: Packet.id,
    packet: packet as any,
    data: packet.data
  };
}