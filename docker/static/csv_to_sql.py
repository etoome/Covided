from datetime import datetime

POSTGRES_PUBLIC_USER = "postgres_public"
POSTGRES_PUBLIC_PASSWORD = "password"

POSTGRES_PRIVATE_USER = "postgres_private"
POSTGRES_PRIVATE_PASSWORD = "password"

POSTGRES_API_USER = "postgres_api"
POSTGRES_API_PASSWORD = "password"

POSTGRES_DB = "covidh303"

TABLES = "CLIMATE, CONTINENT, REGION, COUNTRY, VACCINATION, HOSPITALISATION, VACCINE, VACCINE_COUNTRY"

DEFAULT_HASHED_PASSWORD = "$argon2id$v=19$m=512,t=256,p=1$2JWKsCeDR0FuEPnzOhCsM/3hHtxnTL7wY0U8Ef5gfTY$665L/WAJkIyHzqhJiXai9c0Kzxc2zZ7xuigu+APicXk"  # "password"


def create_permissions(sql):

    sql.write(
        f'CREATE USER {POSTGRES_PUBLIC_USER} WITH PASSWORD \'{POSTGRES_PUBLIC_PASSWORD}\';\n')
    sql.write(
        f'CREATE USER {POSTGRES_PRIVATE_USER} WITH PASSWORD \'{POSTGRES_PRIVATE_PASSWORD}\';\n')
    sql.write(
        f'CREATE USER {POSTGRES_API_USER} WITH PASSWORD \'{POSTGRES_API_PASSWORD}\';\n\n')

    sql.write(
        f'GRANT CONNECT ON DATABASE {POSTGRES_DB} TO {POSTGRES_PUBLIC_USER};\n'
    )
    sql.write(
        f'GRANT SELECT ON TABLE {TABLES} TO {POSTGRES_PUBLIC_USER};\n'
    )
    sql.write(
        f'GRANT CONNECT ON DATABASE {POSTGRES_DB} TO {POSTGRES_PRIVATE_USER};\n'
    )
    sql.write(
        f'GRANT SELECT, INSERT, UPDATE, DELETE ON  {TABLES} TO {POSTGRES_PRIVATE_USER};\n'
    )
    sql.write(
        f'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO {POSTGRES_PRIVATE_USER};\n'
    )
    sql.write(
        f'GRANT SELECT ON EPIDEMIOLOGIST TO {POSTGRES_PRIVATE_USER};\n\n'
    )
    sql.write(
        f'GRANT CONNECT ON DATABASE {POSTGRES_DB} TO {POSTGRES_API_USER};\n'
    )
    sql.write(
        f'GRANT SELECT, INSERT, UPDATE, DELETE ON APP_USER, EPIDEMIOLOGIST TO {POSTGRES_API_USER};\n\n'
    )
    sql.write('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n')


def create_triggers(sql):
    sql.write(
        '''
CREATE function check_hospi_country_date_exist()
    RETURNS trigger AS
$func$
BEGIN
    IF EXISTS(SELECT * FROM hospitalisation h WHERE to_char(h.date, 'yyyy-mm-dd') = to_char(NEW.date, 'yyyy-mm-dd') and h.iso_code= NEW.iso_code) THEN
        RAISE EXCEPTION 'Combination of date-country already exists in hospitalisation';
    END IF;
    return NEW;
END
$func$ LANGUAGE plpgsql;

CREATE TRIGGER check_hospitalisation_country_date
BEFORE INSERT ON "hospitalisation"
FOR EACH ROW
EXECUTE PROCEDURE check_hospi_country_date_exist();
        '''
    )

    sql.write(
        '''
CREATE FUNCTION check_vaccination_country_date_exists()
    RETURNS trigger AS 
$func$
BEGIN
    IF EXISTS (SELECT * FROM vaccination v WHERE to_char(v.date, 'yyyy-mm-dd') = to_char(NEW.date, 'yyyy-mm-dd') and v.iso_code = NEW.iso_code) THEN
        RAISE EXCEPTION 'Combination of date-country already exists in vaccination';
    END IF;
    return NEW;
END
$func$ LANGUAGE plpgsql;

CREATE TRIGGER check_vaccination_country_date
BEFORE INSERT ON "vaccination"
FOR EACH ROW
EXECUTE PROCEDURE check_vaccination_country_date_exists();
        '''
    )

    sql.write(
        '''
CREATE FUNCTION check_epidemiologist_exists()
    RETURNS trigger AS 
$func$
BEGIN
    IF NOT EXISTS (SELECT * FROM epidemiologist e WHERE e.id =  NEW.id_epidemiologist) THEN
        RAISE EXCEPTION 'id_epidemiologist does not point to an existing epidemiologist';
    END IF;
    return NEW;
END
$func$ LANGUAGE plpgsql;

CREATE TRIGGER check_hospitalisation_epidemiologist
BEFORE INSERT ON "hospitalisation"
FOR EACH ROW
EXECUTE PROCEDURE check_epidemiologist_exists();
        '''
    )


