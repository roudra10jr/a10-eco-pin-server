const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleware:
app.use(cors());
app.use(express.json());

const uri =
	"mongodb+srv://ecopindbUser:lFgOdqiE10WimWR6@cluster0.cc5jffg.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

app.get("/", (req, res) => {
	res.send("EcoPin server is perfectly running");
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();

		const db = client.db("eco_db");
		const issuesCollection = db.collection("issues");

		// issues related API's :
		app.get("/issues", async (req, res) => {
			const cursor = issuesCollection.find();
			const result = await cursor.toArray();
			res.send(result);
		});

		app.get("/recent-issues", async (req, res) => {
			const cursor = issuesCollection.find().sort({ date: -1 }).limit(6);
			const result = await cursor.toArray();
			res.send(result);
		});

		app.post("/issues", async (req, res) => {
			const newIssue = req.body;
			const result = await issuesCollection.insertOne(newIssue);
			res.send(result);
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

app.listen(port, () => {
	console.log(`EcoPin server is running on port: ${port}`);
});
