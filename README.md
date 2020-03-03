# LogisticsReceiveHelper

Aplikacja napisana za pomocą: 
- Angular v7.2.0
- Ionic 5
- Firebase (Auth, DB) - komunikacja odbywa się za pomocą wysyłania żądań HTTP
- Konwersja na wersję mobilną przy użyciu IONIC/Capacitor

# Zamysł aplikacji

Aplikacja napisana w oparciu o doświadczenie w branży logistycznej. Appka służy do zliczania poszczególnych produktów (podaje dokładną ilość palet, kartonów na palecie oraz podsumowanie) - Dzięki aplikacji średnio na dostawie byłem w stanie zaoszczędzić parę minut (ponieważ wszystko zostało zliczone przez appke)

Aplikacja wygląda śmiesznie na desktopie, ponieważ nie za dużo jest do pokazania. Za to wygląda nienagannie na telefonie (bo tylko tam była potrzebna)

### Żeby uruchomić aplikację u siebie należy

* src/environment/environment.prod.ts ALBO src/environment/environment.ts 
* functions/credential.json (tam dodać dane logowania do firebase)
* npm init a potem npm start - albo jak mamy Angular CLI to ng serve

### Screenshoty z appki

Panel sterowania        |  Opcje            | Menu przypisań         | Panel boczny
:-------------------------:|:-------------------------:|:-------------------------:|:-------------------------:
<img src="https://user-images.githubusercontent.com/59890819/72463235-10573800-37d3-11ea-96de-b3e47fd12915.PNG" width="150" alt=""> | <img src="https://user-images.githubusercontent.com/59890819/72463265-1f3dea80-37d3-11ea-867a-c229795e7b62.PNG" width="150" alt=""> |<img src="https://user-images.githubusercontent.com/59890819/72463281-295fe900-37d3-11ea-8019-a1ddb5bc440d.PNG" width="150" alt=""> | <img src="https://user-images.githubusercontent.com/59890819/72463296-3381e780-37d3-11ea-8008-1cef278dedeb.PNG" width="150" alt="">

Zarządzanie produktami            | Generator kodów kreskowych        | Baza | Auth
:-------------------------:|:-------------------------:|:-------------------------:|:-------------------------:
<img src="https://user-images.githubusercontent.com/59890819/72463313-3d0b4f80-37d3-11ea-9b4e-c3506e964317.PNG" width="150" alt=""> |<img src="https://user-images.githubusercontent.com/59890819/72463331-472d4e00-37d3-11ea-8302-4ee0f424d835.PNG" width="150" alt=""> | <img src="https://user-images.githubusercontent.com/59890819/72464717-1b5f9780-37d6-11ea-8fca-d9c2d28ef339.PNG" width="150" alt=""> | <img src="https://user-images.githubusercontent.com/59890819/72464830-5235ad80-37d6-11ea-967d-24eecb10df0c.PNG" width="150" alt="">
