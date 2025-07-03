const {onValueCreated} = require('firebase-functions/v2/database');
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
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        ciphers: 'SSLv3'
    }
});

exports.sendErrorReport = onValueCreated({
    region: location,
    ref: '/errorReports/{pushId}',
}, async (event) => {
    console.info('Received event');
    try {
        const value = event.data.val();
        const {appName, errorMessage, url} = value;

        if (!errorMessage) {
            console.warn('Brak treści błędu.');
            return;
        }

        const prompt = `
        Jesteś doświadczonym inżynierem aplikacji, 
        specjalizujesz się w aplikacjach front-end, 
        dostałeś zgłoszenie dotyczące aplikacji hostowanej na Firebase:
        - Nazwa aplikacji: ${appName}
        - Treść błędu: ${errorMessage}
        - URL: ${url || 'brak'}
        
        Podaj możliwe przyczyny błędu oraz sugestie dotyczące jego naprawy w punktach. 
        (Podaj tylko potencjalne przyczyny i sugestie, bez dodatkowych komentarzy)
        `;

        const result = await model.generateContent({
            contents: [{role: 'user', parts: [{text: prompt}]}],
        });

        const suggestions = result.response.candidates?.[0]?.content?.parts?.[0]?.text || 'Brak sugestii.';

        const recipients = process.env.RECIPIENTS.split(',');

        const mailOptions = {
            from: `"Zgłoszenie błędu" <${process.env.SMTP_SENDER}>`,
            to: recipients,
            subject: 'Nowe zgłoszenie błędu z aplikacji Angular',
            html: `
        <h2>Nowe zgłoszenie błędu</h2>
        <p><strong>Nazwa aplikacji:</strong> ${appName}</p>
        <p><strong>Treść błędu:</strong> ${errorMessage}</p>
        <p><strong>URL:</strong> ${url || 'brak'}</p>
        <h3>Sugestie naprawy:</h3>
        <pre>${suggestions}</pre>
        `
        }

        await transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.error('Error during sending message: ', err);
            } else {
                console.info('Message sent to recipients: ', recipients);
            }
        });

    } catch (err) {
        console.error('Error during event processing: ', err);
    }
});
