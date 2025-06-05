const {onRequest} = require('firebase-functions/v2/https');
const {initializeApp} = require('firebase-admin/app');
const {VertexAI} = require('@google-cloud/vertexai');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();
initializeApp();

const project = process.env.PROJECT_ID;
const location = process.env.LOCATION;
const vertexAI = new VertexAI({project, location});

const model = vertexAI.getGenerativeModel({
    model: process.env.MODEL,
    safetySettings: [],
});

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

exports.sendErrorReport = onRequest({region: location}, async (req, res) => {
    try {
        const {appName, errorMessage, url} = req.body;

        if (!errorMessage) {
            res.status(400).send('Brak treści błędu.');
            return;
        }

        const prompt = `
Otrzymano zgłoszenie błędu z aplikacji:
- Nazwa aplikacji: ${appName}
- Treść błędu: ${errorMessage}
- URL: ${url || 'brak'}

Podaj możliwe przyczyny błędu oraz sugestie dotyczące jego naprawy w punktach.
`;

        const result = await model.generateContent({
            contents: [{role: 'user', parts: [{text: prompt}]}],
        });

        const suggestions = result.response.candidates?.[0]?.content?.parts?.[0]?.text || 'Brak sugestii.';

        const recipients = process.env.RECIPIENTS.split(',');

        await transporter.sendMail({
            from: `"Zgłoszenie błędu" <${process.env.SMTP_USER}>`,
            to: recipients,
            subject: 'Nowe zgłoszenie błędu z aplikacji Angular',
            html: `
        <h2>Nowe zgłoszenie błędu</h2>
        <p><strong>Nazwa aplikacji:</strong> ${appName}</p>
        <p><strong>Treść błędu:</strong> ${errorMessage}</p>
        <p><strong>URL:</strong> ${url || 'brak'}</p>
        <h3>Sugestie naprawy:</h3>
        <pre>${suggestions}</pre>
      `,
        });

        res.status(200).send('Zgłoszenie błędu zostało przetworzone.');
    } catch (err) {
        console.error('Błąd podczas przetwarzania zgłoszenia:', err);
        res.status(500).send('Wystąpił błąd serwera.');
    }
});
