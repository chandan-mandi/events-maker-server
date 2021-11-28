const express = require('express')
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient } = require('mongodb');
require('dotenv').config();
const objectId = require('mongodb').ObjectId;

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
    const pricingTableCollection = database.collection("Pricing-Table");
    const ordersCollection = database.collection('Orders');

    // POST ORDER DETAILS
    app.post("/orders", async(req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.json(result)
    })
    // GET ALL ORDER DATA
    app.get("/orders", async(req, res) => {
      const cursor = ordersCollection.find({})
      const result = await cursor.toArray()
      res.json(result)
    })
    // GET MYORDERS
    app.get("/myOrders/:email", async(req, res) => {
      const email = req.params.email;
      const query = {email : email};
      const myOrders = await ordersCollection.find(query).toArray();
      res.json(myOrders)
    })
    // UPDATE SINGLE ORDER DATA
    app.patch("/orders/:id", async(req, res) => {
      const id = req.params.id;
      const updatingOrder = req.body;
      const filter = {_id: objectId(id)}
      const options = {upsert: true};
      const updateDoc = {
        $set: {
          status: updatingOrder.status
        },
      };
      const result = await ordersCollection.updateOne(filter, updateDoc, options);
      res.json(result)
    })

    //GET ALL PRICING DATA
    app.get('/pricing', async(req, res) => {
      const cursor = pricingTableCollection.find({});
      const result = await cursor.toArray();
      res.json(result)
    })

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
    // USER COLLECTION ADDED ADMIN ROLE / UPDATE ROLE FOR ADMIN
    app.put('/users/admin', async(req, res) => {
      const user = req.body;
      const filter = {email: user.email}
      const updateDoc = {$set: {role: 'admin'}}
      const result = await usersCollection.updateOne(filter, updateDoc);
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
  res.send('Hello From Event Maker!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
/* 
git add .
git commit -m "first"
git push 
heroku login
heroku create
you can update url heroku
git push heroku main
*/