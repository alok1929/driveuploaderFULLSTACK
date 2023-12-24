import pkg from '@googleapis/drive';
import fs from 'fs';
import express from 'express';
import mutler from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();



const { google } = pkg;
const app = express();
app.use(express.json());
app.use(cors());

const storage = mutler.diskStorage({
    destination: 'uploads/', // Save files in the 'uploads' directory
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original filename
    },
  });
  const upload = mutler({ storage: storage });
  
// Read client ID and secret from environment variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "940082298886-3tavmhlckfolgtamt9ro4qfjpmg6fgio.apps.googleusercontent.com";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "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";
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/google/redirect';

// Create OAuth2 client
const oauth2Client = new pkg.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

oauth2Client.setCredentials({
    access_token: "ya29.a0AfB_byBu6GMl_h8aYYsnuZoQD3MEb_MIOgv6y4fhF0YDO9GS_mg5fM1KxbD5I2JNB-Xaj1js_z2Dnm2JLgOwGpvOuq89MwHYGZD6pm0R2N5TQlSjQxomJ2FaQG7aoV_s0i3jz3trDczb9emyjKgExgSohwnXopveZOPUaCgYKAWkSARASFQHGX2Miys3vypteeMEfJRUZo3xJfg0171",
    refresh_token:"1//0gRfNlDn19xDHCgYIARAAGBASNwF-L9Iri8zCOktsNMAkccFlokXbJR8mkhUMEEF1mypgEujm54rwiaPkhJ8C2nifsVPxc6Q_IEc",
    expiry_date: "1703418264210"   
  });
  

// Set up routes
app.get('/auth/google', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/drive'
        ],
    });
    res.redirect(url);
});

app.get('/getImages', (req, res) => {
    const uploadsFolder = 'uploads'; // Path to your uploads folder
    fs.readdir(uploadsFolder, (err, files) => {
        if (err) {
            console.error('Error reading uploads folder:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(files);
        }
    });
});


app.get('/google/redirect', async (req, res) => {
    const { code } = req.query;

    try {
        const { tokens } = await oauth2Client.getToken(code);
        if (!tokens) {
            throw new Error('No tokens received from Google API.');
        }
        oauth2Client.setCredentials(tokens);

        // Save tokens to creds.json
        fs.writeFileSync('creds.json', JSON.stringify(tokens));

        res.send('Successfully obtained credentials.');
    } catch (error) {
        console.error('Error getting tokens:', error);
        res.status(500).send('Error obtaining credentials');
    }
});

app.post('/uploadImage', upload.single('imagefile'), async (req, res) => {
    try {
      // Access the uploaded file using req.file.path
      const imagePath = req.file.path;
        console.log("this is the path",imagePath)
      // Upload the image to Google Drive
      const drive = pkg.drive({ version: 'v3', auth: oauth2Client });
  
      const r = await drive.files.create({
        requestBody: {
          name: imagePath,
          mimeType: 'image/png',
        },
        media: {
          mimeType: 'image/png',
          body: fs.createReadStream(imagePath),
        },
      });
  
      res.send('Image uploaded to Google Drive successfully.');
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).send('Error uploading image to Google Drive');
    }
  })
  



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
});
