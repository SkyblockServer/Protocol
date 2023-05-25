import { BufWrapper } from "./BufWrapper";
import Packet from "./Packet";
  
import MetadataPacket from "./MetadataPacket";
import HeartbeatPacket from "./HeartbeatPacket";
import SessionCreatePacket from "./SessionCreatePacket";
import IdentifyPacket from "./IdentifyPacket";
import RequestAuctionsPacket from "./RequestAuctionsPacket";
import AuctionsPacket from "./AuctionsPacket";
  
type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
type ValueOf<T> = T[keyof T]

// Incoming

export const IncomingPackets = [
  MetadataPacket,
  SessionCreatePacket,
  AuctionsPacket,
];

export type IncomingPacketTypes = {
  [key in ArrayElement<typeof IncomingPackets>['id']]: Extract<ArrayElement<typeof IncomingPackets>, { id: key }> extends typeof Packet<infer U> ? U : never;
};

export enum IncomingPacketIDs {
  Metadata = 1,
  SessionCreate = 4,
  Auctions = 5,
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

export function readIncomingPacket<T extends keyof IncomingPacketTypes>(data: Buffer): ValueOf<{
  [V in T]: {
    id: V;
    packet: Packet<IncomingPacketTypes[V]>;
    data: IncomingPacketTypes[V];
  };
}> {
  const buf = new BufWrapper(data);

  const id = buf.readVarInt();
  const Packet = IncomingPackets.find(p => p.id == id);

  if(!Packet) throw new Error(`Could not find Incoming Packet with ID ${id}`);

  const packet = new Packet(buf);
  packet.read();

  return {
    id: Packet.id,
    packet: packet as any,
    data: packet.data
  } as any;
}

// Outgoing

export const OutgoingPackets = [
  HeartbeatPacket,
  IdentifyPacket,
  RequestAuctionsPacket,
];

export type OutgoingPacketTypes = {
  [key in ArrayElement<typeof OutgoingPackets>['id']]: Extract<ArrayElement<typeof OutgoingPackets>, { id: key }> extends typeof Packet<infer U> ? U : never;
};

export enum OutgoingPacketIDs {
  Heartbeat = 2,
  Identify = 3,
  RequestAuctions = 4,
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

export function readOutgoingPacket<T extends keyof OutgoingPacketTypes>(data: Buffer): ValueOf<{
  [V in T]: {
    id: V;
    packet: Packet<OutgoingPacketTypes[V]>;
    data: OutgoingPacketTypes[V];
  };
}> {
  const buf = new BufWrapper(data);

  const id = buf.readVarInt();
  const Packet = OutgoingPackets.find(p => p.id == id);

  if(!Packet) throw new Error(`Could not find Outgoing Packet with ID ${id}`);

  const packet = new Packet(buf);
  packet.read();

  return {
    id: Packet.id,
    packet: packet as any,
    data: packet.data
  } as any;
}