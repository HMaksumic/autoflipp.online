const dataFiles = {
  audi: '=OLX_AUDI.json',
  bmw: '=OLX_BMW.json',
  mercedes: '=OLX_MERCEDES.json',
  peugeot: '=OLX_PEUGEOT.json',
  volvo: '=OLX_VOLVO.json',
  volkswagen: '=OLX_VW.json',
  other: 'olx_finn_before2015.json',
};

export function getCarDataUrl(brand) {
  if (!Object.hasOwn(dataFiles, brand)) {
    throw new Error(`Unknown car brand: ${brand}`);
  }

  return `/data/${dataFiles[brand]}`;
}
