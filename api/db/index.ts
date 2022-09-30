import { Client } from "pg";
import { User } from "../schema/User";
import {
  CountriesWith5000HospitalisedPeople,
  CountryWithMostVaccines,
  VaccineUsedByCountry,
  ProportionOfHospitalisedPeopleOnFirstJanuary,
  EvolutionOfHospitalisedPeople,
  VaccineAvailableForFranceAndBelgium,
} from "../schema/PreparedQuery";
import { QueryResponse } from "../schema/Query";

const publicClient = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  user: process.env.POSTGRES_PUBLIC_USER,
  password: process.env.POSTGRES_PUBLIC_PASSWORD,
  database: process.env.POSTGRES_DB,
});

const privateClient = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  user: process.env.POSTGRES_PRIVATE_USER,
  password: process.env.POSTGRES_PRIVATE_PASSWORD,
  database: process.env.POSTGRES_DB,
});

const apiClient = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  user: process.env.POSTGRES_API_USER,
  password: process.env.POSTGRES_API_PASSWORD,
  database: process.env.POSTGRES_DB,
});

export async function connect() {
  await publicClient.connect().catch((err) => {
    throw new Error("DB Connection error (public)");
  });

  await privateClient.connect().catch((err) => {
    throw new Error("DB Connection error (private)");
  });

  await apiClient.connect().catch((err) => {
    throw new Error("DB Connection error (api)");
  });

  return;
}

/** PUBLIC */
export function publicExec(sql: string) {
  return publicClient
    .query(sql)
    .then(({ command, rowCount, rows }: QueryResponse) => {
      return { command, rowCount, rows };
    })
    .catch((err) => {
      throw err;
    });
}

export function getCountriesWith5000HospitalisedPeople(): Promise<
  CountriesWith5000HospitalisedPeople[]
> {
  return publicClient
    .query(
      `SELECT DISTINCT c.name 
    FROM hospitalisation h 
    JOIN country c on h.iso_code = c.iso_code
    where hosp_patients >= 5000;`
    )
    .then(({ rows }) => {
      return rows;
    })
    .catch((err) => {
      throw err;
    });
}

export function getCountryWithMostVaccines(): Promise<
  CountryWithMostVaccines[]
> {
  return publicClient
    .query(
      `SELECT c.name, SUM(vaccinations) AS "vaccination_total"
    FROM vaccination v 
    JOIN country c on c.iso_code = v.iso_code
    GROUP BY name 
    ORDER BY SUM(vaccinations) DESC 
    LIMIT 1;`
    )
    .then(({ rows }) => {
      return rows;
    })
    .catch((err) => {
      throw err;
    });
}

export function getVaccinesUsedByCountries(): Promise<VaccineUsedByCountry[]> {
  return publicClient
    .query(
      `SELECT v.name, array_agg(c.name) AS "countries"
  FROM vaccine v
  JOIN vaccine_country vc ON v.id = vc.id
  JOIN country c ON vc.iso_code = c.iso_code
  GROUP BY v.name;`
    )
    .then(({ rows }) => {
      return rows;
    })
    .catch((err) => {
      throw err;
    });
}

export function getProportionOfHospitalisedPeopleOnFirstJanuary(): Promise<
  ProportionOfHospitalisedPeopleOnFirstJanuary[]
> {
  return publicClient
    .query(
      `SELECT c.name, (h.hosp_patients/cast(c.population as float)) * 100 || ' %' AS "hospitalised_population_at_01_01_2021"
  FROM country c
  JOIN hospitalisation h ON c.iso_code = h.iso_code
  WHERE to_char(h.date, 'yyyy-mm-dd') = '2021-01-01';`
    )
    .then(({ rows }) => {
      return rows;
    })
    .catch((err) => {
      throw err;
    });
}

export function getEvolutionOfHospitalisedPeople(): Promise<
  EvolutionOfHospitalisedPeople[]
