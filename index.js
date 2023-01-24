require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const url = require("url");
const dns = require("dns");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

let urlSchema = new mongoose.Schema({ url: String });
let Url = mongoose.model("Url", urlSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static("public"));

app.get("/", function (req, res) {
	res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
	res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
	Url.findOne({ url: req.body.url }, async function (err, data) {
		if (!data) {
			dns.lookup(
				url.parse(req.body.url).hostname,
				async function (err, address) {
					if (!address) {
						res.json({ error: "invalid url" });
					} else {
						await Url.create({ url: req.body.url }, function (err, data) {
							if (err) {
								console.error(err);
							}
							res.json({ original_url: data.url, short_url: data._id });
						});
					}
				}
			);
		} else {
			res.json({ original_url: data.url, short_url: data._id });
		}
	});
});

app.get("/api/shorturl/:id", function (req, res) {
	Url.findById(req.params.id, function (err, data) {
		if (err) {
			console.error(err);
		}
		res.redirect(data.url);
	});
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
