import { AddressDto, CreateSightParams } from '../sight/dto';

export function formatSightsInfo(sightInfoList: CreateSightParams[]): string {
  return sightInfoList
    .filter((el) => el.name.length && el.address)
    .map((el) => {
      return `Название: ${el.name}\nАдрес: ${el.address}`;
    })
    .join('\n\n');
}

export function formatAddress(address: AddressDto): string {
  let adressProp = ['road', 'hause_name', 'house'];

  adressProp = adressProp
    .map((prop) => {
      if (!address.hasOwnProperty(prop)) {
        return undefined;
      }
      return address[prop];
    })
    .filter((el) => el != undefined);

  return adressProp.length ? adressProp.join(' ') : undefined;
}
