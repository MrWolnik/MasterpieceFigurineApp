# PLAN.md — Strona Julii, artystki malującej figurki

> Wersja 0.6. Ten plan służy jako instrukcja dla Claude Code.
> Zadania wykonujemy po kolei. Każde zadanie kończy się działającą stroną, zielonymi testami i commitem.
> Artystka: **Julia**. Marka i domena: **MasterpieceFigurineJ.com**.

---

## 1. Cel strony

Strona promuje usługi malowania figurek. Odwiedzający ma:

1. **poznać Julię**, czyli zobaczyć, kim jest i czym się zajmuje,
2. **obejrzeć wykonane prace** w portfolio, czyli **figurki** (wybrane można obrócić i zobaczyć z każdej strony) i **obrazy** (z możliwością powiększenia detali),
3. **wysłać zgłoszenie przez formularz**: kontakt, opis, opcjonalny termin i zdjęcie swojej figurki,
4. **znaleźć dane kontaktowe** Julii.

Strona jest dwujęzyczna: **polski (domyślny) i angielski**.
Na stronie **nie ma cen**. Każde zlecenie jest wyceniane indywidualnie po zgłoszeniu z formularza.

## 2. Styl

- Klimat dark fantasy w duchu „Wiedźmina”: ciemne tła, faktura (kamień, pergamin, mgła), złote lub miedziane akcenty.
- **Minimalizm**: dużo pustej przestrzeni, mało ozdobników. Figurki są bohaterami strony.
- Używamy tylko własnych grafik i darmowych fontów. Nie kopiujemy logo, znaków ani grafik z gry, bo są chronione.
- Paleta (do akceptacji):
  - tło `#0E0D0B` (prawie czarne, ciepłe)
  - powierzchnie `#1A1815`
  - tekst `#E8E1D3` (kość słoniowa)
  - tekst drugorzędny `#9A9183`
  - akcent `#B8893B` (stare złoto)
  - błąd lub ostrzeżenie `#7A1F1F` (ciemna czerwień), tylko jako tło lub ramka, bo jako tekst na ciemnym tle ma za mały kontrast (1,9:1)
  - tekst komunikatów błędów `#D06A5F` (jaśniejsza czerwień, kontrast 5,5:1)
- Fonty: **Cinzel** na nagłówki, **Inter** na tekst. Oba trzymamy lokalnie przez `@fontsource`. Cinzel musi obsługiwać polskie znaki, co sprawdzamy w Z0.3.
- Delikatne animacje. Wyłączamy je, gdy użytkownik ma w systemie ustawione `prefers-reduced-motion`.

## 3. Struktura strony

Adresy są poprzedzone językiem: `/pl/...` i `/en/...`. Wejście na `/` przekierowuje na język przeglądarki, a gdy go nie rozpoznamy, na `pl`.

| PL                    | EN                    | Zawartość                            |
| --------------------- | --------------------- | ------------------------------------ |
| `/pl`                 | `/en`                 | Strona główna                        |
| `/pl/portfolio`       | `/en/portfolio`       | Wszystkie prace w kafelkach          |
| `/pl/portfolio/:slug` | `/en/portfolio/:slug` | Szczegóły figurki z podglądem 360°   |
| `/pl/kontakt`         | `/en/contact`         | O Julii, dane kontaktowe i formularz |
| `/pl/prywatnosc`      | `/en/privacy`         | Polityka prywatności                 |

### 3.1 Strona główna

- **Sekcja 1 „Hero” na pełną wysokość ekranu (100vh)**
  - Z lewej: zdjęcie Julii w ciemnej tonacji.
  - Z prawej: imię, 2–3 zdania opisu i przycisk „Zamów malowanie”, który prowadzi do kontaktu.
  - Na dole wskaźnik przewijania.
- **Sekcja 2 „Wyróżnione prace” (przewijanie o cały ekran)**
  - 1–3 wyróżnione figurki (`featured: true`) z **interaktywnym podglądem 360°**.
  - Przycisk „Zobacz całe portfolio”.
- **Stopka**: social media, e-mail, przełącznik języka.

### 3.2 Portfolio

