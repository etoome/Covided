import { Router } from "express";
import QueriesController from "../controllers/QueriesController";

const router = Router();
const queriesController = new QueriesController();

router.post("/custom", queriesController.executeCustomQuery);

router.get(
  "/countriesWith5000HospitalisedPeople",
  queriesController.getCountriesWith5000HospitalisedPeople
);
router.get(
  "/countryWithMostVaccines",
  queriesController.getCountryWithMostVaccines
);
router.get(
  "/vaccinesUsedByCountries",
  queriesController.getVaccinesUsedByCountries
);
router.get(
  "/proportionOfHospitalisedPeopleOnFirstJanuary",
  queriesController.getProportionOfHospitalisedPeopleOnFirstJanuary
);
router.get(
  "/evolutionOfHospitalisedPeople",
  queriesController.getEvolutionOfHospitalisedPeople
);
router.get(
  "/vaccineAvailableForFranceAndBelgium",
  queriesController.getVaccineAvailableForFranceAndBelgium
);

export default router;
