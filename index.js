const express = require('express')
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient } = require('mongodb');
require('dotenv').config()

//middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.islim.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    console.log('database is Connected')
    const database = client.db("eventsMaker")
    const specialServicesCollection = database.collection("Special-Services");
    const servicesCollection = database.collection("services");
    const usersCollection = database.collection("User-Collection");

    // POST USER DATA API
    app.post('/users', async(req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result)
    })
    // USERS DATA UPDATE API
    app.put('/users', async(req, res) => {
      const user = req.body;
      console.log(user)
      const filter = {email: user.email};
      const options = {upsert: true};
      const updateDoc = {$set: user}
      const result = await usersCollection.updateOne(filter, updateDoc, options)
      res.json(result)
    })
    // ADMIN ROLE FINDER
    app.get('/users/:email', async(req, res) => {
      const email = req.params.email;
      const query = {email: email}
      const user = await usersCollection.findOne(query)
      let isAdmin = false;
      if(user?.role === 'admin'){
        isAdmin = true;
      }
      res.json({admin: isAdmin});
    })

    // GET ALL SPECIAL SERVICES
    app.get('/specialServices', async(req,res) => {
      const cursor = specialServicesCollection.find({})
      const result = await cursor.toArray();
      res.send(result)
    }) 
    // GET ALL SERVICES
    app.get('/services', async(req, res) => {
      const cursor = servicesCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    })
  }
  finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})