- **Siatka kafelków** z pracami: okładka, nazwa i tagi, a przy najechaniu delikatna złota ramka.
- Na mobile 1–2 kolumny, na desktopie 3–4.
- **Filtr rodzaju pracy:** „Wszystko / Figurki / Obrazy”.
- Filtr po tagach (np. „Warhammer”, „D&D”, „Olej”, „Akwarela”).
- Kafelki mają jednakowy kształt (kadr przez `object-fit: cover` z ustawianym punktem kadru), więc pionowe i poziome obrazy nie rozbijają siatki. Pełny obraz bez kadrowania jest na stronie szczegółów.
- Kliknięcie kafelka otwiera stronę szczegółów `/portfolio/:slug`:
  - **figurka:** podgląd 360° (gdy ma klatki obrotu) albo galeria zdjęć,
  - **obraz:** pełny obraz z powiększaniem (pkt 3.5) oraz technika, wymiary i rok.

### 3.3 Kontakt

- Dłuższy opis Julii: historia, doświadczenie, styl pracy, jak wygląda współpraca (3–4 kroki, w tym „wycena indywidualna po zgłoszeniu”).
- Dane kontaktowe: e-mail i social media.
- **Formularz zgłoszenia**:

| Pole                      | Wymagane      | Uwagi                                                                                                                                                 |
| ------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rodzaj zlecenia           | tak           | wybór: **Malowanie figurki** / **Obraz na zamówienie**, domyślnie figurka                                                                             |
| Imię                      | tak           |                                                                                                                                                       |
| E-mail                    | jedno z dwóch | wymagany e-mail **albo** telefon                                                                                                                      |
| Telefon                   | jedno z dwóch | format międzynarodowy                                                                                                                                 |
| Opis — co chcesz osiągnąć | tak           | min. 20 znaków; podpowiedź w polu zmienia się z rodzajem zlecenia                                                                                     |
| Preferowane wymiary       | nie           | **tylko dla obrazu**, np. „50 × 70 cm”                                                                                                                |
| Technika                  | nie           | **tylko dla obrazu**: olej / akryl / akwarela / „bez znaczenia”                                                                                       |
| Termin                    | nie           | pole daty, nie wcześniej niż dziś                                                                                                                     |
| Zdjęcia lub GIF-y         | nie           | dla figurki „zdjęcie Twojej figurki”, dla obrazu „inspiracje lub zdjęcia referencyjne”; jpg, png, webp, gif, maksymalnie 3 pliki po 5 MB, z podglądem |
| Zgoda RODO                | tak           | link do polityki prywatności                                                                                                                          |

- Pola tylko dla obrazu pokazują się i znikają z łagodną animacją. Po przełączeniu z obrazu na figurkę ich wartości są czyszczone i nie są wysyłane.
- Przycisk „Chcę podobną” na stronie pracy ustawia od razu właściwy rodzaj zlecenia (`?kind=painting&ref=<slug>`).
- Temat e-maila do Julii zawiera rodzaj zlecenia, np. „[Obraz] Nowe zgłoszenie od Anny”, żeby łatwo było je odróżnić w skrzynce.

- Zabezpieczenie przed spamem: ukryte pole (honeypot).
- Komunikaty walidacji i stany wysyłania, sukcesu i błędu są w obu językach.

### 3.4 Podgląd 360° (obrotnica zdjęć)

Figurkę fotografujemy na obrotowym talerzu, robiąc 24–36 zdjęć co 10–15°. Na stronie obraca się ją przeciąganiem myszą lub palcem. Komponent piszemy tak, żeby później dało się dodać modele 3D (`<model-viewer>`).

### 3.5 Podgląd obrazu (powiększanie)

- Obraz wyświetla się w całości, bez kadrowania, na ciemnym tle.
- Kliknięcie otwiera widok pełnoekranowy z powiększaniem: kółkiem myszy, gestem szczypania na telefonie, przyciskami +/− oraz przesuwaniem powiększonego obrazu.
- Najpierw ładuje się wersja średnia, a wersja w wysokiej rozdzielczości dopiero po otwarciu powiększenia.
- Pod obrazem: tytuł, technika (np. olej na płótnie), wymiary, rok i opis.
- Opcjonalnie kilka dodatkowych zdjęć, np. detale albo obraz na ścianie dla skali.

### 3.6 Pozostałe

- Polityka prywatności (szablon do uzupełnienia).
- Strona 404 w tym samym stylu.

## 4. Technologia

