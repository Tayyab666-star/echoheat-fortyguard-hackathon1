declare module "geoip-lite" {
  const geoip: {
    lookup(ip: string): { country: string; region: string; city: string; ll: [number, number]; range: number } | null
  }
  export default geoip
}
