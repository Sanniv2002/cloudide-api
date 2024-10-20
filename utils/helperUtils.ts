/**
 * Utility functions for network operations and alias generation.
 *
 * This file provides utility functions for:
 * - Dynamically finding a free port on the local machine.
 * - Generating a random alias string with a specified length.
 *
 * Functions in this file include:
 * - `findFreePort`: Returns a promise that resolves with a free port number.
 * - `generateAlias`: Generates a random alphanumeric string, often used for creating aliases.
 * - `sendMessage` : Sends a real-time update message to the client over an HTTP response using Server-Sent Events (SSE).
 *
 * @function findFreePort
 * @returns {Promise<number>} - A promise that resolves with a free port number found on the system.
 * @throws {Error} - If the port discovery encounters an issue, the promise will reject with the error.
 *
 * @function generateAlias
 * @param {number} length - The length of the alias string to generate.
 * @returns {string} - A randomly generated alphanumeric string.
 *
 * @function sendMessage
 * @param {Response} res - The Express response object used to send the data back to the client.
 * @param {string} message - The message to be sent to the client. This will be JSON stringified
 *                           before being sent.
 */

import * as net from "net";
import type { Response } from "express";

export function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.listen(0, () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port));
    });

    server.on("error", (err) => {
      reject(err);
    });
  });
}

export function generateAlias(length: number): string {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(randomIndex);
  }
  return result;
}

export const sendMessage = (res: Response, message: object) => {
  res.write(`data: ${JSON.stringify(message)}\n\n`);
};
