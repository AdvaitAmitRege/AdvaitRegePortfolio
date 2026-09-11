// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive features
    initCursor();
    initNavigation();
    initScrollEffects();
    initAnimations();
    initSkillBars();
    initStatsCounter();
    initProjectHover();
    initCategorySelector();
    initProjectCardAssembly();
    initProjectAccordions();
});
// Project Card Assembly Animation (staggered)
function initProjectCardAssembly() {
    const cards = document.querySelectorAll('.project-card');
    if (!cards.length) return;
    cards.forEach((card, i) => {
        card.classList.add(i % 2 === 0 ? 'slide-in-left' : 'slide-in-right');
    });
    // IntersectionObserver for fade+slide-in
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scrolled-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    cards.forEach(card => observer.observe(card));
}

// Collapsible sections for project pages
function initProjectAccordions() {
    const projectPage = document.querySelector('.project-main-content');
    if (!projectPage) return;

    if (document.querySelector('.project-accordion')) {
        updateProjectStatusColors();
        renameWrongFloorQuickInfo();
        return;
    }

    const infoCardsContainer = projectPage.querySelector('.info-cards');
    if (!infoCardsContainer) return;

    const sourceCards = Array.from(infoCardsContainer.querySelectorAll('.info-card'));
    const statusText = findProjectValue(sourceCards, projectPage, ['status', 'release', 'ongoing', 'upcoming']) || 'Completed';
    const typeText = findProjectValue(sourceCards, projectPage, ['type', 'genre']) || 'Project';
    const engineText = findProjectValue(sourceCards, projectPage, ['engine']) || 'Unreal Engine 5';

    const summaryCards = document.createElement('div');
    summaryCards.className = 'info-cards project-summary-cards';
    summaryCards.appendChild(createSummaryCard('Status', statusText, getStatusTone(statusText)));
    summaryCards.appendChild(createSummaryCard('Type', typeText));
    summaryCards.appendChild(createSummaryCard('Engine', engineText));

    projectPage.insertBefore(summaryCards, infoCardsContainer);

    const accordionAnchors = [];

    const detailSections = Array.from(projectPage.querySelectorAll(':scope > .level-horizontal-details'));

    detailSections.forEach((section) => {
        if (section.closest('.project-accordion')) return;
        const accordion = convertDetailSectionToAccordion(section);
        if (accordion) {
            accordionAnchors.push(accordion);
        }
    });

    const insertBeforeNode = infoCardsContainer.nextElementSibling;
    accordionAnchors.forEach((accordion) => {
        projectPage.insertBefore(accordion, insertBeforeNode);
    });

    infoCardsContainer.remove();
    updateProjectStatusColors();
    renameWrongFloorQuickInfo();
}

function createSummaryCard(title, value, tone) {
    const card = document.createElement('div');
    card.className = `info-card${tone ? ` status-${tone}` : ''}`;

    const heading = document.createElement('h3');
    heading.textContent = title;

    const body = document.createElement('div');
    body.className = 'info-value';
    body.textContent = value;

    card.appendChild(heading);
    card.appendChild(body);
    return card;
}

function findProjectValue(cards, projectPage, keys) {
        const searchScope = `${projectPage.textContent} ${cards.map(card => card.textContent).join(' ')}`;
        const lowerScope = searchScope.toLowerCase();

        for (const card of cards) {
                const cardText = card.textContent;
                const lowerCard = cardText.toLowerCase();
                for (const key of keys) {
                        const index = lowerCard.indexOf(`${key}:`);
                        if (index !== -1) {
                                return cardText.slice(index + key.length + 1).replace(/\s+/g, ' ').trim();
                        }
                }
        }

        const regexes = keys.map((key) => new RegExp(`${key}\\s*:\\s*([^\\n\\r]+)`, 'i'));
        for (const regex of regexes) {
                const match = searchScope.match(regex);
                if (match) {
                        return match[1].replace(/\s+/g, ' ').trim();
                }
        }

        const statusMatches = lowerScope.match(/(completed|ongoing|upcoming|released|prototype|in progress)/i);
        if (keys.includes('status') && statusMatches) {
                return statusMatches[1].replace(/\b\w/g, ch => ch.toUpperCase());
        }

        return '';
}

function getStatusTone(statusText) {
    const normalized = statusText.toLowerCase();
    if (normalized.includes('ongoing') || normalized.includes('upcoming') || normalized.includes('in progress')) {
        return 'ongoing';
    }
    return 'completed';
}

function createAccordionFromNode(title, contentNode, openByDefault = false) {
    if (!contentNode) return null;

    const accordion = document.createElement('details');
    accordion.className = 'project-accordion';
    if (openByDefault) {
        accordion.open = true;
    }

    const summary = document.createElement('summary');
    summary.textContent = title;

    const body = document.createElement('div');
    body.className = 'project-accordion-body';
    body.appendChild(contentNode);

    accordion.appendChild(summary);
    accordion.appendChild(body);
    return accordion;
}

function convertSectionCardToAccordion(card) {
    const titleElement = card.querySelector('h3');
    if (!titleElement) return null;

    const title = titleElement.textContent.trim();
    const content = document.createElement('div');
    content.innerHTML = card.innerHTML;
    content.querySelector('h3')?.remove();

    return createAccordionFromNode(title, content, ['about', 'project info'].includes(title.toLowerCase()));
}

