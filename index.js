require("dotenv").config();
const express = require("express");

const cors = require("cors");
const app = express();

const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
let { emailVerification, resetPassword } = require("./emailVerification.js");
const { confirmation, authenticate } = require("./middleware");
const { upload, cloudinary, unlinkFile } = require("./uploadFile");
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

const dbUrl = process.env.DB_URL; //sI2SXgjjkuvVgLbE

app.get("/", authenticate, async (req, res) => {
  try {
    const clientInfo = await mongoClient.connect(dbUrl);
    const db = clientInfo.db("amazon_clone");
    const data = await db.collection("amazon_users").find().toArray();

    res.json(data);
    clientInfo.close();
  } catch (error) {
    console.log(error);
  }
});
app.post(
  "/addProduct",
  authenticate,
  upload.single("image"),
  async (req, res) => {
    try {
      const file = req.file;

      const image = await cloudinary.uploader.upload(file.path);

      const clientInfo = await mongoClient.connect(dbUrl);
      const db = clientInfo.db("amazon_clone");
      const data = await db
        .collection("amazon_users")
        .findOne({ email: req.user.email });
      if (!data) {
        return res.status(404).json({ messsage: "not found" });
      }
      if (!data.activation) {
        return res.status(401).json({ messsage: "account not verified" });
      }
      if (!data.role) {
        return res.status(401).json({
          messsage: "Unauthorized you need business account to add products",
        });
      }
      const productInfo = {
        image_url: image.url,
        productName: req.body.productName,
        productPrice: req.body.productPrice,
        description: req.body.description,
        seller: data.firstName + " " + data.lastName,
      };
      await db
        .collection("amazon_users")
        .findOneAndUpdate(
          { email: req.user.email },
          { $push: { products: productInfo } }
        );
      await db.collection("amazon_products").insertOne(productInfo);
      await unlinkFile(file.path);
      return res.status(200).json({ message: "product added" });
    } catch (error) {
      console.log(error);
    }
  }
);

app.get("/all-products", async (req, res) => {
  try {
    const clientInfo = await mongoClient.connect(dbUrl);
    const db = clientInfo.db("amazon_clone");
    const data = await db.collection("amazon_products").find().toArray();
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(400);
  }
});

app.get("/product/:productName", async (req, res) => {
  try {
    const clientInfo = await mongoClient.connect(dbUrl);
    const db = clientInfo.db("amazon_clone");
    const data = await db
      .collection("amazon_products")
      .findOne({ productName: req.params.productName });

    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
});

app.post("/register", async (req, res) => {
  try {
    const clientInfo = await mongoClient.connect(dbUrl);
    const db = clientInfo.db("amazon_clone");
    const data = await db
      .collection("amazon_users")
      .findOne({ email: req.body.email });
    if (data) {
      return res
        .status(400)
        .json({ messsage: "user with this email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const token = jwt.sign(
      { email: req.body.email },
      process.env.ACCESS_TOKEN_SECRET_EMAIL
    );
    await emailVerification(token, req.body.email);
    await db.collection("amazon_users").insertOne({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: hashedPassword,
      activation: false,
      role: req.body.role,
    });

    return res.status(200).json({ message: "Email sent succesfully" });
    clientInfo.close();
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});
// emailVerification("123nndannnadn2323", "aniketdevarkar98@gmail.com");
app.get("/register/confirmation/:token", confirmation, (req, res) => {
  res.status(200).json({ message: "YOUR ACCOUNT IS ACTIVATED" });
});

app.post("/login", async (req, res) => {
  try {
    const clientInfo = await mongoClient.connect(dbUrl);
    const db = clientInfo.db("amazon_clone");
    const data = await db
      .collection("amazon_users")
      .findOne({ email: req.body.email });
    if (!data) {
      return res.status(404).json({ messsage: "not found" });
    }
    if (!data.activation) {
      return res.status(401).json({ messsage: "account not verified" });
    }
    const isValid = await bcrypt.compare(req.body.password, data.password);

    if (!isValid) {
      return res.status(400).json({ message: "wrong password" });
    }
    const token = jwt.sign(
      { user_id: data._id, email: data.email },
      process.env.ACCESS_TOKEN_SECRET
    );
    res.status(200).json({ token, data });

    clientInfo.close();
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error });
  }
});

app.put("/forgotpassword", async (req, res) => {
  try {
    const clientInfo = await mongoClient.connect(dbUrl);
    const db = clientInfo.db("amazon_clone");
    const data = await db
      .collection("amazon_users")
      .findOne({ email: req.body.email });
    if (!data) {
      return res.status(404).json({ messsage: "Email not found" });
    }
    if (!data.activation) {
      return res.status(401).json({ messsage: "account not verified" });
    }
    const token = jwt.sign(
      { email: req.body.email },
      process.env.ACCESS_TOKEN_SECRET_PASSWORD_RESET,
      { expiresIn: "1h" }
    );
    await db
      .collection("amazon_users")
      .findOneAndUpdate(
        { email: req.body.email },
        { $set: { resetToken: token } }
      );
    resetPassword(token, req.body.email);
    res.status(200).json(`email sent to ${req.body.email}`);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

app.put("/forgotpassword/resetpassword", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const clientInfo = await mongoClient.connect(dbUrl);
    const db = clientInfo.db("amazon_clone");
    const data = await db
      .collection("amazon_users")
      .findOne({ resetToken: token });
    if (!data) {
      return res.status(400).json({ messsage: "token is not valid" });
    }
    const isValid = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET_PASSWORD_RESET
    );
    if (isValid) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await db
        .collection("amazon_users")
        .findOneAndUpdate(
          { resetToken: token },
          { $unset: { resetToken: token }, $set: { password: hashedPassword } }
        );

      res.status(200).json({ message: "password_updated" });
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

app.listen(port, () => console.log(`app is running on ${port}`));
