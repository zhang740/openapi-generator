import * as request from 'request';

const timeout = process.env.requestTimeout ? (parseInt(process.env.requestTimeout, 10) || 5000) : 5000;

export async function requestData(url: string) {
  return new Promise<string>((resolve, reject) => {
    request(url, { timeout: timeout }, (error, response, body) => {
      if (error) {
        console.warn('[GenSDK] err', error);
        reject(error);
      }
      if (response && response.statusCode !== 200) {
        console.warn('[GenSDK] err', error);
        reject(new Error(response.statusMessage));
      }
      resolve(body);
    });
  });
}
