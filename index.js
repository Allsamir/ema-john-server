require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.DATABASE_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productCollection = client.db("emaJohnDB").collection("products");

    app.get("/products", async (req, res) => {
      const page = parseInt(req.query.page);
      const itemsPerPage = parseInt(req.query.itemsPerPage);
      const skip = (page - 1) * itemsPerPage;
      const result = await productCollection
        .find()
        .skip(skip)
        .limit(itemsPerPage)
        .toArray();
      const totalProducts = await productCollection.estimatedDocumentCount();
      res.send({ result, totalProducts });
    });

    app.post("/productIDs", async (req, res) => {
      const ids = req.body;
      const idsWithObjectID = ids.map((id) => new ObjectId(id));
      console.log(idsWithObjectID);
      const productsThatAreInLocalStorage = await productCollection
        .find({ _id: { $in: idsWithObjectID } })
        .toArray();
      res.send(productsThatAreInLocalStorage);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("john is busy shopping");
});

app.listen(port, () => {
  console.log(`ema john server is running on port: ${port}`);
});
