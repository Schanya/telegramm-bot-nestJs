import { sight } from 'env';

import { NotFoundException } from '@nestjs/common';

import { SightsNotFoundExeption } from '@telegramm/errors';
import { axiosDownload, formatAddress } from '@telegramm/scenes/utils';
import {
  CityGeoData,
  CreateSightParams,
  SightRequestParams,
  SigthXidsDto,
} from '../dto';
import { DEFAULT_REQUEST_PARAMS, SightPhrases, urls } from '../enums';

export async function getCityGeoData(
  cityGeoDataParams: SightRequestParams,
): Promise<CityGeoData> {
  const { data: cityGeoData } = await sendSightApiRequest(
    sight.url + urls.geoname,
    cityGeoDataParams,
  );

  if (cityGeoData?.error) {
    throw new NotFoundException(SightPhrases.notFoundCity);
  }

  return cityGeoData;
}

export async function getSights(
  sightRequestParams: SightRequestParams,
): Promise<SigthXidsDto[]> {
  try {
    const { data } = await sendSightApiRequest(
      sight.url + urls.radius,
      sightRequestParams,
    );
    const sightsXids: SigthXidsDto[] = data.features;

    if (!sightsXids.length) {
      throw new SightsNotFoundExeption(SightPhrases.notFoundSight);
    }

    return sightsXids;
  } catch (error) {
    throw new SightsNotFoundExeption(SightPhrases.notFoundSight);
  }
}

export async function getSightInfo(xid: string): Promise<CreateSightParams> {
  const { data: sightData } = await sendSightApiRequest(
    sight.url + `${urls.xid}/${xid}`,
  );

  const formattedAddress = formatAddress(sightData.address);
  const sightInfo: CreateSightParams = {
    address: formattedAddress,
    name: sightData.name,
  };

  return sightInfo;
}

export async function sendSightApiRequest(
  url: string,
  params?: SightRequestParams,
) {
  const response = await axiosDownload(url, {
    ...params,
    apikey: sight.key,
    radius: DEFAULT_REQUEST_PARAMS.radius,
  });

  return response;
}