| Obszar                          | Wybór                                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| Aplikacja                       | **React 19 + TypeScript 6 (strict) + Vite**, jedna aplikacja (SPA)                                |
| Routing                         | React Router z prefiksem języka                                                                   |
| Tłumaczenia                     | react-i18next, pliki `src/locales/pl.json` i `en.json`                                            |
| Formularz                       | react-hook-form + zod (reguła „e-mail albo telefon”)                                              |
| Style                           | CSS Modules + zmienne CSS (design tokens)                                                         |
| Dane prac                       | pliki JSON w `src/content/works/<slug>.json`, sprawdzane schematem zod                            |
| SEO                             | generowanie gotowych podstron podczas budowania (prerendering, np. `vite-react-ssg`) + `hreflang` |
| Wysyłka formularza              | Netlify Forms (obsługuje załączniki, bez własnego serwera)                                        |
| Hosting                         | Netlify (darmowy plan)                                                                            |
| Repozytorium                    | **Git + GitHub**                                                                                  |
| Testy jednostkowe i komponentów | **Vitest + React Testing Library + user-event**                                                   |
| Mockowanie sieci w testach      | **MSW** (Mock Service Worker)                                                                     |
| Testy end-to-end                | **Playwright** (Chromium, Firefox, WebKit, w tym widok telefonu)                                  |
| Testy dostępności               | **@axe-core/playwright**                                                                          |
| CI                              | **GitHub Actions**                                                                                |

**Dlaczego prace są w JSON-ach, a nie w kodzie:** panel CMS dodamy w przyszłości (Etap 6). CMS-y działające na Gicie (np. Decap CMS) edytują właśnie pliki JSON i Markdown w repozytorium. Dzięki temu później nie trzeba niczego przepisywać.

**Dlaczego taki zestaw testów:**

- **Vitest** działa natywnie z Vite (ta sama konfiguracja, bardzo szybki) i ma API zgodne z Jest.
- **React Testing Library** testuje komponenty tak, jak używa ich człowiek (po etykietach i rolach), a nie po szczegółach implementacji.
- **Playwright** testuje całą stronę w prawdziwych przeglądarkach, w tym w Safari (WebKit), które jest ważne dla obrotnicy 360° i przewijania na iPhonie.

## 5. Git i sposób pracy

- **Repozytorium:** GitHub. Gałąź `main` jest zawsze stabilna, a każda zmiana trafia na nią przez pull request.
- **Gałęzie:** jedno zadanie to jedna gałąź, nazwana `feat/z1-5-turntable`, `fix/...`, `test/...`, `chore/...`.
- **Commity:** format Conventional Commits, np. `feat(portfolio): add tag filter`, `test(form): cover email-or-phone rule`.
- **Przed commitem:** Husky + lint-staged uruchamiają Prettier, ESLint i testy powiązane ze zmienionymi plikami.
- **CI (GitHub Actions)** przy każdym pull requeście sprawdza po kolei:
  1. `npm run lint`
  2. `npm run typecheck`
  3. `npm run test` (Vitest z pokryciem kodu)
  4. `npm run build`
  5. `npm run test:e2e` (Playwright na zbudowanej stronie)
- **Ochrona `main`:** merge jest możliwy tylko przy zielonym CI.
- **Wdrożenie:** Netlify publikuje `main` automatycznie i robi podgląd każdego pull requesta.
- **Widoczność repozytorium:** **publiczne** (od 2026-11-26). Na darmowym planie GitHub ochrona gałęzi działa tylko w publicznych repozytoriach. Uwaga: plan, konfiguracja i historia Gita zawierają adresy e-mail, a publiczne repozytoria są przeszukiwane przez boty spamowe. Przy przejściu na GitHub Pro można wrócić do repozytorium prywatnego.
- **Sekrety:** nigdy nie trafiają do repozytorium. Repozytorium zawiera `.env.example` z pustymi wartościami, a `.env` jest w `.gitignore`.
- **Zdjęcia:** pliki WebP mają łącznie umiarkowany rozmiar, więc trzymamy je w repozytorium. Gdy repozytorium urośnie powyżej ~500 MB, przenosimy zdjęcia do Git LFS lub zewnętrznego magazynu.

### Zasady dla Claude Code (trafią do `CLAUDE.md` w repozytorium)

1. Przed rozpoczęciem zadania przeczytaj `PLAN.md` i odhacz zadanie po jego ukończeniu.
2. Każde zadanie ma własną gałąź i kończy się pull requestem.
3. Każdy nowy komponent lub funkcja ma testy. Bez testów zadanie nie jest skończone.
4. Przed commitem uruchom `npm run lint && npm run typecheck && npm run test`.
5. Wszystkie teksty widoczne dla użytkownika idą do `pl.json` i `en.json`. Nie wpisujemy tekstów na sztywno w komponentach.
6. Nie dodawaj nowych bibliotek bez uzasadnienia w opisie pull requesta.

