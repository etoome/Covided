import { TypeOf } from "yup";
import { string } from "yup/lib/locale";

interface CountryColour {
  country: string;
  colour: string;
}
export const colours: CountryColour[] = [
  { country: "Austria", colour: "rgb(253,28,28)" },
  { country: "Belgium", colour: "rgb(255, 202, 58)" },
  { country: "Bulgaria", colour: "rgb(35, 206, 107)" },
  { country: "Canada", colour: "rgb(255,102,178)" },
  { country: "Cyprus", colour: "rgb(255,153,51)" },
  { country: "Czech Republic", colour: "rgb(0,0,153)" },
  { country: "Denmark", colour: "rgb(153,0,0)" },
  { country: "Estonia", colour: "rgb(102,102,255)" },
  { country: "Finland", colour: "rgb(224,224,224)" },
  { country: "France", colour: "rgb(0,0,255)" },
  { country: "Iceland", colour: "rgb(51,0,102)" },
  { country: "Ireland", colour: "rgb(102,204,0)" },
  { country: "Israel", colour: "rgb(102,0,204)" },
  { country: "Italy", colour: "rgb(0,153,0)" },
  { country: "Luxembourg", colour: "rgb(153,153,255)" },
  { country: "Netherlands", colour: "rgb(204,0,102)" },
  { country: "Portugal", colour: "rgb(173, 40, 49)" },
  { country: "Slovenia", colour: "rgb(49, 13, 32)" },
  { country: "Spain", colour: "rgb(34, 85, 96)" },
  { country: "Sweden", colour: "rgb(0,51,102)" },
  { country: "United Kingdom", colour: "rgb(255,51,51)" },
  { country: "United States", colour: "rgb(51,0,0)" },
];
