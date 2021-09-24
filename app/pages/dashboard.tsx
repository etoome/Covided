import { NextPageContext } from "next";
import Layout from "../components/Layout";
import logged from "../utils/logged";
import { Bar } from "react-chartjs-2";
import { fetchData } from "../utils/fetch";
import Table from "../components/Table";
import {
  CountriesWith5000HospitalisedPeople,
  CountryWithMostVaccines,
  VaccineUsedByCountry,
  VaccineAvailableForFranceAndBelgium,
  ProportionOfHospitalisedPeopleOnFirstJanuary,
  EvolutionOfHospitalisedPeople,
} from "../schema/PreparedQuery";
import {
  getEvolutionOfHospitalisedPeopleGraphDatas,
  getProportionOfHospitalisedPeopleOnFirstJanuaryGraphDatas,
} from "../graph/index";

interface Data {
  countriesWith5000HospitalisedPeople: CountriesWith5000HospitalisedPeople[];
  countryWithMostVaccines: CountryWithMostVaccines[];
  vaccinesUsedByCountries: [];
  proportionHospitalisedPeople: [];
  evolutionOfHospitalisedPeople: [];
  vaccineAvailableForFranceAndBelgium: VaccineAvailableForFranceAndBelgium[];
}

const Dashboard = ({
  countriesWith5000HospitalisedPeople,
  countryWithMostVaccines,
  vaccinesUsedByCountries,
  evolutionOfHospitalisedPeople,
  proportionHospitalisedPeople,
  vaccineAvailableForFranceAndBelgium,
}: Data) => {
  return (
    <Layout>
      <div className="grid grid-cols-2 mt-10 mb-10 gap-5">
        {countriesWith5000HospitalisedPeople && (
          <div>
            <Table
              title={"Countries with more than 5000 hospitalised people"}
              columns={[
                {
                  Header: "Countries",
                  accessor: "name",
                },
              ]}
              data={countriesWith5000HospitalisedPeople}
            />
          </div>
        )}
        {countryWithMostVaccines && (
          <div>
            <Table
              title={"Country with most vaccines"}
              columns={[
                {
                  Header: "Country",
                  accessor: "name",
                },
                {
                  Header: "Vaccines",
                  accessor: "vaccination_total",
                },
              ]}
              data={countryWithMostVaccines}
            />
          </div>
        )}
        {vaccinesUsedByCountries && (
          <div>
            <Table
              title={"Vaccines used by country"}
              columns={[
                {
                  Header: "Vaccine",
                  accessor: "name",
                },
                {
                  Header: "Countries",
                  accessor: "countries",
                },
              ]}
              data={vaccinesUsedByCountries}
            />
          </div>
        )}
        {proportionHospitalisedPeople && (
          <div className="w-full h-auto">
            {/* <Bar type="bar" data={proportionHospitalisedPeople} /> */}
          </div>
        )}
        {evolutionOfHospitalisedPeople && (
          <div className="w-full h-auto">
            {/* <Bar type="bar" data={evolutionOfHospitalisedPeople} /> */}
          </div>
        )}
        {vaccineAvailableForFranceAndBelgium && (
          <div>
            <Table
              title={"Vaccines available for Belgium and France"}
              columns={[
                {
                  Header: "Vaccine",
                  accessor: "name",
                },
              ]}
              data={vaccineAvailableForFranceAndBelgium}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;

export async function getServerSideProps(ctx: NextPageContext) {
  if (logged(ctx)) {
    const fetchCountriesWith5000HospitalisedPeople = await fetchData<
      CountriesWith5000HospitalisedPeople[]
    >({
      method: "GET",
      url: `${process.env.API_URL}/query/countriesWith5000HospitalisedPeople`,
      cookies: ctx.req?.headers.cookie || "",
    });
    const fetchCountryWithMostVaccines = await fetchData<
      CountryWithMostVaccines[]
    >({
      method: "GET",
      url: `${process.env.API_URL}/query/countryWithMostVaccines`,
      cookies: ctx.req?.headers.cookie || "",
    });
    const fetchVaccinesUsedByCountries = await fetchData<
      VaccineUsedByCountry[]
    >({
      method: "GET",
      url: `${process.env.API_URL}/query/vaccinesUsedByCountries`,
      cookies: ctx.req?.headers.cookie || "",
    });
    const fetchProportionOfHospitalisedPeopleOnFirstJanuary = await fetchData<
      ProportionOfHospitalisedPeopleOnFirstJanuary[]
    >({
      method: "GET",
      url: `${process.env.API_URL}/query/proportionOfHospitalisedPeopleOnFirstJanuary`,
      cookies: ctx.req?.headers.cookie || "",
    });
    const fetchEvolutionOfHospitalisedPeople = await fetchData<
      EvolutionOfHospitalisedPeople[]
    >({
      method: "GET",
      url: `${process.env.API_URL}/query/evolutionOfHospitalisedPeople`,
      cookies: ctx.req?.headers.cookie || "",
    });
    const fetchVaccineAvailableForFranceAndBelgium = await fetchData<
      VaccineAvailableForFranceAndBelgium[]
    >({
      method: "GET",
      url: `${process.env.API_URL}/query/vaccineAvailableForFranceAndBelgium`,
      cookies: ctx.req?.headers.cookie || "",
    });

    fetchVaccinesUsedByCountries.data &&
      fetchVaccinesUsedByCountries.data.forEach((vaccineData: any = []) => {
        vaccineData.countries = vaccineData.countries.toString();
      });

    const proportionData =
      fetchProportionOfHospitalisedPeopleOnFirstJanuary.data &&
      getProportionOfHospitalisedPeopleOnFirstJanuaryGraphDatas(
        fetchProportionOfHospitalisedPeopleOnFirstJanuary.data
      );

    const evolutionData =
      fetchEvolutionOfHospitalisedPeople.data &&
      getEvolutionOfHospitalisedPeopleGraphDatas(
        fetchEvolutionOfHospitalisedPeople.data
      );

    return {
      props: {
        countriesWith5000HospitalisedPeople:
          fetchCountriesWith5000HospitalisedPeople?.data,
        countryWithMostVaccines: fetchCountryWithMostVaccines?.data,
        vaccinesUsedByCountries: fetchVaccinesUsedByCountries?.data,
        proportionHospitalisedPeople: proportionData,
        evolutionOfHospitalisedPeople: evolutionData,
        vaccineAvailableForFranceAndBelgium:
          fetchVaccineAvailableForFranceAndBelgium?.data,
      },
    };
  }
  return {
    redirect: {
      destination: `/login?next=/dashboard`,
      permanent: false,
    },
  };
}