## 6. Struktura repozytorium

```
/.github/workflows/ci.yml
/.husky/
/e2e                    ← testy Playwright
  home.spec.ts, portfolio.spec.ts, contact.spec.ts, i18n.spec.ts, a11y.spec.ts
/public
  /works/<slug>/cover.webp, /frames/001.webp ... 036.webp
  favicon, og-image
/src
  /components
    Layout/ (Header, Footer, LanguageSwitcher)
    Hero/
    Turntable/          ← podgląd 360° (Turntable.tsx, Turntable.test.tsx, Turntable.module.css)
    ImageZoom/          ← powiększanie obrazów
    WorkCard/
    WorkGrid/
    ContactForm/
    FileDropzone/
  /config               site.ts (imię, e-mail, social media)
  /content/works        <slug>.json
  /pages                Home, Portfolio, WorkDetails, Contact, Privacy, NotFound
  /locales              pl.json, en.json
  /lib                  i18n.ts, works.ts, validation.ts, submitForm.ts
  /styles               tokens.css, global.css
  /test                 setup.ts, msw-handlers.ts, test-utils.tsx (render z routerem i i18n)
  main.tsx, router.tsx
.env.example
.gitignore
CLAUDE.md
PLAN.md
README.md
playwright.config.ts
vitest.config.ts
```

Testy jednostkowe leżą obok plików, które testują (`*.test.ts(x)`). Testy end-to-end są w `/e2e`.

### Konfiguracja strony (`src/config/site.ts`)

Jedno miejsce na dane, które Julia będzie zmieniać. Edycja to zmiana jednej linijki i commit, bez dotykania komponentów.

```ts
export const site = {
  artistName: 'Julia',
  brand: 'Masterpiece Figurine J',
  url: import.meta.env.VITE_SITE_URL ?? 'https://masterpiecefigurinej.netlify.app',
  contactEmail: 'dwolnik12310@gmail.com', // e-mail testowy; docelowy podamy przed startem
  socials: [
    // Pusty `url` = ikona się nie wyświetla. Wystarczy wkleić link, żeby się pojawiła.
    { id: 'instagram', label: 'Instagram', url: '' },
    { id: 'facebook', label: 'Facebook', url: '' },
    { id: 'tiktok', label: 'TikTok', url: '' },
    { id: 'youtube', label: 'YouTube', url: '' },
  ],
} as const;
```

- Kolejność ikon odpowiada kolejności w tablicy.
- Nową sieć społecznościową (np. Pinterest) dodaje się jednym wpisem i jedną ikoną SVG w `src/components/Layout/icons/`.
- W Etapie 6 te ustawienia przejdą do pliku `src/content/settings.json`, żeby CMS mógł je edytować.
- W trybie dev, gdy żaden link nie jest ustawiony, stopka pokazuje szare ikony zastępcze. Na produkcji ikon bez linku nie ma.

Format pliku pracy (`src/content/works/<slug>.json`):
Figurka:

```json
{
  "kind": "figurine",
  "slug": "nocny-wartownik",
  "title": { "pl": "Nocny wartownik", "en": "Night Sentinel" },
  "description": { "pl": "...", "en": "..." },
  "tags": ["warhammer", "nmm"],
  "cover": "/works/nocny-wartownik/cover.webp",
  "frames": 36,
  "images": [],
  "featured": true,
  "order": 1
}
```

Pole `frames` jest opcjonalne: gdy go brak, strona pokazuje zwykłą galerię zamiast podglądu 360°. Pole `framesFormat` (`webp` domyślnie albo `svg` dla obrazków zastępczych) podaje rozszerzenie plików klatek `/works/<slug>/frames/001.<format>`.

Obraz:

```json
{
  "kind": "painting",
  "slug": "mgla-nad-bagnem",
  "title": { "pl": "Mgła nad bagnem", "en": "Mist over the Marsh" },
  "description": { "pl": "...", "en": "..." },
  "tags": ["olej", "pejzaz"],
  "cover": "/works/mgla-nad-bagnem/cover.webp",
  "image": "/works/mgla-nad-bagnem/full.webp",
  "imageHiRes": "/works/mgla-nad-bagnem/full@2x.webp",
  "medium": { "pl": "Olej na płótnie", "en": "Oil on canvas" },
  "size": "50 × 70 cm",
  "year": 2025,
  "coverFocus": "50% 30%",
  "images": [],
  "featured": false,
  "order": 2
}
```