def build_climate_table(filename, sql):
    with open(filename) as climate_file:
        climate_file.readline()
        sql.write('''CREATE TABLE CLIMATE(
    id int,
    description VARCHAR(100) NOT NULL,
    PRIMARY KEY(id)
);
\n''')
        sql.write('INSERT INTO CLIMATE VALUES\n')

        query = ""

        for climate in climate_file:
            id, decription = climate.strip().split(';')
            query += f"    ({id}, '{decription}'),\n"
        sql.write(query[:-2] + ';\n\n')


def build_country_table(filename, sql):

    with open(filename) as country_file:
        # create table
        sql.write('''CREATE TABLE CONTINENT(
    id int,
    name VARCHAR(150) NOT NULL,
    PRIMARY KEY(id)
);
\n''')
        sql.write('''CREATE TABLE REGION(
   id int,
   name VARCHAR(150) NOT NULL,
   PRIMARY KEY(id)
);
\n''')
        country_file.readline()
        sql.write('''CREATE TABLE COUNTRY(
    iso_code CHAR(3),
    continent int NOT NULL,
    region int NOT NULL,
    name VARCHAR(150) NOT NULL,
    hdi NUMERIC(4,3) NOT NULL CONSTRAINT hdi_between_zero_and_one CHECK (hdi BETWEEN 0 AND 1),
    population INT NOT NULL CONSTRAINT population_positive CHECK (population > 0),
    area_sq_ml INT NOT NULL CONSTRAINT area_sq_ml_positive CHECK (area_sq_ml >= 0),
    climate INT,
    PRIMARY KEY(iso_code),
    FOREIGN KEY(continent) REFERENCES CONTINENT(id),
    FOREIGN KEY(region) REFERENCES REGION(id),
    FOREIGN KEY(climate) REFERENCES CLIMATE(id)
);
\n''')

        # insert values
        iso_codes = set()
        continent_dict = dict()
        continent_int = 1
        continent_query = 'INSERT INTO CONTINENT VALUES \n'

        region_dict = dict()
        region_int = 1
        region_query = 'INSERT INTO REGION VALUES \n'

        country_query = 'INSERT INTO COUNTRY VALUES \n'

        for country in country_file:
            country = country.strip().split(';')
            if country[1] not in continent_dict:
                continent_dict[country[1]] = continent_int
                continent_query += f"    ({continent_dict[country[1]]},'{country[1]}'),\n"
                continent_int += 1
            if country[2] not in region_dict:
                region_dict[country[2]] = region_int
                region_query += f"    ({region_dict[country[2]]},'{country[2]}'),\n"
                region_int += 1

            country_name = country[3].replace("'", "''")

            if (0 <= float(country[4]) <= 1) and int(country[5]) >= 0 and int(country[6]) >= 0:
                country_query += f"    ('{country[0]}', {continent_dict[country[1]]}, {region_dict[country[2]]}, '{country_name}',"
                iso_codes.add(country[0])
            for data in country[4:]:
                country_query += f" {'NULL' if data.strip() == '' else data},"
            country_query = country_query[:-1] + "),\n"

        sql.write(continent_query[:-2] + ';\n\n')
        sql.write(region_query[:-2] + ';\n\n')
        sql.write(country_query[:-2] + ';\n\n')
        return iso_codes


