export class SightRequestParamsDto {
  lat: number;
  lon: number;
  radius: number = 1000;
  apikey: string = process.env.SIGHTS_KEY;
  limit: number = 3;
  kinds: string;
  name: string;

  constructor(lat?: number, lon?: number, kinds?: string, cityName?: string) {
    this.lat = lat;
    this.lon = lon;
    this.kinds = kinds;
    this.name = cityName;
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
