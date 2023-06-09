// Credit to MinecraftJS (https://github.com/MinecraftJS/)
    
import { Buffer } from 'buffer';

function encodeVarint(num: number): number[] {
  if (Number.MAX_SAFE_INTEGER && num > Number.MAX_SAFE_INTEGER) {
    throw new RangeError('Could not encode varint');
  }

  const MSB = 0x80,
    REST = 0x7f,
    MSBALL = ~REST,
    INT = Math.pow(2, 31);

  const out = [];
  let offset = 0;

  while (num >= INT) {
    out[offset++] = (num & 0xff) | MSB;
    num /= 128;
  }
  while (num & MSBALL) {
    out[offset++] = (num & 0xff) | MSB;
    num >>>= 7;
  }
  out[offset] = num | 0;

  return out;
}
function decodeVarint(buf: Buffer, offset: number): [number, number] {
  const MSB = 0x80,
    REST = 0x7f,
    MATH_POW_4 = Math.pow(2, 4 * 7),
    MATH_POW_5 = Math.pow(2, 5 * 7),
    MATH_POW_6 = Math.pow(2, 6 * 7),
    MATH_POW_7 = Math.pow(2, 7 * 7);

  offset = offset || 0;

  let b = buf[offset];
  let res = 0;

  res += b & REST;
  if (b < MSB) {
    return [res, 1];
  }

  b = buf[offset + 1];
  res += (b & REST) << 7;
  if (b < MSB) {
    return [res, 2];
  }

  b = buf[offset + 2];
  res += (b & REST) << 14;
  if (b < MSB) {
    return [res, 3];
  }

  b = buf[offset + 3];
  res += (b & REST) << 21;
  if (b < MSB) {
    return [res, 4];
  }

  b = buf[offset + 4];
  res += (b & REST) * MATH_POW_4;
  if (b < MSB) {
    return [res, 5];
  }

  b = buf[offset + 5];
  res += (b & REST) * MATH_POW_5;
  if (b < MSB) {
    return [res, 6];
  }

  b = buf[offset + 6];
  res += (b & REST) * MATH_POW_6;
  if (b < MSB) {
    return [res, 7];
  }

  b = buf[offset + 7];
  res += (b & REST) * MATH_POW_7;
  if (b < MSB) {
    return [res, 8];
  }

  throw new RangeError('Could not decode varint');
}

export class BufWrapper {
  /**
   * The wrapped NodeJS buffer
   */
  public buffer: Buffer;
  /**
   * Current offset (used for reading)
   */
  public offset: number;
  /**
   * Options that apply to the current `BufWrapper` instance
   */
  public options?: BufWrapperOptions;

  /** List of buffers, used for the `oneConcat` option */
  private buffers: Buffer[];

  /**
   * Create a new buffer wrapper instance
   * @param buffer The NodeJS buffer to wrap, optional
   * @param options Options to apply to the buffer wrapper, optional
   */
  public constructor(buffer?: Buffer | null, options: BufWrapperOptions = {}) {
    this.buffer = buffer || Buffer.alloc(0);
    this.offset = 0;
    this.buffers = [];
    this.options = options;
  }

  /**
   * Write a varint to the buffer
   * @param value The value to write (number)
   * @example
   * ```javascript
   * const buf = new BufWrapper();
   * buf.writeVarInt(300);
   * console.log(buf.buffer); // <Buffer ac 02>
   * ```
   */
  public writeVarInt(value: number): void {
    const encoded = encodeVarint(value);
    this.writeToBuffer(Buffer.from(encoded));
  }

  /**
   * Read a varint from the buffer
   * @returns The varint value read from the buffer
   * @example
   * ```javascript
   * const buffer = Buffer.from([0xac, 0x02]);
   * const buf = new BufWrapper(buffer);
   * const decoded = buf.readVarInt();
   * console.log(decoded); // 300
   * ```
   */
  public readVarInt(): number {
    const data = decodeVarint(this.buffer, this.offset);
    const value = data[0];
    this.offset += data[1];
    return value;
  }