def build_provider_table(sql):
    # creates users and epidemiologists
    sql.write('''CREATE TABLE APP_USER(
    id CHAR(36),
    username VARCHAR(30) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    address_street VARCHAR(150) NOT NULL,
    address_number VARCHAR(5) NOT NULL,
    address_postal_code INT NOT NULL,
    address_city VARCHAR(150) NOT NULL,
    PRIMARY KEY(id)
);
\n''')

    sql.write('''CREATE TABLE EPIDEMIOLOGIST(
    id CHAR(36) NOT NULL,
    center VARCHAR(150) NOT NULL,
    service_phone varchar(30) NOT NULL,
    FOREIGN KEY(id) REFERENCES APP_USER(id)
);
\n''')

    # insert some users in the database
    sql.write('INSERT INTO APP_USER VALUES\n')
    sql.write(
        f'    (\'e782830c-4592-4eb4-a144-be8c076e3018\', \'Anneized\', \'{DEFAULT_HASHED_PASSWORD}\', \'Johanna\', \'DIETRICH\', \'Schulgasse\', \'17\', 3341, \'Zogelsgraben\'),\n')
    sql.write(
        f'    (\'d5dbe04f-fb97-4951-89f0-518734e019b6\', \'Haless1961\', \'{DEFAULT_HASHED_PASSWORD}\', \'Milen\', \'PETROV\', \'Kassulke Plain\', \'36972\', 4009, \'Krumovo\'),\n')
    sql.write(
        f'    (\'4c998443-5e6a-4df2-9252-50ae3ef749eb\', \'Roolearm\', \'{DEFAULT_HASHED_PASSWORD}\', \'Tony\', \'KOTTILA\', \'Kaarrostie\', \'70\', 00950, \'Helsinki\'),\n')
    sql.write(
        f'    (\'efcd6628-f7fc-4a3e-b9a9-201f520858c3\', \'Himpeas\', \'{DEFAULT_HASHED_PASSWORD}\', \'Selmin\', \'KAJBA\', \'Dalmatinova\', \'77\', 3320, \'Velenje\'),\n')
    sql.write(
        f'    (\'cc44aad3-2348-4bd2-850e-d8048ac0749c\', \'Aind1942\', \'{DEFAULT_HASHED_PASSWORD}\', \'Mounssif\', \'BROEKHUIZEN\', \'Pijperstraat\', \'160\', 3034, \'Rotterdam\'),\n')
    sql.write(
        f'    (\'1d074f92-388a-474b-9a1b-8075369eb119\', \'Squaloodding\', \'{DEFAULT_HASHED_PASSWORD}\', \'Ronnie\', \'MARCHAN\', \'De L Acadie Boul\', \'1511\', 11290, \'Montreal\'),\n')
    sql.write(
        f'    (\'0e61cae8-546f-404f-a33a-7069127118c5\', \'Mustent\', \'{DEFAULT_HASHED_PASSWORD}\', \'Valencia\', \'SALAZAR\', \'Ctra. de Fuentenueva\', \'68\', 28300, \'Madrid\'),\n')
    sql.write(
        f'    (\'1ad6c92e-7b97-41f5-a8d3-0c6a0e79a9b8\', \'Gouvernoument\', \'{DEFAULT_HASHED_PASSWORD}\', \'Virginie\', \'DELACROIX\', \'Rue saint-Roch\', \'69\', 1120, \'Bruxelles\'),\n')
    sql.write(
        f'    (\'dff52555-def1-4711-ba5e-c1c17a75f6da\', \'Fratirld\', \'{DEFAULT_HASHED_PASSWORD}\', \'Deborah\', \'SOTO\', \'Metz Lane\', \'831\', 02215, \'Boston\'),\n')
    sql.write(
        f'    (\'811b98f5-0110-4eab-84b5-bdee33570c59\', \'Coure1945\', \'{DEFAULT_HASHED_PASSWORD}\', \'Abdirahman\', \'ARVIDSSON\', \'Luddingsbo Mekanikusv\', \'76\', 10653, \'Stockholm\'),\n')
    sql.write(
        f'    (\'5721f919-e260-40b4-ac5c-091b18fb7f6f\', \'Commayfuland1997\', \'{DEFAULT_HASHED_PASSWORD}\', \'Svanur\', \'SIGURSTEINSSON\', \'Skolavordustig\', \'99\', 107, \'Reykjavik\'),\n')
    sql.write(
        f'    (\'d74da382-943c-41fa-8659-c4a6470b5643\', \'Profete\', \'{DEFAULT_HASHED_PASSWORD}\', \'Didier\', \'RAOULT\', \'Rue Saint-Pierre\', \'264\', 13005, \'Marseille\'), \n')
    sql.write(
        f'    (\'fe25d0f7-f6c6-4be4-abe3-3bde78ad75a3\', \'TcheckPoint\', \'{DEFAULT_HASHED_PASSWORD}\', \'Subrtova\', \'Ruzena\', \'Stare Hradiste u Pardubic\', \'264\', 558, \'Prague\'), \n')
    sql.write(
        f'    (\'cea8bf97-03bc-4c93-8633-27258f14c0b6\', \'CasaDiMama\', \'{DEFAULT_HASHED_PASSWORD}\', \'Giovanna\', \'Giorno\', \'Via Foria\', \'61\', 3, \'Rome\'), \n')
    sql.write(
        f'    (\'cbc927ed-0b00-4798-b88a-6cc2e4d4bd5b\', \'Username\', \'{DEFAULT_HASHED_PASSWORD}\', \'Sophia\', \'Hertzog\', \'Gotzkowskystrasse\', \'77\', 105, \'Luxembourg\'),\n')
    sql.write(
        f'    (\'b5b76a23-0649-4436-9542-081ce27cee3c\', \'Brexit\', \'{DEFAULT_HASHED_PASSWORD}\', \'Martha\', \'Marrow\', \'Nottingham Rd\', \'47\', 69, \'Londres\'), \n')
    sql.write(
        f'    (\'38d5454a-1d7f-491e-ad36-308db347bc70\', \'FREEIRELAND\', \'{DEFAULT_HASHED_PASSWORD}\', \'Adam\', \'Bailey\', \'Whatlington Road\', \'78\', 136, \'Dublin\'), \n')
    sql.write(
        f'    (\'efcb8c7b-f786-4140-bf9c-79cd77f7c183\', \'xXDarkEstonianXx\', \'{DEFAULT_HASHED_PASSWORD}\', \'Holman\', \'Lothran\', \'Kuusalu tee\', \'66\', 42, \'Talinn\'), \n')
    sql.write(
        f'    (\'dd3e31d5-c3ad-449a-98a9-d08d4a246935\', \'Froggen\', \'{DEFAULT_HASHED_PASSWORD}\', \'Hansen\', \'Henrik\', \'Sludevej\', \'62\', 1359, \'Copenaghe\'), \n')
    sql.write(
        f'    (\'9736e326-4a93-496e-b52f-443ec5a95626\', \'bolaDauraba\', \'{DEFAULT_HASHED_PASSWORD}\', \'Christian\', \'Ronald\', \'Damiao Gois\', \'54\', 2690, \'Lisbonne\'), \n')
    sql.write(
        f'    (\'7434f45d-6343-4685-9300-a0542b3790b7\', \'Bankrupted\', \'{DEFAULT_HASHED_PASSWORD}\', \'Asmarina\', \'Asfaha\', \'Prostagma\', \'15\', 1095, \'Athenes\'), \n')
    sql.write(
        f'    (\'cc5ade74-451e-4f51-aace-bd46e94729c5\', \'Shalom\', \'{DEFAULT_HASHED_PASSWORD}\', \'Jeff\', \'Goldbloom\', \'Lamentomore\', \'1\', 1, \'Jerusalem\');\n')

    sql.write('\n\n')

    sql.write('''INSERT INTO EPIDEMIOLOGIST VALUES
    ('d74da382-943c-41fa-8659-c4a6470b5643', 'CHU de Marseille', '+33413732051'),
    ('e782830c-4592-4eb4-a144-be8c076e3018', 'Haupartz', '+436602840282'),
    ('d5dbe04f-fb97-4951-89f0-518734e019b6', 'Hospital Serdika Ltd', '+359485555146'),
    ('4c998443-5e6a-4df2-9252-50ae3ef749eb', 'Helsinki hospital', '+358500847196'),
    ('efcd6628-f7fc-4a3e-b9a9-201f520858c3', 'Univerzitetni Klinicni Center Ljubljana', '+38670309250'),
    ('cc44aad3-2348-4bd2-850e-d8048ac0749c', 'Erasmus Medisch Centrum', '+31686086146'),
    ('1d074f92-388a-474b-9a1b-8075369eb119', 'CHUM', '+15149463010'),
    ('0e61cae8-546f-404f-a33a-7069127118c5', 'Centro Medico Infanta Mercedes', '+34795318734'),
    ('1ad6c92e-7b97-41f5-a8d3-0c6a0e79a9b8', 'CHU Saint-Pierre', '+32485191910'),
    ('dff52555-def1-4711-ba5e-c1c17a75f6da', 'Massachusetts General Hospital', '+18578291010'),
    ('811b98f5-0110-4eab-84b5-bdee33570c59', 'Karolinska University Hospital', '+46085944264'),
    ('5721f919-e260-40b4-ac5c-091b18fb7f6f', 'Landspitali', '+3544717325'),
    ('fe25d0f7-f6c6-4be4-abe3-3bde78ad75a3', 'General University Hospital in Prague', '+420732573657'),
    ('cea8bf97-03bc-4c93-8633-27258f14c0b6', 'Salvator Mundi International Hospital', '+390339 4203828'),
    ('cbc927ed-0b00-4798-b88a-6cc2e4d4bd5b', 'Centre Hospitalier de Luxembourg', '+35205435453967'),
    ('b5b76a23-0649-4436-9542-081ce27cee3c', 'Royal London Hospital Clinic 3', '+4407071067627'),
    ('38d5454a-1d7f-491e-ad36-308db347bc70', 'Rotunda Hospital', '+35307857628156'),
    ('efcb8c7b-f786-4140-bf9c-79cd77f7c183', 'East Tallinn Central Hospital', '+3724606458'),
    ('dd3e31d5-c3ad-449a-98a9-d08d4a246935', 'Hopital Amager', '+4525162440'),
    ('9736e326-4a93-496e-b52f-443ec5a95626', 'Centro Hospitalar Universitario de Lisboa Central', '+351212966555159'),
    ('cc5ade74-451e-4f51-aace-bd46e94729c5', 'Shaare Tzedek Medical Center -Bikur Cholim', '+972');
\n''')


