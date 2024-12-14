const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 8080;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection (replace `<dbname>` with your database name)
mongoose.connect('mongodb+srv://sanket411:Sanket411@cluster0.ea7ih.mongodb.net/abis?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Define Schemas
const applicationSchema = new mongoose.Schema({  
    f_name: { type: String, required: true },
    l_name: { type: String, required: true },
    email_id: { type: String, required: true, unique: true }, // Prevent duplicate emails
    mobile_no: { type: String, required: true },
    cover_letter: { type: String, required: false },
    experience: { type: String, required: false },
    start_date: { type: String, required: false },
    terms_of_services: { type: Boolean, required: true },
}, { collection: 'applications' });

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Prevent duplicate emails
    subject: { type: String, required: true },
    message: { type: String, required: true },
}, { collection: 'contact_form' });

// Define Models
const Application = mongoose.model('Application', applicationSchema);
const Contact = mongoose.model('Contact', contactSchema);

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/:page', (req, res) => {
    const page = req.params.page;
    const validPages = [
        'about',
        'index',
        'careers',
        'contact',
        'form',
        'gallery',
        'itsolutions',
        'team',
        'testimonial',
    ];

    if (validPages.includes(page)) {
        res.sendFile(path.join(__dirname, 'views', `${page}.html`));
    } else {
        res.status(404).send('Page not found');
    }
});

// For Applications
app.post('/submit', (req, res) => {
    const {
        f_name,
        l_name,
        email_id,
        mobile_no,
        cover_letter,
        experience,
        start_date,
        terms_of_services,
    } = req.body;

    const application = new Application({
        f_name,
        l_name,
        email_id,
        mobile_no,
        cover_letter,
        experience,
        start_date,
        terms_of_services: terms_of_services === 'on',
    });

    application
        .save()
        .then(() => {
            res.send(`
                <script>
                    alert('Your application has been successfully submitted!');
                    window.location.href = '/careers';
                </script>
            `);
        })
        .catch((err) => {
            if (err.code === 11000) { // Duplicate key error
                res.send(`
                    <script>
                        alert('You have already applied with this email. Duplicate entries are not allowed.');
                        window.location.href = '/form';
                    </script>
                `);
            } else {
                console.error(err);
                res.send(`
                    <script>
                        alert('Submission failed. Please try again.');
                        window.location.href = '/form';
                    </script>
                `);
            }
        });
});

// For Contact Form
app.post('/submitC', (req, res) => {
    const { name, email, subject, message } = req.body;

    const contact = new Contact({ name, email, subject, message });

    contact
        .save()
        .then(() => {
            res.send(`
                <script>
                    alert('Your message has been successfully sent!');
                    window.location.href = '/contact';
                </script>
            `);
        })
        .catch((err) => {
            if (err.code === 11000) { // Duplicate key error
                res.send(`
                    <script>
                        alert('You have already contacted us with this email. Duplicate entries are not allowed.');
                        window.location.href = '/contact';
                    </script>
                `);
            } else {
                console.error(err);
                res.send(`
                    <script>
                        alert('Submission failed. Please try again.');
                        window.location.href = '/contact';
                    </script>
                `);
            }
        });
});

// Start Server
app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running`);
});