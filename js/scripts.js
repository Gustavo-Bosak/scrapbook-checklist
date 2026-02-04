// Rules on business
window.ondragstart = function() { return false; };

// DOM imports
const tabs = document.querySelectorAll('.tabs ul li');
const infoContent = document.querySelector('.info-content ul');
const sorterButtons = document.querySelectorAll('.sorter ul li')

// This function renders the content with the data altogether based on the argument, with is the select partition
function renderCategory(partition) {
    const items = scrapbookEntriesData[partition] || [];

    infoContent.innerHTML = items.map(item => `
    <li>
        <button>
            <img src="./assets/images/scrapbook_entries/${item.image}.png" alt="${item.name}" decoding="async" loading="lazy">
            <div>
                <p class="subcat">${item.subcat != null ? item.subcat.charAt(0).toUpperCase() + item.subcat.slice(1) + '/' : ''}</p>
                <p class="name">${item.name}</p>
            </div>
        </button>
    </li>
  `).join('');
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
}

// This function assings the .sorter buttons to switch the layout of the .info-content in 4 different ways (the amount of columns)
function updateLayout(index) {
    const layouts = [1, 2, 3, 7];
    const totalCols = layouts[index];
    
    infoContent.style.setProperty('--cols', totalCols);
    infoContent.dataset.view = `${totalCols}-cols`;
}

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

// Function calls
setupMenu();
setupLayoutSwitcher();