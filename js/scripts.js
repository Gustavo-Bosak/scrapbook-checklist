// DOM imports
const tabs = document.querySelectorAll('.tabs ul li');
const infoContent = document.querySelector('.info-content ul');

// This function renders the content with the data altogether based on the argument, with is the select partition
function renderCategory(partition) {
    const items = scrapbookEntriesData[partition] || [];

    infoContent.innerHTML = items.map(item => `
    <li>
      <img src="./assets/images/scrapbook_entries/${item.image}.png" alt="${item.name}">
      <p>${item.name}</p>
    </li>
  `).join('');
}

// This function take care of the selection process, it assigns the partitions to its respective buttons and add click events to select and show that selected
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

// Function calls
setupMenu();