> {
  return publicClient
    .query(
      `SELECT temp.name, temp.date, differency AS "new_hospitalisations_since_yesterday"
  FROM ( 
      SELECT c.name, today.date, today.hosp_patients - yesterday.hosp_patients AS "differency" 
      FROM hospitalisation today
      JOIN country c ON c.iso_code = today.iso_code
      JOIN hospitalisation yesterday ON today.iso_code = yesterday.iso_code AND today.date = yesterday.date+1
      
      UNION
  
      SELECT c.name, today.date, today.hosp_patients as "differency"
      FROM hospitalisation today 
      JOIN country c ON c.iso_code = today.iso_code
      WHERE NOT EXISTS (
          SELECT date 
          FROM hospitalisation yesterday 
          WHERE yesterday.date = today.date-1 AND yesterday.iso_code = today.iso_code
      )
  ) AS temp 
  ORDER BY temp.name, temp.date;`
    )
    .then(({ rows }) => {
      return rows;
    })
    .catch((err) => {
      throw err;
    });
}

export function getVaccineAvailableForFranceAndBelgium(): Promise<
  VaccineAvailableForFranceAndBelgium[]
> {
  return publicClient
    .query(
      `SELECT v.name
  FROM vaccine v
  JOIN vaccine_country vc on v.id = vc.id
  JOIN country c ON vc.iso_code = c.iso_code
  WHERE c.name = 'Belgium'
  
  INTERSECT
  
  SELECT v.name
  FROM vaccine v
  JOIN vaccine_country vc on v.id = vc.id
  JOIN country c ON vc.iso_code = c.iso_code
  WHERE c.name = 'France';`
    )
    .then(({ rows }) => {
      return rows;
    })
    .catch((err) => {
      throw err;
    });
}
/** PRIVATE */
export function privateExec(sql: string) {
  return privateClient
    .query(sql)
    .then(async ({ command, rowCount, rows }: QueryResponse) => {
      return { command, rowCount, rows };
    })
    .catch((err) => {
      throw err;
    });
}

/** API */
export function getUserAuth(
  username: string
): Promise<{ id: string; password: string } | undefined> {
  return apiClient
    .query("SELECT id, password  FROM app_user WHERE username = $1", [username])
    .then(async ({ rows: [r0], rowCount }) => {
      if (rowCount < 1) {
        return;
      }

      return r0;
    })
    .catch((err) => {
      throw new Error(`getUser : ${err}`);
    });
}

export function getUserRole(id: string): Promise<"user" | "epidemiologist"> {
  return apiClient
    .query(
      "SELECT 1 FROM app_user u JOIN epidemiologist e ON e.id = u.id WHERE e.id = $1",
      [id]
    )
    .then(async ({ rowCount }) => {
      if (rowCount < 1) {
        return "user";
      }

      return "epidemiologist";
    })
    .catch((err) => {
      throw new Error(`getRoleOfUser : ${err}`);
    });
}

export function userExists(username: string): Promise<boolean> {
  return apiClient
    .query("SELECT 1 FROM app_user WHERE username = $1", [username])
    .then(async ({ rowCount }) => {
      return rowCount > 0;
    })
    .catch((err) => {
      throw new Error(`userExists : ${err}`);
    });
}

export function addUser(user: User): Promise<string> {
  return apiClient
    .query(
      "INSERT INTO app_user VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
      [
        user.username,
        user.password,
        user.first_name,
        user.last_name,
        user.address.street,
        user.address.number,
        user.address.postal_code,
        user.address.city,
      ]
    )
    .then(async ({ rows: [r0], rowCount }) => {
      if (rowCount < 1) {
        return;
      }
      return r0.id;
    })
    .catch((err) => {
      throw new Error(`addUser : ${err}`);
    });
}

interface NewEpidemiologist {
  id: string;
  center: string;
  service_phone: string;
}

export function addEpidemiologist(epidemiologist: NewEpidemiologist) {
  return apiClient
    .query("INSERT INTO epidemiologist VALUES ($1, $2, $3)", [
      epidemiologist.id,
      epidemiologist.center,
      epidemiologist.service_phone,
    ])
    .then(async ({ rowCount }) => {
      return rowCount;
    })
    .catch((err) => {
      throw new Error(`addEpidemiologist : ${err}`);
    });
}
