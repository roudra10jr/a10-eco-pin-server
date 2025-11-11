const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
		const contributionCollection = db.collection("contribution");
		const usersCollection = db.collection("users");

		// user related api's
		app.post("/users", async (req, res) => {
			const newUser = req.body;
			const email = newUser.email;
			const query = { email: email };

			const existingUser = await usersCollection.findOne(query);

			if (existingUser) {
				res.send({ message: "This user already exist" });
			} else {
				const result = await usersCollection.insertOne(newUser);
				res.send(result);
			}
		});

		// issues related API's :
		app.get("/issues", async (req, res) => {
			const email = req.query.email;
			const query = {};
			if (email) {
				query.email = email;
			}
			const cursor = issuesCollection.find(query);
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

		app.get("/issues/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await issuesCollection.findOne(query);
			res.send(result);
		});

		app.delete("/issues/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await issuesCollection.deleteOne(query);
			res.send(result);
		});

		app.patch("/issues/:id", async (req, res) => {
			//console.log(req.params.id);

			const id = req.params.id;
			const updatedIssue = req.body;
			const query = { _id: new ObjectId(id) };

			const update = {
				$set: updatedIssue,
			};
			const options = {};
			const result = await issuesCollection.updateOne(
				query,
				update,
				options
			);
			res.send(result);
		});

		// contribution related api's:
		app.get("/contributions", async (req, res) => {
			const email = req.query.email;
			const query = {};
			if (email) {
				query.email = email;
			}

			const cursor = contributionCollection.find(query);
			const result = await cursor.toArray();
			res.send(result);
		});

		app.post("/contributions", async (req, res) => {
			const newContribution = req.body;
			const result = await contributionCollection.insertOne(
				newContribution
			);
			res.send(result);
		});

		app.get("/issue/contributions/:issueId", async (req, res) => {
			const issueId = req.params.issueId;
			const query = { issueId: issueId };
			const cursor = contributionCollection
				.find(query)
				.sort({ amount: -1 });
			const result = await cursor.toArray();
			res.send(result);
		});

		app.delete("/contributions/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await contributionCollection.deleteOne(query);
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
