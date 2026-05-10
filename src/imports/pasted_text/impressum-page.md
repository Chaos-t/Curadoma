Create and integrate two new legal pages for the existing Cura Doma website:

1. Impressum
2. Datenschutz

The pages must match the existing Cura Doma design system and be fully responsive for desktop, tablet, and mobile.

[General Page Integration]
Add two footer links:
- Impressum
- Datenschutz

These links should appear in the footer at the bottom of the website.
When the user clicks “Impressum”, open the new Impressum page.
When the user clicks “Datenschutz”, open the new Datenschutz page.

Also make sure both pages have:
- the same header/navigation as the main website
- the same footer as the main website
- consistent Cura Doma branding
- clear spacing
- readable typography
- mobile-optimized layout

[Design Style]
Keep the design consistent with the Cura Doma website:
- calm
- professional
- trustworthy
- clean
- soft healthcare/service aesthetic
- white and very light mint backgrounds
- soft turquoise accents
- rounded cards
- generous spacing
- readable text

Do not use 3D background animations.
Use clean static backgrounds only.

[Animated Images Requirement]
When the Impressum or Datenschutz link is clicked and the page opens, show a suitable visual image on each page.

For the Impressum page:
- use a professional, subtle image related to contact, office, documents, or business information
- the image should feel clean, trustworthy, and suitable for a care service website

For the Datenschutz page:
- use a professional, subtle image related to privacy, security, data protection, documents, or digital trust
- the image should feel calm and serious, not overly technical

Animation:
- the image should fade in smoothly when the page loads
- use a soft entrance animation such as fade-in and slight upward movement
- animation duration around 600–900ms
- keep it subtle and elegant
- do not distract from the legal content

[Impressum Page Content]
Create a clean Impressum page with the following structure and fill in all available Cura Doma information.

Use this structure:

Title:
Impressum

Intro:
Angaben gemäß § 5 TMG

Company / Provider:
Cura Doma
Ambulanter Betreuungsdienst

Address:
Süntelhang 9
31787 Hameln
Deutschland

Contact:
Telefon: 05151 7107093
E-Mail: info@curadoma.de

Responsible for content:
Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:
Cura Doma
Süntelhang 9
31787 Hameln

Business/legal details:
Create clearly marked placeholder fields for any information that is still missing and must be added later:
- Vertreten durch: [Name der verantwortlichen Person eintragen]
- Rechtsform: [Rechtsform eintragen]
- Umsatzsteuer-ID: [falls vorhanden eintragen]
- Aufsichtsbehörde / zuständige Stelle: [falls erforderlich eintragen]
- Berufsrechtliche Angaben: [falls erforderlich eintragen]

Do not invent missing legal data.
Use placeholders where information is not yet available.

Add a note in the admin-facing content/comment:
“Bitte alle Platzhalter vor Veröffentlichung rechtlich prüfen und vervollständigen.”

[Datenschutz Page Content]
Create a Datenschutz page with a clean, readable legal layout.

Use this structure:

Title:
Datenschutzerklärung

Sections:
1. Allgemeine Hinweise
Explain that the protection of personal data is important and that data is processed according to applicable data protection laws.

2. Verantwortliche Stelle
Cura Doma
Ambulanter Betreuungsdienst
Süntelhang 9
31787 Hameln
Deutschland
Telefon: 05151 7107093
E-Mail: info@curadoma.de

3. Erhebung und Verarbeitung personenbezogener Daten
Explain that personal data may be processed when users contact Cura Doma through forms, email, phone, or website interaction.

4. Kontaktformular / Anfrageformular
Explain that data entered into the contact form may be used to process the request and contact the user.

5. Supabase Integration
Add a section explaining that the website uses Supabase as a backend service for handling submitted form data and/or contact requests.

Use neutral placeholder wording:
“Für die technische Verarbeitung von Kontaktanfragen kann Supabase als Backend-Dienst eingesetzt werden. Die übermittelten Daten werden ausschließlich zur Bearbeitung der Anfrage verwendet.”

6. Google Maps
Add a section explaining that Google Maps may be used for displaying locations and route planning.

7. Cookies and local storage
Create a basic section for cookies/local storage if the website uses them. If not used, state that only technically necessary storage is used.

8. Rights of users
Include:
- Auskunft
- Berichtigung
- Löschung
- Einschränkung der Verarbeitung
- Widerspruch
- Datenübertragbarkeit
- Beschwerderecht bei einer Aufsichtsbehörde

9. Contact for privacy questions
E-Mail: info@curadoma.de

Important:
Do not invent legal details.
Use placeholders where specific legal information is missing.
The text should be clean, readable, and structured, but final legal review is required before publication.

[Supabase Connection for Cura Doma]
Connect the website contact functionality to the existing Supabase account/project for Cura Doma.

Goal:
The website should be able to receive contact requests and emails/messages through Supabase.

Set up the contact form so that submitted messages are saved in Supabase and can be reviewed later.

Create or use a Supabase table with this structure:

Table name:
contact_messages

Fields:
- id: uuid, primary key, generated automatically
- created_at: timestamp with time zone, default now()
- name: text
- email: text
- phone: text, nullable
- subject: text, nullable
- message: text
- page_source: text, nullable
- consent_privacy: boolean
- status: text, default “new”

Contact form requirements:
- Name field
- Email field
- Phone field optional
- Subject field optional
- Message field
- Privacy consent checkbox
- Submit button

Privacy consent text:
“Ich habe die Datenschutzerklärung gelesen und stimme zu, dass meine Angaben zur Bearbeitung meiner Anfrage verarbeitet werden.”

The words “Datenschutzerklärung” should link to the Datenschutz page.

Validation:
- Name required
- Email required and valid
- Message required
- Privacy consent required
- Show clear error messages
- Show success message after successful submission:
“Vielen Dank für Ihre Anfrage. Wir melden uns schnellstmöglich bei Ihnen.”

Supabase security:
- Do not expose private service role keys in the frontend.
- Use only the public anon key where appropriate.
- Use Row Level Security policies correctly.
- Allow anonymous users only to insert new contact messages.
- Do not allow anonymous users to read, update, or delete messages.

If email notifications are supported:
- Create or prepare a Supabase Edge Function to send an email notification to info@curadoma.de whenever a new contact request is submitted.
- The email should include name, email, phone, subject, message, and timestamp.
- Use secure environment variables for email provider/API keys.
- Do not hardcode private secrets in frontend code.

If direct email sending is not configured yet:
- still save the request in Supabase
- show a clear note in the implementation that an email provider such as Resend, SendGrid, Brevo, or SMTP must be connected for actual email notifications

[Mobile Version]
Both Impressum and Datenschutz pages must be fully mobile-optimized.

Mobile requirements:
- Header becomes mobile-friendly with hamburger navigation
- Footer stacks vertically
- Legal text uses readable font size
- Images scale properly
- No horizontal overflow
- Cards and content blocks stack vertically
- Tables or long text areas remain readable
- Buttons are touch-friendly
- Contact form is easy to use on mobile
- Animation should remain subtle and lightweight

[Navigation / Links]
Add legal links in the footer:
- Impressum
- Datenschutz

Also ensure:
- Contact form privacy checkbox links to Datenschutz
- Logo links back to the homepage
- Header navigation works on desktop and mobile
- Footer links work correctly

[Final Goal]
Create fully designed, responsive Impressum and Datenschutz pages for Cura Doma, integrate them into the footer navigation, add suitable fade-in images on page load, connect the contact form to Supabase for receiving and storing messages, prepare email notification functionality for info@curadoma.de, and ensure the entire website works cleanly on desktop and mobile.