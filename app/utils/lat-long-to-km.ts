/**
 * https://github.com/Vaibhavav/lat-long-to-km/
 *
 * Adds commas to a number
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @return {number}
 */

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

export default function latLongToKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371 // Radius of the earth in km
  const dLat: number = deg2rad(lat2 - lat1) // deg2rad below
  const dLon: number = deg2rad(lon2 - lon1)
  const a: number =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d: number = R * c // Distance in km
  return d
}
