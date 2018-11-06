import * as request from 'request';

export async function getDataFromUrl(url: string) {
  return new Promise<string>((resolve, reject) => {
    request(url, { timeout: 5000 }, (error, response, body) => {
      if (error) {
        console.warn('[Api-GenSDK] err', url, error);
        reject(error);
      }
      if (response && response.statusCode !== 200) {
        console.warn('[Api-GenSDK] err', url, error);
        reject(new Error(response.statusMessage));
      }
      resolve(body);
    });
  });
}
