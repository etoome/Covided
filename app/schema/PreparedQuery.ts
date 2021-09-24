export interface CountriesWith5000HospitalisedPeople {
  name: string;
}

export interface CountryWithMostVaccines {
  name: string;
  vaccination_total: number;
}

export interface VaccineUsedByCountry {
  name: string;
  countries: string[];
}

export interface ProportionOfHospitalisedPeopleOnFirstJanuary {
  name: string;
  hospitalised_population_at_01_01_2021: string;
}

export interface EvolutionOfHospitalisedPeople {
  name: string;
  date: string;
  new_hospitalisations_since_yesterday: number;
}

export interface VaccineAvailableForFranceAndBelgium {
  name: string;
}
