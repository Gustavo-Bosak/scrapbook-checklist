// Rules on business
window.ondragstart = function () { return false; };

// DOM imports
const tabs = document.querySelectorAll('.tabs ul li');
const infoContent = document.querySelector('.info-content ul');
const sorterButtons = document.querySelectorAll('.sorter ul li');
const infoTitle = document.querySelector('.title');

// This function renders the content with the data altogether based on the argument, with is the select partition. It also save the data in localStorage when a rendered item is clicked
function renderCategory(partition) {
    const items = scrapbookEntriesData[partition] || [];
    
    const storage = JSON.parse(localStorage.getItem('scrapbook-checked-items')) || {};
    const checkedInThisPartition = storage[partition] || [];

    infoContent.innerHTML = items.map(item =>
        `<li>
            <button class="${checkedInThisPartition.includes(item.image) ? 'check' : ''}" 
                    data-value="${item.image}" 
                    data-partition="${partition}">
                <div class="scrapbook-icon">
                    <span></span>
                    <img src="./assets/images/scrapbook_entries/${item.image}.png" alt="${item.name}">
                </div>
                <div>
                    <p class="subcat">${item.subcat != null ? item.subcat.charAt(0).toUpperCase() + item.subcat.slice(1) + '/' : ''}</p>
                    <p class="name">${item.name}</p>
                </div>
            </button>
        </li>`
    ).join('');

    renderTitle();
}

// This function assigns to the infoContent buttons the check functionality, saving this status in localStorage grouped by the partitions
function setupDoubleClickHandler() {
    infoContent.addEventListener('dblclick', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const entryValue = button.dataset.value;
        const partition = button.dataset.partition;
        
        let storage = JSON.parse(localStorage.getItem('scrapbook-checked-items')) || {};
        
        if (!storage[partition]) storage[partition] = [];

        button.classList.toggle('check');

        if (button.classList.contains('check')) {
            if (!storage[partition].includes(entryValue)) {
                storage[partition].push(entryValue);
            }
        } else {
            storage[partition] = storage[partition].filter(entry => entry !== entryValue);
        }

        localStorage.setItem('scrapbook-checked-items', JSON.stringify(storage));
        updateProgress();
    });
}

// This function renders the display name of the entries clicked on a side title
function renderTitle() {
    infoContent.querySelectorAll('li button').forEach(element => {
        element.addEventListener('click', () => {
            infoTitle.textContent = `${element.querySelector('.name').textContent}`
        })
    })
}

// This function take care of the tabs selection process, it assigns the partitions to its respective buttons and add click events to select and show that selected
function setupMenu() {
    const partitions = Object.keys(scrapbookEntriesData);

    tabs.forEach((tab, index) => {
        const pKey = partitions[index];
        if (!pKey) return;

        tab.dataset.partition = pKey;

        tab.addEventListener('click', () => {
            if (tab.classList.contains('selected')) return;

            document.querySelector('.tabs ul li.selected')?.classList.remove('selected');

            tab.classList.add('selected');

            renderCategory(pKey);
        });
    });

    if (partitions.length > 0) {
        tabs[0].classList.add('selected');
        renderCategory(partitions[0]);
    }
    updateProgress();
}

// This function assings the .sorter buttons to switch the layout of the .info-content in 4 different ways (the amount of columns)
function updateLayout(index) {
    const layouts = [1, 2, 3, 7];
    const totalCols = layouts[index];

    infoContent.style.setProperty('--cols', totalCols);
    infoContent.dataset.view = `${totalCols}-cols`;
}

// This function handles getting and setting .sorter info into localStorage for .info-content layout setting
function setupLayoutSwitcher() {
    const savedLayoutIndex = localStorage.getItem('scrapbook-layout-index') || 0;

    updateLayout(parseInt(savedLayoutIndex));

    sorterButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            updateLayout(index);
            localStorage.setItem('scrapbook-layout-index', index);
        });
    });
}

// This function handles the scrollbar behaviors, such as scrolling and clicking .bar, dragging .handle and clicking arrows up and down
function initCustomScrollbar(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const content = container.querySelector('.info-content, .info');
    const scrollbar = container.querySelector('.scrollbar');
    const handle = container.querySelector('.handle');
    const bar = container.querySelector('.bar');
    const [arrowUp, arrowDown] = container.querySelectorAll('.arrow');

    const scrollStep = 150;

    const updateScrollUI = () => {
        const hasScroll = content.scrollHeight > content.clientHeight;

        scrollbar.style.opacity = hasScroll ? "1" : "0";
        scrollbar.style.pointerEvents = hasScroll ? "auto" : "none";

        if (hasScroll) {
            const scrollPercentage = content.scrollTop / (content.scrollHeight - content.clientHeight);
            const maxTop = bar.clientHeight - handle.clientHeight;
            handle.style.top = `${scrollPercentage * maxTop}px`;
        }
    };

    arrowUp.addEventListener('click', () => {
        content.scrollBy({ top: -scrollStep, behavior: 'smooth' });
    });

    arrowDown.addEventListener('click', () => {
        content.scrollBy({ top: scrollStep, behavior: 'smooth' });
    });

    bar.addEventListener('mousedown', (e) => {
        if (e.target === handle) return;

        const targetY = e.pageY - bar.getBoundingClientRect().top - (handle.clientHeight / 2);
        const maxTop = bar.clientHeight - handle.clientHeight;

        const scrollPercentage = Math.max(0, Math.min(targetY, maxTop)) / maxTop;
        const targetScroll = scrollPercentage * (content.scrollHeight - content.clientHeight);

        content.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    });

    let isDragging = false;
    let startY, startScroll;

    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.pageY - handle.offsetTop;
        document.body.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = bar.getBoundingClientRect();
        const y = e.pageY - rect.top - (handle.clientHeight / 2);
        const maxTop = bar.clientHeight - handle.clientHeight;
        const clampedY = Math.max(0, Math.min(y, maxTop));

        const scrollPercentage = clampedY / maxTop;
        content.scrollTop = scrollPercentage * (content.scrollHeight - content.clientHeight);
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.cursor = '';
    });

    content.addEventListener('scroll', updateScrollUI);
    window.addEventListener('resize', updateScrollUI);

    const observer = new MutationObserver(updateScrollUI);
    observer.observe(content, { childList: true, subtree: true });
    updateScrollUI();
}

// This function displays the amount of checked items under the total entries to all partitions
function updateProgress() {
    const partitions = ['creatures', 'giants', 'items', 'food', 'things', 'POI'];
    const storage = JSON.parse(localStorage.getItem('scrapbook-checked-items')) || {};

    partitions.forEach(partition => {
        const progress = document.querySelector(`.progress[data-partition=${partition}]`);
        progress.textContent = `${storage[partition]?.length || 0} / ${scrapbookEntriesData[partition]?.length || 0}`
    })
}

// Function calls
setupMenu();
setupLayoutSwitcher();
setupDoubleClickHandler();
initCustomScrollbar('.info-header');
initCustomScrollbar('.info-content-container');