export class SightRequestParamsDto {
  lat: number;
  lon: number;
  radius: number = 1000;
  apikey: string = '5ae2e3f221c38a28845f05b6cec17836c01a4e7bff58f3d381fb2cd8';
  kinds: string;

  constructor(lat?: number, lon?: number, kinds?: string) {
    this.lat = lat;
    this.lon = lon;
    this.kinds = kinds;
  }
}

export class SightInfoDto {
  name: string;
  address: string;
  coordinates: string;

  constructor(name: string, address: string, coordinates: string) {
    this.name = name;
    this.address = address;
    this.coordinates = coordinates;
  }
}

export class SigthXidsDto {
  properties: {
    xid: string;
  };
}

export class AddressDto {
  road: string;
  house_number: string;
}

export class PointDto {
  lat: string;
  lon: string;
}