Schemat zod to unia rozróżniana po polu `kind`, więc każdy rodzaj ma tylko swoje pola. Pole `coverFocus` ustawia punkt kadru kafelka (domyślnie środek).

---

## 7. Zadania dla Claude Code

Przy każdym zadaniu wymienione są testy, które są częścią „gotowe gdy”.

### Etap 0 — Fundamenty

- [x] **Z0.1 Repozytorium i projekt.** `git init`, Vite + React + TypeScript (strict), `.gitignore`, `.env.example`, ESLint, Prettier i skrypty `dev`, `build`, `preview`, `lint`, `typecheck`. Do tego README i `CLAUDE.md` z zasadami z pkt 5. Pierwszy commit, a potem wypchnięcie do nowego repozytorium na GitHubie.
      _Gotowe gdy:_ `build`, `lint` i `typecheck` przechodzą, a kod jest na GitHubie.
- [x] **Z0.2 Testy i jakość.** Vitest + React Testing Library + user-event + jsdom, `src/test/setup.ts`, `test-utils.tsx` (renderowanie z routerem i i18n), MSW. Playwright (3 przeglądarki + profil telefonu) z `@axe-core/playwright`. Husky + lint-staged. Skrypty `test`, `test:watch`, `test:coverage`, `test:e2e`.
      _Gotowe gdy:_ jest przykładowy test jednostkowy i przykładowy test e2e, oba przechodzą, a hook pre-commit działa.
- [x] **Z0.3 CI.** Workflow GitHub Actions z pkt 5 (cache npm, raport Playwright jako artefakt przy błędzie). Instrukcja w README, jak włączyć ochronę gałęzi `main`.
      _Gotowe gdy:_ pull request pokazuje zielony status CI.
- [x] **Z0.4 Design tokens i style globalne.** `tokens.css`, fonty przez `@fontsource` z polskimi znakami, reset CSS, ciemne tło z subtelną teksturą lub vignette. Strona testowa `/styleguide` (tylko w trybie dev).
      _Testy:_ e2e sprawdzający, że `/styleguide` się renderuje i nie ma błędów kontrastu (axe).
- [x] **Z0.5 Routing i i18n.** Trasy z prefiksem `/:lang`, przekierowanie z `/`, przełącznik języka zostający na tej samej podstronie, `<html lang>` zmieniający się z językiem, strona 404.
      _Testy:_ jednostkowe dla mapowania tras PL↔EN. E2e: przekierowanie z `/`, przełączanie języka na każdej podstronie, nieznany adres pokazuje 404. Test sprawdzający, że `pl.json` i `en.json` mają te same klucze.
- [x] **Z0.6 Layout.** Header (nawigacja + przełącznik języka), menu hamburger na mobile, Footer z ikonami social media, `src/config/site.ts` według pkt 6. Linki social media otwierają się w nowej karcie z `rel="noopener noreferrer"`.
      _Testy:_ komponentowe (menu otwiera i zamyka się, link aktywnej strony jest wyróżniony, wpis z pustym `url` nie renderuje ikony, a wpis z linkiem renderuje ją z poprawnym `href` i `aria-label`). E2e: nawigacja klawiaturą i na profilu telefonu.

### Etap 1 — Dane i portfolio

- [x] **Z1.1 Model danych.** Schemat zod jako unia rozróżniana po polu `kind` (`figurine` | `painting`), wczytywanie JSON-ów przez `import.meta.glob`, funkcje `getWorks({ kind?, tag? })`, `getFeatured`, `getBySlug`, `getTags(kind?)`. 8 przykładowych prac z obrazkami zastępczymi: 5 figurek (w tym 2 z klatkami 360°) i 3 obrazy (pionowy, poziomy, kwadratowy).
      _Testy:_ jednostkowe dla sortowania, filtrowania po rodzaju i tagu, wyszukiwania po slugu oraz błędu przy niepoprawnym JSON-ie (np. obraz bez `image`, figurka z polem `medium`).
