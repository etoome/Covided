export interface UserAuth {
  username: string;
  password: string;
}

export function isUserAuth(user: any): user is UserAuth {
  return (
    user && typeof user.username == "string" && typeof user.password == "string"
  );
}

export interface User extends UserAuth {
  first_name: string;
  last_name: string;
  address: {
    street: string;
    number: string;
    postal_code: number;
    city: string;
  };
}

export function isUser(user: any): user is User {
  return (
    user &&
    typeof user.username == "string" &&
    typeof user.password == "string" &&
    typeof user.first_name == "string" &&
    typeof user.last_name == "string" &&
    typeof user.address == "object" &&
    typeof user.address.street == "string" &&
    typeof user.address.number == "string" &&
    typeof user.address.postal_code == "number" &&
    typeof user.address.city == "string"
  );
}

export interface Epidemiologist extends User {
  center: string;
  service_phone: string;
}

export function isEpidemiologist(
  epidemiologist: any
): epidemiologist is Epidemiologist {
  return (
    typeof epidemiologist.center == "string" &&
    typeof epidemiologist.service_phone == "string"
  );
}
