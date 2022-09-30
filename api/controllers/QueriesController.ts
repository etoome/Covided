import { Request, Response } from "express";
import { default as jwt } from "jsonwebtoken";
import * as db from "../db";
import { CustomQuery, isCustomQuery } from "../schema/Query";
import { isToken, Token } from "../schema/Token";

class QueriesController {
  public async executeCustomQuery(req: Request, res: Response) {
    if (!isCustomQuery(req.body)) {
      return res.status(400).send({ message: "body information invalid" });
    }

    const { query }: CustomQuery = req.body;

    const decoded = jwt.decode(req.cookies.auth) as any;

    if (!isToken(decoded)) {
      return res.status(400).send({ message: "token information invalid" });
    }

    const { role }: Token = decoded;

    if (role === "user") {
      try {
        const result = await db.publicExec(query);
        return res.status(200).send(result);
      } catch (err) {
        return res.status(400).send({ message: `${err}` });
      }
    } else if (role === "epidemiologist") {
      try {
        const result = await db.privateExec(query);
        return res.status(200).send(result);
      } catch (err) {
        return res.status(400).send({ message: `${err}` });
      }
    }
  }

  public async getCountriesWith5000HospitalisedPeople(
    req: Request,
    res: Response
  ) {
    try {
      res.status(200).send(await db.getCountriesWith5000HospitalisedPeople());
    } catch (err) {
      return res.status(400).send({ message: `${err}` });
    }
  }

  public async getCountryWithMostVaccines(req: Request, res: Response) {
    try {
      res.status(200).send(await db.getCountryWithMostVaccines());
    } catch (err) {
      return res.status(400).send({ message: `${err}` });
    }
  }

  public async getVaccinesUsedByCountries(req: Request, res: Response) {
    try {
      res.status(200).send(await db.getVaccinesUsedByCountries());
    } catch (err) {
      return res.status(400).send({ message: `${err}` });
    }
  }

  public async getProportionOfHospitalisedPeopleOnFirstJanuary(
    req: Request,
    res: Response
  ) {
    try {
      res
        .status(200)
        .send(await db.getProportionOfHospitalisedPeopleOnFirstJanuary());
    } catch (err) {
      return res.status(400).send({ message: `${err}` });
    }
  }

  public async getEvolutionOfHospitalisedPeople(req: Request, res: Response) {
    try {
      res.status(200).send(await db.getEvolutionOfHospitalisedPeople());
    } catch (err) {
      return res.status(400).send({ message: `${err}` });
    }
  }

  public async getVaccineAvailableForFranceAndBelgium(
    req: Request,
    res: Response
  ) {
    try {
      res.status(200).send(await db.getVaccineAvailableForFranceAndBelgium());
    } catch (err) {
      return res.status(400).send({ message: `${err}` });
    }
  }
}
export default QueriesController;