- [x] **Z1.2 Kafelek i siatka.** `WorkCard` i `WorkGrid` (CSS Grid, leniwe ładowanie zdjęć). Kafelki mają jednakowe proporcje, a kadr obrazu bierzemy z `coverFocus`. Mała ikonka rodzaju pracy (figurka lub obraz) i ikonka „360°” dla figurek z klatkami.
      _Testy:_ komponentowe (kafelek pokazuje tytuł w bieżącym języku, tagi, właściwą ikonkę rodzaju i link do szczegółów).
- [x] **Z1.3 Strona Portfolio.** Wstęp i siatka wszystkich prac.
      _Testy:_ e2e (wszystkie prace widoczne, kliknięcie otwiera szczegóły). Zrzuty ekranu przy szerokościach 360, 768 i 1440 px.
- [x] **Z1.4 Filtry.** Przełącznik rodzaju „Wszystko / Figurki / Obrazy” i przyciski tagów. Lista tagów zależy od wybranego rodzaju, a stan filtrów trafia do adresu (`?kind=painting&tag=olej`).
      _Testy:_ komponentowe dla filtrowania i zmiany listy tagów po zmianie rodzaju. E2e: wejście z `?kind=` i `?tag=` pokazuje przefiltrowaną listę.
- [x] **Z1.5 Komponent Turntable (360°).** Obrót przeciąganiem (Pointer Events) i strzałkami, wskaźnik ładowania, autoobrót zatrzymujący się po dotknięciu, pierwsza klatka widoczna od razu, reszta wczytywana w tle. Ma `aria-label` i podpowiedź.
      _Testy:_ jednostkowe dla wyliczania klatki z przesunięcia (zawijanie 35 → 0 → 35). Komponentowe: strzałki zmieniają klatkę, a autoobrót wyłącza się przy `prefers-reduced-motion`. E2e: przeciąganie zmienia klatkę w Chromium i WebKit.
- [x] **Z1.6 Komponent ImageZoom.** Obraz w całości, a po kliknięciu widok pełnoekranowy z powiększaniem kółkiem myszy, szczypaniem i przyciskami +/− oraz przesuwaniem powiększonego obrazu. Wersja w wysokiej rozdzielczości ładuje się dopiero przy powiększeniu. Zamykanie klawiszem Esc lub przyciskiem X, fokus nie ucieka poza widok. Napisz to samodzielnie na Pointer Events albo użyj małej biblioteki (np. `react-zoom-pan-pinch`) z uzasadnieniem w pull requeście.
      _Testy:_ jednostkowe dla ograniczania powiększenia (1×–5×) i przesuwania w granicach obrazu. Komponentowe: Esc zamyka widok, a przyciski +/− zmieniają powiększenie. E2e: szczypanie na profilu telefonu w WebKit.
- [ ] **Z1.7 Strona szczegółów pracy.** Widok zależny od `kind`: dla figurki Turntable albo galeria, dla obrazu ImageZoom oraz technika, wymiary i rok. Wspólne elementy to opis, tagi, linki „Poprzednia / Następna” (w obrębie tego samego rodzaju) i przycisk „Chcę podobną”, który prowadzi do formularza z ustawionym rodzajem zlecenia i nazwą pracy wpisaną w opis.
      _Testy:_ e2e (figurka pokazuje Turntable, obraz pokazuje ImageZoom z wymiarami, nieistniejący slug pokazuje 404, „Chcę podobną” przy obrazie ustawia rodzaj „Obraz” i wypełnia opis).

### Etap 2 — Strona główna

- [ ] **Z2.1 Sekcja Hero.** Dwie kolumny, 100vh, na mobile elementy jeden pod drugim, wskaźnik przewijania.
- [ ] **Z2.2 Przewijanie o cały ekran.** `scroll-snap` między Hero a wyróżnionymi pracami. W razie problemów na iOS snap działa tylko na desktopie.
- [ ] **Z2.3 Wyróżnione prace.** 1–3 prace `featured` z Turntable i przycisk „Zobacz całe portfolio”.
      _Testy (całego etapu):_ e2e (CTA prowadzi do kontaktu, wyróżnione prace są widoczne po przewinięciu, link do portfolio działa), skan axe strony głównej.

### Etap 3 — Kontakt i formularz

