document.addEventListener('DOMContentLoaded', function() {
            // Set today's date as default
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('itemDate').value = today;
            
            // Load items from localStorage
            loadItems();
            
            // Form submission
            document.getElementById('itemForm').addEventListener('submit', function(e) {
                e.preventDefault();
                saveItem();
            });
            
            // Generate document button
            document.getElementById('generateDocBtn').addEventListener('click', generateDocument);
            
            // Close modal button
            document.getElementById('closeModalBtn').addEventListener('click', function() {
                document.getElementById('documentModal').classList.add('hidden');
            });
            
            // Print document button
            document.getElementById('printDocBtn').addEventListener('click', function() {
                window.print();
            });
            
            // Search functionality
            document.getElementById('searchInput').addEventListener('input', function() {
                filterItems();
            });
            
            // Filter buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    filterItems(this.dataset.category);
                });
            });
        });
        
        function saveItem() {
            const item = {
                id: Date.now().toString(),
                name: document.getElementById('itemName').value,
                category: document.getElementById('itemCategory').value,
                quantity: document.getElementById('itemQuantity').value,
                priority: document.getElementById('itemPriority').value,
                description: document.getElementById('itemDescription').value,
                requestedBy: document.getElementById('itemRequestedBy').value,
                date: document.getElementById('itemDate').value,
                budget: document.getElementById('itemBudget').value || '0',
                createdAt: new Date().toISOString()
            };
            
            let items = JSON.parse(localStorage.getItem('purchaseItems')) || [];
            items.push(item);
            localStorage.setItem('purchaseItems', JSON.stringify(items));
            
            // Reset form
            document.getElementById('itemForm').reset();
            document.getElementById('itemDate').value = new Date().toISOString().split('T')[0];
            
            // Show success message
            alert('Vásárlási igény sikeresen mentve!');
            
            // Reload items
            loadItems();
        }
        
        function loadItems() {
            const itemsContainer = document.getElementById('itemsContainer');
            const noItemsMessage = document.getElementById('noItemsMessage');
            
            let items = JSON.parse(localStorage.getItem('purchaseItems')) || [];
            
            if (items.length === 0) {
                itemsContainer.innerHTML = '';
                noItemsMessage.classList.remove('hidden');
                return;
            }
            
            noItemsMessage.classList.add('hidden');
            itemsContainer.innerHTML = '';
            
            // Sort by creation date (newest first)
            items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            items.forEach(item => {
                const priorityColors = {
                    'Alacsony': 'bg-blue-100 text-blue-800',
                    'Közepes': 'bg-yellow-100 text-yellow-800',
                    'Magas': 'bg-orange-100 text-orange-800',
                    'Sürgős': 'bg-red-100 text-red-800'
                };
                
                const itemElement = document.createElement('div');
                itemElement.className = `bg-white border border-gray-200 rounded-lg p-4 shadow-sm card-hover transition-all fade-in`;
                itemElement.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-bold text-lg text-gray-800">${item.name}</h3>
                            <div class="flex items-center mt-1">
                                <span class="text-sm text-gray-500 mr-2">${item.category}</span>
                                <span class="text-sm px-2 py-1 rounded-full ${priorityColors[item.priority]}">${item.priority}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-gray-500 text-sm">${formatDate(item.date)}</span>
                            <div class="mt-1 text-gray-700 font-medium">${item.quantity} db</div>
                        </div>
                    </div>
                    ${item.description ? `<p class="mt-3 text-gray-600 text-sm">${item.description}</p>` : ''}
                    <div class="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                        <div>
                            <span class="text-sm text-gray-600">Igénylő: <span class="font-medium">${item.requestedBy}</span></span>
                        </div>
                        <div class="text-right">
                            ${item.budget > 0 ? `<span class="text-sm font-medium">${formatCurrency(item.budget)}</span>` : '<span class="text-sm text-gray-400">Nincs költségbecslés</span>'}
                        </div>
                    </div>
                    <div class="mt-3 flex justify-end">
                        <button class="delete-btn px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-all" data-id="${item.id}">
                            <i class="fas fa-trash-alt mr-1"></i> Törlés
                        </button>
                    </div>
                `;
                
                itemsContainer.appendChild(itemElement);
            });
            
            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    if (confirm('Biztosan törölni szeretnéd ezt a vásárlási igényt?')) {
                        deleteItem(this.dataset.id);
                    }
                });
            });
        }
        
        function deleteItem(id) {
            let items = JSON.parse(localStorage.getItem('purchaseItems')) || [];
            items = items.filter(item => item.id !== id);
            localStorage.setItem('purchaseItems', JSON.stringify(items));
            loadItems();
        }
        
        function filterItems(category = 'all', searchTerm = '') {
            const searchInput = document.getElementById('searchInput');
            searchTerm = searchTerm || searchInput.value.toLowerCase();
            
            let items = JSON.parse(localStorage.getItem('purchaseItems')) || [];
            
            if (category !== 'all') {
                items = items.filter(item => item.category === category);
            }
            
            if (searchTerm) {
                items = items.filter(item => 
                    item.name.toLowerCase().includes(searchTerm) || 
                    item.description.toLowerCase().includes(searchTerm) ||
                    item.requestedBy.toLowerCase().includes(searchTerm) ||
                    item.category.toLowerCase().includes(searchTerm)
                );
            }
            
            const itemsContainer = document.getElementById('itemsContainer');
            const noItemsMessage = document.getElementById('noItemsMessage');
            
            if (items.length === 0) {
                itemsContainer.innerHTML = '';
                noItemsMessage.classList.remove('hidden');
                return;
            }
            
            noItemsMessage.classList.add('hidden');
            
            // Hide all items first
            document.querySelectorAll('#itemsContainer > div').forEach(el => {
                el.classList.add('hidden');
            });
            
            // Show only matching items
            items.forEach(item => {
                const itemEl = document.querySelector(`.delete-btn[data-id="${item.id}"]`)?.closest('div');
                if (itemEl) {
                    itemEl.classList.remove('hidden');
                    itemEl.classList.add('fade-in');
                }
            });
        }
        
        function generateDocument() {
            const items = JSON.parse(localStorage.getItem('purchaseItems')) || [];
            
            if (items.length === 0) {
                alert('Nincsenek vásárlási igények a dokumentum létrehozásához!');
                return;
            }
            
            const now = new Date();
            const formattedDate = formatDate(now.toISOString(), true);
            
            let docContent = `
                <h1 class="text-3xl font-bold mb-6 text-indigo-700">Vásárlási Igények Összesítése</h1>
                <div class="mb-8">
                    <p class="text-gray-600 mb-1"><strong>Dokumentum dátuma:</strong> ${formattedDate}</p>
                    <p class="text-gray-600"><strong>Összes igény:</strong> ${items.length} db</p>
                </div>
                
                <table class="w-full border-collapse mb-8">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="border border-gray-300 px-4 py-2 text-left">Termék</th>
                            <th class="border border-gray-300 px-4 py-2 text-left">Kategória</th>
                            <th class="border border-gray-300 px-4 py-2 text-center">Mennyiség</th>
                            <th class="border border-gray-300 px-4 py-2 text-left">Prioritás</th>
                            <th class="border border-gray-300 px-4 py-2 text-left">Igénylő</th>
                            <th class="border border-gray-300 px-4 py-2 text-right">Költség</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            let totalBudget = 0;
            
            items.forEach((item, index) => {
                const budget = parseInt(item.budget) || 0;
                totalBudget += budget;
                
                docContent += `
                    <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                        <td class="border border-gray-300 px-4 py-2">${item.name}</td>
                        <td class="border border-gray-300 px-4 py-2">${item.category}</td>
                        <td class="border border-gray-300 px-4 py-2 text-center">${item.quantity}</td>
                        <td class="border border-gray-300 px-4 py-2">${item.priority}</td>
                        <td class="border border-gray-300 px-4 py-2">${item.requestedBy}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">${budget > 0 ? formatCurrency(budget) : '-'}</td>
                    </tr>
                `;
            });
            
            docContent += `
                    </tbody>
                    <tfoot>
                        <tr class="bg-gray-100 font-semibold">
                            <td colspan="5" class="border border-gray-300 px-4 py-2 text-right">Összes költség:</td>
                            <td class="border border-gray-300 px-4 py-2 text-right">${formatCurrency(totalBudget)}</td>
                        </tr>
                    </tfoot>
                </table>
                
                <div class="mt-8">
                    <h2 class="text-xl font-semibold mb-4 text-gray-800">Prioritás szerinti bontás</h2>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 class="text-blue-800 font-medium mb-2">Alacsony</h3>
                            <p class="text-2xl font-bold text-blue-600">${countItemsByPriority(items, 'Alacsony')} db</p>
                        </div>
                        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <h3 class="text-yellow-800 font-medium mb-2">Közepes</h3>
                            <p class="text-2xl font-bold text-yellow-600">${countItemsByPriority(items, 'Közepes')} db</p>
                        </div>
                        <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <h3 class="text-orange-800 font-medium mb-2">Magas</h3>
                            <p class="text-2xl font-bold text-orange-600">${countItemsByPriority(items, 'Magas')} db</p>
                        </div>
                        <div class="bg-red-50 p-4 rounded-lg border border-red-200">
                            <h3 class="text-red-800 font-medium mb-2">Sürgős</h3>
                            <p class="text-2xl font-bold text-red-600">${countItemsByPriority(items, 'Sürgős')} db</p>
                        </div>
                    </div>
                </div>
                
                <div class="mt-8">
                    <h2 class="text-xl font-semibold mb-4 text-gray-800">Kategória szerinti bontás</h2>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                            <h3 class="text-indigo-800 font-medium mb-2">Irodai felszerelés</h3>
                            <p class="text-2xl font-bold text-indigo-600">${countItemsByCategory(items, 'Irodai felszerelés')} db</p>
                        </div>
                        <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h3 class="text-purple-800 font-medium mb-2">IT eszközök</h3>
                            <p class="text-2xl font-bold text-purple-600">${countItemsByCategory(items, 'IT eszközök')} db</p>
                        </div>
                        <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h3 class="text-green-800 font-medium mb-2">Bútor</h3>
                            <p class="text-2xl font-bold text-green-600">${countItemsByCategory(items, 'Bútor')} db</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h3 class="text-gray-800 font-medium mb-2">Egyéb</h3>
                            <p class="text-2xl font-bold text-gray-600">${countItemsByCategory(items, 'Egyéb')} db</p>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('documentContent').innerHTML = docContent;
            document.getElementById('documentModal').classList.remove('hidden');
        }
        
        function countItemsByPriority(items, priority) {
            return items.filter(item => item.priority === priority).length;
        }
        
        function countItemsByCategory(items, category) {
            return items.filter(item => item.category === category).length;
        }
        
        function formatDate(dateString, withTime = false) {
            const date = new Date(dateString);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            if (withTime) {
                options.hour = '2-digit';
                options.minute = '2-digit';
            }
            return date.toLocaleDateString('hu-HU', options);
        }
        
        function formatCurrency(amount) {
            return new Intl.NumberFormat('hu-HU', { 
                style: 'currency', 
                currency: 'HUF',
                maximumFractionDigits: 0
            }).format(amount);
        }