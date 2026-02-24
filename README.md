# Playwright Testovi sa Page Object Modelom

Ovaj projekat sadrži automatizovane testove koristeći Playwright i Page Object Model (POM) pattern za testiranje web aplikacija.

## Postavljanje Playwright-a

### Preduvjeti
- Node.js (verzija 16 ili novija)
- npm

### Instalacija
1. Klonirajte repozitorij:
   ```
   git clone <url-repozitorija>
   cd fit-pw
   ```

2. Instalirajte dependencies:
   ```
   npm install
   ```

3. Kreirajte `.env` fajl u korijenskom direktoriju sa sledećim varijablama:
   ```
   BASE_URL=https://www.saucedemo.com
   VALID_USERNAME=standard_user
   VALID_USER_PASSWORD=secret_sauce
   ```

### Pokretanje testova
- Pokrenite sve testove: `npm test`
- Pokrenite testove sa UI modom: `npm run test:ui`
- Debug mod: `npm run test:debug`
- Headed mod (vidljivi browser): `npm run test:headed`

## Page Object Model (POM)

Page Object Model je dizajn pattern koji pomaže u organizaciji koda za automatizovano testiranje. Svaka stranica web aplikacije je predstavljena kao klasa koja enkapsulira elemente te stranice i metode za interakciju sa njima.

### Prednosti POM-a:
- Poboljšava čitljivost i održivost koda
- Smanjuje duplikaciju koda
- Olakšava održavanje testova kada se UI promijeni

### Primjer implementacije

U ovom projektu, `LoginPage` klasa predstavlja login stranicu:

```typescript
export class LoginPage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;

  constructor(private page: Page) {
    this.usernameInput = page.getByPlaceholder("Username");
    this.passwordInput = page.getByPlaceholder("Password");
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.errorMessage = page.getByTestId("error");
  }

  async login(username: string, password: string) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}
```

U testovima se koristi ovako:

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { LoginDataFactory } from '../utils/factories/LoginDataFactory';

test('should successfully login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  const validCredentials = LoginDataFactory.validCredentials();
  await loginPage.login(validCredentials.username, validCredentials.password);
  await expect(page).toHaveURL("/inventory.html");
});
```

### Struktura projekta
- `pages/`: Sadrži Page Object klase
- `tests/`: Sadrži test fajlove
- `utils/factories/`: Sadrži factory klase za generisanje test podataka

## Test Data Factory

Test Data Factory je pattern koji se koristi za centralizovano upravljanje test podacima. Omogućava generisanje konzistentnih, ponovljivih i lako održivih test podataka.

### Prednosti Test Data Factory:
- Centralizovano upravljanje test podacima
- Laka promjena test podataka bez mijenjanja testova
- Generisanje dinamičkih podataka za različite test scenarije
- Poboljšava čitljivost i održivost testova

### Primjer implementacije

U ovom projektu, `LoginDataFactory` klasa upravlja test podacima za login funkcionalnost:

```typescript
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
```

### Kako se koristi Test Data Factory

Test Data Factory se koristi u testovima za dobijanje test podataka:

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { LoginDataFactory } from '../utils/factories/LoginDataFactory';

test.describe('Login Tests', () => {
  test('should successfully login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    
    // Koristi validne kredencijale iz factory-a
    const validCredentials = LoginDataFactory.validCredentials();
    await loginPage.login(validCredentials.username, validCredentials.password);
    
    await expect(page).toHaveURL("/inventory.html");
  });

  test('should display error with invalid username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    
    const validCredentials = LoginDataFactory.validCredentials();
    // Koristi nevalidne kredencijale generisane factory-em
    const invalidCredentials = LoginDataFactory.invalidCredentials();
    
    await loginPage.login(invalidCredentials.username, validCredentials.password);
    expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
  });

  test('should generate random password', async () => {
    // Koristi factory za generisanje random password-a
    const randomPassword = LoginDataFactory.randomPassword();
    expect(randomPassword).toBeDefined();
    expect(typeof randomPassword).toBe('string');
    expect(randomPassword.length).toBeGreaterThan(0);
  });
});
```

### Metode u LoginDataFactory:
- **`validCredentials()`**: Vraća validne kredencijale iz environment varijabli
- **`invalidCredentials()`**: Generiše nasumične nevalidne kredencijale koristeći Faker.js
- **`randomPassword()`**: Generiše nasumičnu lozinku za testiranje

Ovaj pristup omogućava da se test podaci lako mijenjaju i da se testovi fokusiraju na logiku testiranja umjesto na upravljanje podacima.

## Postavljanje GitHub Actions

GitHub Actions se koristi za kontinuiranu integraciju (CI) kako bi se testovi automatski pokretali na svaki push ili pull request.

### Kreiranje workflow-a

1. Kreirajte direktorij `.github/workflows/` u korijenskom direktoriju projekta.

2. Kreirajte fajl `main.yml` u `.github/workflows/` sa sledećim sadržajem:

