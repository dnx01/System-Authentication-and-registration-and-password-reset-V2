const express = require("express"); 
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); 
const nodemailer = require("nodemailer"); 
const { v4: uuidv4 } = require("uuid"); 
const app = express(); 
const Validator = require("fastest-validator");
const bcrypt = require("bcrypt");

const validator = new Validator();


mongoose.connect("mongodb://localhost:27017/web_app_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("");
    console.log('\x1b[33m%s\x1b[0m', "🔍 Conectarea la MongoDB este în curs...");
    console.log("");
    console.log("\x1b[32m%s\x1b[0m", "📡 Conexiunea la MongoDB a fost stabilită cu succes.");
    console.log("");
}).catch((err) => {
    console.log('\x1b[33m%s\x1b[0m', "Eroare la conectarea la MongoDB:", err);
    console.log("");
    process.exit();
});

const UserSchema = new mongoose.Schema({
    username: String,
    prenume: String,
    dateOfBirth: String,
    email: String,
    password: String,
    userId: {
        type: String,
        default: uuidv4(),
    },
});

const User = mongoose.model("User", UserSchema);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/signup", (req, res) => {
    res.render("signup");
});

const signupSchema = {
    username: { type: "string", min: 3, max: 30 },
    prenume: { type: "string", min: 3, max: 30 },
    dateOfBirth: { type: "string" },
    email: { type: "email" },
    password: { type: "string", min: 6, pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/ },
};

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "A apărut o eroare internă a serverului." });
});



app.post("/signup", async (req, res) => {
    try {
        const { username, email, prenume, dateOfBirth, password } = req.body;
        const ipAddress = req.ip;

        const validationResult = validator.validate(req.body, signupSchema);
        if (validationResult !== true) {
            return res.status(400).json({ error: validationResult });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send("Un utilizator cu acest email există deja.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            prenume,
            dateOfBirth,
            password: hashedPassword,
            userId: uuidv4(),
            ipAddress: ipAddress 
        });

        await newUser.save();

        const welcomeMailOptions = {
            from: "your mail",
            to: newUser.email,
            subject: "🎉 Bun venit pe platforma noastră! 🎉",
            html: `
          <p style="text-align: center; font-size: 20px;">
            Bun venit, ${username}!
            <br>
            Te-ai înregistrat cu succes pe platforma noastră.
          </p>
        `,
        };

        transporter.sendMail(welcomeMailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Email de bun venit trimis cu succes: " + info.response);
            }
        });

        app.get("/welcome", (req, res) => {
            res.render("welcome");
        });

        res.redirect("/welcome");
    } catch (err) {
        console.error('Eroare la înregistrare:', err);
        res.status(500).send("Oops! A apărut o eroare la înregistrare.");
    }
});


app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.send("Nume de utilizator sau parolă incorecte.");
        }
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            app.get("/welcome", (req, res) => {
                res.render("welcome");
            });
            res.redirect("/welcome");
        } else {
            res.send("Nume de utilizator sau parolă incorecte.");
        }
    } catch (err) {
        res.send("Eroare la autentificare: " + err);
    }
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your gmail',
        pass: 'app password'
    }
});

app.get("/forgot-password", (req, res) => {
    res.render("forgot-password");
});

app.post("/forgot-password", async (req, res) => {
    try {

        const { username, prenume, dateOfBirth, email } = req.body;

        const user = await User.findOne({ username, prenume, dateOfBirth, email });

        if (!user) {
            return res.send("Nu există un utilizator cu aceste date.");
        }
        const resetId = user._id;

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 1);

        const resetPasswordURL = `http://localhost:3000/reset-password?id=${resetId}&expiresAt=${expiresAt.toISOString()}`;
        const expiresInMinutes = 15;
        const mailOptions = {
            from: "dnz.weed@gmail.com",
            to: user.email,
            subject: "🔑 Resetare parolă - Platforma noastră 🔑",
            html: `
                <p>Bună ziua, ${user.username}!</p>
                <p>Pentru a reseta parola, accesați următorul link:</p>
                <a href="${resetPasswordURL}">Resetare Parolă</a>
                <p>Link-ul de resetare a parolei va expira în ${expiresInMinutes} minute.</p>
            `,
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.send("Eroare la trimiterea emailului de resetare a parolei.");
            } else {
                console.log("Email de resetare a parolei trimis: " + info.response);
                res.send("Un email de resetare a parolei a fost trimis la adresa ta de email.");
            }
        });
    } catch (err) {
        res.send("Eroare la resetarea parolei: " + err);
    }
});


app.get("/reset-password", (req, res) => {
    const { id } = req.query;
    res.render("reset-password", { id });
});


app.post("/reset-password", async (req, res) => {
    try {
        const { id, password } = req.body; 
        const user = await User.findById(id);
        if (!user) { 
            return res.send("Utilizatorul nu a fost găsit.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        await user.save();

        const mailOptions = {
            from: "dnz.weed@gmail.com",
            to: user.email,
            subject: "🔑 Parola a fost resetată cu succes - Platforma noastră 🔑",
            html: `
                <p>Bună ziua, ${user.username}!</p>
                <p>Parola contului tău a fost resetată cu succes.</p>
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Email de confirmare a resetării parolei trimis: " + info.response);
            }
        });

        res.send("Parola a fost resetată cu succes!");
    } catch (err) {
        res.send("Eroare la resetarea parolei: " + err); 
    }
});




const PORT = process.env.PORT || 3000;

app.listen(
    PORT,
    () => {
        setTimeout(() => {
            console.log("                 👇👇👇👇👇👇👇👇👇👇");
            console.log("");
            console.log(
                "\x1b[94m%s\x1b[0m",
                `🌐 Serverul rulează la adresa http://localhost:${PORT}/login`
            );
            console.log("");
            console.log("");
        }, 2000);
    }
);
