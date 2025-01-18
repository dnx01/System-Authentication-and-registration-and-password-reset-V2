# Sistem de Autentificare cu Node.js și Express

Această aplicație web este un exemplu complet de sistem de autentificare și gestionare a utilizatorilor, construit cu Node.js și Express. Este concepută pentru a oferi funcționalități esențiale de gestionare a utilizatorilor, cum ar fi înregistrarea, autentificarea, resetarea parolelor și trimiterea de emailuri, utilizând biblioteci populare.

---

## Funcționalități principale

### 1. Înregistrare utilizatori
- Validare a datelor de intrare (username, email, parolă etc.) folosind schema definită cu `fastest-validator`.
- Parolele sunt criptate cu `bcrypt` înainte de a fi stocate în baza de date MongoDB.
- Generare de email de bun venit utilizând `nodemailer`.

### 2. Autentificare utilizatori
- Verificare a datelor de autentificare și confirmare a parolei cu ajutorul `bcrypt`.
- Redirecționare la o pagină de bun venit în cazul autentificării cu succes.

### 3. Resetarea parolelor
- Verificare a existenței unui utilizator pe baza datelor furnizate (email, username, data nașterii etc.).
- Generare de linkuri temporare pentru resetarea parolei.
- Trimiterea unui email cu link-ul de resetare.
- Criptarea și salvarea noii parole.

### 4. Erori gestionate
- Erori de validare și de conectare la baza de date sunt gestionate corespunzător.
- Pagină de eroare generală pentru erorile serverului.

### 5. Emailuri automate
- Integrare cu `nodemailer` pentru trimiterea de emailuri:
  - Emailuri de bun venit.
  - Emailuri pentru resetarea parolelor.
  - Confirmări de resetare a parolei.

### 6. Conectare la MongoDB
- Folosește `mongoose` pentru gestionarea modelelor și conexiunilor la baza de date MongoDB.

---

## Biblioteci utilizate
- **Express**: Framework minimalist pentru aplicația web.
- **Mongoose**: ORM pentru interacțiunea cu MongoDB.
- **Body-parser**: Parsare a datelor din cererile HTTP.
- **Nodemailer**: Trimiterea de emailuri.
- **Fastest-validator**: Validare rapidă a datelor de intrare.
- **Bcrypt**: Criptare a parolelor.
- **UUID**: Generare de identificatori unici.

---

## Configurații

- **Baza de date**: MongoDB local (`mongodb://localhost:27017/web_app_db`).
- **Portul serverului**: 3000 (sau specificat prin `process.env.PORT`).
- **Email**: Configurat pentru trimiterea de emailuri cu Gmail (necesită parola aplicației).

---

## Cum să rulezi proiectul

1. Clonează acest repository:
    ```bash
    git clone https://github.com/dnx01/System-Authentication-and-registration-and-password-reset-V2.git
    ```

2. Accesează directorul proiectului:
    ```bash
    cd proiect-autentificare
    ```

3. Instalează dependențele:
    ```bash
    npm install
    ```

4. Configurează `nodemailer` cu datele tale de autentificare (email și parola aplicației):
   - Creează un fișier `.env`:
     ```env
     EMAIL_USER=adresa_ta_email@gmail.com
     EMAIL_PASS=parola_aplicatiei
     ```

5. Asigură-te că MongoDB este pornit:
    ```bash
    mongod
    ```

6. Rulează aplicația:
    ```bash
    npm start
    ```

7. Accesează aplicația în browser la adresa:
    ```
    http://localhost:3000/login
    ```

---

## Scop

Acest proiect este ideal pentru dezvoltatorii care doresc să învețe cum să implementeze un sistem de autentificare complet și sigur utilizând Node.js și Express. De asemenea, poate fi extins pentru proiecte mai mari sau utilizat ca bază pentru aplicații personalizate.

---

## Contribuie
Dacă ai sugestii sau dorești să contribui, trimite un pull request sau deschide un issue.

---

## Licență
Acest proiect este licențiat sub [MIT License](LICENSE).
