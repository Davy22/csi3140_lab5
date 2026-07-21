// registration form script
document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('registration-form');
    var confirmation = document.getElementById('confirmation');
    if (!form || !confirmation) return;

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        form.style.display = 'none';
        confirmation.style.display = 'block';
        confirmation.focus();
    });
});

// Announcements rendering
document.addEventListener('DOMContentLoaded', function () {
    var announcementsList = document.getElementById('announcements');
    if (!announcementsList) return;

    var announcements = [
        "Next meeting will be on Monday, June 23rd at 6:00 PM in Room CRX 440-442.",
        "Please bring your laptop to the lab session."
    ];
    
    announcements.forEach(function (announcement) {
        var item = document.createElement('li');
        item.textContent = announcement;
        announcementsList.appendChild(item);
    });
});

// navigation menu script
document.addEventListener('DOMContentLoaded', function () {
    var header = document.querySelector('header');
    if (!header) return;

    var lastScrollY = window.scrollY;

    window.addEventListener('scroll', function () {
        var currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }

        if (currentScrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollY = currentScrollY;
    });
});

// Theme toggle
document.addEventListener('DOMContentLoaded', function () {
    var root = document.documentElement;
    var themeToggle = document.createElement('button');
    themeToggle.id = 'theme-toggle';
    themeToggle.type = 'button';

    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        themeToggle.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
        localStorage.setItem('theme', theme);
    }

    var storedTheme = localStorage.getItem('theme');
    var defaultTheme = storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(defaultTheme);

    themeToggle.addEventListener('click', function () {
        var nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
    });

    var headerElement = document.querySelector('header');
    if (headerElement) {
        headerElement.appendChild(themeToggle);
    }
});

// Accordion
document.addEventListener('DOMContentLoaded', function () {
    var faqAccordion = document.getElementById('faq-accordion');
    if (faqAccordion) {
        var faqs = [
            {
                question: 'How do I join the club?',
                answer: 'You can join by registering on the Registration page or simply attending any Monday meeting in Room CRX 440-442.'
            },
            {
                question: 'Do I need to read every book before the meeting?',
                answer: 'It is recommended, but not required. Many members come ready to discuss the main ideas, even if they have not finished the entire book.'
            },
            {
                question: 'Can I suggest a book for the schedule?',
                answer: 'Yes. We welcome book suggestions, and the club votes on selections for future weeks.'
            }
        ];

        faqs.forEach(function (faq, index) {
            var item = document.createElement('div');
            item.className = 'accordion-item';

            var header = document.createElement('button');
            header.className = 'accordion-header';
            header.type = 'button';
            header.setAttribute('aria-expanded', 'false');
            header.textContent = faq.question;

            var panel = document.createElement('div');
            panel.className = 'accordion-panel';
            panel.setAttribute('role', 'region');
            panel.innerHTML = '<p>' + faq.answer + '</p>';

            header.addEventListener('click', function () {
                var isOpen = panel.classList.toggle('visible');
                header.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });

            item.appendChild(header);
            item.appendChild(panel);
            faqAccordion.appendChild(item);
        });
    }
});

// Lab 4 Requirement: Fetch Data and Render Table Dynamically
document.addEventListener('DOMContentLoaded', async function () {
    const tableBody = document.querySelector('main table tbody');
    const genreFilter = document.getElementById('genre-filter');
    if (!tableBody) return;

    try {
        // Fetch from our new Node.js API
        const response = await fetch('/api/books');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const books = await response.json();
        
        // Clear loading state or empty the table
        tableBody.innerHTML = ''; 

        // Populate table rows dynamically
        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.date}</td>
                <td><em>${book.title}</em></td>
                <td>${book.author}</td>
                <td class="book-genre">${book.genre}</td>
                <td>${book.time}</td>
                <td>${book.room}</td>
            `;
            tableBody.appendChild(row);
        });

        // Initialize Filter Logic AFTER rows are created
        if (genreFilter) {
            const scheduleRows = document.querySelectorAll('main table tbody tr');
            genreFilter.addEventListener('change', function () {
                var filterValue = genreFilter.value;
                scheduleRows.forEach(function (row) {
                    var genreCell = row.querySelector('.book-genre');
                    if (!genreCell) return;
                    var genreText = genreCell.textContent.trim();
                    row.style.display = (filterValue === 'all' || genreText === filterValue) ? '' : 'none';
                });
            });
        }

    } catch (error) {
        console.error('Error fetching books:', error);
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load schedule from server. Please try again later.</td></tr>';
    }
});