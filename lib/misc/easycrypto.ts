import { createHash, createCipheriv, createDecipheriv } from 'crypto';
import { DataLike } from "./extratypes";

export function hashNow(algo: string, message: DataLike): Buffer {
    const hash = createHash(algo);
    hash.update(message);
    return hash.digest();
}

export function sha256(message: DataLike): Buffer {
    return hashNow("sha256", message);
}

export function sha256Concat(message: DataLike[]): Buffer {
    const hash = createHash("sha256");
    for (let mes of message)
        hash.update(mes);
    return hash.digest();
}

export function encryptNow(algo: string, key: Buffer, iv: Buffer, message: Buffer): Buffer {
    const ctx = createCipheriv(algo, key, iv);
    let data = ctx.update(message, "hex");
    data += ctx.final("hex");
    return Buffer.from(data, "hex");
}

export function decryptNow(algo: string, key: Buffer, iv: Buffer, message: Buffer): Buffer {
    const ctx = createDecipheriv(algo, key, iv);
    let data = ctx.update(message).toString("hex");
    data += ctx.final("hex");
    return Buffer.from(data, "hex");
}

export function aesEncrypt(key: Buffer, iv: Buffer, message: Buffer): Buffer {
    return encryptNow("aes-256-cfb", key, iv, message);
}

export function aesDecrypt(key: Buffer, iv: Buffer, message: Buffer): Buffer {
    return decryptNow("aes-256-cfb", key, iv, message);
}