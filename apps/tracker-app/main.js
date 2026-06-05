const STORAGE_KEY = 'EXPENSE_TRACKER_APP';
const RENDER_EVENT = 'render-expense-tracker';

let transactions = [];
let isEditMode = false;
let searchQuery = '';

function isStorageExist() {
  return typeof (Storage) !== 'undefined';
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(transactions);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    transactions = data;
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateId() {
  return +new Date();
}

function formatCurrency(number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(number);
}

function createTransactionElement(transaction) {
  const container = document.createElement('div');
  container.classList.add('transaction-item');
  container.setAttribute('data-testid', 'transactionItem');

  const titleNode = document.createElement('h3');
  titleNode.setAttribute('data-testid', 'transactionItemTitle');
  titleNode.innerText = transaction.title;

  const amountNode = document.createElement('p');
  amountNode.setAttribute('data-testid', 'transactionItemAmount');
  amountNode.innerText = `Amount: ${formatCurrency(transaction.amount)}`;

  const dateNode = document.createElement('p');
  dateNode.setAttribute('data-testid', 'transactionItemDate');
  dateNode.innerText = `Date: ${transaction.date}`;

  const typeNode = document.createElement('p');
  typeNode.setAttribute('data-testid', 'transactionItemType');
  const typeText = transaction.type === 'income' ? 'Income' : 'Expense';
  typeNode.innerText = `Type: ${typeText}`;

  const actionsContainer = document.createElement('div');
  actionsContainer.classList.add('item-actions');

  const toggleTypeButton = document.createElement('button');
  toggleTypeButton.setAttribute('data-testid', 'transactionItemEditTypeButton');
  toggleTypeButton.innerText = 'Change Type';
  toggleTypeButton.addEventListener('click', () => {
    transaction.type = transaction.type === 'income' ? 'expense' : 'income';
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  const editButton = document.createElement('button');
  editButton.innerText = 'Edit';
  editButton.classList.add('btn-action-edit');
  editButton.addEventListener('click', () => {
    activateEditMode(transaction);
  });

  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('data-testid', 'transactionItemDeleteButton');
  deleteButton.classList.add('btn-action-delete');
  deleteButton.innerText = 'Delete';
  deleteButton.addEventListener('click', () => {
    transactions = transactions.filter(item => item.id !== transaction.id);
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  actionsContainer.append(toggleTypeButton, editButton, deleteButton);
  container.append(titleNode, amountNode, dateNode, typeNode, actionsContainer);

  return container;
}

function updateDashboardSummary() {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  document.getElementById('totalIncome').innerText = formatCurrency(totalIncome);
  document.getElementById('totalExpense').innerText = formatCurrency(totalExpense);
  document.getElementById('totalBalance').innerText = formatCurrency(totalBalance);
}

function activateEditMode(transaction) {
  isEditMode = true;
  document.getElementById('formTitle').innerText = 'Edit Transaction';
  document.getElementById('submitButton').innerText = 'Update Transaction';
  document.getElementById('cancelEditButton').style.display = 'block';

  document.getElementById('transactionId').value = transaction.id;
  document.getElementById('transactionTitle').value = transaction.title;
  document.getElementById('transactionAmount').value = transaction.amount;
  document.getElementById('transactionDate').value = transaction.date;
  document.getElementById('transactionType').value = transaction.type;
}

function resetForm() {
  isEditMode = false;
  document.getElementById('formTitle').innerText = 'Add New Transaction';
  document.getElementById('submitButton').innerText = 'Save Transaction';
  document.getElementById('cancelEditButton').style.display = 'none';
  document.getElementById('transactionForm').reset();
  document.getElementById('transactionId').value = '';
}

document.getElementById('transactionForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const id = document.getElementById('transactionId').value;
  const title = document.getElementById('transactionTitle').value.trim();
  const amount = parseInt(document.getElementById('transactionAmount').value, 10);
  const date = document.getElementById('transactionDate').value;
  const type = document.getElementById('transactionType').value;

  if (!title) {
    alert('Transaction title cannot be empty!');
    return;
  }

  if (isNaN(amount) || amount < 1) {
    alert('Amount must be a number and at least 1 dollar!');
    return;
  }

  if (!date) {
    alert('Transaction date must be selected!');
    return;
  }

  if (isEditMode) {
    const transactionIndex = transactions.findIndex(t => t.id == id);
    if (transactionIndex !== -1) {
      transactions[transactionIndex] = { id: Number(id), title, amount, date, type };
    }
  } else {
    const newTransaction = { id: generateId(), title, amount, date, type };
    transactions.push(newTransaction);
  }

  saveData();
  resetForm();
  document.dispatchEvent(new Event(RENDER_EVENT));
});

document.getElementById('cancelEditButton').addEventListener('click', () => {
  resetForm();
});

document.getElementById('searchTransaction').addEventListener('input', (event) => {
  searchQuery = event.target.value.toLowerCase();
  document.dispatchEvent(new Event(RENDER_EVENT));
});

document.addEventListener(RENDER_EVENT, () => {
  const incomeList = document.getElementById('incomeList');
  const expenseList = document.getElementById('expenseList');

  incomeList.innerHTML = '';
  expenseList.innerHTML = '';

  const filteredTransactions = transactions.filter(transaction => 
    transaction.title.toLowerCase().includes(searchQuery)
  );

  for (const transaction of filteredTransactions) {
    const element = createTransactionElement(transaction);
    if (transaction.type === 'income') {
      incomeList.append(element);
    } else {
      expenseList.append(element);
    }
  }

  updateDashboardSummary();
});

document.addEventListener('DOMContentLoaded', () => {
  loadDataFromStorage();
});