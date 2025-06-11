export const maskAddress = (address: string) => {
  let visibleChars = Math.max(2, Math.floor(address.length * 0.2));
  return address.slice(0, visibleChars) + "..." + address.slice(-visibleChars);
};
console.log(maskAddress("abcdefghuik"));
console.log(maskAddress("0x123456789abcdef123456789abcdef12345678"));