```yaml
name: Playwright Tests  # Naziv workflow-a koji će se prikazivati u GitHub Actions tabu

on:  # Definira kada će se workflow pokrenuti
  push:  # Na svaki push
    branches: [ main, master ]  # Samo na main i master grane
  pull_request:  # Na svaki pull request
    branches: [ main, master ]  # Samo na main i master grane

jobs:  # Definira poslove koji će se izvršiti
  test:  # Naziv posla
    timeout-minutes: 60  # Maksimalno vrijeme izvršenja (60 minuta)
    runs-on: ubuntu-latest  # Pokreće se na najnovijoj Ubuntu verziji
    environment: test  # Koristi test environment (ako je definisan)
    steps:  # Koraci koje će se izvršiti
      - uses: actions/checkout@v4  # Checkout koda iz repozitorija
      
      - uses: actions/setup-node@v4  # Postavljanje Node.js okruženja
        with:
          node-version: lts/*  # Koristi najnoviju LTS verziju Node.js
      
      - run: npm install  # Instalacija npm dependencies
      
      - run: npx playwright install --with-deps  # Instalacija Playwright browser-a sa sistemskim dependencies
      
      - run: npx playwright test  # Pokretanje Playwright testova
      
      - uses: actions/upload-artifact@v4  # Upload rezultata kao artifact
        if: always()  # Uvijek se izvršava, čak i ako prethodni koraci padnu
        with:
          name: playwright-report  # Naziv artifact-a
          path: playwright-report/  # Putanja do foldera sa izvještajem
          retention-days: 30  # Koliko dana će se čuvati artifact (30 dana)
    
    env:  # Environment varijable
      BASE_URL: ${{ vars.BASE_URL }}  # URL aplikacije iz environment varijabli
      VALID_USERNAME: ${{ secrets.VALID_USERNAME }}  # Valid username iz secrets
      VALID_USER_PASSWORD: ${{ secrets.VALID_USER_PASSWORD }}  # Valid password iz secrets
```

### Objašnjenje workflow-a:
- **name**: Daje naziv workflow-u koji će se prikazivati u GitHub interfejsu
- **on**: Specificira trigger-e - kada će se workflow pokrenuti (push ili PR na main/master)
- **jobs.test**: Definira jedan posao nazvan "test"
  - **timeout-minutes**: Sprečava da se workflow zaglavi duže od 60 minuta
  - **runs-on**: Određuje operativni sistem (Ubuntu latest)
  - **environment**: Koristi "test" environment ako postoji u repository settings
  - **steps**: Lista koraka koje će se izvršiti redom
    - **checkout**: Preuzima kod iz repozitorija
    - **setup-node**: Instalira Node.js sa specificiranom verzijom
    - **npm install**: Instalira sve dependencies iz package.json
    - **playwright install**: Instalira Playwright browser-e i sistemske biblioteke
    - **playwright test**: Pokreće sve testove
    - **upload-artifact**: Čuva Playwright izvještaj kao download-abilni fajl
  - **env**: Postavlja environment varijable - BASE_URL iz environment varijabli, dok se username i password uzimaju iz GitHub secrets za sigurno čuvanje osjetljivih podataka

### Postavljanje Secrets
Da bi workflow radio, trebate kreirati "test" environment i dodati sledeće secrets u vaš GitHub repository:

#### Kreiranje Test Environment-a
1. Idite na vaš GitHub repository
2. Kliknite na **Settings** tab
3. U lijevom meniju kliknite na **Environments**
4. Kliknite na **New environment** dugme
5. Unesite ime: `test`
6. Kliknite na **Configure environment**

#### Dodavanje Secrets u Test Environment
1. Dok ste u "test" environment-u, idite na **Environment secrets** sekciju
2. Kliknite na **Add secret** dugme za sledeće secrets:
   - **Name**: `VALID_USERNAME`, **Value**: Valid username za testiranje (npr. `standard_user`)
   - **Name**: `VALID_USER_PASSWORD`, **Value**: Valid password za testiranje (npr. `secret_sauce`)

3. Zatim idite na **Environment variables** sekciju (ne secrets)
4. Kliknite na **Add variable** dugme:
   - **Name**: `BASE_URL`, **Value**: URL vaše aplikacije (npr. `https://www.saucedemo.com`)

**Napomena**: BASE_URL se dodaje kao environment varijabla jer nije osjetljiv podatak, dok se username i password čuvaju kao secrets radi sigurnosti.

Alternativno, možete dodati secrets na nivou cijelog repository-a (umjesto environment-a):
1. Idite na **Settings** > **Secrets and variables** > **Actions**
2. Za secrets kliknite na **New repository secret**:
   - `VALID_USERNAME`: Valid username za testiranje
   - `VALID_USER_PASSWORD`: Valid password za testiranje
3. Za varijable kliknite na **Variables** tab, zatim **New repository variable**:
   - `BASE_URL`: URL vaše aplikacije (npr. https://www.saucedemo.com)

**Napomena**: Korištenje environment varijabli i secrets je sigurnije jer su dostupni samo u specifičnom environment-u, dok repository varijable i secrets mogu biti dostupni svim workflow-ovima.

Nakon što kreirate ovaj fajl i push-ujete na GitHub, workflow će se automatski pokrenuti i testovi će se izvršavati u cloud-u.