def build_vaccination_table(filename, sql, iso_codes):
    with open(filename) as file:
        sql.write('''CREATE TABLE VACCINATION(
    id SERIAL,
    date timestamp with time zone,
    tests INT CONSTRAINT tests_positive CHECK (tests >= 0),
    vaccinations INT CONSTRAINT vaccinations_positive CHECK (vaccinations >= 0),
    iso_code CHAR(3),
    FOREIGN KEY(iso_code) REFERENCES COUNTRY(iso_code),
    PRIMARY KEY(id)
);
\n''')

        sql.write('INSERT INTO VACCINATION VALUES\n')
        file.readline()

        query = ""

        for line in file:
            iso_code, date, tests, vaccinations = line.strip().split(",")

            test_value = '0' if tests == '' else tests
            vaccination_value = '0' if vaccinations == '' else vaccinations
            if iso_code in iso_codes and float(test_value) >= 0 and float(vaccination_value) >= 0:
                query += f"    (DEFAULT, '{date}', {test_value}, {vaccination_value}, '{iso_code}'),\n"
        sql.write(query[:-2] + ';\n\n')


def build_hospital_table(filename, sql, iso_codes):
    with open(filename) as file:
        sql.write(
            '''CREATE TABLE HOSPITALISATION(
    id SERIAL,
    date DATE NOT NULL,
    icu_patients INT CONSTRAINT icu_patients_positive CHECK (icu_patients >= 0),
    hosp_patients INT CONSTRAINT hosp_patients_positive CHECK (hosp_patients >= 0),
    iso_code CHAR(3) NOT NULL,
    id_epidemiologist CHAR(36) NOT NULL,
    FOREIGN KEY(id_epidemiologist) REFERENCES APP_USER(id),
    FOREIGN KEY(iso_code) REFERENCES COUNTRY(iso_code),
    PRIMARY KEY(id)
);
\n''')

        sql.write(
            'INSERT INTO HOSPITALISATION VALUES\n')
        file.readline()

        query = ""
        epidemiologists = set()

        for line in file:
            iso_code, date, icu_patients, hosp_patients, source_epidemiologiste = line.strip().split(",")
            epidemiologists.add(source_epidemiologiste)
            date_frmt = datetime.strptime(date, '%d/%m/%Y')
            if iso_code in iso_codes and float(icu_patients) >= 0 and float(hosp_patients) >= 0:
                query += f"    (DEFAULT, '{date_frmt.strftime('%Y-%m-%d')}', {'0' if icu_patients == '' else icu_patients}, {'0' if hosp_patients == '' else hosp_patients}, '{iso_code}', '{source_epidemiologiste}'),\n"
        sql.write(query[:-2] + ';\n\n')


