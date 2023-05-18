const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.66lxfzt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyCollection = client.db('toyProducts').collection('toy')

    const indexKey = { name: 1};
    const indexOption = { name: 'name' }

    const result = await toyCollection.createIndex(indexKey, indexOption)


    // ---------- Get 20 toys by using limit------
    app.get('/toys', async (req, res) => {
      const result = await toyCollection.find().limit(20).toArray()
      res.send(result)
    })

    // ----------get all toys search by email----------
    app.get('/myToys/:email', async(req,res)=>{
      const email = req.params.email;
      const result = await toyCollection.find({email : email}).toArray()
      res.send(result)
      
    })

    // ---------search toy by name-----------
    app.get('/searchToy/:text', async(req,res)=>{
      const text = req.params.text;
      const result = await toyCollection.find({
        $or : [{name : {$regex:text , $options : "i"} }]
      }).toArray()
      res.send(result)
    })

    // -----show toy details by id-----
    app.get('/toy/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id :  new ObjectId(id)}
      const result = await toyCollection.findOne(query)
      res.send(result)
    })
    // ----------inset data into database-------------
    app.post('/addToy', async (req, res) => {
      const body = req.body
      const result = await toyCollection.insertOne(body);
      res.send(result)
    })

    // -----------delete data form data base-----------
    app.delete('/toy/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await toyCollection.deleteOne(query)
      res.send(result)
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('toy bazar is running')
})

app.listen(port, () => {
  console.log(`listening on port ${port}`);
})