  /**
   * Write a string to the buffer (will use the ut8 encoding)
   * @param value The value to write (string)
   * @example
   * ```javascript
   * const buf = new BufWrapper();
   * buf.writeString('Hello World');
   * console.log(buf.buffer); // <Buffer 0b 48 65 6c 6c 6f 20 57 6f 72 6c 64>
   * ```
   */
  public writeString(value: string): void {
    this.writeVarInt(value.length);
    this.writeToBuffer(Buffer.from(value));
  }

  /**
   * Read a string from the buffer (will use the ut8 encoding)
   * @returns The string value read from the buffer
   * @example
   * ```javascript
   * const buffer = Buffer.from([0x0b, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x57, 0x6f, 0x72, 0x6c, 0x64]);
   * const buf = new BufWrapper(buffer);
   * const decoded = buf.readString();
   * console.log(decoded); // Hello World
   * ```
   */
  public readString(): string {
    let length = this.readVarInt();

    let value = '';
    while (length > 0) {
        const next = this.buffer.toString('utf8', this.offset, this.offset + length);
        this.offset += length;
        length -= next.length;
        value += next;
    }
    
    return value;
  }

  /**
   * Write an integer to the buffer
   * @param value The value to write (number)
   * @example
   * ```javascript
   * const buf = new BufWrapper();
   * buf.writeInt(123);
   * console.log(buf.buffer); // <Buffer 00 00 00 7b>
   * ```
   */
  public writeInt(value: number): void {
    const buf = Buffer.alloc(4);
    buf.writeInt32BE(value);
    this.writeToBuffer(buf);
  }

  /**
   * Read an integer from the buffer
   * @returns The integer value read from the buffer
   * @example
   * ```javascript
   * const buffer = Buffer.from([0x00, 0x00, 0x00, 0x7b]);
   * const buf = new BufWrapper(buffer);
   * const decoded = buf.readInt();
   * console.log(decoded); // 123
   * ```
   */
  public readInt(): number {
    const value = this.buffer.readInt32BE(this.offset);
    this.offset += 4;
    return value;
  }

  /**
   * Write a long to the buffer
   * @param value The value to write (number)
   * @example
   * ```javascript
   * const buf = new BufWrapper();
   * buf.writeLong(123456789);
   * console.log(buf.buffer); // <Buffer 00 00 00 00 07 5b cd 15>
   * ```
   */
  public writeLong(value: number | bigint): void {
    const buf = Buffer.alloc(8);
    buf.writeBigInt64BE(BigInt(value));
    this.writeToBuffer(buf);
  }

  /**
   * Read a long from the buffer
   * @returns The long value read from the buffer
   * @example
   * ```javascript
   * const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x07, 0x5b, 0xcd, 0x15]);
   * const buf = new BufWrapper(buffer);
   * const decoded = buf.readLong();
   * console.log(decoded); // 123456789
   * ```
   */
  public readLong(): number {
    const value = this.buffer.readBigInt64BE(this.offset);
    this.offset += 8;
    return Number(value);
  }

  /**
   * Write an array of strings to the buffer
   * @param value The value to write (string[])
   * @example
   * ```javascript
   * const buf = new BufWrapper();
   * buf.writeStringArray(['Hello', 'World']);
   * console.log(buf.buffer); // <Buffer 02 05 48 65 6c 6c 6f 05 57 6f 72 6c 64>
   * ```
   */
  public writeStringArray(value: string[]): void {
    this.writeVarInt(value.length);
    value.forEach(v => this.writeString(v));
  }