- [ ] **Z3.1 Sekcja „O mnie”** z informacją, że Julia przyjmuje zlecenia na malowanie figurek i na obrazy, procesem współpracy i informacją o indywidualnej wycenie.
- [ ] **Z3.2 Dane kontaktowe** z `site.ts`, e-mail zabezpieczony przed botami.
- [ ] **Z3.3 Formularz (frontend).** Pola z pkt 3.3 oparte na react-hook-form i zod (schemat jako unia rozróżniana po rodzaju zlecenia), komunikaty w obu językach. Pola tylko dla obrazu są warunkowe, a parametry `?kind=` i `?ref=` z adresu wypełniają formularz.
      _Testy:_ jednostkowe schematu zod (sam e-mail OK, sam telefon OK, brak obu = błąd, termin w przeszłości = błąd, za krótki opis = błąd, pola obrazu są ignorowane przy figurce). Komponentowe: wybór „Obraz” pokazuje wymiary i technikę, a powrót do figurki je ukrywa i czyści; podpowiedzi opisu i pola zdjęć zmieniają się z rodzajem; `?kind=painting` ustawia rodzaj. Błędy pojawiają się przy właściwych polach i są czytane przez czytnik ekranu (`aria-describedby`).
- [ ] **Z3.4 Dropzone dla zdjęć.** Przeciągnij i upuść lub wybierz plik, miniatury (GIF-y się animują), usuwanie pliku, limit 3 plików po 5 MB i tylko dozwolone typy.
      _Testy:_ komponentowe (odrzuca PDF, odrzuca plik 6 MB, odrzuca czwarty plik, usuwa plik).
- [ ] **Z3.5 Wysyłka.** Netlify Forms: statyczna kopia formularza w `index.html`, wysyłka jako `multipart/form-data`, honeypot. Adres e-mail do powiadomień ustawiamy w panelu Netlify, nie w kodzie.
      Wysyłane dane zawierają pole `kind` i temat z rodzajem zlecenia.
      _Testy:_ komponentowe z MSW (sukces pokazuje potwierdzenie, błąd 500 pokazuje komunikat i zachowuje dane, wypełniony honeypot nie wysyła formularza, przy figurce w żądaniu nie ma pól obrazu). E2e całego przepływu dla obu rodzajów zlecenia z przechwyconym żądaniem.
      _Gotowe gdy:_ po wdrożeniu testowe zgłoszenie ze zdjęciem i GIF-em dociera na skrzynkę Julii.
- [ ] **Z3.6 Polityka prywatności** w PL i EN oraz checkbox zgody.

### Etap 4 — Szlif

- [ ] **Z4.1 Animacje** (IntersectionObserver), z poszanowaniem `prefers-reduced-motion`.
- [ ] **Z4.2 SEO.** Prerendering wszystkich tras, tytuły i opisy stron w obu językach, `hreflang`, sitemap, robots.txt, obrazki OG, dane strukturalne `Person`.
      _Testy:_ e2e sprawdzający, że zbudowany HTML każdej trasy zawiera `<title>`, opis i `hreflang` jeszcze przed uruchomieniem JS.
      _Uwaga (przegląd Etapu 0):_ prerendering musi ustawić `<html lang>` osobno dla każdej trasy (teraz robi to `Layout` w przeglądarce, a `index.html` ma na sztywno `pl`). Rok w stopce (`new Date().getFullYear()`) brać z czasu budowania, żeby HTML zbudowany w grudniu nie dawał błędu hydracji w styczniu.
- [ ] **Z4.3 Wydajność.** WebP/AVIF z `srcset`, dzielenie kodu na trasy (code splitting), preload fontów. Lighthouse CI w GitHub Actions z progiem ≥ 90.
- [ ] **Z4.4 Dostępność.** Skan axe na każdej podstronie w obu językach jako stały test e2e, fokus widoczny, teksty alternatywne.

### Etap 5 — Publikacja

- [ ] **Z5.1 Hosting.** Netlify połączone z GitHubem, wdrożenie `main` i podglądy pull requestów. Powiadomienia formularza idą na `dwolnik12310@gmail.com` (ustawiane w panelu Netlify: Forms → Form notifications). Zmienna `VITE_SITE_URL` jest ustawiona w panelu.
- [ ] **Z5.2 Domena.** Na etap testów używamy darmowej subdomeny Netlify **`masterpiecefigurinej.netlify.app`** (nazwa do ustawienia w Site settings). Docelowa domena to **`masterpiecefigurinej.com`**. W adresach używamy małych liter, a w logo i tekstach zapisu „MasterpieceFigurineJ”. Własną domenę podpinamy później: podpięcie, HTTPS i przekierowanie z `www`. Wszystkie adresy (sitemap, OG, `hreflang`) bierzemy ze zmiennej `SITE_URL`, więc zmiana domeny nie wymaga zmian w kodzie.
- [ ] **Z5.3 Test dymny po wdrożeniu.** Playwright uruchamiany na produkcyjnym adresie: strony się ładują, formularz jest widoczny, brak błędów w konsoli.
- [ ] **Z5.4 Instrukcja dla Julii.** Jak sfotografować figurkę do obrotnicy, jak sfotografować lub zeskanować obraz (rozproszone światło, bez odblasków, prosto na wprost) i jak dodać nową pracę każdego rodzaju (JSON + zdjęcia + commit).

