// Keep the existing estimate available while rates load or the CDN is offline.
export function turnToBAM(amount, currencyData) {
  const rates = currencyData?.conversions?.USD;
  const nokPerBam = rates?.NOK > 0 && rates?.EUR > 0
    ? 0.51 * rates.NOK / rates.EUR
    : 5.85;

  return (amount / nokPerBam).toFixed(0);
}