  /**
   * Read an array of strings from the buffer
   * @returns The array read from the buffer
   * @example
   * ```javascript
   * const buffer = Buffer.from([0x02, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x05, 0x57, 0x6f, 0x72, 0x6c, 0x64]);
   * const buf = new BufWrapper(buffer);
   * const decoded = buf.readStringArray();
   * console.log(decoded); // ['Hello', 'World']
   * ```
   */
  public readStringArray(): string[] {
    const length = this.readVarInt();
    const value: string[] = [];
    for (let i = 0; i < length; i++) {
      value.push(this.readString());
    }
    return value;
  }

  /**
   * Write an array of ints to the buffer
   * @param value The value to write (number[])
   * @example
   * ```javascript
   * const buf = new BufWrapper();
   * buf.writeIntArray([1, 2, 3]);
   * console.log(buf.buffer); // <Buffer 03 00 00 00 01 00 00 00 02 00 00 00 03>
   * ```
   */
  public writeIntArray(value: number[]): void {
    this.writeVarInt(value.length);
    value.forEach(v => this.writeInt(v));
  }

  /**
   * Read an array of ints from the buffer
   * @returns The array read from the buffer
   * @example
   * ```javascript
   * const buffer = Buffer.from([ 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x03 ]);
   * const buf = new BufWrapper(buffer);
   * const decoded = buf.readIntArray();
   * console.log(decoded); // [ 1, 2, 3 ]
   * ```
   */
  public readIntArray(): number[] {
    const length = this.readVarInt();
    const value: number[] = [];
    for (let i = 0; i < length; i++) {
      value.push(this.readInt());
    }
    return value;
  }

  /**
   * Write raw bytes to the buffer
   * @param value The value to write (a buffer or an array of bytes)
   * @example
   * ```javascript
   * const buf = new BufWrapper();
   * buf.writeBytes([ 0x01, 0x02, 0x03 ]);
   * console.log(buf.buffer); // <Buffer 01 02 03>
   * ```
   */
  public writeBytes(value: Buffer | number[]): void {
    this.writeToBuffer(Buffer.from(value));
  }

  /**
   * Read raw bytes from the buffer
   * @param length The number of bytes to read
   * @returns The bytes read from the buffer
   * @example
   * ```javascript
   * const buffer = Buffer.from([ 0x01, 0x02, 0x03 ]);
   * const buf = new BufWrapper(buffer);
   * const decoded = buf.readBytes(3);
   * console.log(decoded); // <Buffer 01 02 03>
   * ```
   */
  public readBytes(length: number): Buffer {
    const value = this.buffer.slice(this.offset, this.offset + length);
    this.offset += length;
    return value;
  }

  /**
   * Write a boolean to the buffer
   * @param value The value to write (boolean)
   * @example
   * ```javascript
   * const buf = new BufWrapper();
   * buf.writeBoolean(true);
   * console.log(buf.buffer); // <Buffer 01>
   * ```
   */
  public writeBoolean(value: boolean): void {
    this.writeToBuffer(Buffer.from([value ? 1 : 0]));
  }

  /**
   * Read a boolean from the buffer
   * @returns The boolean read from the buffer
   * @example
   * ```javascript
   * const buffer = Buffer.from([ 0x01 ]);
   * const buf = new BufWrapper(buffer);
   * const decoded = buf.readBoolean();
   * console.log(decoded); // true
   * ```
   */
  public readBoolean(): boolean {
    const value = this.buffer.readUInt8(this.offset) === 1;
    this.offset += 1;
    return value;
  }

  /**
   * Write a float to the buffer
   * @param value The value to write (number)
   * @example
   * ```javascript
   * const buf = new BufWrapper();
   * buf.writeFloat(12.34);
   * console.log(buf.buffer); // <Buffer 41 45 70 a4>
   * ```
   */
  public writeFloat(value: number): void {
    const buf = Buffer.alloc(4);
    buf.writeFloatBE(value);
    this.writeToBuffer(buf);
  }

