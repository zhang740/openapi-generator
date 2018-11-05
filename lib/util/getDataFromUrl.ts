import * as request from 'request';

export async function getDataFromUrl(url: string) {
  return new Promise<string>((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) {
        console.warn('[Api-GenSDK] err', error);
        reject(error);
      }
      if (response.statusCode !== 200) {
        console.warn('[Api-GenSDK] err', error);
        reject(new Error(response.statusMessage));
      }
      resolve(body);
    });
  });
}
