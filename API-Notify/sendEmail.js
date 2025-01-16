import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(bodyParser.json());

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'diostesalveclinica@gmail.com',
    pass: 'xnnc ukmq pqzw dkbs'
  }
});

// Ruta para recibir notificaciones de fallos de microservicios
app.post('/send-notification', (req, res) => {
  const { serviceName } = req.body;
  
  const mailOptions = {
    from: 'diostesalveclinica@gmail.com',
    to: '',
    subject: `Fallo en el microservicio ${serviceName}`,
    text: `El microservicio ${serviceName} ha fallado. Por favor, revisa el estado.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo electrónico:', error);
      res.status(500).send('Error al enviar el correo electrónico');
    } else {
      console.log('Correo electrónico enviado correctamente:', info.response);
      res.status(200).send('Correo electrónico enviado correctamente');
    }
  });
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
