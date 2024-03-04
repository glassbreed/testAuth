import { HttpException, HttpStatus } from '@nestjs/common';
const https = require('https');
const crypto = require('crypto');

export function errorHandler(
  response: { pointer: string; text: string },
  e: Error
) {
  console.log('ERROR: ', e);
  if (!(e instanceof HttpException)) {
    const error = new HttpException(
      response,
      HttpStatus.INTERNAL_SERVER_ERROR,
      { cause: e }
    );

    return Promise.reject(error);
  }
  return Promise.reject(e);
}

export const disableCertCheck = () => {
  return new https.Agent({
    rejectUnauthorized: false,
  });
};

type TIdentifier = 'email' | 'phone_number' | 'id';

export const getIdentifierType = (
  identifier: string
): TIdentifier => {
  try {
    if (/^\d+$/.test(identifier)) {
      if (identifier.length === 11) return 'phone_number';
      return 'id'; //database id
    }

    if (identifier?.startsWith('+7') || identifier.startsWith(' 7'))
      return 'phone_number';
    if (identifier?.includes('@')) return 'email';
  } catch (e) {
    console.log('getIdentifierType error: ', e);
  }
};

export const prepareIdentifier = (
  identifier: string,
  type: TIdentifier
) => {
  switch (type) {
    case 'id':
      return parseInt(identifier, 10);
    case 'phone_number':
      return '7' + identifier?.slice(identifier.length - 10);
    default:
      return identifier;
  }
};

export const getRandomDigits = async (number = 6): Promise<string> =>
  new Promise((resolve, reject) => {
    crypto.randomInt(0, 1000000, (err, result) => {
      if (err) reject(err);
      resolve(result.toString().padStart(number, '0'));
    });
  });
