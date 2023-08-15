import { AddressDto, CreateSightParams } from '../sight/dto';

export function formatSightsInfo(sightInfoList: CreateSightParams[]): string {
  return sightInfoList
    .map((el) => {
      if (!el.name.length) {
        el.name = 'не указано';
      }
      return `Название: ${el.name}\nАдрес: ${el.address}`;
    })
    .join('\n\n');
}

export function formatAddress(address: AddressDto): string {
  if (!Object.keys(address).length) {
    return 'не указан';
  }
  return `${address.road ?? ''} ${address.house_number ?? ''}`;
}
