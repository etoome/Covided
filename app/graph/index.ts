import { GraphData } from "../schema/Graph";
import {
  EvolutionOfHospitalisedPeople,
  ProportionOfHospitalisedPeopleOnFirstJanuary,
} from "../schema/PreparedQuery";
import { colours } from "./colours";

function addDays(date: Date, days: number) {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getDates(startDate: Date, stopDate: Date) {
  let dateArray = [];
  let currentDate = startDate;
  while (currentDate <= stopDate) {
    const date = new Date(currentDate);
    let dd = String(date.getDate()).padStart(2, "0");
    let mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
    let yy = date.getFullYear();
    dateArray.push(`${dd}/${mm}/${yy}`);
    currentDate = addDays(currentDate, 1);
  }
  return dateArray;
}

export function getProportionOfHospitalisedPeopleOnFirstJanuaryGraphDatas(
  resProportionOfHospitalisedPeopleOnFirstJanuary: ProportionOfHospitalisedPeopleOnFirstJanuary[]
): GraphData {
  const labels: string[] = [];
  const data: number[] = [];
  const backgroundColor: string[] = [];

  resProportionOfHospitalisedPeopleOnFirstJanuary.forEach(
    (countryData: ProportionOfHospitalisedPeopleOnFirstJanuary) => {
      labels.push(countryData.name);
      data.push(parseFloat(countryData.hospitalised_population_at_01_01_2021));
      const countryColour = colours.find((e) => {
        return e.country === countryData.name;
      });
      countryColour && backgroundColor.push(countryColour.colour);
    }
  );
  return {
    labels: labels,
    datasets: [
      {
        label: "Proportion of hospitalised population on 01/01/2021",
        data: data,
        backgroundColor: backgroundColor,
      },
    ],
  };
}

export function getEvolutionOfHospitalisedPeopleGraphDatas(
  fetchEvolutionOfHospitalisedPeople: EvolutionOfHospitalisedPeople[]
): GraphData {
  const countries: any[] = [];
  let minDate: Date = new Date();
  let maxDate: Date = new Date(-8640000000000000);
  fetchEvolutionOfHospitalisedPeople.forEach(
    (data: EvolutionOfHospitalisedPeople) => {
      let date = new Date(data.date);
      if (date < minDate) {
        minDate = date;
      } else if (date > maxDate) {
        maxDate = date;
      }
      const idx = countries.findIndex((el) => {
        return el.country === data.name;
      });
      if (idx === -1) {
        countries.push({ country: data.name, hosp: [] });
      }
      var dd = String(date.getDate()).padStart(2, "0");
      var mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
      var yy = date.getFullYear();
      countries[idx === -1 ? countries.length - 1 : idx].hosp.push({
        date: `${dd}/${mm}/${yy}`,
        newHospSinceYesterday: data.new_hospitalisations_since_yesterday,
      });
    }
  );
  const datasets: any[] = [];
  const labels = getDates(minDate, maxDate);
  countries.forEach((country: any) => {
    let data: any[] = [];
    labels.forEach((date: string) => {
      const ind = country.hosp.findIndex((el: any) => {
        return date.localeCompare(el.date) === 0;
      });
      data.push(ind === -1 ? 0 : country.hosp[ind].newHospSinceYesterday);
    });
    const countryColour = colours.find((e) => {
      return e.country === country.country;
    });
    datasets.push({
      label: country.country,
      data: data,
      backgroundColor: countryColour?.colour || "rgb(169,169,169)",
      hidden: country.country !== "Belgium",
    });
  });

  return {
    labels: labels,
    datasets: datasets,
  };
}
