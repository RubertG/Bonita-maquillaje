export function returnFileSize(number: number) {
  if (number < 1e3) {
    return `${number} bytes`
  } else if (number >= 1e3 && number < 1e6) {
    return `${(number / 1e3).toFixed(1)} KB`
  } else {
    return `${(number / 1e6).toFixed(1)} MB`
  }
}