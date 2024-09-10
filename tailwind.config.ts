import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        'logo': '0 0 10px 0 rgba(199,176,183,0.8)',
        'button': '0 3px 5px 0 rgba(199,176,183,0.2)'
      },
      backgroundImage: {
        'gradient-principal': 'linear-gradient(to bottom, #FFF4F4 53%, #FFE2EB 100%)'
      },
      colors: {
        "principal-100": "#ff9ec6",
        "principal-200": "#df81a9",
        "principal-300": "#974068",
        "accent-100": "#ffd3e1",
        "text-100": "#262222",
        "text-200": "#333333",
        "bg-100": "#fff4f4",
        "bg-200": "#feeaf0",
        "accent-300": "#90596b",
        "text-50": "#0d0d0d",
        "bg-300": "#ffd9e3",
        "accent-200": "#ffc1d5",
        "text-300": "#6a6363",
        "bg-50": "#fdfdfd",
        "bg-transparent": "rgb(255,244,244,0.5)"
      }
    }
  },
  plugins: []
}
export default config