### Etap 6 — Przyszłość (po starcie strony)

- [ ] **Z6.1 Panel CMS.** Decap CMS (lub podobny CMS na Gicie) do dodawania prac z poziomu przeglądarki: osobne kolekcje „Figurki” i „Obrazy” odpowiadające schematowi JSON oraz upload okładki, klatek 360° i obrazów w wysokiej rozdzielczości. Logowanie tylko dla Julii.
- [ ] **Z6.2 Modele 3D** jako alternatywa dla obrotnicy (opcjonalnie).

---

## 8. Otwarte pytania

1. Docelowy e-mail do zgłoszeń. Na razie testowy `dwolnik12310@gmail.com`, a zmiana to jedna linijka w `site.ts` i ustawienie w Netlify.
2. Linki do social media. Na razie puste pola w `site.ts`.
3. Logo. Na razie napis „MasterpieceFigurineJ” fontem Cinzel.

## 9. Decyzje

| Data       | Decyzja                                                                      |
| ---------- | ---------------------------------------------------------------------------- |
| 2026-11-25 | React + TypeScript + Vite                                                    |
| 2026-11-25 | Języki PL (domyślny) i EN                                                    |
| 2026-11-25 | Bez cen na stronie, wycena indywidualna                                      |
| 2026-11-25 | Prace jako pliki JSON w repozytorium, CMS w Etapie 6                         |
| 2026-11-25 | Podgląd 360° jako obrotnica zdjęć                                            |
| 2026-11-25 | Testy: Vitest + RTL + MSW + Playwright + axe                                 |
| 2026-11-25 | Git + GitHub, CI w GitHub Actions, hosting Netlify                           |
| 2026-11-25 | Na testy darmowa subdomena `*.netlify.app`                                   |
| 2026-11-25 | Portfolio zawiera dwa rodzaje prac: figurki i obrazy                         |
| 2026-11-25 | Formularz przyjmuje zlecenia na figurki i na obrazy (pole „Rodzaj zlecenia”) |
| 2026-11-25 | Artystka: Julia; marka i domena: MasterpieceFigurineJ.com                    |
| 2026-11-25 | E-mail testowy do zgłoszeń: dwolnik12310@gmail.com                           |
| 2026-11-25 | Social media jako edytowalne pola w `site.ts`; pusty link = ikona ukryta     |
| 2026-11-25 | Repozytorium GitHub prywatne                                                 |
| 2026-11-26 | React 19 i TypeScript 6 (TS 7 jeszcze nieobsługiwany przez typescript-eslint) |
| 2026-11-26 | ESLint + Prettier zamiast oxlint z szablonu Vite                             |
| 2026-11-26 | Repozytorium publiczne (ochrona `main` bez GitHub Pro); być może Pro w przyszłości |
| 2026-11-26 | Dodatkowy kolor `#D06A5F` na tekst błędów (WCAG AA); `#7A1F1F` tylko na tło i ramki |
| 2026-11-26 | Fonty zmienne `@fontsource-variable` (Cinzel, Inter) zamiast stałych grubości |
| 2026-11-26 | Slug z innego języka (np. `/en/kontakt`) przekierowuje na właściwy adres (`/en/contact`); nieznany adres pokazuje 404 |
| 2026-11-26 | Wykrywanie języka przeglądarki bez dodatkowej biblioteki; `public/_redirects` dla Netlify (SPA fallback) |
| 2026-11-26 | Header przyklejony (sticky); menu hamburger poniżej 900 px; skip link „Przejdź do treści” |
| 2026-11-26 | `site.brand` = „MasterpieceFigurineJ” (zapis z pkt Z5.2), a nie „Masterpiece Figurine J” z przykładu w pkt 6 |
