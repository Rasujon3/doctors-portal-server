const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3l9g8.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000;

app.get('/',(req,res)=>{
    res.send('Hello from db it is working')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointCollection = client.db("doctorsPortal").collection("appointments");
  const doctorCollection = client.db("doctorsPortal").collection("doctors");
  app.post('/addAppointment',(req,res)=>{
    const appointment = req.body;
    // console.log(appointment);
    appointCollection.insertOne(appointment)
    .then(result =>{
        res.send(result.insertedCount > 0)

    })
  });



  app.post('/addAppointmentsByDate',(req,res)=>{
    const date = req.body;
    const email = req.body.email;
    doctorCollection.find({email: email})
    .toArray((err,doctors)=>{
      const filter = {date: date.date};
        if (doctors.length === 0) {
          filter.email = email;
        }
        appointCollection.find(filter)
          .toArray((err,documents)=>{
            res.send(documents);
        })
    })

    appointCollection.find({date: date.date})
    .toArray((err,documents)=>{
        res.send(documents);
    })
  });

  app.get('/appointments', (req, res) => {
    appointCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
});

app.post('/addADoctor', (req, res) => {
  const file = req.files.file;
  const name = req.body.name;
  const email = req.body.email;
  const newImg = file.data;
  const encImg = newImg.toString('base64');

  var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
  };

  doctorCollection.insertOne({ name, email, image })
      .then(result => {
          res.send(result.insertedCount > 0);
      })
});

  app.get('/doctors', (req, res) => {
    doctorCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
});

app.post('/isDoctor',(req,res)=>{
  const email = req.body.email;
  doctorCollection.find({email: email})
  .toArray((err,doctors)=>{
    res.send(doctors.length > 0);
    
  })
})


});

app.listen(process.env.PORT || port);
