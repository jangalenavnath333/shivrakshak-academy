const pptxgen = require('pptxgenjs');

let pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';

pres.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: '050805' },
    objects: [
        { rect: { x: 0, y: 0, w: '100%', h: '0.1', fill: { color: 'e2b740' } } },
        { rect: { x: 0, y: '98%', w: '100%', h: '0.2', fill: { color: 'e2b740' } } }
    ]
});

function addSlide(title, points) {
    let slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    slide.addText(title, { 
        x: 0.5, y: 0.5, w: '90%', h: 0.8, 
        fontSize: 32, bold: true, color: 'e2b740', 
        fontFace: 'Arial' 
    });

    let yOffset = 1.5;
    points.forEach(p => {
        slide.addText(p, { 
            x: 0.5, y: yOffset, w: '90%', h: 0.5, 
            fontSize: 20, color: 'fdfbf7', 
            bullet: { type: 'bullet', code: '2022', color: 'ffe07a' } 
        });
        yOffset += 0.7;
    });
}

// 1
let slide1 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
slide1.addText('Shivrakshak Academy', { x: 0, y: 1.5, w: '100%', h: 1, fontSize: 48, bold: true, color: 'e2b740', align: 'center' });
slide1.addText('ERP & Official Web Portal', { x: 0, y: 2.5, w: '100%', h: 1, fontSize: 28, bold: true, color: 'ffe07a', align: 'center' });
slide1.addText('A Complete Enterprise Resource Planning & High-Performance Web System', { x: 0, y: 3.2, w: '100%', h: 0.5, fontSize: 18, color: 'b5baaa', align: 'center' });

// 2
addSlide('Introduction', [
    'What is Shivrakshak Academy?: A premier defense academy in Maharashtra.',
    'The Core Idea: Transitioning from scattered manual operations to a centralized ERP system.',
    'Project Goal: To build an ultra-premium, cinematic landing page fully integrated with a robust backend ERP.'
]);

// 3
addSlide('Problem Statement', [
    'No Centralized System: Data was scattered across physical files and excel sheets.',
    'Manual Admissions: Paper-based admission forms were slow and hard to track.',
    'Offline Exams: Conducting mock tests manually required excessive printing and manual evaluation.',
    'Media Management: No direct system to dynamically update academy photos and videos.'
]);

// 4
addSlide('Proposed ERP Solution', [
    'Centralized ERP Dashboard: A secure, all-in-one Admin Portal to manage academy operations.',
    'Premium Public Portal: A dynamic, cinematic website using Glassmorphism UI.',
    'Digital Admission System: Paperless data entry with instant printable admission receipts.',
    'Online Exam Portal (CBT): A fully functional Computer Based Test engine.'
]);

// 5
addSlide('Technology Stack', [
    'Frontend Framework: Next.js 14 (App Router) & React 18',
    'Styling: Vanilla CSS3 with Custom Glassmorphism variables',
    'Backend/API: Next.js Server Actions & API Routes',
    'Database: Supabase (PostgreSQL) - Cloud Database',
    'Authentication: Supabase Auth (Secure Admin Login)',
    'Deployment: Vercel (Edge Network)'
]);

// 6
addSlide('System Architecture', [
    'Client Tier: Browsers interacting with the Next.js Frontend.',
    'ERP Admin Tier: Next.js Server rendering secure UI and executing API routes.',
    'Database Tier: Supabase PostgreSQL handling admissions, exams, results, and media.',
    'Storage Tier: Supabase Cloud Storage buckets for uploaded media files.'
]);

// 7
addSlide('Module 1 - The Public Portal', [
    'Cinematic Hero Section: Deep military gradients with glowing metallic typography.',
    'Dynamic Content: Courses, Strengths, and Testimonials loaded dynamically from the ERP.',
    'Premium Lightbox Gallery: Clickable photos and inline video players with frosted-glass overlays.',
    'Responsive Design: 100% optimized for Mobile, Tablet, and Desktop.'
]);

// 8
addSlide('Module 2 - Academy ERP Dashboard', [
    'Student Management: View, edit, and manage all student admission data in real-time.',
    'Dynamic Receipts: Instantly generate printable, fully-formatted admission forms.',
    'Media Controller: Upload new gallery photos, videos, and assign placements.',
    'Secure Access: Role-based protected routes ensuring only authorized personnel access data.'
]);

// 9
addSlide('Module 3 - CBT Exam Portal', [
    'Exam Creation: Admins can create custom tests with multiple-choice questions.',
    'Real-Time Testing: Students experience a realistic timer-based exam environment.',
    'Concurrency Handling: Advanced database logic to prevent duplicate exam starts.',
    'Instant Results: Automatic evaluation and result generation upon submission.'
]);

// 10
addSlide('Future Scope', [
    'Payment Gateway: Integration with Razorpay/PhonePe for seamless online fee collection.',
    'Inventory Management: Tracking academy physical assets (uniforms, equipment).',
    'Mobile Application: A dedicated Android/iOS app for students.',
    'WhatsApp/SMS Integration: Automated alerts for student attendance and exam marks.'
]);

// 11
addSlide('Conclusion', [
    'The project successfully established a highly professional digital identity AND a powerful backend ERP.',
    'By digitizing admissions and exams, administrative overhead is reduced by over 80%.',
    'The use of Next.js and Supabase ensures the ERP platform is highly scalable and secure.'
]);

// 12
let slideEnd = pres.addSlide({ masterName: 'MASTER_SLIDE' });
slideEnd.addText('THANK YOU!', { x: 0, y: 2.5, w: '100%', h: 1, fontSize: 48, bold: true, color: 'e2b740', align: 'center' });
slideEnd.addText('Any Questions?', { x: 0, y: 3.5, w: '100%', h: 0.5, fontSize: 24, color: 'b5baaa', align: 'center' });

pres.writeFile({ fileName: 'Shivrakshak_Academy_ERP_Project_Seminar.pptx' })
    .then(fileName => {
        console.log('Successfully created file: ' + fileName);
    });