def build_split_vaccine_table(filename, sql, iso_codes):
    with open(filename) as file:
        sql.write(
            '''CREATE TABLE VACCINE(
    id SERIAL,
    name VARCHAR(64) NOT NULL,
    PRIMARY KEY(id)
);
\n''')
        sql.write(
            '''CREATE TABLE VACCINE_COUNTRY(
    id INT,
    iso_code CHAR(3),
    date DATE NOT NULL,
    FOREIGN KEY(id) REFERENCES VACCINE(id),
    FOREIGN KEY(iso_code) REFERENCES COUNTRY(iso_code),
    PRIMARY KEY(id, iso_code)
);
\n''')

        file.readline()

        query_vaccine = ""
        query_vaccine_country = ""

        prods = {}
        prod_id = 1

        for line in file:
            iso_code, date, vaccines = line.strip().split(";")

            for prod in vaccines.split(", "):
                if iso_code in iso_codes:
                    if prod not in prods.keys():
                        query_vaccine += f"    ({prod_id}, '{prod}'),\n"
                        prods[prod] = prod_id
                        prod_id += 1

                    query_vaccine_country += f"    ({prods[prod]}, '{iso_code}', '{date}'),\n"
        sql.write(
            'INSERT INTO VACCINE VALUES\n')
        sql.write(query_vaccine[:-2] + ';\n\n')

        sql.write(
            'INSERT INTO VACCINE_COUNTRY VALUES\n')
        sql.write(query_vaccine_country[:-2] + ';\n\n')


if __name__ == "__main__":

    with open('docker/static/db.sql', 'w') as sql:
        build_climate_table('data/climate.csv', sql)
        iso_codes = build_country_table('data/country.csv', sql)
        build_provider_table(sql)
        build_vaccination_table('data/vaccinations.csv', sql, iso_codes)
        build_hospital_table('data/hospitals.csv', sql, iso_codes)
        build_split_vaccine_table('data/producers.csv', sql, iso_codes)
        create_permissions(sql)
        create_triggers(sql)
