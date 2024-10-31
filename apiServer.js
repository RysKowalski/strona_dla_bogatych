const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const yamlFilePath = path.join(__dirname, 'dane.yaml');

// Middleware do parsowania tekstu jako plain text oraz JSON
app.use(bodyParser.text());
app.use(bodyParser.json()); // Dodaj parsowanie JSON

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

// Uruchom serwer API
app.listen(PORT, () => {
    console.log(`Serwer API działa na porcie ${PORT}`);
});