function convertDetailSectionToAccordion(section) {
    const firstDetail = section.querySelector('.h-detail');
    if (!firstDetail) return null;

    const titleElement = firstDetail.querySelector('.h-detail-title');
    if (!titleElement) return null;

    const title = titleElement.textContent.trim();
    return createAccordionFromNode(
        title,
        section,
        ['about', 'project info', 'screenshots'].includes(title.toLowerCase())
    );
}

function updateProjectStatusColors() {
    document.querySelectorAll('.project-summary-cards .info-card').forEach((card) => {
        const heading = card.querySelector('h3');
        if (!heading || heading.textContent.trim().toLowerCase() !== 'status') return;
        const value = card.querySelector('.info-value')?.textContent || '';
        card.classList.remove('status-completed', 'status-ongoing');
        card.classList.add(`status-${getStatusTone(value)}`);
    });
}

function renameWrongFloorQuickInfo() {
    document.querySelectorAll('.project-accordion summary').forEach((summary) => {
        if (summary.textContent.trim().toLowerCase() === 'quick info') {
            summary.textContent = 'Project Info';
        }
    });
}
// Category Selector Filtering (Projects Page Only)
function initCategorySelector() {
    const selector = document.querySelector('.category-selector-init');
    if (!selector) return;
    const buttons = selector.querySelectorAll('.category-btn');
    const cards = document.querySelectorAll('.project-card');

    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (btn.classList.contains('active')) return;
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.getAttribute('data-category');
            // Simulate system initializing delay
            cards.forEach(card => {
                card.style.opacity = '0.3';
                card.style.pointerEvents = 'none';
            });
            setTimeout(() => {
                cards.forEach(card => {
                    if (cat === 'all' || card.getAttribute('data-category').includes(cat)) {
                        card.style.display = '';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.pointerEvents = '';
                        }, 80);
                    } else {
                        card.style.opacity = '0';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 180);
                    }
                });
            }, 320); // Delay for 'initializing' effect
        });
    });
}

// Custom Cursor
function initCursor() {
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Disable cursor effects on mobile
    if (isMobile) {
        return;
    }
    
    // Create ring + dot cursor
    const cursorDot = document.createElement('div');
    const cursorRing = document.createElement('div');
    cursorDot.classList.add('cursor-dot');
    cursorRing.classList.add('cursor-ring');
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorRing);

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let ringScale = 1;
    const ringSpeed = 0.18;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    function animate() {
        ringX += (mouseX - ringX) * ringSpeed;
        ringY += (mouseY - ringY) * ringSpeed;
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
        cursorRing.style.transform = `translate(-50%, -50%) scale(${ringScale})`;
        requestAnimationFrame(animate);
    }
    animate();

    // Expand/glow ring on hover
    const hoverElements = document.querySelectorAll('a, button, .nav-link, .skill-card, .project-card');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            ringScale = 1.5;
            cursorRing.classList.add('cursor-ring-hover');
        });
        el.addEventListener('mouseleave', () => {
            ringScale = 1;
            cursorRing.classList.remove('cursor-ring-hover');
        });
    });
}

// Navigation
function initNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.navigation');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navigation.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for anchor links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                
                const target = document.querySelector(href);
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    
                    // Update active link
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    
                    // Close mobile menu if open
                    if (navigation.classList.contains('active')) {
                        navigation.classList.remove('active');
                        menuToggle.classList.remove('active');
                    }
                }
            }
        });
    });
    
    // Update active link on scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');
            
            if (scrollPos >= top && scrollPos <= bottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// Scroll Effects
function initScrollEffects() {
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        // Header effect
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Reveal animations
        const revealElements = document.querySelectorAll('.fade-in');
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                el.classList.add('visible');
            }
        });
    });
}

// Animations
function initAnimations() {
    // Initialize hero title animation
    const heroLines = document.querySelectorAll('.hero-title .line');
    heroLines.forEach((line, index) => {
        setTimeout(() => {
            line.style.animationPlayState = 'running';
        }, index * 200);
    });
    
    // Initialize floating elements
    const elements = document.querySelectorAll('.element');
    elements.forEach(el => {
        // Randomize animation delays
        const delay = Math.random() * 5;
        el.style.animationDelay = `-${delay}s`;
    });
}

// Skill Bars Animation
function initSkillBars() {
    const skillBars = document.querySelectorAll('.progress-fill, .skill-progress');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.dataset.width || bar.dataset.percent;
                if (width) {
                    bar.style.width = `${width}%`;
                }
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => {
        observer.observe(bar);
    });
}

// Stats Counter Animation
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const target = parseInt(stat.dataset.count);
                let count = 0;
                const duration = 2000; // ms
                const increment = target / (duration / 16); // 60fps
                
                const timer = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        count = target;
                        clearInterval(timer);
                    }
                    stat.textContent = Math.floor(count);
                }, 16);
                
                observer.unobserve(stat);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

// Project Hover Effects
function initProjectHover() {
    // Hover effects removed as per user request
}

// Keyboard Navigation (Game-like)
document.addEventListener('keydown', (e) => {
    // WASD navigation
    if (e.key === 'w' || e.key === 'W') {
        window.scrollBy(0, -50);
    } else if (e.key === 's' || e.key === 'S') {
        window.scrollBy(0, 50);
    }
});
