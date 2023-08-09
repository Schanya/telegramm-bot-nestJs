export class SightRequestParamsDto {
  lat?: number;
  lon?: number;
  radius?: number;
  limit?: number;
  kinds?: string;
  name?: string;
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
