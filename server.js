const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');


const app = express();
const PORT = 3000;
const commentsFile = path.join(__dirname, 'comments.json');
const yamlFilePath = path.join(__dirname, 'dane.yaml');

// Middleware do parsowania JSON i serwowania plików statycznych
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint GET - zwraca zawartość pliku YAML jako string
app.get('/api', (req, res) => {
    fs.readFile(yamlFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Błąd odczytu pliku:', err); // Log błędu do konsoli
            return res.status(500).send('Błąd podczas odczytu pliku.');
        }
        res.type('text/plain').send(data);
    });
});

// Endpoint POST - zapisuje plain text lub obiekt JSON do pliku YAML
app.post('/api', (req, res) => {
    let newYamlData;

    // Sprawdź, czy dane są w formacie JSON
    if (req.is('application/json')) {
        newYamlData = JSON.stringify(req.body, null, 2); // Konwertuj obiekt JSON na string
    } else {
        newYamlData = req.body; // Odbierz dane jako plain text
    }

    // Upewnij się, że dane są typu string
    if (typeof newYamlData !== 'string') {
        return res.status(400).send('Dane muszą być w formacie tekstowym lub JSON.');
    }

    // Zapisz dane do pliku YAML, nadpisując całą jego zawartość
    fs.writeFile(yamlFilePath, newYamlData, (err) => {
        if (err) {
            console.error('Błąd zapisu pliku:', err); // Log błędu do konsoli
            return res.status(500).send('Błąd podczas zapisywania do pliku.');
        }
        res.send('Dane zostały zapisane.');
    });
});

// Przechowuj hasło hashowane (przykład, w rzeczywistości użyj zmiennych środowiskowych lub bezpieczniejszego rozwiązania)
const storedPasswordHash = '$2a$10$3jkXRm71hotOnBOZMJefwOlCV1eXG4Fo2h0uJxIQFccIFxU0UslUu'; // Przykładowy hash

// Endpoint do logowania
app.post('/login', async (req, res) => {
    const { password } = req.body;

    // Logowanie podanego hasła
    console.log('Podane hasło:', password);

    try {
        // Generowanie hasha z podanego hasła
        const hashedPassword = await bcrypt.hash(password, 10);

        // Logowanie zahardcodowanego hasła
        console.log('Hash podanego hasła:', hashedPassword);

        // Porównywanie hasła
        const match = await bcrypt.compare(password, storedPasswordHash);

        if (match) {
            console.log('Hasło poprawne.');
            res.status(200).send('Zalogowano pomyślnie');
        } else {
            console.log('Hasło niepoprawne.');
            res.status(401).send('Niepoprawne hasło');
        }
    } catch (error) {
        console.error('Błąd serwera:', error);
        res.status(500).send('Błąd serwera');
    }
});

// Endpoint do pobierania komentarzy
app.get('/comments', (req, res) => {
    fs.readFile(commentsFile, (err, data) => {
        if (err) {
            return res.status(500).send('Błąd odczytu danych.');
        }
        const comments = JSON.parse(data || '{}');
        res.json(comments);
    });
});

// Endpoint do dodawania komentarzy
app.post('/add-comment', (req, res) => {
    const { player, comment } = req.body;

    fs.readFile(commentsFile, (err, data) => {
        if (err) {
            return res.status(500).send('Błąd odczytu danych.');
        }
        const comments = JSON.parse(data || '{}');
        comments[player] = comment;

        fs.writeFile(commentsFile, JSON.stringify(comments), (err) => {
            if (err) {
                return res.status(500).send('Błąd zapisu danych.');
            }
            res.status(200).send('Komentarz zapisany.');
        });
    });
});


// Endpoint do usuwania komentarzy
app.post('/delete-comment', (req, res) => {
    const { player } = req.body;

    fs.readFile(commentsFile, (err, data) => {
        if (err) {
            return res.status(500).send('Błąd odczytu danych.');
        }
        const comments = JSON.parse(data || '{}');
        delete comments[player];

        fs.writeFile(commentsFile, JSON.stringify(comments), (err) => {
            if (err) {
                return res.status(500).send('Błąd zapisu danych.');
            }
            res.status(200).send('Komentarz usunięty.');
        });
    });
});

// Uruchom serwer
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
