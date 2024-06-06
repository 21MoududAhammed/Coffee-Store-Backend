const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.kttkhnp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // create a database and collection
    const coffeesCollection = client.db("coffeesDB").collection("coffees");

    // create a item
    app.post("/coffees", async (req, res) => {
      try {
        const data = req.body;
        const result = await coffeesCollection.insertOne(data);
        if (result.acknowledged && result.insertedId) {
          return res
            .status(201)
            .json({ message: "Item created", id: result.insertedId });
        }
      } catch (err) {
        res
          .status(500)
          .json({ message: "Item has not been created", error: err.message });
      }
    });

    // get all items
    app.get("/coffees", async (req, res) => {
      try {
        const cursor = await coffeesCollection.find();
        const items = await cursor.toArray();
        console.log(items);
        res.status(200).json(items);
      } catch (err) {
        res.status(500).json({ message: "Not Found", error: err.message });
      }
    });

    // retrieve a item by id
    app.get("/coffees/:id", async (req, res) => {
      try {
        const query = { _id: new ObjectId(req.params.id) };
        const result = await coffeesCollection.findOne(query);
        if (result) {
          res.status(200).json(result);
        } else {
          res.status(404).json({ message: "Item not found" });
        }
      } catch (err) {
        res.status(500).json({message: 'Failed to retrieve item', error: err.message})
      }
    });

    // update a item 
    app.put('/coffees/:id', async(req, res)=>{
        try{
            const filter = {_id: new ObjectId(req.params.id)}
            const options = {upsert: true}
            const updatedItem = {
                $set:{
                    ...req.body
                }
            }

            const result = await coffeesCollection.updateOne(filter, updatedItem, options);
            console.log(result);
            res.status(200).json(result)

        }catch(err){
            res.status(500).json({message: 'Failed to update', error: err.message})
        }
    })

    // delete a item by id
    app.delete("/coffees/:id", async (req, res) => {
      try {
        const query = { _id: new ObjectId(req.params.id) };
        const result = await coffeesCollection.deleteOne(query);
        if (result.deletedCount === 1) {
          res.status(200).json({ message: "Item deleted", result: result });
        } else {
          res.status(404).json({ message: "Item not found" });
        }
      } catch (err) {
        res
          .status(500)
          .json({ message: "Item has not been deleted", error: err.message });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