  /**
   * Read a float from the buffer
   * @returns The float read from the buffer
   * @example
   * ```javascript
   * const buffer = Buffer.from([ 0x41, 0x45, 0x70, 0xa4 ]);
   * const buf = new BufWrapper(buffer);
   * const decoded = buf.readFloat();
   * console.log(decoded); // 12.34000015258789
   * ```
   */
  public readFloat(): number {
    const value = this.buffer.readFloatBE(this.offset);
    this.offset += 4;
    return value;
  }

  /**
   * Write a short to the buffer
   * @param value The value to write (number)
   * @example
   * ```javascript
   * const buf = new BufWrapper();
   * buf.writeShort(42);
   * console.log(buf.buffer); // <Buffer 00 2a>
   * ```
   */
  public writeShort(value: number): void {
    const buf = Buffer.alloc(2);
    buf.writeUInt16BE(value);
    this.writeToBuffer(buf);
  }

  /**
   * Read a float from the buffer
   * @returns The float read from the buffer
   * @example
   * ```javascript
   * const buffer = Buffer.from([ 0x00, 0x2a ]);
   * const buf = new BufWrapper(buffer);
   * const decoded = buf.readShort();
   * console.log(decoded); // 42
   * ```
   */
  public readShort(): number {
    const value = this.buffer.readInt16BE(this.offset);
    this.offset += 2;
    return value;
  }

  /**
   * Write a double to the buffer
   * @param value The value to write (number)
   * @example
   * ```javascript
   * const buf = new BufWrapper();
   * buf.writeDouble(42.42);
   * console.log(buf.buffer); // <Buffer 40 45 35 c2 8f 5c 28 f6>
   * ```
   */
  public writeDouble(value: number): void {
    const buf = Buffer.alloc(8);
    buf.writeDoubleBE(value);
    this.writeToBuffer(buf);
  }

  /**
   * Read a double from the buffer
   * @returns The double read from the buffer
   * @example
   * ```javascript
   * const buffer = Buffer.from([ 0x40, 4x45, 0x35, 0xc2, 0x8f, 0x5c, 0x28, 0xf6 ]);
   * const buf = new BufWrapper(buffer);
   * const decoded = buf.readShort();
   * console.log(decoded); // 42.42
   * ```
   */
  public readDouble(): number {
    const value = this.buffer.readDoubleBE(this.offset);
    this.offset += 8;
    return value;
  }

  /**
   * When the `BufWrapperOptions#oneConcat` is set to `true`
   * you must call this method to concatenate all buffers
   * into one. If the option is `undefined` or set to `false`,
   * this method will throw an error.
   *
   * This method will also set the `BufWrapper#buffer` to the
   * concatenated buffer.
   * @returns The concatenated buffer.
   */
  public finish(): Buffer {
    if (this.options?.oneConcat !== true) throw new Error("Can't call BufWrapper#finish without oneConcat option set to true");

    const buf = Buffer.concat([...this.buffers]);
    this.buffer = buf;
    return buf;
  }

  /**
   * Concat the given buffers into the main buffer
   * if `BufWrapperOptions#oneConcat` is `false` or `undefined`.
   * Otherwise, it will push the buffer to the `BufWrapper#buffers`
   * array.
   * @param value The buffers to write (array of buffers)
   */
  public writeToBuffer(...buffers: Buffer[]): void {
    if (this.options?.oneConcat === true) this.buffers.push(...buffers);
    else this.buffer = Buffer.concat([this.buffer, ...buffers]);
  }
}

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

export interface BufWrapperOptions {
  /**
   * Whether or not to run the `Buffer#concat` method when writing.
   * When set to `true`, you will have to call the `BufWrapper#finish`
   * method to get the final buffer. (Making this true and calling)
   * the `BufWrapper#finish` will increase performance.
   * When set to `false`, the `BufWrapper#finish` method will throw an error
   * and the `Buffer#concat` will be run every time you write something
   * to the buffer.
   */
  oneConcat?: boolean;
}