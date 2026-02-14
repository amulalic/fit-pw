import { faker } from "@faker-js/faker";

export interface LoginCredentials {
  username: string;
  password: string;
}

export class LoginDataFactory {
  static validCredentials(): LoginCredentials {
    return {
      username: process.env.VALID_USERNAME!,
      password: process.env.VALID_USER_PASSWORD!,
    };
  }

  static invalidCredentials(): LoginCredentials {
    return {
      username: faker.internet.userName(),
      password: faker.internet.password(),
    };
  }

  static randomPassword(): string {
    return faker.internet.password();
  }
}
